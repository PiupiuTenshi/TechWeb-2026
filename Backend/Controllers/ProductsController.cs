using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Product;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    private const long _maxFileSize = 5 * 1024 * 1024; // 5 MB

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? brand,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] string? sort,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var response = await _productService.GetProductsAsync(search, category, brand, minPrice, maxPrice, sort, page, pageSize);
        return Ok(response);
    }

    [HttpGet("{slug}")]
    public async Task<IActionResult> GetProduct(string slug)
    {
        var response = await _productService.GetProductAsync(slug);
        if (!response.Success)
        {
            if (response.Error == "NOT_FOUND") return NotFound(response);
            return BadRequest(response);
        }
        return Ok(response);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPost]
    public async Task<IActionResult> CreateProduct(CreateProductDto dto)
    {
        var response = await _productService.CreateProductAsync(dto);
        if (!response.Success)
        {
            return BadRequest(response);
        }
        return CreatedAtAction(nameof(GetProduct), new { slug = response.Data!.Slug }, response);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProduct(Guid id, UpdateProductDto dto)
    {
        var response = await _productService.UpdateProductAsync(id, dto);
        if (!response.Success)
        {
            if (response.Error == "NOT_FOUND") return NotFound(response);
            return BadRequest(response);
        }
        return Ok(response);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var response = await _productService.DeleteProductAsync(id);
        if (!response.Success)
        {
            if (response.Error == "NOT_FOUND") return NotFound(response);
            return BadRequest(response);
        }
        return Ok(response);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPost("{id:guid}/images")]
    [RequestSizeLimit(_maxFileSize)]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file, [FromForm] string? altText, [FromForm] int sortOrder = 0)
    {
        var response = await _productService.UploadImageAsync(id, file, altText, sortOrder);
        if (!response.Success)
        {
            if (response.Error == "NOT_FOUND") return NotFound(response);
            return BadRequest(response);
        }
        return Ok(response);
    }
}
