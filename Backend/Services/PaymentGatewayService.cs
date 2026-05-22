using System.Security.Cryptography;
using System.Text;
using TechShop.Backend.DTOs.Payment;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public interface IPaymentGatewayService
{
    PaymentGatewayResultDto CreatePaymentUrl(Payment payment, string method, string returnUrl);
    string CreateSignature(Guid paymentId, string status, string? transactionCode);
    bool VerifySignature(Guid paymentId, string status, string? transactionCode, string signature);
}

public class PaymentGatewayService : IPaymentGatewayService
{
    private readonly IConfiguration _configuration;

    public PaymentGatewayService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public PaymentGatewayResultDto CreatePaymentUrl(Payment payment, string method, string returnUrl)
    {
        var transactionCode = $"{method.ToUpperInvariant()}-{DateTimeOffset.UtcNow.ToUnixTimeSeconds()}-{payment.PaymentId:N}";
        var signature = CreateSignature(payment.PaymentId, "Success", transactionCode);
        var separator = returnUrl.Contains('?') ? "&" : "?";
        var paymentUrl = $"{returnUrl}{separator}paymentId={payment.PaymentId}&method={method}&status=Success&transactionCode={Uri.EscapeDataString(transactionCode)}&signature={Uri.EscapeDataString(signature)}";

        return new PaymentGatewayResultDto(
            payment.PaymentId,
            payment.OrderId,
            method,
            payment.Amount,
            paymentUrl,
            transactionCode,
            DateTime.UtcNow.AddMinutes(15));
    }

    public string CreateSignature(Guid paymentId, string status, string? transactionCode)
    {
        var secret = _configuration["Payment:CallbackSecret"] ?? "TechShop-Payment-Dev-Secret";
        var payload = $"{paymentId:N}|{status}|{transactionCode}";
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(payload))).ToLowerInvariant();
    }

    public bool VerifySignature(Guid paymentId, string status, string? transactionCode, string signature)
    {
        var expected = CreateSignature(paymentId, status, transactionCode);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expected),
            Encoding.UTF8.GetBytes(signature.ToLowerInvariant()));
    }
}
