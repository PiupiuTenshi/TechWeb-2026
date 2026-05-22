using TechShop.Backend.Models;

namespace TechShop.Backend.Services;

public interface IEmailService
{
    Task SendOrderConfirmationAsync(Order order, CancellationToken cancellationToken = default);
    Task SendOrderStatusChangedAsync(Order order, string oldStatus, string newStatus, CancellationToken cancellationToken = default);
    Task SendPaymentResultAsync(Order order, Payment payment, CancellationToken cancellationToken = default);
}

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendOrderConfirmationAsync(Order order, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email mock: order confirmation for {OrderId}, total {Total}", order.OrderId, order.GrandTotal);
        return Task.CompletedTask;
    }

    public Task SendOrderStatusChangedAsync(Order order, string oldStatus, string newStatus, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email mock: order {OrderId} status changed {OldStatus} -> {NewStatus}", order.OrderId, oldStatus, newStatus);
        return Task.CompletedTask;
    }

    public Task SendPaymentResultAsync(Order order, Payment payment, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("Email mock: payment {PaymentId} for order {OrderId} is {Status}", payment.PaymentId, order.OrderId, payment.Status);
        return Task.CompletedTask;
    }
}
