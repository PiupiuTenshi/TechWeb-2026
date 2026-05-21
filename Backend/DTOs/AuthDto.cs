namespace TechShop.Backend.DTOs;

public record RegisterDto(string Email, string Password, string FullName, string? Phone);
public record LoginDto(string Email, string Password);
public record RefreshTokenDto(string RefreshToken);
public record LogoutDto(string RefreshToken);
