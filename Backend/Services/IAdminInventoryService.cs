using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TechShop.Backend.DTOs.Admin;
using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Services;

public interface IAdminInventoryService
{
    Task<ApiResponse<List<InventoryItemDto>>> GetInventoryAsync(string? keyword, bool lowStock, int page, int pageSize);
    Task<ApiResponse<List<InventoryLogDto>>> GetLogsAsync(Guid? variantId, string? changeType, int page, int pageSize);
    Task<ApiResponse<object>> ImportStockAsync(InventoryChangeDto dto, Guid userId);
    Task<ApiResponse<object>> ExportStockAsync(InventoryChangeDto dto, Guid userId);
    Task<ApiResponse<object>> AdjustStockAsync(InventoryAdjustDto dto, Guid userId);
}
