using Microsoft.AspNetCore.Http;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Product;

namespace TechShop.Backend.Services;

public record ProductCreatedResult(Guid ProductId, string Slug);
public record ProductUpdatedResult(Guid ProductId);

public interface IProductService
{
    Task<ApiResponse<List<ProductListItemDto>>> GetProductsAsync(string? search, string? category, string? brand, decimal? minPrice, decimal? maxPrice, string? sort, int page, int pageSize);
    Task<ApiResponse<ProductDetailDto>> GetProductAsync(string slug);
    Task<ApiResponse<ProductCreatedResult>> CreateProductAsync(CreateProductDto dto);
    Task<ApiResponse<ProductUpdatedResult>> UpdateProductAsync(Guid id, UpdateProductDto dto);
    Task<ApiResponse<ProductUpdatedResult>> DeleteProductAsync(Guid id);
    Task<ApiResponse<ProductImageDto>> UploadImageAsync(Guid id, IFormFile file, string? altText, int sortOrder);
}
