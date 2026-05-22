using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Payment;
using TechShop.Backend.Models;
using TechShop.Backend.Services;

namespace TechShop.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IPaymentGatewayService _paymentGateway;
    private readonly IEmailService _emailService;

    public PaymentsController(AppDbContext context, IPaymentGatewayService paymentGateway, IEmailService emailService)
    {
        _context = context;
        _paymentGateway = paymentGateway;
        _emailService = emailService;
    }

    [Authorize]
    [HttpPost("vnpay/create")]
    public async Task<IActionResult> CreateVnPayPayment(CreatePaymentRequestDto dto)
        => await CreateGatewayPayment(dto, "VNPay");

    [Authorize]
    [HttpPost("momo/create")]
    public async Task<IActionResult> CreateMomoPayment(CreatePaymentRequestDto dto)
        => await CreateGatewayPayment(dto, "Momo");

    [HttpPost("vnpay/callback")]
    public async Task<IActionResult> VnPayCallback(PaymentCallbackDto dto)
        => await HandleCallback(dto, "VNPay");

    [HttpPost("momo/callback")]
    public async Task<IActionResult> MomoCallback(PaymentCallbackDto dto)
        => await HandleCallback(dto, "Momo");

    private async Task<IActionResult> CreateGatewayPayment(CreatePaymentRequestDto dto, string method)
    {
        var order = await _context.Orders.Include(o => o.Payment).FirstOrDefaultAsync(o => o.OrderId == dto.OrderId);
        if (order == null)
        {
            return NotFound(ApiResponse<object>.Fail("ORDER_NOT_FOUND", "Don hang khong ton tai."));
        }

        if (order.Status is "Cancelled" or "Completed")
        {
            return BadRequest(ApiResponse<object>.Fail("INVALID_ORDER_STATUS", "Don hang khong the thanh toan o trang thai hien tai."));
        }

        var payment = order.Payment;
        if (payment == null)
        {
            payment = new Payment
            {
                OrderId = order.OrderId,
                Amount = order.GrandTotal
            };
            _context.Payments.Add(payment);
        }

        payment.Method = method;
        payment.Status = "Pending";
        payment.Amount = order.GrandTotal;
        payment.TransactionCode = null;
        payment.GatewayResponse = null;
        payment.PaidAt = null;
        await _context.SaveChangesAsync();

        var result = _paymentGateway.CreatePaymentUrl(payment, method, dto.ReturnUrl);
        return Ok(ApiResponse<PaymentGatewayResultDto>.Ok(result, $"Da tao giao dich {method}."));
    }

    private async Task<IActionResult> HandleCallback(PaymentCallbackDto dto, string method)
    {
        if (!_paymentGateway.VerifySignature(dto.PaymentId, dto.Status, dto.TransactionCode, dto.Signature))
        {
            return BadRequest(ApiResponse<object>.Fail("INVALID_SIGNATURE", "Chu ky callback khong hop le."));
        }

        var payment = await _context.Payments
            .Include(p => p.Order)
            .ThenInclude(o => o!.StatusLogs)
            .FirstOrDefaultAsync(p => p.PaymentId == dto.PaymentId && p.Method == method);

        if (payment?.Order == null)
        {
            return NotFound(ApiResponse<object>.Fail("PAYMENT_NOT_FOUND", "Giao dich khong ton tai."));
        }

        var normalizedStatus = dto.Status.Equals("Success", StringComparison.OrdinalIgnoreCase)
            ? "Paid"
            : dto.Status.Equals("Failed", StringComparison.OrdinalIgnoreCase)
                ? "Failed"
                : "Pending";

        payment.Status = normalizedStatus;
        payment.TransactionCode = dto.TransactionCode;
        payment.GatewayResponse = dto.GatewayResponse;
        payment.PaidAt = normalizedStatus == "Paid" ? DateTime.UtcNow : null;

        if (normalizedStatus == "Paid" && payment.Order.Status == "Pending")
        {
            var oldStatus = payment.Order.Status;
            payment.Order.Status = "Paid";
            payment.Order.UpdatedAt = DateTime.UtcNow;
            payment.Order.StatusLogs.Add(new OrderStatusLog
            {
                OldStatus = oldStatus,
                NewStatus = "Paid",
                Note = $"{method} payment success"
            });
        }

        await _context.SaveChangesAsync();
        await _emailService.SendPaymentResultAsync(payment.Order, payment);

        return Ok(ApiResponse<object>.Ok(new
        {
            payment.PaymentId,
            payment.OrderId,
            payment.Method,
            payment.Status,
            payment.TransactionCode,
            payment.PaidAt,
            orderStatus = payment.Order.Status
        }, "Da xu ly callback thanh toan."));
    }
}
