using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Admin;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public class AdminUsersService : IAdminUsersService
{
    private readonly AppDbContext _context;

    public AdminUsersService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ApiResponse<List<AdminUserDto>>> GetUsersAsync(
        string? search,
        int? roleId,
        bool? active,
        int page,
        int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _context.Users.Include(u => u.Role).AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim().ToLower();
            query = query.Where(u => u.Email.ToLower().Contains(term) || u.FullName.ToLower().Contains(term) || (u.Phone != null && u.Phone.Contains(term)));
        }

        if (roleId.HasValue)
        {
            query = query.Where(u => u.RoleId == roleId.Value);
        }

        if (active.HasValue)
        {
            query = query.Where(u => u.IsActive == active.Value);
        }

        var total = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => ToDto(u))
            .ToListAsync();

        return ApiResponse<List<AdminUserDto>>.Ok(users, "OK", new PaginationMeta(page, pageSize, total));
    }

    public async Task<ApiResponse<AdminUserDto>> GetUserAsync(Guid id)
    {
        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == id);
        if (user == null)
        {
            return ApiResponse<AdminUserDto>.Fail("NOT_FOUND", "Nguoi dung khong ton tai.");
        }

        return ApiResponse<AdminUserDto>.Ok(ToDto(user));
    }

    public async Task<(ApiResponse<object>? ErrorResponse, Guid? NewUserId, ApiResponse<object>? SuccessResponse)> CreateUserAsync(CreateUserDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            return (ApiResponse<object>.Fail("EMAIL_EXISTS", "Email da ton tai."), null, null);
        }

        if (!await _context.Roles.AnyAsync(r => r.RoleId == dto.RoleId))
        {
            return (ApiResponse<object>.Fail("ROLE_NOT_FOUND", "Role khong ton tai."), null, null);
        }

        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            FullName = dto.FullName.Trim(),
            Phone = dto.Phone,
            RoleId = dto.RoleId,
            IsActive = dto.IsActive
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return (null, user.UserId, ApiResponse<object>.Ok(new { user.UserId }, "Da tao nguoi dung."));
    }

    public async Task<ApiResponse<object>> UpdateUserAsync(Guid id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai.");
        }

        if (!await _context.Roles.AnyAsync(r => r.RoleId == dto.RoleId))
        {
            return ApiResponse<object>.Fail("ROLE_NOT_FOUND", "Role khong ton tai.");
        }

        user.FullName = dto.FullName.Trim();
        user.Phone = dto.Phone;
        user.AvatarUrl = dto.AvatarUrl;
        user.RoleId = dto.RoleId;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { user.UserId }, "Da cap nhat nguoi dung.");
    }

    public async Task<ApiResponse<object>> UpdateStatusAsync(Guid id, UpdateUserStatusDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai.");
        }

        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { user.UserId, user.IsActive }, "Da cap nhat trang thai nguoi dung.");
    }

    public async Task<ApiResponse<object>> ChangePasswordAsync(Guid id, ChangeUserPasswordDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai.");
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { user.UserId }, "Da doi mat khau.");
    }

    public async Task<ApiResponse<object>> DeleteUserAsync(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai.");
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return ApiResponse<object>.Ok(new { user.UserId }, "Da khoa nguoi dung.");
    }

    private static AdminUserDto ToDto(User user)
        => new(
            user.UserId,
            user.Email,
            user.FullName,
            user.Phone,
            user.AvatarUrl,
            user.RoleId,
            user.Role?.RoleName,
            user.IsActive,
            user.CreatedAt,
            user.UpdatedAt);
}
