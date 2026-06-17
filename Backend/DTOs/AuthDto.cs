using System.ComponentModel.DataAnnotations;

namespace TechShop.Backend.DTOs;

public record RegisterDto(
    [property: Required, EmailAddress, MaxLength(255)] string Email,
    [property: Required, MinLength(6), MaxLength(100)] string Password,
    [property: Required, MaxLength(150)] string FullName,
    [property: MaxLength(20)] string? Phone);

public record LoginDto(
    [property: Required, EmailAddress, MaxLength(255)] string Email,
    [property: Required] string Password);

public record RefreshTokenDto(
    [property: Required] string RefreshToken);

public record LogoutDto(
    [property: Required] string RefreshToken);

public record GoogleLoginDto(
    [property: Required] string Credential);
