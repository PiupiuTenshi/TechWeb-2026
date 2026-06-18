using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs.Admin;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin,Staff")]
[Route("api/admin/inventory")]
public class AdminInventoryController : ControllerBase
{
    private readonly IAdminInventoryService _inventoryService;

    public AdminInventoryController(IAdminInventoryService inventoryService)
    {
        _inventoryService = inventoryService;
    }

    [HttpGet]
    public async Task<IActionResult> GetInventory([FromQuery] string? keyword, [FromQuery] bool lowStock = false, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _inventoryService.GetInventoryAsync(keyword, lowStock, page, pageSize);
        return Ok(result);
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] Guid? variantId, [FromQuery] string? changeType, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _inventoryService.GetLogsAsync(variantId, changeType, page, pageSize);
        return Ok(result);
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportStock(InventoryChangeDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _inventoryService.ImportStockAsync(dto, userId);
        if (!result.Success)
        {
            if (result.Error == "VARIANT_NOT_FOUND") return NotFound(result);
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportStock(InventoryChangeDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _inventoryService.ExportStockAsync(dto, userId);
        if (!result.Success)
        {
            if (result.Error == "INVENTORY_NOT_FOUND") return NotFound(result);
            return BadRequest(result);
        }
        return Ok(result);
    }

    [HttpPatch("adjust")]
    public async Task<IActionResult> AdjustStock(InventoryAdjustDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _inventoryService.AdjustStockAsync(dto, userId);
        if (!result.Success)
        {
            if (result.Error == "VARIANT_NOT_FOUND") return NotFound(result);
            return BadRequest(result);
        }
        return Ok(result);
    }
}
