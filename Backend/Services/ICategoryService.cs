using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Product;

namespace TechShop.Backend.Services;

public interface ICategoryService
{
    Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync();
}
