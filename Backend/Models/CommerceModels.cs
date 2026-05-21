using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.Models;

public class RefreshToken
{
    [Key]
    public Guid TokenId { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    [MaxLength(500)]
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsRevoked { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Address
{
    [Key]
    public Guid AddressId { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    [MaxLength(150)]
    public string ReceiverName { get; set; } = string.Empty;
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;
    [MaxLength(100)]
    public string Province { get; set; } = string.Empty;
    [MaxLength(100)]
    public string District { get; set; } = string.Empty;
    [MaxLength(100)]
    public string Ward { get; set; } = string.Empty;
    [MaxLength(255)]
    public string Street { get; set; } = string.Empty;
    public bool IsDefault { get; set; }
}

public class Coupon
{
    [Key]
    public Guid CouponId { get; set; } = Guid.NewGuid();
    [MaxLength(50)]
    public string Code { get; set; } = string.Empty;
    [MaxLength(20)]
    public string DiscountType { get; set; } = "Fixed";
    public decimal DiscountValue { get; set; }
    public decimal MinOrderValue { get; set; }
    public decimal? MaxDiscount { get; set; }
    public int UsageLimit { get; set; } = 1;
    public int UsedCount { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Promotion
{
    [Key]
    public Guid PromotionId { get; set; } = Guid.NewGuid();
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(20)]
    public string DiscountType { get; set; } = "Fixed";
    public decimal DiscountValue { get; set; }
    public DateTime StartsAt { get; set; }
    public DateTime EndsAt { get; set; }
    public bool IsActive { get; set; } = true;
    public List<PromotionProduct> Products { get; set; } = new();
}

public class PromotionProduct
{
    [Key]
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid PromotionId { get; set; }
    public Promotion? Promotion { get; set; }
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
}

public class Inventory
{
    [Key]
    public Guid InventoryId { get; set; } = Guid.NewGuid();
    public Guid VariantId { get; set; }
    public ProductVariant? Variant { get; set; }
    public int Quantity { get; set; }
    public int LowStockAlert { get; set; } = 5;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public class InventoryLog
{
    [Key]
    public Guid LogId { get; set; } = Guid.NewGuid();
    public Guid VariantId { get; set; }
    public ProductVariant? Variant { get; set; }
    [MaxLength(20)]
    public string ChangeType { get; set; } = string.Empty;
    public int Quantity { get; set; }
    [MaxLength(255)]
    public string? Note { get; set; }
    public Guid? CreatedBy { get; set; }
    public User? CreatedByUser { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
