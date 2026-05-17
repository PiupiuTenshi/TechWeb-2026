// File: Controllers/CartController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs;
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

    private Guid? GetUserIdFromToken()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdString != null ? Guid.Parse(userIdString) : null;
    }

    private string GetOrCreateSessionId()
    {
        if (Request.Headers.TryGetValue("X-Session-Id", out var sessionId))
        {
            return sessionId.ToString();
        }
        return Guid.NewGuid().ToString(); 
    }

    // 1. GET /api/cart: Lấy giỏ hàng hiện tại 
    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var userId = GetUserIdFromToken();
        string? sessionId = userId == null ? GetOrCreateSessionId() : null;

        var cartQuery = _context.Carts.Include(c => c.Items).AsQueryable();
        
        Cart? cart = userId != null 
            ? await cartQuery.FirstOrDefaultAsync(c => c.UserId == userId)
            : await cartQuery.FirstOrDefaultAsync(c => c.SessionId == sessionId);

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

        return Ok(cart);
    }

    // 2. POST /api/cart/items: Thêm vào giỏ hàng 
    [HttpPost("items")]
    public async Task<IActionResult> AddToCart(AddToCartDto dto)
    {
        var userId = GetUserIdFromToken();
        string? sessionId = userId == null ? GetOrCreateSessionId() : null;

        var cartQuery = _context.Carts.Include(c => c.Items).AsQueryable();
        
        Cart? cart = userId != null 
            ? await cartQuery.FirstOrDefaultAsync(c => c.UserId == userId)
            : await cartQuery.FirstOrDefaultAsync(c => c.SessionId == sessionId);

        if (cart == null)
        {
            cart = new Cart { UserId = userId, SessionId = sessionId };
            _context.Carts.Add(cart);
        }

        var existingItem = cart.Items.FirstOrDefault(i => i.VariantId == dto.VariantId);
        if (existingItem != null)
        {
            existingItem.Quantity += dto.Quantity;
        }
        else
        {
            var cartItem = new CartItem
            {
                VariantId = dto.VariantId,
                Quantity = dto.Quantity
            };
            cart.Items.Add(cartItem);
        }

        await _context.SaveChangesAsync();

        if (userId == null && !Request.Headers.ContainsKey("X-Session-Id"))
        {
            Response.Headers["X-Session-Id"] = cart.SessionId;
        }

        return Ok(cart);
    }
}