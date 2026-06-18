using TechShop.Backend.DTOs;
using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Services;

public interface ICartService
{
    Task<ApiResponse<object>> GetCartAsync(Guid? userId, string? sessionId);
    Task<ApiResponse<object>> AddToCartAsync(Guid? userId, string? sessionId, AddToCartDto dto);
    Task<ApiResponse<object>> UpdateItemAsync(Guid? userId, string? sessionId, Guid id, UpdateCartItemDto dto);
    Task<ApiResponse<object>> DeleteItemAsync(Guid? userId, string? sessionId, Guid id);
    Task<ApiResponse<object>> ApplyCouponAsync(Guid? userId, string? sessionId, ApplyCouponDto dto);
}
