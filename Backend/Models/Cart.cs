using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.Models;

public class Cart
{
    [Key]
    public Guid CartId { get; set; } = Guid.NewGuid();
    public Guid? UserId { get; set; } 

    [MaxLength(100)]
    public string? SessionId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
    public List<CartItem> Items { get; set; } = new();
}