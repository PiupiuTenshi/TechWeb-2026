using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var (userId, sessionId) = GetUserAndSession();
        var response = await _cartService.GetCartAsync(userId, sessionId);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddToCart(AddToCartDto dto)
    {
        var (userId, sessionId) = GetUserAndSession();
        var response = await _cartService.AddToCartAsync(userId, sessionId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPut("items/{id:guid}")]
    public async Task<IActionResult> UpdateItem(Guid id, UpdateCartItemDto dto)
    {
        var (userId, sessionId) = GetUserAndSession();
        var response = await _cartService.UpdateItemAsync(userId, sessionId, id, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpDelete("items/{id:guid}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var (userId, sessionId) = GetUserAndSession();
        var response = await _cartService.DeleteItemAsync(userId, sessionId, id);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpPost("apply-coupon")]
    public async Task<IActionResult> ApplyCoupon(ApplyCouponDto dto)
    {
        var (userId, sessionId) = GetUserAndSession();
        var response = await _cartService.ApplyCouponAsync(userId, sessionId, dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    private (Guid? UserId, string SessionId) GetUserAndSession()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var userId = Guid.TryParse(userIdString, out var uid) ? (Guid?)uid : null;

        var sessionId = Request.Headers.TryGetValue("X-Session-Id", out var id) ? id.ToString() : Guid.NewGuid().ToString();

        if (userId == null && !Request.Headers.ContainsKey("X-Session-Id"))
        {
            Response.Headers["X-Session-Id"] = sessionId;
        }

        return (userId, sessionId);
    }
}
