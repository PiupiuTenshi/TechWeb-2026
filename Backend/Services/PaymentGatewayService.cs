using System.Security.Cryptography;
using System.Text;
using TechShop.Backend.DTOs.Payment;
using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public interface IPaymentGatewayService
{
    PaymentGatewayResultDto CreatePaymentUrl(Payment payment, string method, string returnUrl);
    PaymentGatewayResultDto CreateQrPayment(Payment payment, string method, string returnUrl);
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
            DateTime.UtcNow.AddMinutes(15),
            method,
            null,
            null,
            null);
    }

    public PaymentGatewayResultDto CreateQrPayment(Payment payment, string method, string returnUrl)
    {
        var result = CreatePaymentUrl(payment, method, returnUrl);
        var qrData = method.Equals("ZaloPay", StringComparison.OrdinalIgnoreCase)
            ? CreateZaloPayQrData(payment, result.TransactionCode)
            : CreateBankTransferQrData(payment, result.TransactionCode);
        var qrCodeUrl = $"https://api.qrserver.com/v1/create-qr-code/?size=280x280&data={Uri.EscapeDataString(qrData)}";
        var instructions = method.Equals("ZaloPay", StringComparison.OrdinalIgnoreCase)
            ? "Mo ung dung ZaloPay va quet ma QR de thanh toan don hang."
            : "Quet ma QR bang ung dung ngan hang va ghi dung noi dung chuyen khoan.";

        return result with
        {
            QrCodeData = qrData,
            QrCodeUrl = qrCodeUrl,
            Instructions = instructions
        };
    }

    private string CreateZaloPayQrData(Payment payment, string transactionCode)
    {
        var appId = _configuration["Payment:ZaloPay:AppId"] ?? "techshop-dev";
        return $"zalopay://payment?appId={Uri.EscapeDataString(appId)}&paymentId={payment.PaymentId:N}&amount={payment.Amount:0}&transactionCode={Uri.EscapeDataString(transactionCode)}";
    }

    private string CreateBankTransferQrData(Payment payment, string transactionCode)
    {
        var bankName = _configuration["Payment:BankTransfer:BankName"] ?? "TechShop Bank";
        var accountNumber = _configuration["Payment:BankTransfer:AccountNumber"] ?? "0000000000";
        var accountName = _configuration["Payment:BankTransfer:AccountName"] ?? "TECHSHOP";
        return $"BANK={bankName};ACCOUNT={accountNumber};NAME={accountName};AMOUNT={payment.Amount:0};CONTENT={transactionCode}";
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
