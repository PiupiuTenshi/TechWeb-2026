using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.Models;
using TechShop.Backend.DTOs;

namespace TechShop.Backend.Controller;
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
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            return BadRequest("Email đã tồn tại.");

        var user = new User
        {
            Email = dto.Email,
            FullName = dto.FullName,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            RoleId = 2 // Customer
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return Ok("Đăng ký thành công.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            return Unauthorized("Email hoặc mật khẩu không đúng.");

        var token = GenerateJwtToken(user);
        return Ok(new { AccessToken = token, User = new { user.FullName, RoleId = user.RoleId } });
    }

    private string GenerateJwtToken(User user)
    {
        return "chuoi-jwt-mau";
    }
}