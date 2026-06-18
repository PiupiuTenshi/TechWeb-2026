using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TechShop.Backend.DTOs.Admin;
using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Services;

public interface IAdminUsersService
{
    Task<ApiResponse<List<AdminUserDto>>> GetUsersAsync(string? search, int? roleId, bool? active, int page, int pageSize);
    Task<ApiResponse<AdminUserDto>> GetUserAsync(Guid id);
    Task<(ApiResponse<object>? ErrorResponse, Guid? NewUserId, ApiResponse<object>? SuccessResponse)> CreateUserAsync(CreateUserDto dto);
    Task<ApiResponse<object>> UpdateUserAsync(Guid id, UpdateUserDto dto);
    Task<ApiResponse<object>> UpdateStatusAsync(Guid id, UpdateUserStatusDto dto);
    Task<ApiResponse<object>> ChangePasswordAsync(Guid id, ChangeUserPasswordDto dto);
    Task<ApiResponse<object>> DeleteUserAsync(Guid id);
}
