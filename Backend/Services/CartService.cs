using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public class CartService : ICartService
{
    private readonly AppDbContext _context;

    public CartService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<object>> GetCartAsync(Guid? userId, string? sessionId)
    {
        var cart = await GetOrCreateCart(userId, sessionId);
        return ApiResponse<object>.Ok(MapCart(cart));
    }

    public async Task<ApiResponse<object>> AddToCartAsync(Guid? userId, string? sessionId, AddToCartDto dto)
    {
        if (dto.Quantity <= 0)
        {
            return ApiResponse<object>.Fail("INVALID_QUANTITY", "So luong phai lon hon 0.");
        }

        var variant = await _context.ProductVariants.Include(v => v.Inventory).FirstOrDefaultAsync(v => v.VariantId == dto.VariantId && v.IsActive);
        if (variant == null)
        {
            return ApiResponse<object>.Fail("VARIANT_NOT_FOUND", "Bien the san pham khong ton tai.");
        }

        var cart = await GetOrCreateCart(userId, sessionId);
        var existingItem = cart.Items.FirstOrDefault(i => i.VariantId == dto.VariantId);
        var currentQuantity = existingItem != null ? existingItem.Quantity : 0;
        var totalDesiredQuantity = currentQuantity + dto.Quantity;

        if ((variant.Inventory?.Quantity ?? 0) < totalDesiredQuantity)
        {
            return ApiResponse<object>.Fail("OUT_OF_STOCK", "So luong ton kho khong du.");
        }

        if (existingItem != null)
        {
            existingItem.Quantity = totalDesiredQuantity;
        }
        else
        {
            _context.CartItems.Add(new CartItem
            {
                CartId = cart.CartId,
                VariantId = dto.VariantId,
                Quantity = dto.Quantity
            });
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        cart = await LoadCart(cart.CartId);

        return ApiResponse<object>.Ok(MapCart(cart), "Da them vao gio hang.");
    }

    public async Task<ApiResponse<object>> UpdateItemAsync(Guid? userId, string? sessionId, Guid id, UpdateCartItemDto dto)
    {
        var cart = await GetOrCreateCart(userId, sessionId);
        var item = cart.Items.FirstOrDefault(i => i.CartItemId == id);
        if (item == null)
        {
            return ApiResponse<object>.Fail("ITEM_NOT_FOUND", "San pham khong co trong gio hang.");
        }

        if (dto.Quantity <= 0)
        {
            _context.CartItems.Remove(item);
        }
        else
        {
            if ((item.Variant?.Inventory?.Quantity ?? 0) < dto.Quantity)
            {
                return ApiResponse<object>.Fail("OUT_OF_STOCK", "So luong ton kho khong du.");
            }
            item.Quantity = dto.Quantity;
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        cart = await LoadCart(cart.CartId);

        return ApiResponse<object>.Ok(MapCart(cart), "Da cap nhat gio hang.");
    }

    public async Task<ApiResponse<object>> DeleteItemAsync(Guid? userId, string? sessionId, Guid id)
    {
        var cart = await GetOrCreateCart(userId, sessionId);
        var item = cart.Items.FirstOrDefault(i => i.CartItemId == id);
        if (item == null)
        {
            return ApiResponse<object>.Fail("ITEM_NOT_FOUND", "San pham khong co trong gio hang.");
        }

        _context.CartItems.Remove(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        cart = await LoadCart(cart.CartId);

        return ApiResponse<object>.Ok(MapCart(cart), "Da xoa san pham khoi gio hang.");
    }

    public async Task<ApiResponse<object>> ApplyCouponAsync(Guid? userId, string? sessionId, ApplyCouponDto dto)
    {
        var cart = await GetOrCreateCart(userId, sessionId);
        var subtotal = CalculateSubtotal(cart);
        var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == dto.Code.Trim().ToUpper());
        if (coupon == null || !coupon.IsActive || coupon.StartsAt > DateTime.UtcNow || coupon.ExpiresAt < DateTime.UtcNow || coupon.UsedCount >= coupon.UsageLimit)
        {
            return ApiResponse<object>.Fail("INVALID_COUPON", "Ma giam gia khong hop le.");
        }

        if (subtotal < coupon.MinOrderValue)
        {
            return ApiResponse<object>.Fail("MIN_ORDER_VALUE", "Don hang chua dat gia tri toi thieu.");
        }

        cart.CouponId = coupon.CouponId;
        cart.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();
        cart = await LoadCart(cart.CartId);

        return ApiResponse<object>.Ok(MapCart(cart), "Da ap dung ma giam gia.");
    }

    private async Task<Cart> GetOrCreateCart(Guid? userId, string? sessionId)
    {
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
            cart = new Cart { UserId = userId, SessionId = userId == null ? sessionId : null };
            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();
        }

        return cart;
    }

    private async Task<Cart> LoadCart(Guid id)
        => await _context.Carts
            .Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Product)
            .Include(c => c.Items).ThenInclude(i => i.Variant).ThenInclude(v => v!.Inventory)
            .Include(c => c.Coupon)
            .FirstAsync(c => c.CartId == id);

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
