using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Admin;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.Models;

namespace TechShop.Backend.Controllers.Admin;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminUsersController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? search,
        [FromQuery] int? roleId,
        [FromQuery] bool? active,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
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

        return Ok(ApiResponse<List<AdminUserDto>>.Ok(users, "OK", new PaginationMeta(page, pageSize, total)));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUser(Guid id)
    {
        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.UserId == id);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai."));
        }

        return Ok(ApiResponse<AdminUserDto>.Ok(ToDto(user)));
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(CreateUserDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            return BadRequest(ApiResponse<object>.Fail("EMAIL_EXISTS", "Email da ton tai."));
        }

        if (!await _context.Roles.AnyAsync(r => r.RoleId == dto.RoleId))
        {
            return BadRequest(ApiResponse<object>.Fail("ROLE_NOT_FOUND", "Role khong ton tai."));
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

        return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, ApiResponse<object>.Ok(new { user.UserId }, "Da tao nguoi dung."));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateUser(Guid id, UpdateUserDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai."));
        }

        if (!await _context.Roles.AnyAsync(r => r.RoleId == dto.RoleId))
        {
            return BadRequest(ApiResponse<object>.Fail("ROLE_NOT_FOUND", "Role khong ton tai."));
        }

        user.FullName = dto.FullName.Trim();
        user.Phone = dto.Phone;
        user.AvatarUrl = dto.AvatarUrl;
        user.RoleId = dto.RoleId;
        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { user.UserId }, "Da cap nhat nguoi dung."));
    }

    [HttpPatch("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, UpdateUserStatusDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai."));
        }

        user.IsActive = dto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { user.UserId, user.IsActive }, "Da cap nhat trang thai nguoi dung."));
    }

    [HttpPatch("{id:guid}/password")]
    public async Task<IActionResult> ChangePassword(Guid id, ChangeUserPasswordDto dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai."));
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { user.UserId }, "Da doi mat khau."));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse<object>.Fail("NOT_FOUND", "Nguoi dung khong ton tai."));
        }

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { user.UserId }, "Da khoa nguoi dung."));
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
