using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Payment;

namespace TechShop.Backend.Services;

public interface IPaymentsService
{
    Task<ApiResponse<PaymentGatewayResultDto>> CreateGatewayPaymentAsync(CreatePaymentRequestDto dto, string method);
    Task<ApiResponse<object>> HandleCallbackAsync(PaymentCallbackDto dto, string method);
}
