using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Order;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin,Staff")]
[Route("api/admin/orders")]
public class AdminOrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IEmailService _emailService;

    public AdminOrdersController(AppDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var query = _context.Orders.Include(o => o.User).AsQueryable();

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(o => o.Status == status);
        }

        var total = await query.CountAsync();
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new
            {
                o.OrderId,
                o.Status,
                o.GrandTotal,
                o.TrackingCode,
                o.CreatedAt,
                customer = o.User == null ? null : new { o.User.UserId, o.User.Email, o.User.FullName }
            })
            .ToListAsync();

        return Ok(ApiResponse<object>.Ok(orders, "OK", new PaginationMeta(page, pageSize, total)));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateOrderStatusDto dto)
    {
        var order = await _context.Orders.Include(o => o.StatusLogs).FirstOrDefaultAsync(o => o.OrderId == id);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Don hang khong ton tai."));
        }

        var oldStatus = order.Status;
        order.Status = dto.Status;
        order.UpdatedAt = DateTime.UtcNow;
        _context.OrderStatusLogs.Add(new()
        {
            OrderId = order.OrderId,
            OldStatus = oldStatus,
            NewStatus = dto.Status,
            Note = dto.Note,
            ChangedBy = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
        });

        await _context.SaveChangesAsync();
        await _emailService.SendOrderStatusChangedAsync(order, oldStatus, dto.Status);
        return Ok(ApiResponse<object>.Ok(new { order.OrderId, order.Status }, "Da cap nhat trang thai."));
    }

    [HttpPut("{id:guid}/tracking")]
    public async Task<IActionResult> UpdateTracking(Guid id, UpdateTrackingDto dto)
    {
        var order = await _context.Orders.FindAsync(id);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Don hang khong ton tai."));
        }

        order.TrackingCode = dto.TrackingCode;
        order.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { order.OrderId, order.TrackingCode }, "Da cap nhat ma van don."));
    }
}
