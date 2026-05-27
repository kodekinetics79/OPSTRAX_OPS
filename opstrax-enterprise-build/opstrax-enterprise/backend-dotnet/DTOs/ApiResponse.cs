namespace OpsTrax.Api.DTOs;

public record ApiResponse<T>(bool Success, T? Data, string Message = "", string[]? Errors = null)
{
    public string[] Errors { get; init; } = Errors ?? [];
    public static ApiResponse<T> Ok(T data, string message = "") => new(true, data, message, []);
    public static ApiResponse<T> Fail(string message, params string[] errors) => new(false, default, message, errors);
}

public record LoginRequest(string Email, string Password);
public record AiAskRequest(string Prompt);
