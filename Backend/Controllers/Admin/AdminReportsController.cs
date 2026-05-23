using ClosedXML.Excel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Admin;
using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin,Staff")]
[Route("api/admin/reports")]
public class AdminReportsController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminReportsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("revenue")]
    public async Task<IActionResult> GetRevenue([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string groupBy = "day")
    {
        var (start, end) = NormalizeRange(from, to);
        var report = await BuildRevenueReport(start, end, groupBy);
        return Ok(ApiResponse<RevenueReportDto>.Ok(report));
    }

    [HttpGet("top-products")]
    public async Task<IActionResult> GetTopProducts([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] int take = 10)
    {
        var (start, end) = NormalizeRange(from, to);
        take = Math.Clamp(take, 1, 50);

        var products = await _context.OrderItems
            .Include(i => i.Order)
            .Where(i => i.Order != null
                && i.Order.CreatedAt >= start
                && i.Order.CreatedAt <= end
                && i.Order.Status != "Cancelled")
            .GroupBy(i => new { i.VariantId, i.ProductName, i.VariantInfo })
            .Select(g => new TopProductDto(
                g.Key.VariantId,
                g.Key.ProductName,
                g.Key.VariantInfo,
                g.Sum(x => x.Quantity),
                g.Sum(x => x.Subtotal)))
            .OrderByDescending(x => x.Revenue)
            .Take(take)
            .ToListAsync();

        return Ok(ApiResponse<List<TopProductDto>>.Ok(products));
    }

    [HttpGet("low-stock")]
    public async Task<IActionResult> GetLowStock([FromQuery] int? threshold, [FromQuery] int take = 50)
    {
        take = Math.Clamp(take, 1, 200);

        var query = _context.Inventories
            .Include(i => i.Variant)
            .ThenInclude(v => v!.Product)
            .AsQueryable();

        query = threshold.HasValue
            ? query.Where(i => i.Quantity <= threshold.Value)
            : query.Where(i => i.Quantity <= i.LowStockAlert);

        var rows = await query
            .OrderBy(i => i.Quantity)
            .Take(take)
            .ToListAsync();

        var items = rows.Select(i => new LowStockDto(
            i.InventoryId,
            i.VariantId,
            i.Variant!.SKU,
            i.Variant.Product!.Name,
            FormatVariant(i.Variant.Color, i.Variant.RAM, i.Variant.Storage),
            i.Quantity,
            i.LowStockAlert,
            i.UpdatedAt)).ToList();

        return Ok(ApiResponse<List<LowStockDto>>.Ok(items));
    }

    [HttpGet("revenue/export")]
    public async Task<IActionResult> ExportRevenue([FromQuery] DateTime? from, [FromQuery] DateTime? to, [FromQuery] string groupBy = "day")
    {
        var (start, end) = NormalizeRange(from, to);
        var report = await BuildRevenueReport(start, end, groupBy);

        using var workbook = new XLWorkbook();
        var summary = workbook.Worksheets.Add("Summary");
        summary.Cell(1, 1).Value = "Metric";
        summary.Cell(1, 2).Value = "Value";
        summary.Cell(2, 1).Value = "From";
        summary.Cell(2, 2).Value = report.From;
        summary.Cell(3, 1).Value = "To";
        summary.Cell(3, 2).Value = report.To;
        summary.Cell(4, 1).Value = "Total revenue";
        summary.Cell(4, 2).Value = report.TotalRevenue;
        summary.Cell(5, 1).Value = "Total orders";
        summary.Cell(5, 2).Value = report.TotalOrders;
        summary.Cell(6, 1).Value = "Average order value";
        summary.Cell(6, 2).Value = report.AverageOrderValue;
        summary.Range("A1:B1").Style.Font.Bold = true;
        summary.Columns().AdjustToContents();

        var details = workbook.Worksheets.Add("Revenue");
        details.Cell(1, 1).Value = "Period";
        details.Cell(1, 2).Value = "Revenue";
        details.Cell(1, 3).Value = "Orders";
        for (var i = 0; i < report.Points.Count; i++)
        {
            details.Cell(i + 2, 1).Value = report.Points[i].Period;
            details.Cell(i + 2, 2).Value = report.Points[i].Revenue;
            details.Cell(i + 2, 3).Value = report.Points[i].Orders;
        }
        details.Range("A1:C1").Style.Font.Bold = true;
        details.Columns().AdjustToContents();

        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"techshop-revenue-{DateTime.UtcNow:yyyyMMddHHmmss}.xlsx");
    }

    private async Task<RevenueReportDto> BuildRevenueReport(DateTime start, DateTime end, string groupBy)
    {
        var orders = await _context.Orders
            .Where(o => o.CreatedAt >= start && o.CreatedAt <= end && o.Status != "Cancelled")
            .Select(o => new
            {
                o.CreatedAt,
                o.GrandTotal,
                o.Status
            })
            .ToListAsync();

        var points = orders
            .GroupBy(o => groupBy.Equals("month", StringComparison.OrdinalIgnoreCase)
                ? o.CreatedAt.ToString("yyyy-MM")
                : o.CreatedAt.ToString("yyyy-MM-dd"))
            .Select(g => new RevenuePointDto(g.Key, g.Sum(x => x.GrandTotal), g.Count()))
            .OrderBy(x => x.Period)
            .ToList();

        var totalRevenue = orders.Sum(o => o.GrandTotal);
        var totalOrders = orders.Count;

        return new RevenueReportDto(
            start,
            end,
            totalRevenue,
            totalOrders,
            totalOrders == 0 ? 0 : totalRevenue / totalOrders,
            orders.Count(o => o.Status == "Paid"),
            orders.Count(o => o.Status == "Completed"),
            points);
    }

    private static (DateTime Start, DateTime End) NormalizeRange(DateTime? from, DateTime? to)
    {
        var end = to?.ToUniversalTime() ?? DateTime.UtcNow;
        var start = from?.ToUniversalTime() ?? end.AddDays(-30);
        return (start, end);
    }

    private static string? FormatVariant(params string?[] values)
    {
        var parts = values.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
        return parts.Count == 0 ? null : string.Join(" / ", parts);
    }
}
