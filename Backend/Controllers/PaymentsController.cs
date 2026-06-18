using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TechShop.Backend.DTOs.Payment;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentsService _paymentsService;

    public PaymentsController(IPaymentsService paymentsService)
    {
        _paymentsService = paymentsService;
    }

    [Authorize]
    [HttpPost("vnpay/create")]
    public async Task<IActionResult> CreateVnPayPayment(CreatePaymentRequestDto dto)
    {
        var response = await _paymentsService.CreateGatewayPaymentAsync(dto, "VNPay");
        if (!response.Success)
        {
            return response.Error == "ORDER_NOT_FOUND" ? NotFound(response) : BadRequest(response);
        }
        return Ok(response);
    }

    [Authorize]
    [HttpPost("momo/create")]
    public async Task<IActionResult> CreateMomoPayment(CreatePaymentRequestDto dto)
    {
        var response = await _paymentsService.CreateGatewayPaymentAsync(dto, "Momo");
        if (!response.Success)
        {
            return response.Error == "ORDER_NOT_FOUND" ? NotFound(response) : BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("vnpay/callback")]
    public async Task<IActionResult> VnPayCallback(PaymentCallbackDto dto)
    {
        var response = await _paymentsService.HandleCallbackAsync(dto, "VNPay");
        if (!response.Success)
        {
            return response.Error == "PAYMENT_NOT_FOUND" ? NotFound(response) : BadRequest(response);
        }
        return Ok(response);
    }

    [HttpPost("momo/callback")]
    public async Task<IActionResult> MomoCallback(PaymentCallbackDto dto)
    {
        var response = await _paymentsService.HandleCallbackAsync(dto, "Momo");
        if (!response.Success)
        {
            return response.Error == "PAYMENT_NOT_FOUND" ? NotFound(response) : BadRequest(response);
        }
        return Ok(response);
    }
}
