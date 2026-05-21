using TechShop.Backend.Models;

namespace TechShop.Backend.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        try
        {
            if (!context.Roles.Any())
            {
                context.Roles.AddRange(
                    new Role { RoleId = 1, RoleName = "Admin" },
                    new Role { RoleId = 2, RoleName = "Staff" },
                    new Role { RoleId = 3, RoleName = "Customer" });
                context.SaveChanges();
            }

            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { CategoryId = 1, Name = "Laptop", Slug = "laptop", DisplayOrder = 1 },
                    new Category { CategoryId = 2, Name = "Dien thoai", Slug = "phone", DisplayOrder = 2 },
                    new Category { CategoryId = 3, Name = "Phu kien", Slug = "accessory", DisplayOrder = 3 });
                context.SaveChanges();
            }

            if (!context.Users.Any())
            {
                context.Users.AddRange(
                    new User
                    {
                        Email = "admin@techshop.vn",
                        FullName = "TechShop Admin",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                        RoleId = 1
                    },
                    new User
                    {
                        Email = "test@techshop.vn",
                        FullName = "Khach hang TechShop",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test@123"),
                        RoleId = 3
                    });
                context.SaveChanges();
            }

            if (!context.Products.Any())
            {
                AddProduct(context, 1, "Laptop ASUS ROG Strix G16", "laptop-asus-rog-strix-g16", "Asus", 35000000, 32000000, true);
                AddProduct(context, 1, "MacBook Air M3 13 inch", "macbook-air-m3-13", "Apple", 28990000, 27490000, true);
                AddProduct(context, 2, "iPhone 15 Pro Max", "iphone-15-pro-max", "Apple", 34990000, 32990000, true);
                AddProduct(context, 2, "Samsung Galaxy S24 Ultra", "samsung-galaxy-s24-ultra", "Samsung", 33990000, 29990000, false);
                AddProduct(context, 3, "Tai nghe Sony WH-1000XM5", "sony-wh-1000xm5", "Sony", 8990000, 7990000, false);
                context.SaveChanges();
            }

            if (!context.Coupons.Any())
            {
                context.Coupons.Add(new Coupon
                {
                    Code = "TECHSHOP10",
                    DiscountType = "Percent",
                    DiscountValue = 10,
                    MinOrderValue = 1000000,
                    MaxDiscount = 1000000,
                    UsageLimit = 100,
                    StartsAt = DateTime.UtcNow.AddDays(-1),
                    ExpiresAt = DateTime.UtcNow.AddMonths(1)
                });
                context.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Seed skipped: {ex.Message}");
        }
    }

    private static void AddProduct(AppDbContext context, int categoryId, string name, string slug, string brand, decimal basePrice, decimal salePrice, bool featured)
    {
        var product = new Product
        {
            CategoryId = categoryId,
            Name = name,
            Slug = slug,
            Brand = brand,
            Description = $"{name} chinh hang tai TechShop.",
            BasePrice = basePrice,
            SalePrice = salePrice,
            ThumbnailUrl = $"/images/{slug}.webp",
            IsFeatured = featured,
            Tags = $"{brand},phase1"
        };

        var variant = new ProductVariant
        {
            Product = product,
            SKU = $"{slug.ToUpperInvariant()}-STD",
            Color = "Default",
            RAM = categoryId == 3 ? null : "8GB",
            Storage = categoryId == 3 ? null : "256GB",
            Inventory = new Inventory { Quantity = 20 }
        };

        product.Variants.Add(variant);
        product.Images.Add(new ProductImage { ImageUrl = product.ThumbnailUrl, AltText = name, SortOrder = 0 });
        product.Specifications.Add(new Specification { SpecKey = "Brand", SpecValue = brand, SortOrder = 1 });
        product.Specifications.Add(new Specification { SpecKey = "Warranty", SpecValue = "12 months", SortOrder = 2 });

        context.Products.Add(product);
    }
}
