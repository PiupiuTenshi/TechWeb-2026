namespace TechShop.Backend.DTOs.Review;

public record CreateReviewDto(Guid ProductId, Guid? OrderId, byte Rating, string? Title, string? Body);
