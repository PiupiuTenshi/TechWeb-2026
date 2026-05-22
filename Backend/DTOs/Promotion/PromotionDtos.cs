namespace TechShop.Backend.DTOs.Promotion;

public record PromotionProductDto(Guid ProductId, string Name, string Slug, string? Brand, string? ThumbnailUrl);

public record PromotionDto(
    Guid PromotionId,
    string Name,
    string DiscountType,
    decimal DiscountValue,
    DateTime StartsAt,
    DateTime EndsAt,
    bool IsActive,
    List<PromotionProductDto> Products);

public record CreatePromotionDto(
    string Name,
    string DiscountType,
    decimal DiscountValue,
    DateTime StartsAt,
    DateTime EndsAt,
    bool IsActive,
    List<Guid> ProductIds);

public record UpdatePromotionDto(
    string Name,
    string DiscountType,
    decimal DiscountValue,
    DateTime StartsAt,
    DateTime EndsAt,
    bool IsActive,
    List<Guid> ProductIds);
