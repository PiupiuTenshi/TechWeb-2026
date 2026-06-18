using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Product;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<CategoryDto>>> GetCategoriesAsync()
    {
        var categories = await _context.Categories
            .Where(c => c.IsActive)
            .OrderBy(c => c.DisplayOrder)
            .ToListAsync();

        var tree = categories
            .Where(c => c.ParentId == null)
            .Select(c => MapCategory(c, categories))
            .ToList();

        return ApiResponse<List<CategoryDto>>.Ok(tree);
    }

    private static CategoryDto MapCategory(Category category, List<Category> all)
        => new(
            category.CategoryId,
            category.Name,
            category.Slug,
            all.Where(c => c.ParentId == category.CategoryId)
                .OrderBy(c => c.DisplayOrder)
                .Select(c => MapCategory(c, all))
                .ToList());
}
