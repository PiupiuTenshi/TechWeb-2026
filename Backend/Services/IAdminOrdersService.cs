using System;
using System.Threading.Tasks;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Order;

namespace TechShop.Backend.Services;

public interface IAdminOrdersService
{
    Task<ApiResponse<object>> GetOrdersAsync(string? status, int page, int pageSize);
    Task<ApiResponse<object>> UpdateStatusAsync(Guid id, UpdateOrderStatusDto dto, Guid userId);
    Task<ApiResponse<object>> UpdateTrackingAsync(Guid id, UpdateTrackingDto dto);
}
