using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs.Review;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [Authorize]
    [HttpPost("reviews")]
    public async Task<IActionResult> CreateReview(CreateReviewDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _reviewService.CreateReviewAsync(userId, dto);
        
        if (!result.Success)
        {
            return BadRequest(result);
        }

        return Ok(result);
    }

    [HttpGet("products/{id:guid}/reviews")]
    public async Task<IActionResult> GetProductReviews(Guid id)
    {
        var result = await _reviewService.GetProductReviewsAsync(id);
        return Ok(result);
    }
}
