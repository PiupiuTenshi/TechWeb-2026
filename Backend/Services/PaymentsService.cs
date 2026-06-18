using Microsoft.EntityFrameworkCore;
using TechShop.Backend.Data;
using TechShop.Backend.DTOs.Common;
using TechShop.Backend.DTOs.Payment;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public class PaymentsService : IPaymentsService
{
    private readonly AppDbContext _context;
    private readonly IPaymentGatewayService _paymentGateway;
    private readonly IEmailService _emailService;

    public PaymentsService(AppDbContext context, IPaymentGatewayService paymentGateway, IEmailService emailService)
    {
        _context = context;
        _paymentGateway = paymentGateway;
        _emailService = emailService;
    }

    public async Task<ApiResponse<PaymentGatewayResultDto>> CreateGatewayPaymentAsync(CreatePaymentRequestDto dto, string method)
    {
        var order = await _context.Orders.Include(o => o.Payment).FirstOrDefaultAsync(o => o.OrderId == dto.OrderId);
        if (order == null)
        {
            return ApiResponse<PaymentGatewayResultDto>.Fail("ORDER_NOT_FOUND", "Don hang khong ton tai.");
        }

        if (order.Status is "Cancelled" or "Completed")
        {
            return ApiResponse<PaymentGatewayResultDto>.Fail("INVALID_ORDER_STATUS", "Don hang khong the thanh toan o trang thai hien tai.");
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
        return ApiResponse<PaymentGatewayResultDto>.Ok(result, $"Da tao giao dich {method}.");
    }

    public async Task<ApiResponse<object>> HandleCallbackAsync(PaymentCallbackDto dto, string method)
    {
        if (!_paymentGateway.VerifySignature(dto.PaymentId, dto.Status, dto.TransactionCode, dto.Signature))
        {
            return ApiResponse<object>.Fail("INVALID_SIGNATURE", "Chu ky callback khong hop le.");
        }

        var payment = await _context.Payments
            .Include(p => p.Order)
            .ThenInclude(o => o!.StatusLogs)
            .FirstOrDefaultAsync(p => p.PaymentId == dto.PaymentId && p.Method == method);

        if (payment?.Order == null)
        {
            return ApiResponse<object>.Fail("PAYMENT_NOT_FOUND", "Giao dich khong ton tai.");
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
            _context.OrderStatusLogs.Add(new OrderStatusLog
            {
                OrderId = payment.Order.OrderId,
                OldStatus = oldStatus,
                NewStatus = "Paid",
                Note = $"{method} payment success"
            });
        }

        await _context.SaveChangesAsync();
        await _emailService.SendPaymentResultAsync(payment.Order, payment);

        return ApiResponse<object>.Ok(new
        {
            payment.PaymentId,
            payment.OrderId,
            payment.Method,
            payment.Status,
            payment.TransactionCode,
            payment.PaidAt,
            orderStatus = payment.Order.Status
        }, "Da xu ly callback thanh toan.");
    }
}
