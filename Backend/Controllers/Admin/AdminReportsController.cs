using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin,Staff")]
[Route("api/admin/reports")]
public class AdminReportsController : ControllerBase
{
    private readonly IAdminReportsService _reportsService;

    public AdminReportsController(IAdminReportsService reportsService)
    {
        _reportsService = reportsService;
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string groupBy = "day")
    {
        var result = await _reportsService.GetRevenueAsync(from, to, groupBy);
        return Ok(result);
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopProducts([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int take = 10)
    {
        var result = await _reportsService.GetTopProductsAsync(from, to, take);
        return Ok(result);
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int? threshold, [FromQuery] int take = 50)
    {
        var result = await _reportsService.GetLowStockAsync(threshold, take);
        return Ok(result);
    }

    [HttpGet("revenue/export")]
    public async Task<IActionResult> ExportRevenue([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string groupBy = "day")
    {
        var content = await _reportsService.ExportRevenueAsync(from, to, groupBy);
        return File(
            content,
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"techshop-revenue-{DateTime.UtcNow:yyyyMMddHHmmss}.xlsx");
    }
}
