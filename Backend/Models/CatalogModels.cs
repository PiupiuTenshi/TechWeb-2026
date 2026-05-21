using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.Models;

public class Role
{
    [Key]
    public int RoleId { get; set; }
    [MaxLength(50)]
    public string RoleName { get; set; } = string.Empty;
    public List<User> Users { get; set; } = new();
}

public class Category
{
    [Key]
    public int CategoryId { get; set; }
    public int? ParentId { get; set; }
    public Category? Parent { get; set; }
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(200)]
    public string Slug { get; set; } = string.Empty;
    public int DisplayOrder { get; set; }
    public bool IsActive { get; set; } = true;
    public List<Category> Children { get; set; } = new();
    public List<Product> Products { get; set; } = new();
}

public class Product
{
    [Key]
    public Guid ProductId { get; set; } = Guid.NewGuid();
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
    [MaxLength(255)]
    public string Name { get; set; } = string.Empty;
    [MaxLength(300)]
    public string Slug { get; set; } = string.Empty;
    [MaxLength(100)]
    public string? Brand { get; set; }
    public string? Description { get; set; }
    public decimal BasePrice { get; set; }
    public decimal? SalePrice { get; set; }
    [MaxLength(500)]
    public string? ThumbnailUrl { get; set; }
    [MaxLength(500)]
    public string? Tags { get; set; }
    public bool IsFeatured { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<ProductImage> Images { get; set; } = new();
    public List<ProductVariant> Variants { get; set; } = new();
    public List<Specification> Specifications { get; set; } = new();
    public List<Review> Reviews { get; set; } = new();
}

public class ProductImage
{
    [Key]
    public Guid ImageId { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;
    [MaxLength(255)]
    public string? AltText { get; set; }
    public int SortOrder { get; set; }
}

public class ProductVariant
{
    [Key]
    public Guid VariantId { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    [MaxLength(100)]
    public string SKU { get; set; } = string.Empty;
    [MaxLength(50)]
    public string? Color { get; set; }
    [MaxLength(20)]
    public string? RAM { get; set; }
    [MaxLength(20)]
    public string? Storage { get; set; }
    public decimal PriceOffset { get; set; }
    public bool IsActive { get; set; } = true;
    public Inventory? Inventory { get; set; }
}

public class Specification
{
    [Key]
    public Guid SpecId { get; set; } = Guid.NewGuid();
    public Guid ProductId { get; set; }
    public Product? Product { get; set; }
    [MaxLength(100)]
    public string SpecKey { get; set; } = string.Empty;
    [MaxLength(255)]
    public string SpecValue { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
