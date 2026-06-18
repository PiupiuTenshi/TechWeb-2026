using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Google.Apis.Auth;
using Microsoft.Extensions.Caching.Memory;
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
    private readonly Microsoft.Extensions.Caching.Memory.IMemoryCache _cache;

    public AuthController(AppDbContext context, IConfiguration configuration, Microsoft.Extensions.Caching.Memory.IMemoryCache cache)
    {
        _context = context;
        _configuration = configuration;
        _cache = cache;
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

        if (existing?.User == null)
        {
            return Unauthorized(ApiResponse<object>.Fail("INVALID_REFRESH_TOKEN", "Refresh token khong hop le."));
        }

        if (existing.IsRevoked)
        {
            var allUserTokens = await _context.RefreshTokens
                .Where(t => t.UserId == existing.UserId && !t.IsRevoked)
                .ToListAsync();
            
            foreach (var t in allUserTokens)
            {
                t.IsRevoked = true;
            }
            await _context.SaveChangesAsync();

            return Unauthorized(ApiResponse<object>.Fail("TOKEN_COMPROMISED", "Phat hien truy cap bat thuong. Vui long dang nhap lai."));
        }

        if (existing.ExpiresAt <= DateTime.UtcNow)
        {
            return Unauthorized(ApiResponse<object>.Fail("TOKEN_EXPIRED", "Phien dang nhap da het han."));
        }

        return Ok(ApiResponse<object>.Ok(new
        {
            accessToken = GenerateJwtToken(existing.User),
            refreshToken = existing.Token,
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

        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        if (authHeader != null && authHeader.StartsWith("Bearer "))
        {
            var accessToken = authHeader.Substring("Bearer ".Length).Trim();
            var handler = new JwtSecurityTokenHandler();
            if (handler.CanReadToken(accessToken))
            {
                var jwtToken = handler.ReadJwtToken(accessToken);
                var remainingTime = jwtToken.ValidTo - DateTime.UtcNow;
                if (remainingTime > TimeSpan.Zero)
                {
                    _cache.Set($"blacklist_{accessToken}", true, remainingTime);
                }
            }
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

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        if (dto.CurrentPassword == dto.NewPassword)
        {
            return BadRequest(ApiResponse<object>.Fail("SAME_PASSWORD", "Mat khau moi khong duoc giong mat khau hien tai."));
        }

        var userIdStr = User.FindFirstValue(System.Security.Claims.ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var user = await _context.Users.FindAsync(userId);
        if (user == null)
            return NotFound(ApiResponse<object>.Fail("USER_NOT_FOUND", "Nguoi dung khong ton tai."));

        if (!BCrypt.Net.BCrypt.Verify(dto.CurrentPassword, user.PasswordHash))
        {
            return BadRequest(ApiResponse<object>.Fail("INVALID_PASSWORD", "Mat khau hien tai khong dung."));
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        
        var allUserTokens = await _context.RefreshTokens
            .Where(t => t.UserId == userId && !t.IsRevoked)
            .ToListAsync();
        foreach (var t in allUserTokens)
        {
            t.IsRevoked = true;
        }

        await _context.SaveChangesAsync();

        return Ok(ApiResponse<object>.Ok(new { }, "Doi mat khau thanh cong. Vui long dang nhap lai."));
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

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var email = dto.Email.Trim().ToLowerInvariant();

        Console.WriteLine($"[FORGOT_PASSWORD] Request for email: {email}");

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email && u.IsActive);

        if (user != null)
        {
            var newPassword = Guid.NewGuid().ToString("N").Substring(0, 8);

            try
            {
                Console.WriteLine("[MAIL] User found");

                var brevoApiKey = _configuration["Brevo:ApiKey"];
                var senderEmail = _configuration["Brevo:SenderEmail"] ?? "no-reply@techshop.vn";
                var senderName = _configuration["Brevo:SenderName"] ?? "TechShop";

                if (string.IsNullOrEmpty(brevoApiKey))
                {
                    throw new Exception("Brevo ApiKey is not configured.");
                }

                Console.WriteLine("[MAIL] Preparing Brevo API request");

                var requestData = new
                {
                    sender = new { name = senderName, email = senderEmail },
                    to = new[] { new { email = email, name = user.FullName } },
                    subject = "Mật khẩu mới của bạn - TechShop",
                    textContent = $"Xin chào {user.FullName},\n\n" +
                                  $"Mật khẩu của bạn đã được reset tự động.\n" +
                                  $"Mật khẩu mới của bạn là: {newPassword}\n\n" +
                                  $"Vui lòng đăng nhập và đổi lại mật khẩu ngay.\n\n" +
                                  $"Trân trọng."
                };

                using (var client = new System.Net.Http.HttpClient())
                {
                    client.DefaultRequestHeaders.Add("api-key", brevoApiKey);
                    
                    var jsonContent = System.Text.Json.JsonSerializer.Serialize(requestData);
                    var content = new System.Net.Http.StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");
                    
                    Console.WriteLine("[MAIL] Sending via Brevo REST API...");
                    var response = await client.PostAsync("https://api.brevo.com/v3/smtp/email", content);

                    if (!response.IsSuccessStatusCode)
                    {
                        var errorContent = await response.Content.ReadAsStringAsync();
                        Console.WriteLine($"[BREVO_ERROR] {errorContent}");
                        throw new Exception($"Lỗi gửi email qua Brevo API: {response.StatusCode}");
                    }
                    
                    Console.WriteLine("[MAIL] Sent successfully via Brevo");
                }

                Console.WriteLine("[MAIL] Updating password");

                user.PasswordHash =
                    BCrypt.Net.BCrypt.HashPassword(newPassword);

                var allUserTokens = await _context.RefreshTokens
                    .Where(t => t.UserId == user.UserId && !t.IsRevoked)
                    .ToListAsync();

                foreach (var t in allUserTokens)
                {
                    t.IsRevoked = true;
                }

                await _context.SaveChangesAsync();

                Console.WriteLine("[MAIL] Database updated");
            }
            catch (Exception ex)
            {
                Console.WriteLine("=================================");
                Console.WriteLine("EMAIL SEND FAILED");
                Console.WriteLine(ex.Message);
                Console.WriteLine(ex.ToString());
                Console.WriteLine("=================================");

                return StatusCode(
                    500,
                    ApiResponse<object>.Fail(
                        "EMAIL_SEND_FAILED",
                        ex.Message
                    )
                );
            }
        }
        else
        {
            Console.WriteLine($"[FORGOT_PASSWORD] User not found: {email}");
        }

        Console.WriteLine("[FORGOT_PASSWORD] Finished");

        return Ok(
            ApiResponse<object>.Ok(
                new { },
                "Neu email hop le, mat khau moi da duoc gui. Vui long kiem tra hom thu."
            )
        );
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
