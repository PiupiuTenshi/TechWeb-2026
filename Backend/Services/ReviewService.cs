using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Review;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _context;

    public ReviewService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<object>> CreateReviewAsync(Guid userId, CreateReviewDto dto)
    {
        if (dto.Rating is < 1 or > 5)
        {
            return ApiResponse<object>.Fail("INVALID_RATING", "Rating phai tu 1 den 5.");
        }

        var hasCompletedOrder = await _context.Orders
            .Where(o => o.UserId == userId && o.Status == "Completed")
            .SelectMany(o => o.Items.Select(i => new { o.OrderId, i.VariantId }))
            .Join(_context.ProductVariants, oi => oi.VariantId, v => v.VariantId, (oi, v) => new { oi.OrderId, v.ProductId })
            .AnyAsync(x => x.ProductId == dto.ProductId && (dto.OrderId == null || x.OrderId == dto.OrderId));

        if (!hasCompletedOrder)
        {
            return ApiResponse<object>.Fail("ORDER_NOT_COMPLETED", "Chi co the danh gia sau khi don hang hoan tat.");
        }

        var review = new Review
        {
            ProductId = dto.ProductId,
            UserId = userId,
            OrderId = dto.OrderId,
            Rating = dto.Rating,
            Title = dto.Title,
            Body = dto.Body,
            IsVisible = false
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { review.ReviewId }, "Da gui danh gia, dang cho duyet.");
    }

    public async Task<ApiResponse<object>> GetProductReviewsAsync(Guid productId)
    {
        var reviews = await _context.Reviews
            .Include(r => r.User)
            .Where(r => r.ProductId == productId && r.IsVisible)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new
            {
                r.ReviewId,
                r.Rating,
                r.Title,
                r.Body,
                r.CreatedAt,
                user = r.User == null ? null : new { r.User.FullName, r.User.AvatarUrl }
            })
            .ToListAsync();

        return ApiResponse<object>.Ok(reviews);
    }
}
