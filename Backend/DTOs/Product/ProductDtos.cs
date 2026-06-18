namespace TechShop.Backend.DTOs.Product;

public record CategoryDto(int CategoryId, string Name, string Slug, List<CategoryDto> Children);
public record ProductCategoryDto(int CategoryId, string Name, string Slug);
public record ProductImageDto(Guid ImageId, string ImageUrl, string? AltText, int SortOrder);
public record ProductVariantDto(Guid VariantId, string SKU, string? Color, string? RAM, string? Storage, decimal PriceOffset, int Stock);
public record SpecificationDto(string SpecKey, string SpecValue, int SortOrder);

public record ProductListItemDto(
    Guid ProductId,
    string Name,
    string Slug,
    string? Brand,
    string? Description,
    string? ThumbnailUrl,
    decimal BasePrice,
    decimal? SalePrice,
    ProductCategoryDto? Category,
    string? Tags,
    bool IsActive,
    bool IsFeatured);

public record ProductDetailDto(
    Guid ProductId,
    string Name,
    string Slug,
    string? Brand,
    string? Description,
    string? ThumbnailUrl,
    decimal BasePrice,
    decimal? SalePrice,
    ProductCategoryDto? Category,
    List<ProductImageDto> Images,
    List<ProductVariantDto> Variants,
    List<SpecificationDto> Specifications,
    double AvgRating);

public record ProductVariantInputDto(string SKU, string? Color, string? RAM, string? Storage, decimal PriceOffset, int Quantity);
public record ProductImageInputDto(string ImageUrl, string? AltText, int SortOrder);
public record SpecificationInputDto(string SpecKey, string SpecValue, int SortOrder);
public record CreateProductDto(
    int CategoryId,
    string Name,
    string Slug,
    string? Brand,
    string? Description,
    decimal BasePrice,
    decimal? SalePrice,
    string? ThumbnailUrl,
    string? Tags,
    bool IsFeatured,
    List<ProductVariantInputDto> Variants,
    List<ProductImageInputDto> Images,
    List<SpecificationInputDto> Specifications);

public record UpdateProductDto(
    int CategoryId,
    string Name,
    string Slug,
    string? Brand,
    string? Description,
    decimal BasePrice,
    decimal? SalePrice,
    string? ThumbnailUrl,
    string? Tags,
    bool IsFeatured,
    bool IsActive,
    List<ProductVariantInputDto>? Variants,
    List<ProductImageInputDto>? Images,
    List<SpecificationInputDto>? Specifications);
