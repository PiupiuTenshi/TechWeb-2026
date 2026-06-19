using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Product;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _context;
    private static readonly char[] _searchDelimiters = new[] { ' ', '\t', '\r', '\n', ',', ';', '-', '_', '/', '\\', '.', '+' };
    private static readonly HashSet<string> _allowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        { ".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg" };

    private static readonly HashSet<string> _allowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        { "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml" };

    private const long _maxFileSize = 5 * 1024 * 1024; // 5 MB

    public ProductService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<ProductListItemDto>>> GetProductsAsync(
        string? search,
        string? category,
        string? brand,
        decimal? minPrice,
        decimal? maxPrice,
        string? sort,
        int page,
        int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Products
            .Include(p => p.Category)
            .Where(p => p.IsActive)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category != null && p.Category.Slug == category);
        }

        if (!string.IsNullOrWhiteSpace(brand))
        {
            query = query.Where(p => p.Brand != null && p.Brand.ToLower() == brand.ToLower());
        }

        var searchTerm = NormalizeSearchAliases(search?.Trim().ToLower() ?? string.Empty);
        var searchTokens = string.IsNullOrWhiteSpace(searchTerm)
            ? Array.Empty<string>()
            : searchTerm
                .Split(_searchDelimiters, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .Where(token => token.Length >= 2)
                .Distinct()
                .ToArray();

        foreach (var token in searchTokens)
        {
            query = query.Where(p =>
                p.Name.ToLower().Contains(token)
                || p.Slug.ToLower().Contains(token)
                || (p.Brand != null && p.Brand.ToLower().Contains(token))
                || (p.Description != null && p.Description.ToLower().Contains(token))
                || (p.Tags != null && p.Tags.ToLower().Contains(token))
                || (p.Category != null && (
                    p.Category.Name.ToLower().Contains(token)
                    || p.Category.Slug.ToLower().Contains(token)))
                || p.Specifications.Any(s =>
                    s.SpecKey.ToLower().Contains(token)
                    || s.SpecValue.ToLower().Contains(token))
                || p.Variants.Any(v => v.IsActive && (
                    v.SKU.ToLower().Contains(token)
                    || (v.Color != null && v.Color.ToLower().Contains(token))
                    || (v.RAM != null && v.RAM.ToLower().Contains(token))
                    || (v.Storage != null && v.Storage.ToLower().Contains(token)))));
        }

        if (minPrice.HasValue)
        {
            query = query.Where(p => (p.SalePrice ?? p.BasePrice) >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => (p.SalePrice ?? p.BasePrice) <= maxPrice.Value);
        }

        if (searchTokens.Length > 0 && string.IsNullOrWhiteSpace(sort))
        {
            query = query
                .OrderByDescending(p => p.Name.ToLower().StartsWith(searchTerm!))
                .ThenByDescending(p => p.Name.ToLower().Contains(searchTerm!))
                .ThenByDescending(p => p.IsFeatured)
                .ThenByDescending(p => p.CreatedAt);
        }
        else
        {
            query = sort switch
            {
                "price_asc" => query.OrderBy(p => p.SalePrice ?? p.BasePrice),
                "price_desc" => query.OrderByDescending(p => p.SalePrice ?? p.BasePrice),
                "newest" => query.OrderByDescending(p => p.CreatedAt),
                _ => query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt)
            };
        }

        var total = await query.CountAsync();
        var productPage = await query
            .Include(p => p.Variants).ThenInclude(v => v.Inventory)
            .Include(p => p.Reviews)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var products = productPage
            .Select(p =>
            {
                var primaryVariant = p.Variants
                    .Where(v => v.IsActive)
                    .OrderBy(v => v.SKU)
                    .Select(v => new ProductVariantDto(
                        v.VariantId,
                        v.SKU,
                        v.Color,
                        v.RAM,
                        v.Storage,
                        v.PriceOffset,
                        v.Inventory?.Quantity ?? 0))
                    .FirstOrDefault();

                var visibleReviews = p.Reviews.Where(r => r.IsVisible).ToList();
                var avgRating = visibleReviews.Count == 0
                    ? 0
                    : Math.Round(visibleReviews.Average(r => (double)r.Rating), 1);

                return new ProductListItemDto(
                p.ProductId,
                p.Name,
                p.Slug,
                p.Brand,
                p.ThumbnailUrl,
                p.BasePrice,
                p.SalePrice,
                p.Category == null ? null : new ProductCategoryDto(p.Category.CategoryId, p.Category.Name, p.Category.Slug),
                p.IsFeatured,
                primaryVariant,
                avgRating,
                visibleReviews.Count);
            })
            .ToList();

        return ApiResponse<List<ProductListItemDto>>.Ok(products, "OK", new PaginationMeta(page, pageSize, total));
    }

    private static string NormalizeSearchAliases(string value)
    {
        if (string.IsNullOrWhiteSpace(value)) return string.Empty;

        return value
            .Replace("dien thoai", "phone")
            .Replace("điện thoại", "phone")
            .Replace("phu kien", "accessory")
            .Replace("phụ kiện", "accessory")
            .Replace("may tinh xach tay", "laptop")
            .Replace("máy tính xách tay", "laptop")
            .Replace("ban phim", "bàn phím")
            .Replace("chuot", "chuột");
    }

    public async Task<ApiResponse<ProductDetailDto>> GetProductAsync(string slug)
    {
        var product = await _context.Products
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Variants).ThenInclude(v => v.Inventory)
            .Include(p => p.Specifications)
            .Include(p => p.Reviews)
            .FirstOrDefaultAsync(p => p.Slug == slug && p.IsActive);

        if (product == null)
        {
            return ApiResponse<ProductDetailDto>.Fail("NOT_FOUND", "San pham khong ton tai.");
        }

        var avgRating = product.Reviews.Where(r => r.IsVisible).Select(r => (double)r.Rating).DefaultIfEmpty(0).Average();
        var dto = new ProductDetailDto(
            product.ProductId,
            product.Name,
            product.Slug,
            product.Brand,
            product.Description,
            product.ThumbnailUrl,
            product.BasePrice,
            product.SalePrice,
            product.Category == null ? null : new ProductCategoryDto(product.Category.CategoryId, product.Category.Name, product.Category.Slug),
            product.Images.OrderBy(i => i.SortOrder).Select(i => new ProductImageDto(i.ImageId, i.ImageUrl, i.AltText, i.SortOrder)).ToList(),
            product.Variants.Where(v => v.IsActive).Select(v => new ProductVariantDto(v.VariantId, v.SKU, v.Color, v.RAM, v.Storage, v.PriceOffset, v.Inventory?.Quantity ?? 0)).ToList(),
            product.Specifications.OrderBy(s => s.SortOrder).Select(s => new SpecificationDto(s.SpecKey, s.SpecValue, s.SortOrder)).ToList(),
            Math.Round(avgRating, 1));

        return ApiResponse<ProductDetailDto>.Ok(dto);
    }

    public async Task<ApiResponse<ProductCreatedResult>> CreateProductAsync(CreateProductDto dto)
    {
        if (await _context.Products.AnyAsync(p => p.Slug == dto.Slug))
        {
            return ApiResponse<ProductCreatedResult>.Fail("SLUG_EXISTS", "Slug da ton tai.");
        }

        var product = new Product
        {
            CategoryId = dto.CategoryId,
            Name = dto.Name,
            Slug = dto.Slug,
            Brand = dto.Brand,
            Description = dto.Description,
            BasePrice = dto.BasePrice,
            SalePrice = dto.SalePrice,
            ThumbnailUrl = dto.ThumbnailUrl,
            Tags = dto.Tags,
            IsFeatured = dto.IsFeatured
        };

        foreach (var image in dto.Images)
        {
            product.Images.Add(new ProductImage { ImageUrl = image.ImageUrl, AltText = image.AltText, SortOrder = image.SortOrder });
        }

        foreach (var spec in dto.Specifications)
        {
            product.Specifications.Add(new Specification { SpecKey = spec.SpecKey, SpecValue = spec.SpecValue, SortOrder = spec.SortOrder });
        }

        foreach (var variant in dto.Variants)
        {
            product.Variants.Add(new ProductVariant
            {
                SKU = variant.SKU,
                Color = variant.Color,
                RAM = variant.RAM,
                Storage = variant.Storage,
                PriceOffset = variant.PriceOffset,
                Inventory = new Inventory { Quantity = variant.Quantity }
            });
        }

        _context.Products.Add(product);
        await _context.SaveChangesAsync();

        return ApiResponse<ProductCreatedResult>.Ok(new ProductCreatedResult(product.ProductId, product.Slug), "Da tao san pham.");
    }

    public async Task<ApiResponse<ProductUpdatedResult>> UpdateProductAsync(Guid id, UpdateProductDto dto)
    {
        var product = await _context.Products
            .Include(p => p.Images)
            .Include(p => p.Specifications)
            .Include(p => p.Variants).ThenInclude(v => v.Inventory)
            .FirstOrDefaultAsync(p => p.ProductId == id);

        if (product == null)
        {
            return ApiResponse<ProductUpdatedResult>.Fail("NOT_FOUND", "San pham khong ton tai.");
        }

        product.CategoryId = dto.CategoryId;
        product.Name = dto.Name;
        product.Slug = dto.Slug;
        product.Brand = dto.Brand;
        product.Description = dto.Description;
        product.BasePrice = dto.BasePrice;
        product.SalePrice = dto.SalePrice;
        product.ThumbnailUrl = dto.ThumbnailUrl;
        product.Tags = dto.Tags;
        product.IsFeatured = dto.IsFeatured;
        product.IsActive = dto.IsActive;
        product.UpdatedAt = DateTime.UtcNow;

        // Cập nhật images nếu có
        if (dto.Images != null)
        {
            _context.ProductImages.RemoveRange(product.Images);
            product.Images.Clear();
            foreach (var image in dto.Images)
            {
                product.Images.Add(new ProductImage
                {
                    ProductId = id,
                    ImageUrl = image.ImageUrl,
                    AltText = image.AltText,
                    SortOrder = image.SortOrder
                });
            }
        }

        // Cập nhật specifications nếu có
        if (dto.Specifications != null)
        {
            _context.Specifications.RemoveRange(product.Specifications);
            product.Specifications.Clear();
            foreach (var spec in dto.Specifications)
            {
                _context.Specifications.Add(new Specification
                {
                    ProductId = id,
                    SpecKey = spec.SpecKey,
                    SpecValue = spec.SpecValue,
                    SortOrder = spec.SortOrder
                });
            }
        }

        // Cập nhật variants nếu có
        if (dto.Variants != null)
        {
            // Mark old variants as inactive instead of deleting (preserves inventory logs)
            foreach (var oldVariant in product.Variants)
            {
                oldVariant.IsActive = false;
                if (oldVariant.Inventory != null)
                {
                    oldVariant.Inventory.Quantity = 0;
                }
            }

            foreach (var variant in dto.Variants)
            {
                product.Variants.Add(new ProductVariant
                {
                    ProductId = id,
                    SKU = variant.SKU,
                    Color = variant.Color,
                    RAM = variant.RAM,
                    Storage = variant.Storage,
                    PriceOffset = variant.PriceOffset,
                    IsActive = true,
                    Inventory = new Inventory { Quantity = variant.Quantity }
                });
            }
        }

        await _context.SaveChangesAsync();

        return ApiResponse<ProductUpdatedResult>.Ok(new ProductUpdatedResult(product.ProductId), "Da cap nhat san pham.");
    }

    public async Task<ApiResponse<ProductUpdatedResult>> DeleteProductAsync(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return ApiResponse<ProductUpdatedResult>.Fail("NOT_FOUND", "San pham khong ton tai.");
        }

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<ProductUpdatedResult>.Ok(new ProductUpdatedResult(product.ProductId), "Da an san pham.");
    }

    public async Task<ApiResponse<ProductImageDto>> UploadImageAsync(Guid id, IFormFile file, string? altText, int sortOrder)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return ApiResponse<ProductImageDto>.Fail("NOT_FOUND", "San pham khong ton tai.");
        }

        if (file == null || file.Length == 0)
        {
            return ApiResponse<ProductImageDto>.Fail("INVALID_FILE", "File anh khong hop le.");
        }

        if (file.Length > _maxFileSize)
        {
            return ApiResponse<ProductImageDto>.Fail("FILE_TOO_LARGE", $"Kich thuoc file toi da la {_maxFileSize / (1024 * 1024)}MB.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrEmpty(extension) || !_allowedExtensions.Contains(extension))
        {
            return ApiResponse<ProductImageDto>.Fail("INVALID_EXTENSION", $"Dinh dang file khong ho tro. Cho phep: {string.Join(", ", _allowedExtensions)}");
        }

        var contentType = file.ContentType;
        if (!_allowedContentTypes.Contains(contentType))
        {
            return ApiResponse<ProductImageDto>.Fail("INVALID_CONTENT_TYPE", $"Dinh dang file khong ho tro.");
        }

        var fileName = $"{Guid.NewGuid():N}{extension}";
        var imagesDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images");
        Directory.CreateDirectory(imagesDir);
        var filePath = Path.Combine(imagesDir, fileName);

        await using (var stream = System.IO.File.Create(filePath))
        {
            await file.CopyToAsync(stream);
        }

        var image = new ProductImage
        {
            ProductId = id,
            ImageUrl = $"/images/{fileName}",
            AltText = altText,
            SortOrder = sortOrder
        };

        _context.ProductImages.Add(image);
        await _context.SaveChangesAsync();

        return ApiResponse<ProductImageDto>.Ok(new ProductImageDto(image.ImageId, image.ImageUrl, image.AltText, image.SortOrder), "Da upload anh.");
    }
}
