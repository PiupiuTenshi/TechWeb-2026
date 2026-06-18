using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Review;

namespace TechShop.Backend.Services;

public interface IReviewService
{
    Task<ApiResponse<object>> CreateReviewAsync(Guid userId, CreateReviewDto dto);
    Task<ApiResponse<object>> GetProductReviewsAsync(Guid productId);
}
