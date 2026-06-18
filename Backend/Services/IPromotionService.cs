using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Promotion;

namespace TechShop.Backend.Services;

public interface IPromotionService
{
    Task<ApiResponse<List<PromotionDto>>> GetActivePromotionsAsync();
    Task<ApiResponse<List<PromotionDto>>> GetPromotionsAsync(bool? active, int page, int pageSize);
    Task<ApiResponse<PromotionDto>> GetPromotionAsync(Guid id);
    Task<ApiResponse<object>> CreatePromotionAsync(CreatePromotionDto dto);
    Task<ApiResponse<object>> UpdatePromotionAsync(Guid id, UpdatePromotionDto dto);
    Task<ApiResponse<object>> DeletePromotionAsync(Guid id);
}
