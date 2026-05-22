using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.Models;

public class Order
{
    [Key]
    public Guid OrderId { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public User? User { get; set; }
    [MaxLength(30)]
    public string Status { get; set; } = "Pending";
    [MaxLength(150)]
    public string ReceiverName { get; set; } = string.Empty;
    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;
    [MaxLength(500)]
    public string ShippingAddress { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal DiscountTotal { get; set; }
    public decimal ShippingFee { get; set; }
    public decimal GrandTotal { get; set; }
    [MaxLength(100)]
    public string? TrackingCode { get; set; }
    [MaxLength(255)]
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<OrderItem> Items { get; set; } = new();
    public List<OrderStatusLog> StatusLogs { get; set; } = new();
    public Payment? Payment { get; set; }
}

public class OrderItem
{
    [Key]
    public Guid OrderItemId { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    public Guid VariantId { get; set; }
    public ProductVariant? Variant { get; set; }
    [MaxLength(255)]
    public string ProductName { get; set; } = string.Empty;
    [MaxLength(255)]
    public string? VariantInfo { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Subtotal { get; set; }
}

public class OrderStatusLog
{
    [Key]
    public Guid LogId { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    [MaxLength(30)]
    public string? OldStatus { get; set; }
    [MaxLength(30)]
    public string NewStatus { get; set; } = string.Empty;
    [MaxLength(255)]
    public string? Note { get; set; }
    public Guid? ChangedBy { get; set; }
    public User? ChangedByUser { get; set; }
    public DateTime ChangedAt { get; set; } = DateTime.UtcNow;
}

public class Payment
{
    [Key]
    public Guid PaymentId { get; set; } = Guid.NewGuid();
    public Guid OrderId { get; set; }
    public Order? Order { get; set; }
    [MaxLength(20)]
    public string Method { get; set; } = "COD";
    [MaxLength(20)]
    public string Status { get; set; } = "Pending";
    public decimal Amount { get; set; }
    [MaxLength(100)]
    public string? TransactionCode { get; set; }
    public string? GatewayResponse { get; set; }
    public DateTime? PaidAt { get; set; }
    public DateTime? RefundedAt { get; set; }
    [MaxLength(255)]
    public string? RefundNote { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Review
{
    [Key]
    public Guid ReviewId { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    public Guid UserId { get; set; }
    public User? User { get; set; }
    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }
    public byte Rating { get; set; }
    [MaxLength(150)]
    public string? Title { get; set; }
    [MaxLength(2000)]
    public string? Body { get; set; }
    public bool IsVisible { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
