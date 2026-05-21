using System;
using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.Models;

public class CartItem
{
    [Key]
    public Guid CartItemId { get; set; } = Guid.NewGuid();

    [Required]
    public Guid CartId { get; set; }
    public Cart? Cart { get; set; }

    [Required]
    public Guid VariantId { get; set; } 
    public ProductVariant? Variant { get; set; }

    public int Quantity { get; set; }

    public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
