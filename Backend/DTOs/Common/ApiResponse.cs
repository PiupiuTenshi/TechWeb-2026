namespace TechShop.Backend.DTOs.Common;

public record PaginationMeta(int Page, int PageSize, int Total);

public class ApiResponse<T>
{
    public bool Success { get; init; }
    public T? Data { get; init; }
    public string? Message { get; init; }
    public string? Error { get; init; }
    public PaginationMeta? Pagination { get; init; }
    public PaginationMeta? Meta { get; init; }

    public static ApiResponse<T> Ok(T data, string message = "OK", PaginationMeta? pagination = null)
        => new() { Success = true, Data = data, Message = message, Pagination = pagination, Meta = pagination };

    public static ApiResponse<T> Fail(string error, string message)
        => new() { Success = false, Error = error, Message = message };
}
