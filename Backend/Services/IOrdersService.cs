using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Order;

namespace TechShop.Backend.Services;

public interface IOrdersService
{
    Task<ApiResponse<object>> CreateOrderAsync(Guid userId, CreateOrderDto dto);
    Task<ApiResponse<object>> GetOrdersAsync(Guid userId);
    Task<ApiResponse<object>> GetOrderAsync(Guid userId, Guid id);
    Task<ApiResponse<object>> CancelOrderAsync(Guid userId, Guid id);
}
