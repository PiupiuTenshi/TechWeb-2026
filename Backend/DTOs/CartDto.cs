// File: DTOs/CartDto.cs
using System;

namespace TechShop.Backend.DTOs;

// Chỉ cần gửi VariantId và Số lượng
public record AddToCartDto(Guid VariantId, int Quantity);
public record UpdateCartItemDto(int Quantity);
public record ApplyCouponDto(string Code);
