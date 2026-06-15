namespace TechShop.Backend.DTOs.Payment;

public record CreatePaymentRequestDto(Guid OrderId, string ReturnUrl);

public record PaymentCallbackDto(
    Guid PaymentId,
    string Status,
    string? TransactionCode,
    string? GatewayResponse,
    string Signature);

public record PaymentGatewayResultDto(
    Guid PaymentId,
    Guid OrderId,
    string Method,
    decimal Amount,
    string PaymentUrl,
    string TransactionCode,
    DateTime ExpiresAt,
    string? Provider,
    string? QrCodeUrl,
    string? QrCodeData,
    string? Instructions);
