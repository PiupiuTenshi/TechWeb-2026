using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandsController : ControllerBase
{
    private readonly AppDbContext _context;

    public BrandsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetBrands()
    {
        var brands = await _context.Products
            .Where(p => p.IsActive && p.Brand != null)
            .Select(p => p.Brand!)
            .Distinct()
            .OrderBy(x => x)
            .ToListAsync();

        return Ok(ApiResponse<List<string>>.Ok(brands));
    }
}
