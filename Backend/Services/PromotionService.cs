using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Promotion;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public class PromotionService : IPromotionService
{
    private readonly AppDbContext _context;

    public PromotionService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<PromotionDto>>> GetActivePromotionsAsync()
    {
        var now = DateTime.UtcNow;
        var promotions = await BasePromotionQuery()
            .Where(p => p.IsActive && p.StartsAt <= now && p.EndsAt >= now)
            .OrderBy(p => p.EndsAt)
            .ToListAsync();

        return ApiResponse<List<PromotionDto>>.Ok(promotions.Select(ToDto).ToList());
    }

    public async Task<ApiResponse<List<PromotionDto>>> GetPromotionsAsync(bool? active, int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var now = DateTime.UtcNow;
        var query = BasePromotionQuery();

        if (active.HasValue)
        {
            query = active.Value
                ? query.Where(p => p.IsActive && p.StartsAt <= now && p.EndsAt >= now)
                : query.Where(p => !p.IsActive || p.StartsAt > now || p.EndsAt < now);
        }

        var total = await query.CountAsync();
        var promotions = await query
            .OrderByDescending(p => p.StartsAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return ApiResponse<List<PromotionDto>>.Ok(promotions.Select(ToDto).ToList(), "OK", new PaginationMeta(page, pageSize, total));
    }

    public async Task<ApiResponse<PromotionDto>> GetPromotionAsync(Guid id)
    {
        var promotion = await BasePromotionQuery().FirstOrDefaultAsync(p => p.PromotionId == id);
        if (promotion == null)
        {
            return ApiResponse<PromotionDto>.Fail("NOT_FOUND", "Khuyen mai khong ton tai.");
        }

        return ApiResponse<PromotionDto>.Ok(ToDto(promotion));
    }

    public async Task<ApiResponse<object>> CreatePromotionAsync(CreatePromotionDto dto)
    {
        var validationError = ValidatePromotion(dto.DiscountType, dto.DiscountValue, dto.StartsAt, dto.EndsAt);
        if (validationError != null)
        {
            return validationError;
        }

        var promotion = new Promotion
        {
            Name = dto.Name.Trim(),
            DiscountType = dto.DiscountType,
            DiscountValue = dto.DiscountValue,
            StartsAt = dto.StartsAt,
            EndsAt = dto.EndsAt,
            IsActive = dto.IsActive
        };

        var productIds = await GetActiveProductIds(dto.ProductIds);
        foreach (var productId in productIds)
        {
            promotion.Products.Add(new PromotionProduct { ProductId = productId });
        }

        _context.Promotions.Add(promotion);
        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { promotion.PromotionId }, "Da tao khuyen mai.");
    }

    public async Task<ApiResponse<object>> UpdatePromotionAsync(Guid id, UpdatePromotionDto dto)
    {
        var validationError = ValidatePromotion(dto.DiscountType, dto.DiscountValue, dto.StartsAt, dto.EndsAt);
        if (validationError != null)
        {
            return validationError;
        }

        var promotion = await _context.Promotions.Include(p => p.Products).FirstOrDefaultAsync(p => p.PromotionId == id);
        if (promotion == null)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Khuyen mai khong ton tai.");
        }

        promotion.Name = dto.Name.Trim();
        promotion.DiscountType = dto.DiscountType;
        promotion.DiscountValue = dto.DiscountValue;
        promotion.StartsAt = dto.StartsAt;
        promotion.EndsAt = dto.EndsAt;
        promotion.IsActive = dto.IsActive;
        _context.PromotionProducts.RemoveRange(promotion.Products);
        promotion.Products.Clear();
        var productIds = await GetActiveProductIds(dto.ProductIds);
        foreach (var productId in productIds)
        {
            _context.PromotionProducts.Add(new PromotionProduct
            {
                PromotionId = promotion.PromotionId,
                ProductId = productId
            });
        }

        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { promotion.PromotionId }, "Da cap nhat khuyen mai.");
    }

    public async Task<ApiResponse<object>> DeletePromotionAsync(Guid id)
    {
        var promotion = await _context.Promotions.FindAsync(id);
        if (promotion == null)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Khuyen mai khong ton tai.");
        }

        promotion.IsActive = false;
        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { promotion.PromotionId }, "Da tat khuyen mai.");
    }

    private IQueryable<Promotion> BasePromotionQuery()
        => _context.Promotions
            .Include(p => p.Products)
            .ThenInclude(pp => pp.Product);

    private async Task<List<Guid>> GetActiveProductIds(List<Guid> productIds)
    {
        var uniqueProductIds = productIds.Distinct().ToList();
        return await _context.Products
            .Where(p => uniqueProductIds.Contains(p.ProductId) && p.IsActive)
            .Select(p => p.ProductId)
            .ToListAsync();
    }

    private static ApiResponse<object>? ValidatePromotion(string discountType, decimal discountValue, DateTime startsAt, DateTime endsAt)
    {
        if (discountType is not ("Percent" or "Fixed"))
        {
            return ApiResponse<object>.Fail("INVALID_DISCOUNT_TYPE", "DiscountType phai la Percent hoac Fixed.");
        }

        if (discountValue <= 0 || (discountType == "Percent" && discountValue > 100))
        {
            return ApiResponse<object>.Fail("INVALID_DISCOUNT_VALUE", "Gia tri khuyen mai khong hop le.");
        }

        if (endsAt <= startsAt)
        {
            return ApiResponse<object>.Fail("INVALID_DATE_RANGE", "Ngay ket thuc phai sau ngay bat dau.");
        }

        return null;
    }

    private static PromotionDto ToDto(Promotion promotion)
        => new(
            promotion.PromotionId,
            promotion.Name,
            promotion.DiscountType,
            promotion.DiscountValue,
            promotion.StartsAt,
            promotion.EndsAt,
            promotion.IsActive,
            promotion.Products
                .Where(pp => pp.Product != null)
                .Select(pp => new PromotionProductDto(
                    pp.Product!.ProductId,
                    pp.Product.Name,
                    pp.Product.Slug,
                    pp.Product.Brand,
                    pp.Product.ThumbnailUrl))
                .ToList());
}
