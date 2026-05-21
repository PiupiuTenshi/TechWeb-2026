using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Product;
using TechShop.Backend.Models;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProductsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category,
        [FromQuery] string? brand,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
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

        if (minPrice.HasValue)
        {
            query = query.Where(p => (p.SalePrice ?? p.BasePrice) >= minPrice.Value);
        }

        if (maxPrice.HasValue)
        {
            query = query.Where(p => (p.SalePrice ?? p.BasePrice) <= maxPrice.Value);
        }

        query = sort switch
        {
            "price_asc" => query.OrderBy(p => p.SalePrice ?? p.BasePrice),
            "price_desc" => query.OrderByDescending(p => p.SalePrice ?? p.BasePrice),
            "newest" => query.OrderByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.IsFeatured).ThenByDescending(p => p.CreatedAt)
        };

        var total = await query.CountAsync();
        var products = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductListItemDto(
                p.ProductId,
                p.Name,
                p.Slug,
                p.Brand,
                p.ThumbnailUrl,
                p.BasePrice,
                p.SalePrice,
                p.Category == null ? null : new ProductCategoryDto(p.Category.CategoryId, p.Category.Name, p.Category.Slug),
                p.IsFeatured))
            .ToListAsync();

        return Ok(ApiResponse<List<ProductListItemDto>>.Ok(products, "OK", new PaginationMeta(page, pageSize, total)));
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetProduct(string slug)
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
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "San pham khong ton tai."));
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

        return Ok(ApiResponse<ProductDetailDto>.Ok(dto));
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct(CreateProductDto dto)
    {
        if (await _context.Products.AnyAsync(p => p.Slug == dto.Slug))
        {
            return BadRequest(ApiResponse<object>.Fail("SLUG_EXISTS", "Slug da ton tai."));
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

        return CreatedAtAction(nameof(GetProduct), new { slug = product.Slug }, ApiResponse<object>.Ok(new { product.ProductId, product.Slug }, "Da tao san pham."));
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, UpdateProductDto dto)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "San pham khong ton tai."));
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
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { product.ProductId }, "Da cap nhat san pham."));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "San pham khong ton tai."));
        }

        product.IsActive = false;
        product.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { product.ProductId }, "Da an san pham."));
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPost("{id:guid}/images")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file, [FromForm] string? altText, [FromForm] int sortOrder = 0)
    {
        var product = await _context.Products.FindAsync(id);
        if (product == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "San pham khong ton tai."));
        }

        if (file.Length == 0)
        {
            return BadRequest(ApiResponse<object>.Fail("EMPTY_FILE", "File anh khong hop le."));
        }

        var extension = Path.GetExtension(file.FileName);
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

        return Ok(ApiResponse<object>.Ok(new ProductImageDto(image.ImageId, image.ImageUrl, image.AltText, image.SortOrder), "Da upload anh."));
    }
}
