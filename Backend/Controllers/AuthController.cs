using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.Models;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(u => u.Email == email))
        {
            return BadRequest(ApiResponse<object>.Fail("EMAIL_EXISTS", "Email da ton tai."));
        }

        var customerRoleId = await _context.Roles
            .Where(x => x.RoleName == "Customer")
            .Select(x => x.RoleId)
            .FirstOrDefaultAsync();

        var user = new User
        {
            Email = email,
            FullName = dto.FullName.Trim(),
            Phone = dto.Phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = customerRoleId
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(ToUserDto(user, "Customer"), "Dang ky thanh cong."));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();
        var user = await _context.Users.Include(u => u.Role).FirstOrDefaultAsync(u => u.Email == email && u.IsActive);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return Unauthorized(ApiResponse<object>.Fail("INVALID_CREDENTIALS", "Email hoac mat khau khong dung."));
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = CreateRefreshToken(user.UserId);
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            accessToken,
            refreshToken = refreshToken.Token,
            user = ToUserDto(user, user.Role?.RoleName ?? "Customer")
        }));
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenDto dto)
    {
        var existing = await _context.RefreshTokens
            .Include(x => x.User)
            .ThenInclude(x => x!.Role)
            .FirstOrDefaultAsync(x => x.Token == dto.RefreshToken);

        if (existing?.User == null || existing.IsRevoked || existing.ExpiresAt <= DateTime.UtcNow)
        {
            return Unauthorized(ApiResponse<object>.Fail("INVALID_REFRESH_TOKEN", "Refresh token khong hop le."));
        }

        existing.IsRevoked = true;
        var replacement = CreateRefreshToken(existing.UserId);
        _context.RefreshTokens.Add(replacement);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            accessToken = GenerateJwtToken(existing.User),
            refreshToken = replacement.Token,
            user = ToUserDto(existing.User, existing.User.Role?.RoleName ?? "Customer")
        }));
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutDto dto)
    {
        var token = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == dto.RefreshToken);
        if (token != null)
        {
            token.IsRevoked = true;
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse<object>.Ok(new { }, "Dang xuat thanh cong."));
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginDto dto)
    {
        var settings = new GoogleJsonWebSignature.ValidationSettings();
        var payload = await GoogleJsonWebSignature.ValidateAsync(dto.Credential, settings);

        var email = payload.Email.ToLowerInvariant();
        var user = await _context.Users.Include(u => u.Role)
            .FirstOrDefaultAsync(u => u.Email == email);

        if (user != null && !user.IsActive)
        {
            return Unauthorized(ApiResponse<object>.Fail("ACCOUNT_LOCKED", "Tài khoản đã bị khóa."));
        }

        if (user == null)
        {
            var customerRoleId = await _context.Roles
                .Where(x => x.RoleName == "Customer")
                .Select(x => x.RoleId).FirstOrDefaultAsync();

            user = new User
            {
                Email = email,
                FullName = payload.Name,
                AvatarUrl = payload.Picture,
                GoogleId = payload.Subject,
                RoleId = customerRoleId,
            };
            _context.Users.Add(user);
        }
        else
        {
            user.GoogleId ??= payload.Subject;
            user.AvatarUrl ??= payload.Picture;
        }

        var accessToken = GenerateJwtToken(user);
        var refreshToken = CreateRefreshToken(user.UserId);
        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new
        {
            accessToken,
            refreshToken = refreshToken.Token,
            user = ToUserDto(user, user.Role?.RoleName ?? "Customer")
        }));
    }

    private string GenerateJwtToken(User user)
    {
        // Role is always included via .Include(u => u.Role) in Login/Refresh calls
        var roleName = user.Role?.RoleName ?? "Customer";
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.FullName),
            new Claim(ClaimTypes.Role, roleName)
        };

        var jwtKey = _configuration["Jwt:Secret"] ?? _configuration["Jwt:Key"]!;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var minutes = int.TryParse(_configuration["Jwt:AccessTokenExpiry"], out var value) ? value : 15;

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(minutes),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    private RefreshToken CreateRefreshToken(Guid userId)
    {
        var days = int.TryParse(_configuration["Jwt:RefreshTokenExpiry"], out var value) ? value : 7;
        return new RefreshToken
        {
            UserId = userId,
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
            ExpiresAt = DateTime.UtcNow.AddDays(days)
        };
    }

    private static object ToUserDto(User user, string roleName) => new
    {
        user.UserId,
        user.Email,
        user.FullName,
        user.Phone,
        user.AvatarUrl,
        user.RoleId,
        Role = roleName
    };
}
