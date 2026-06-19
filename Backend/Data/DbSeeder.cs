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
                    new Role { RoleName = "Admin" },
                    new Role { RoleName = "Staff" },
                    new Role { RoleName = "Customer" });
                context.SaveChanges();
            }

            if (!context.Categories.Any())
            {
                context.Categories.AddRange(
                    new Category { Name = "Laptop", Slug = "laptop", DisplayOrder = 1 },
                    new Category { Name = "Dien thoai", Slug = "phone", DisplayOrder = 2 },
                    new Category { Name = "Phu kien", Slug = "accessory", DisplayOrder = 3 });
                context.SaveChanges();
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Seed skipped: {ex.Message}");
        }
    }
}
