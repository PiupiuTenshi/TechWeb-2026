// File: DTOs/CartDto.cs
using System;

namespace TechShop.Backend.DTOs;

// Chỉ cần gửi VariantId và Số lượng
public record AddToCartDto(Guid VariantId, int Quantity);