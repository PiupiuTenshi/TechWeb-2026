using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs.Promotion;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PromotionsController : ControllerBase
{
    private readonly IPromotionService _promotionService;

    public PromotionsController(IPromotionService promotionService)
    {
        _promotionService = promotionService;
    }

    [HttpGet("active")]
    public async Task<IActionResult> GetActivePromotions()
    {
        var result = await _promotionService.GetActivePromotionsAsync();
        return Ok(result);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet]
    public async Task<IActionResult> GetPromotions([FromQuery] bool? active, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = await _promotionService.GetPromotionsAsync(active, page, pageSize);
        return Ok(result);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPromotion(Guid id)
    {
        var result = await _promotionService.GetPromotionAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPost]
    public async Task<IActionResult> CreatePromotion(CreatePromotionDto dto)
    {
        var result = await _promotionService.CreatePromotionAsync(dto);
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return StatusCode(201, result);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdatePromotion(Guid id, UpdatePromotionDto dto)
    {
        var result = await _promotionService.UpdatePromotionAsync(id, dto);
        if (!result.Success)
        {
            if (result.Message == "Khuyen mai khong ton tai.")
            {
                return NotFound(result);
            }
            return BadRequest(result);
        }

        return Ok(result);
    }

    [Authorize(Roles = "Admin,Staff")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePromotion(Guid id)
    {
        var result = await _promotionService.DeletePromotionAsync(id);
        if (!result.Success)
        {
            return NotFound(result);
        }

        return Ok(result);
    }
}
