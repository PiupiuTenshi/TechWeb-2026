using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs.Order;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrdersService _ordersService;

    public OrdersController(IOrdersService ordersService)
    {
        _ordersService = ordersService;
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
    {
        var response = await _ordersService.CreateOrderAsync(GetUserId(), dto);
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var response = await _ordersService.GetOrdersAsync(GetUserId());
        return response.Success ? Ok(response) : BadRequest(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var response = await _ordersService.GetOrderAsync(GetUserId(), id);
        return response.Success ? Ok(response) : NotFound(response);
    }

    [HttpPatch("{id:guid}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        var response = await _ordersService.CancelOrderAsync(GetUserId(), id);
        if (!response.Success)
        {
            return response.Error == "NOT_FOUND" ? NotFound(response) : BadRequest(response);
        }
        return Ok(response);
    }

    private Guid GetUserId()
        => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
}
