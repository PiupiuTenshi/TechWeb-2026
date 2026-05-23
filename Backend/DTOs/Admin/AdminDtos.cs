namespace TechShop.Backend.DTOs.Admin;

public record RevenuePointDto(string Period, decimal Revenue, int Orders);

public record RevenueReportDto(
    DateTime From,
    DateTime To,
    decimal TotalRevenue,
    int TotalOrders,
    decimal AverageOrderValue,
    int PaidOrders,
    int CompletedOrders,
    List<RevenuePointDto> Points);

public record TopProductDto(
    Guid VariantId,
    string ProductName,
    string? VariantInfo,
    int QuantitySold,
    decimal Revenue);

public record LowStockDto(
    Guid InventoryId,
    Guid VariantId,
    string SKU,
    string ProductName,
    string? VariantInfo,
    int Quantity,
    int LowStockAlert,
    DateTime UpdatedAt);

public record InventoryItemDto(
    Guid InventoryId,
    Guid VariantId,
    string SKU,
    string ProductName,
    string? ProductSlug,
    string? Brand,
    string? VariantInfo,
    int Quantity,
    int LowStockAlert,
    DateTime UpdatedAt);

public record InventoryLogDto(
    Guid LogId,
    Guid VariantId,
    string SKU,
    string ProductName,
    string ChangeType,
    int Quantity,
    string? Note,
    string? CreatedByName,
    DateTime CreatedAt);

public record InventoryChangeDto(Guid VariantId, int Quantity, string? Note);
public record InventoryAdjustDto(Guid VariantId, int Quantity, string? Note);

public record AdminUserDto(
    Guid UserId,
    string Email,
    string FullName,
    string? Phone,
    string? AvatarUrl,
    int RoleId,
    string? Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record CreateUserDto(
    string Email,
    string Password,
    string FullName,
    string? Phone,
    int RoleId,
    bool IsActive);

public record UpdateUserDto(
    string FullName,
    string? Phone,
    string? AvatarUrl,
    int RoleId,
    bool IsActive);

public record UpdateUserStatusDto(bool IsActive);
public record ChangeUserPasswordDto(string Password);
