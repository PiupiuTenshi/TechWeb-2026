using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TechShop.Backend.DTOs.Admin;
using TechShop.Backend.DTOs.Common;

namespace TechShop.Backend.Services;

public interface IAdminReportsService
{
    Task<ApiResponse<RevenueReportDto>> GetRevenueAsync(DateTime? from, DateTime? to, string groupBy);
    Task<ApiResponse<List<TopProductDto>>> GetTopProductsAsync(DateTime? from, DateTime? to, int take);
    Task<ApiResponse<List<LowStockDto>>> GetLowStockAsync(int? threshold, int take);
    Task<byte[]> ExportRevenueAsync(DateTime? from, DateTime? to, string groupBy);
}
