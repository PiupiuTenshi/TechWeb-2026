using TechShop.Backend.Models;

namespace TechShop.Backend.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext context)
    {
        try
        {
            if (!context.Users.Any())
            {
                context.Users.Add(new User
                {
                    Email = "admin@techshop.com",
                    FullName = "Quản Trị Viên",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin@123"),
                    RoleId = 1, //  Admin
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });

                context.Users.Add(new User
                {
                    Email = "sangpham@techshop.com",
                    FullName = "Sáng Phạm Minh",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Sang@123"),
                    RoleId = 2, // Customer
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });

                context.SaveChanges();
                Console.WriteLine("--> Đã nạp dữ liệu mẫu (Seed Data) thành công từ DbSeeder!");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"--> Lỗi khi khởi tạo dữ liệu mẫu: {ex.Message}");
        }
    }
}