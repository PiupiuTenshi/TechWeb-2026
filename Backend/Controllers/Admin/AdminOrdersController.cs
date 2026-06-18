using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs.Order;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin,Staff")]
[Route("api/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly IAdminOrdersService _ordersService;

    public AdminOrdersController(IAdminOrdersService ordersService)
    {
        _ordersService = ordersService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _ordersService.GetOrdersAsync(status, page, pageSize);
        return Ok(result);
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateOrderStatusDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _ordersService.UpdateStatusAsync(id, dto, userId);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }

    [HttpPut("{id:guid}/tracking")]
    public async Task<IActionResult> UpdateTracking(Guid id, UpdateTrackingDto dto)
    {
        var result = await _ordersService.UpdateTrackingAsync(id, dto);
        if (!result.Success)
        {
            return NotFound(result);
        }
        return Ok(result);
    }
}
