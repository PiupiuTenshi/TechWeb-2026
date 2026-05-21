using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.Models;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly AppDbContext _context;

    public CartController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var cart = await GetOrCreateCart();
        return Ok(ApiResponse<object>.Ok(MapCart(cart)));
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToCart(AddToCartDto dto)
    {
        if (dto.Quantity <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("INVALID_QUANTITY", "So luong phai lon hon 0."));
        }

        var variant = await _context.ProductVariants.Include(v => v.Inventory).FirstOrDefaultAsync(v => v.VariantId == dto.VariantId && v.IsActive);
        if (variant == null)
        {
            return NotFound(ApiResponse<object>.Fail("VARIANT_NOT_FOUND", "Bien the san pham khong ton tai."));
        }

        if ((variant.Inventory?.Quantity ?? 0) < dto.Quantity)
        {
            return BadRequest(ApiResponse<object>.Fail("OUT_OF_STOCK", "So luong ton kho khong du."));
        }

        var cart = await GetOrCreateCart();
        var existingItem = cart.Items.FirstOrDefault(i => i.VariantId == dto.VariantId);
        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            cart.Items.Add(new CartItem { VariantId = dto.VariantId, Quantity = dto.Quantity });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        cart = await LoadCart(cart.CartId);

        return Ok(ApiResponse<object>.Ok(MapCart(cart), "Da them vao gio hang."));
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, UpdateCartItemDto dto)
    {
        var cart = await GetOrCreateCart();
        var item = cart.Items.FirstOrDefault(i => i.CartItemId == id);
        if (item == null)
        {
            return NotFound(ApiResponse<object>.Fail("ITEM_NOT_FOUND", "San pham khong co trong gio hang."));
        }

        if (dto.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            item.Quantity = dto.Quantity;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        cart = await LoadCart(cart.CartId);

        return Ok(ApiResponse<object>.Ok(MapCart(cart), "Da cap nhat gio hang."));
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var cart = await GetOrCreateCart();
        var item = cart.Items.FirstOrDefault(i => i.CartItemId == id);
        if (item == null)
        {
            return NotFound(ApiResponse<object>.Fail("ITEM_NOT_FOUND", "San pham khong co trong gio hang."));
        }

        _context.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        cart = await LoadCart(cart.CartId);

        return Ok(ApiResponse<object>.Ok(MapCart(cart), "Da xoa san pham khoi gio hang."));
    }

    [HttpPost("apply-coupon")]
    public async Task<IActionResult> ApplyCoupon(ApplyCouponDto dto)
    {
        var cart = await GetOrCreateCart();
        var subtotal = CalculateSubtotal(cart);
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == dto.Code.Trim().ToUpper());
        if (coupon == null || !coupon.IsActive || coupon.StartsAt > DateTime.UtcNow || coupon.ExpiresAt < DateTime.UtcNow || coupon.UsedCount >= coupon.UsageLimit)
        {
            return BadRequest(ApiResponse<object>.Fail("INVALID_COUPON", "Ma giam gia khong hop le."));
        }

        if (subtotal < coupon.MinOrderValue)
        {
            return BadRequest(ApiResponse<object>.Fail("MIN_ORDER_VALUE", "Don hang chua dat gia tri toi thieu."));
        }

        cart.CouponId = coupon.CouponId;
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        cart = await LoadCart(cart.CartId);

        return Ok(ApiResponse<object>.Ok(MapCart(cart), "Da ap dung ma giam gia."));
    }

    private async Task<Cart> GetOrCreateCart()
    {
        var userId = GetUserIdFromToken();
        var sessionId = userId == null ? GetOrCreateSessionId() : null;
        var cart = userId != null
            ? await _context.Carts.Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Product)
                .Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Inventory)
                .Include(c => c.Coupon)
                .FirstOrDefaultAsync(c => c.UserId == userId)
            : await _context.Carts.Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Product)
                .Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Inventory)
                .Include(c => c.Coupon)
                .FirstOrDefaultAsync(c => c.SessionId == sessionId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId, SessionId = sessionId };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        if (userId == null && !Request.Headers.ContainsKey("X-Session-Id"))
        {
            Response.Headers["X-Session-Id"] = cart.SessionId;
        }

        return cart;
    }

    private async Task<Cart> LoadCart(Guid id)
        => await _context.Carts
            .Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Product)
            .Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Inventory)
            .Include(c => c.Coupon)
            .FirstAsync(c => c.CartId == id);

    private Guid? GetUserIdFromToken()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(userIdString, out var userId) ? userId : null;
    }

    private string GetOrCreateSessionId()
        => Request.Headers.TryGetValue("X-Session-Id", out var sessionId) ? sessionId.ToString() : Guid.NewGuid().ToString();

    private static decimal CalculateSubtotal(Cart cart)
        => cart.Items.Sum(item => item.Quantity * ((item.Variant?.Product?.SalePrice ?? item.Variant?.Product?.BasePrice ?? 0) + (item.Variant?.PriceOffset ?? 0)));

    private static decimal CalculateDiscount(Cart cart, decimal subtotal)
    {
        if (cart.Coupon == null)
        {
            return 0;
        }

        var discount = cart.Coupon.DiscountType == "Percent"
            ? subtotal * cart.Coupon.DiscountValue / 100
            : cart.Coupon.DiscountValue;

        return cart.Coupon.MaxDiscount.HasValue ? Math.Min(discount, cart.Coupon.MaxDiscount.Value) : discount;
    }

    private static object MapCart(Cart cart)
    {
        var subtotal = CalculateSubtotal(cart);
        var discount = CalculateDiscount(cart, subtotal);
        return new
        {
            cart.CartId,
            cart.UserId,
            cart.SessionId,
            coupon = cart.Coupon == null ? null : new { cart.Coupon.Code, cart.Coupon.DiscountType, cart.Coupon.DiscountValue },
            items = cart.Items.Select(item =>
            {
                var product = item.Variant?.Product;
                var unitPrice = (product?.SalePrice ?? product?.BasePrice ?? 0) + (item.Variant?.PriceOffset ?? 0);
                return new
                {
                    item.CartItemId,
                    item.VariantId,
                    productId = product?.ProductId,
                    productName = product?.Name,
                    productSlug = product?.Slug,
                    thumbnailUrl = product?.ThumbnailUrl,
                    variantInfo = item.Variant == null ? null : string.Join(" / ", new[] { item.Variant.Color, item.Variant.RAM, item.Variant.Storage }.Where(x => !string.IsNullOrWhiteSpace(x))),
                    item.Quantity,
                    unitPrice,
                    subtotal = unitPrice * item.Quantity,
                    stock = item.Variant?.Inventory?.Quantity ?? 0
                };
            }),
            subtotal,
            discount,
            total = subtotal - discount
        };
    }
}
