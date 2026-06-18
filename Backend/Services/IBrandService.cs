using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Services;

public interface IBrandService
{
    Task<ApiResponse<List<string>>> GetBrandsAsync();
}
