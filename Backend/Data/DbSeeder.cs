// File: Data/DbSeeder.cs
using System;
using System.Linq;
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
                    RoleId = 1,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });

                context.Users.Add(new User
                {
                    Email = "sangpham@techshop.com",
                    FullName = "Sáng Phạm Minh",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("Sang@123"),
                    RoleId = 2,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                });

                context.SaveChanges();
                Console.WriteLine("--> Đã nạp dữ liệu mẫu (Seed Data) cho Users thành công!");
            }

            if (!context.Carts.Any())
            {
                var customer = context.Users.FirstOrDefault(u => u.Email == "sangpham@techshop.com");

                if (customer != null)
                {
                    var dummyVariantId = Guid.NewGuid(); 

                    var cart = new Cart
                    {
                        UserId = customer.UserId,
                        SessionId = null, 
                        CreatedAt = DateTime.UtcNow,
                    };

                    cart.Items.Add(new CartItem
                    {
                        VariantId = dummyVariantId, 
                        Quantity = 2,
                        AddedAt = DateTime.UtcNow
                    });

                    cart.Items.Add(new CartItem
                    {
                        VariantId = Guid.NewGuid(), 
                        Quantity = 1,
                        AddedAt = DateTime.UtcNow
                    });

                    context.Carts.Add(cart);
                    context.SaveChanges();
                    Console.WriteLine("--> Đã nạp dữ liệu mẫu cho Giỏ hàng (Cart) thành công!");
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"--> Lỗi khi khởi tạo dữ liệu mẫu: {ex.Message}");
        }
    }
}