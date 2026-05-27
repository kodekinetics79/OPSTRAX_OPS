using OpsTrax.Api.DTOs;

namespace OpsTrax.Api.Middleware;

public class ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Unhandled API error");
            context.Response.StatusCode = 500;
            await context.Response.WriteAsJsonAsync(ApiResponse<object>.Fail("Unexpected server error", ex.Message));
        }
    }
}
