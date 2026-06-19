using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var response = await _authService.RegisterAsync(dto);
        if (!response.Success)
            return BadRequest(response);
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
        var response = await _authService.LoginAsync(dto, sessionId);
        if (!response.Success)
            return Unauthorized(response);
        return Ok(response);
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh(RefreshTokenDto dto)
    {
        var response = await _authService.RefreshAsync(dto);
        if (!response.Success)
            return Unauthorized(response);
        return Ok(response);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(LogoutDto dto)
    {
        var authHeader = Request.Headers["Authorization"].FirstOrDefault();
        var response = await _authService.LogoutAsync(dto, authHeader);
        return Ok(response);
    }

    [HttpPost("google-login")]
    public async Task<IActionResult> GoogleLogin(GoogleLoginDto dto)
    {
        var sessionId = Request.Headers["X-Session-Id"].FirstOrDefault();
        var response = await _authService.GoogleLoginAsync(dto, sessionId);
        if (!response.Success)
            return Unauthorized(response);
        return Ok(response);
    }

    [Microsoft.AspNetCore.Authorization.Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdStr, out var userId))
            return Unauthorized();

        var response = await _authService.ChangePasswordAsync(dto, userId);
        if (!response.Success)
        {
            if (response.Error == "USER_NOT_FOUND") return NotFound(response);
            return BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var response = await _authService.ForgotPasswordAsync(dto);
        if (!response.Success)
        {
            return StatusCode(500, response);
        }
        return Ok(response);
    }
}
