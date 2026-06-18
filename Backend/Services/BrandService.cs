using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Services;

public class BrandService : IBrandService
{
    private readonly AppDbContext _context;

    public BrandService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<string>>> GetBrandsAsync()
    {
        var brands = await _context.Products
            .Where(p => p.IsActive && p.Brand != null)
            .Select(p => p.Brand!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

        return ApiResponse<List<string>>.Ok(brands);
    }
}
