using TechShop.Backend.DTOs;
using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Services;

public interface IAuthService
{
    Task<ApiResponse<object>> RegisterAsync(RegisterDto dto);
    Task<ApiResponse<object>> LoginAsync(LoginDto dto);
    Task<ApiResponse<object>> RefreshAsync(RefreshTokenDto dto);
    Task<ApiResponse<object>> LogoutAsync(LogoutDto dto, string? authHeader);
    Task<ApiResponse<object>> GoogleLoginAsync(GoogleLoginDto dto);
    Task<ApiResponse<object>> ChangePasswordAsync(ChangePasswordDto dto, Guid userId);
    Task<ApiResponse<object>> ForgotPasswordAsync(ForgotPasswordDto dto);
}
