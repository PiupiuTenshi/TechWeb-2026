namespace TechShop.Backend.DTOs.Order;

public record CreateOrderDto(string ReceiverName, string Phone, string ShippingAddress, string? Note);
public record UpdateOrderStatusDto(string Status, string? Note);
public record UpdateTrackingDto(string? TrackingCode);
