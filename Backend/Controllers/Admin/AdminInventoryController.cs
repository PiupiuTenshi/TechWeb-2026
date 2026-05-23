using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Admin;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.Models;

namespace TechShop.Backend.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin,Staff")]
[Route("api/admin/inventory")]
public class AdminInventoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminInventoryController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetInventory([FromQuery] string? keyword, [FromQuery] bool lowStock = false, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Inventories
            .Include(i => i.Variant)
            .ThenInclude(v => v!.Product)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(keyword))
        {
            var term = keyword.Trim().ToLower();
            query = query.Where(i => i.Variant != null
                && (i.Variant.SKU.ToLower().Contains(term)
                    || (i.Variant.Product != null && i.Variant.Product.Name.ToLower().Contains(term))
                    || (i.Variant.Product != null && i.Variant.Product.Brand != null && i.Variant.Product.Brand.ToLower().Contains(term))));
        }

        if (lowStock)
        {
            query = query.Where(i => i.Quantity <= i.LowStockAlert);
        }

        var total = await query.CountAsync();
        var rows = await query
            .OrderBy(i => i.Quantity)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(i => new
            {
                i.InventoryId,
                i.VariantId,
                i.Quantity,
                i.LowStockAlert,
                i.UpdatedAt,
                Variant = i.Variant,
                Product = i.Variant!.Product
            })
            .ToListAsync();

        var items = rows.Select(i => new InventoryItemDto(
            i.InventoryId,
            i.VariantId,
            i.Variant!.SKU,
            i.Product!.Name,
            i.Product.Slug,
            i.Product.Brand,
            FormatVariant(i.Variant.Color, i.Variant.RAM, i.Variant.Storage),
            i.Quantity,
            i.LowStockAlert,
            i.UpdatedAt)).ToList();

        return Ok(ApiResponse<List<InventoryItemDto>>.Ok(items, "OK", new PaginationMeta(page, pageSize, total)));
    }

    [HttpGet("logs")]
    public async Task<IActionResult> GetLogs([FromQuery] Guid? variantId, [FromQuery] string? changeType, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.InventoryLogs
            .Include(l => l.Variant)
            .ThenInclude(v => v!.Product)
            .Include(l => l.CreatedByUser)
            .AsQueryable();

        if (variantId.HasValue)
        {
            query = query.Where(l => l.VariantId == variantId.Value);
        }

        if (!string.IsNullOrWhiteSpace(changeType))
        {
            query = query.Where(l => l.ChangeType == changeType);
        }

        var total = await query.CountAsync();
        var rows = await query
            .OrderByDescending(l => l.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(l => new
            {
                l.LogId,
                l.VariantId,
                l.ChangeType,
                l.Quantity,
                l.Note,
                l.CreatedAt,
                l.CreatedByUser,
                Variant = l.Variant,
                Product = l.Variant!.Product
            })
            .ToListAsync();

        var logs = rows.Select(l => new InventoryLogDto(
            l.LogId,
            l.VariantId,
            l.Variant!.SKU,
            l.Product!.Name,
            l.ChangeType,
            l.Quantity,
            l.Note,
            l.CreatedByUser?.FullName,
            l.CreatedAt)).ToList();

        return Ok(ApiResponse<List<InventoryLogDto>>.Ok(logs, "OK", new PaginationMeta(page, pageSize, total)));
    }

    [HttpPost("import")]
    public async Task<IActionResult> ImportStock(InventoryChangeDto dto)
    {
        if (dto.Quantity <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("INVALID_QUANTITY", "So luong nhap phai lon hon 0."));
        }

        var inventory = await GetOrCreateInventory(dto.VariantId);
        if (inventory == null)
        {
            return NotFound(ApiResponse<object>.Fail("VARIANT_NOT_FOUND", "Bien the san pham khong ton tai."));
        }

        inventory.Quantity += dto.Quantity;
        inventory.UpdatedAt = DateTime.UtcNow;
        AddLog(dto.VariantId, "Import", dto.Quantity, dto.Note);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { inventory.InventoryId, inventory.VariantId, inventory.Quantity }, "Da nhap kho."));
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportStock(InventoryChangeDto dto)
    {
        if (dto.Quantity <= 0)
        {
            return BadRequest(ApiResponse<object>.Fail("INVALID_QUANTITY", "So luong xuat phai lon hon 0."));
        }

        var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.VariantId == dto.VariantId);
        if (inventory == null)
        {
            return NotFound(ApiResponse<object>.Fail("INVENTORY_NOT_FOUND", "Ton kho khong ton tai."));
        }

        if (inventory.Quantity < dto.Quantity)
        {
            return BadRequest(ApiResponse<object>.Fail("OUT_OF_STOCK", "So luong ton kho khong du."));
        }

        inventory.Quantity -= dto.Quantity;
        inventory.UpdatedAt = DateTime.UtcNow;
        AddLog(dto.VariantId, "Export", -dto.Quantity, dto.Note);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { inventory.InventoryId, inventory.VariantId, inventory.Quantity }, "Da xuat kho."));
    }

    [HttpPatch("adjust")]
    public async Task<IActionResult> AdjustStock(InventoryAdjustDto dto)
    {
        if (dto.Quantity < 0)
        {
            return BadRequest(ApiResponse<object>.Fail("INVALID_QUANTITY", "So luong ton moi khong duoc am."));
        }

        var inventory = await GetOrCreateInventory(dto.VariantId);
        if (inventory == null)
        {
            return NotFound(ApiResponse<object>.Fail("VARIANT_NOT_FOUND", "Bien the san pham khong ton tai."));
        }

        var delta = dto.Quantity - inventory.Quantity;
        inventory.Quantity = dto.Quantity;
        inventory.UpdatedAt = DateTime.UtcNow;
        AddLog(dto.VariantId, "Adjust", delta, dto.Note);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { inventory.InventoryId, inventory.VariantId, inventory.Quantity }, "Da dieu chinh ton kho."));
    }

    private async Task<Inventory?> GetOrCreateInventory(Guid variantId)
    {
        var variantExists = await _context.ProductVariants.AnyAsync(v => v.VariantId == variantId && v.IsActive);
        if (!variantExists)
        {
            return null;
        }

        var inventory = await _context.Inventories.FirstOrDefaultAsync(i => i.VariantId == variantId);
        if (inventory != null)
        {
            return inventory;
        }

        inventory = new Inventory { VariantId = variantId, Quantity = 0 };
        _context.Inventories.Add(inventory);
        return inventory;
    }

    private void AddLog(Guid variantId, string changeType, int quantity, string? note)
    {
        _context.InventoryLogs.Add(new InventoryLog
        {
            VariantId = variantId,
            ChangeType = changeType,
            Quantity = quantity,
            Note = note,
            CreatedBy = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!)
        });
    }

    private static string? FormatVariant(params string?[] values)
    {
        var parts = values.Where(x => !string.IsNullOrWhiteSpace(x)).ToList();
        return parts.Count == 0 ? null : string.Join(" / ", parts);
    }
}
