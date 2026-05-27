using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OpsTrax.Api.Data;
using OpsTrax.Api.DTOs;
using OpsTrax.Api.Middleware;
using OpsTrax.Api.Services;

var builder = WebApplication.CreateBuilder(args);

var allowedOrigins = builder.Configuration["Cors:AllowedOrigins"] ?? "http://localhost:10000";
var jwtKey = builder.Configuration["Jwt:Key"] ?? "opstrax-demo-local-development-key-change-me";

builder.Services.AddCors(options =>
{
    options.AddPolicy("OpsTraxCors", policy => policy.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddScoped<DataService>();
builder.Services.AddDbContext<OpsTraxDbContext>(options =>
{
    var connection = builder.Configuration.GetConnectionString("DefaultConnection") ?? "server=mysql;database=opstrax;user=opstrax;password=opstraxpass";
    options.UseMySql(connection, ServerVersion.AutoDetect(connection));
});
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidateLifetime = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "OpsTrax",
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "OpsTraxEnterprise",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseSwagger();
app.UseSwaggerUI();
app.UseCors("OpsTraxCors");
app.UseAuthentication();
app.UseAuthorization();
app.Use(async (context, next) =>
{
    app.Logger.LogInformation("{Method} {Path}", context.Request.Method, context.Request.Path);
    await next();
});

IResult Ok<T>(T data, string message = "") => Results.Ok(ApiResponse<T>.Ok(data, message));

app.MapGet("/api/health", () => Ok(new { service = "OpsTrax API", status = "healthy", timestamp = DateTimeOffset.UtcNow }));

app.MapPost("/api/auth/login", async (LoginRequest request, DataService db, IConfiguration configuration) =>
{
    var rows = await db.QueryAsync("""
        SELECT u.id, u.email, u.name, r.name AS role, c.name AS company
        FROM users u
        JOIN roles r ON r.id = u.role_id
        JOIN companies c ON c.id = u.company_id
        WHERE u.email = @email AND u.password_hash = @password
        LIMIT 1
    """, new() { ["@email"] = request.Email, ["@password"] = request.Password });
    if (rows.Count == 0) return Results.Unauthorized();
    var user = rows[0];
    var claims = new[] { new Claim(ClaimTypes.NameIdentifier, $"{user["id"]}"), new Claim(ClaimTypes.Email, $"{user["email"]}"), new Claim(ClaimTypes.Role, $"{user["role"]}") };
    var credentials = new SigningCredentials(new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)), SecurityAlgorithms.HmacSha256);
    var token = new JwtSecurityToken(configuration["Jwt:Issuer"] ?? "OpsTrax", configuration["Jwt:Audience"] ?? "OpsTraxEnterprise", claims, expires: DateTime.UtcNow.AddHours(12), signingCredentials: credentials);
    return Ok(new { token = new JwtSecurityTokenHandler().WriteToken(token), user });
});

app.MapGet("/api/dashboard/summary", async (DataService db) =>
{
    var vehicles = await db.ModuleAsync("vehicles");
    var jobs = await db.ModuleAsync("jobs-orders");
    var maintenance = await db.ModuleAsync("maintenance");
    var safety = await db.ModuleAsync("safety");
    var dispatch = await db.ModuleAsync("dispatch-board");
    var ai = await db.QueryAsync("SELECT id, name AS title, metric AS recommendation, priority AS severity FROM ai_insights ORDER BY id DESC LIMIT 6");
    var alerts = await db.QueryAsync("SELECT id, name AS title, priority AS severity, metric AS message FROM notifications ORDER BY id DESC LIMIT 8");
    var weekly = await db.QueryAsync("SELECT label AS day, value AS jobs, target AS onTime FROM kpi_records WHERE category='weekly' ORDER BY id LIMIT 7");
    var delayed = jobs.Count(j => $"{j.GetValueOrDefault("status")}".Contains("Delayed", StringComparison.OrdinalIgnoreCase));
    var fuel = await db.QueryAsync("SELECT COALESCE(SUM(amount),0) AS amount FROM fuel_transactions");
    var idle = await db.QueryAsync("SELECT COALESCE(SUM(idle_cost),0) AS idleCost FROM fuel_transactions");
    return Ok(new
    {
        kpis = new Dictionary<string, object?>
        {
            ["activeVehicles"] = vehicles.Count(v => $"{v.GetValueOrDefault("status")}".Contains("Active", StringComparison.OrdinalIgnoreCase)),
            ["jobsInProgress"] = jobs.Count(j => !$"{j.GetValueOrDefault("status")}".Contains("Completed", StringComparison.OrdinalIgnoreCase)),
            ["delayedJobs"] = delayed,
            ["fleetSafetyScore"] = "94%",
            ["maintenanceDue"] = maintenance.Count(m => $"{m.GetValueOrDefault("status")}".Contains("Due", StringComparison.OrdinalIgnoreCase)),
            ["idleCost"] = $"${Convert.ToDecimal(idle[0]["idleCost"]):N0}",
            ["complianceRisk"] = "5 warnings",
            ["fuelSpend"] = $"${Convert.ToDecimal(fuel[0]["amount"]):N0}",
            ["onTimeDeliveryRate"] = "91%"
        },
        weeklyOperations = weekly,
        fleetStatus = vehicles.Take(6),
        maintenanceQueue = maintenance.Take(6),
        safetyEvents = safety.Take(6),
        dispatchActivity = dispatch.Take(6),
        aiInsights = ai,
        alerts
    });
});

app.MapGet("/api/command-center/summary", async (DataService db) => Ok(await db.GetCommandCenterSummaryAsync()));

app.MapPost("/api/command-center/actions/{actionId:int}/acknowledge", async (int actionId, HttpContext context, DataService db) =>
{
    var actor = context.User.Identity?.Name ?? context.User.FindFirst(ClaimTypes.Email)?.Value ?? "demo@opstrax.local";
    return Ok(await db.UpdateCommandActionAsync(actionId, "Acknowledged", actor), "Command center action acknowledged");
});

app.MapPost("/api/command-center/actions/{actionId:int}/complete", async (int actionId, HttpContext context, DataService db) =>
{
    var actor = context.User.Identity?.Name ?? context.User.FindFirst(ClaimTypes.Email)?.Value ?? "demo@opstrax.local";
    return Ok(await db.UpdateCommandActionAsync(actionId, "Completed", actor), "Command center action completed");
});

app.MapGet("/api/control-tower/summary", async (DataService db) => Ok(await db.GetControlTowerSummaryAsync()));
app.MapGet("/api/control-tower/entities", async (string? type, string? status, string? risk, string? search, DataService db) => Ok(await db.GetControlTowerEntitiesAsync(type, status, risk, search)));
app.MapGet("/api/control-tower/entities/{entityType}/{id:int}", async (string entityType, int id, DataService db) => Ok(await db.GetControlTowerEntityAsync(entityType, id)));
app.MapGet("/api/control-tower/events", async (DataService db) => Ok(await db.GetControlTowerEventsAsync()));
app.MapPost("/api/control-tower/actions/send-eta-update", async (Dictionary<string, object?> payload, HttpContext context, DataService db) =>
{
    var actor = context.User.Identity?.Name ?? context.User.FindFirst(ClaimTypes.Email)?.Value ?? "demo@opstrax.local";
    return Ok(await db.CreateControlTowerActionAsync("send-eta-update", payload, actor), "ETA update sent");
});
app.MapPost("/api/control-tower/actions/create-dispatch-review", async (Dictionary<string, object?> payload, HttpContext context, DataService db) =>
{
    var actor = context.User.Identity?.Name ?? context.User.FindFirst(ClaimTypes.Email)?.Value ?? "demo@opstrax.local";
    return Ok(await db.CreateControlTowerActionAsync("create-dispatch-review", payload, actor), "Dispatch review created");
});
app.MapPost("/api/control-tower/actions/create-maintenance-review", async (Dictionary<string, object?> payload, HttpContext context, DataService db) =>
{
    var actor = context.User.Identity?.Name ?? context.User.FindFirst(ClaimTypes.Email)?.Value ?? "demo@opstrax.local";
    return Ok(await db.CreateControlTowerActionAsync("create-maintenance-review", payload, actor), "Maintenance review created");
});

app.MapGet("/api/modules/{moduleKey}", async (string moduleKey, DataService db) => Ok(await db.ModuleAsync(moduleKey)));
app.MapGet("/api/modules/{moduleKey}/{id:int}", async (string moduleKey, int id, DataService db) => Ok((await db.ModuleByIdAsync(moduleKey, id)).FirstOrDefault()));
app.MapPost("/api/modules/{moduleKey}", async (string moduleKey, Dictionary<string, object?> payload, DataService db) => Ok((await db.CreateModuleAsync(moduleKey, payload)).First()));
app.MapPut("/api/modules/{moduleKey}/{id:int}", async (string moduleKey, int id, Dictionary<string, object?> payload, DataService db) =>
{
    var table = db.TableFor(moduleKey);
    await db.ExecuteAsync($"UPDATE `{table}` SET name=@name, status=@status, owner=@owner, metric=@metric, priority=@priority, location=@location, updated_at=UTC_TIMESTAMP() WHERE id=@id", new()
    {
        ["@id"] = id,
        ["@name"] = payload.GetValueOrDefault("name") ?? "Updated record",
        ["@status"] = payload.GetValueOrDefault("status") ?? "Active",
        ["@owner"] = payload.GetValueOrDefault("owner") ?? "Ops Control",
        ["@metric"] = payload.GetValueOrDefault("metric") ?? "Updated from API",
        ["@priority"] = payload.GetValueOrDefault("priority") ?? "Normal",
        ["@location"] = payload.GetValueOrDefault("location") ?? "Operations HQ"
    });
    return Ok((await db.ModuleByIdAsync(moduleKey, id)).FirstOrDefault());
});

string Actor(HttpContext context) => context.User.Identity?.Name ?? context.User.FindFirst(ClaimTypes.Email)?.Value ?? "demo@opstrax.local";

app.MapGet("/api/vehicles", async (string? search, string? status, string? type, string? region, string? riskLevel, string? maintenanceStatus, string? complianceStatus, string? assignedDriver, int? page, int? pageSize, DataService db) =>
    Ok(await db.GetVehiclesAsync(search, status, type, region, riskLevel, maintenanceStatus, complianceStatus, assignedDriver, page ?? 1, pageSize ?? 100)));
app.MapGet("/api/vehicles/summary", async (DataService db) => Ok(await db.GetVehicleSummaryAsync()));
app.MapGet("/api/vehicles/{id:int}", async (int id, DataService db) => Ok(await db.GetVehicleAsync(id)));
app.MapPost("/api/vehicles", async (Dictionary<string, object?> payload, HttpContext context, DataService db) => Ok(await db.CreateVehicleAsync(payload, Actor(context)), "Vehicle created"));
app.MapPut("/api/vehicles/{id:int}", async (int id, Dictionary<string, object?> payload, HttpContext context, DataService db) => Ok(await db.UpdateVehicleAsync(id, payload, Actor(context)), "Vehicle updated"));
app.MapDelete("/api/vehicles/{id:int}", async (int id, HttpContext context, DataService db) => Ok(await db.ArchiveVehicleAsync(id, Actor(context)), "Vehicle archived"));
app.MapGet("/api/vehicles/{id:int}/timeline", async (int id, DataService db) => Ok(await db.GetEntityTimelineAsync("vehicle", id)));
app.MapGet("/api/vehicles/{id:int}/recommendations", async (int id, DataService db) => Ok(await db.GetEntityRecommendationsAsync("vehicle", id)));
app.MapPost("/api/vehicles/import-preview", async (Dictionary<string, object?> payload, DataService db) => Ok(await db.ImportPreviewAsync("vehicles", payload), "Vehicle import preview generated"));
app.MapPost("/api/vehicles/{id:int}/assign-driver", async (int id, Dictionary<string, object?> payload, HttpContext context, DataService db) => Ok(await db.AssignDriverAsync(id, payload, Actor(context)), "Driver assigned"));
app.MapPost("/api/vehicles/{id:int}/change-status", async (int id, Dictionary<string, object?> payload, HttpContext context, DataService db) => Ok(await db.ChangeVehicleStatusAsync(id, payload, Actor(context)), "Vehicle status changed"));

app.MapGet("/api/drivers", async (string? search, string? status, string? region, string? riskLevel, string? availability, string? assignedVehicle, int? page, int? pageSize, DataService db) =>
    Ok(await db.GetDriversAsync(search, status, region, riskLevel, availability, assignedVehicle, page ?? 1, pageSize ?? 100)));
app.MapGet("/api/drivers/summary", async (DataService db) => Ok(await db.GetDriverSummaryAsync()));
app.MapGet("/api/drivers/{id:int}", async (int id, DataService db) => Ok(await db.GetDriverAsync(id)));
app.MapPost("/api/drivers", async (Dictionary<string, object?> payload, HttpContext context, DataService db) => Ok(await db.CreateDriverAsync(payload, Actor(context)), "Driver created"));
app.MapPut("/api/drivers/{id:int}", async (int id, Dictionary<string, object?> payload, HttpContext context, DataService db) => Ok(await db.UpdateDriverAsync(id, payload, Actor(context)), "Driver updated"));
app.MapDelete("/api/drivers/{id:int}", async (int id, HttpContext context, DataService db) => Ok(await db.ArchiveDriverAsync(id, Actor(context)), "Driver archived"));
app.MapGet("/api/drivers/{id:int}/timeline", async (int id, DataService db) => Ok(await db.GetEntityTimelineAsync("driver", id)));
app.MapGet("/api/drivers/{id:int}/recommendations", async (int id, DataService db) => Ok(await db.GetEntityRecommendationsAsync("driver", id)));
app.MapPost("/api/drivers/import-preview", async (Dictionary<string, object?> payload, DataService db) => Ok(await db.ImportPreviewAsync("drivers", payload), "Driver import preview generated"));
app.MapPost("/api/drivers/{id:int}/assign-vehicle", async (int id, Dictionary<string, object?> payload, HttpContext context, DataService db) => Ok(await db.AssignVehicleAsync(id, payload, Actor(context)), "Vehicle assigned"));
app.MapPost("/api/drivers/{id:int}/change-status", async (int id, Dictionary<string, object?> payload, HttpContext context, DataService db) => Ok(await db.ChangeDriverStatusAsync(id, payload, Actor(context)), "Driver status changed"));
app.MapGet("/api/jobs", async (DataService db) => Ok(await db.ModuleAsync("jobs-orders")));
app.MapGet("/api/dispatch/board", async (DataService db) => Ok(await db.ModuleAsync("dispatch-board")));
app.MapGet("/api/routes", async (DataService db) => Ok(await db.ModuleAsync("route-planning")));
app.MapGet("/api/assets", async (DataService db) => Ok(await db.ModuleAsync("assets")));
app.MapGet("/api/maintenance", async (DataService db) => Ok(await db.ModuleAsync("maintenance")));
app.MapGet("/api/workorders", async (DataService db) => Ok(await db.ModuleAsync("work-orders")));
app.MapGet("/api/fuel/summary", async (DataService db) => Ok(await db.QueryAsync("SELECT id, name, status, owner, metric, priority, location, updated_at AS updatedAt FROM fuel_transactions ORDER BY id DESC")));
app.MapGet("/api/safety/events", async (DataService db) => Ok(await db.ModuleAsync("safety")));
app.MapGet("/api/dashcam/events", async (DataService db) => Ok(await db.ModuleAsync("dashcam")));
app.MapGet("/api/compliance/summary", async (DataService db) => Ok(await db.ModuleAsync("compliance")));
app.MapGet("/api/reports/operations", async (DataService db) => Ok(await db.ModuleAsync("reports-analytics")));
app.MapGet("/api/alerts", async (DataService db) => Ok(await db.QueryAsync("SELECT id, name, status, owner, metric, priority, location, updated_at AS updatedAt FROM notifications ORDER BY id DESC")));
app.MapGet("/api/audit-logs", async (DataService db) => Ok(await db.ModuleAsync("audit-logs")));
app.MapGet("/api/ai/insights", async (DataService db) => Ok(await db.ModuleAsync("ai-copilot")));
app.MapPost("/api/ai/ask", async (AiAskRequest request, DataService db) =>
{
    var vehicles = await db.ModuleAsync("vehicles");
    var jobs = await db.ModuleAsync("jobs-orders");
    var safety = await db.ModuleAsync("safety");
    var maintenance = await db.ModuleAsync("maintenance");
    var delayed = jobs.Count(j => $"{j.GetValueOrDefault("status")}".Contains("Delayed", StringComparison.OrdinalIgnoreCase));
    var answer = $"Based on seeded OpsTrax data: {vehicles.Count} vehicles, {jobs.Count} jobs, {delayed} delayed jobs, {safety.Count} safety events, and {maintenance.Count} maintenance items are in scope. For \"{request.Prompt}\", prioritize delayed high-value loads, coach drivers tied to high-severity safety events, and pull forward maintenance for active vehicles with due items.";
    return Ok(new { answer, confidence = 0.86, context = new { vehicles = vehicles.Count, jobs = jobs.Count, safetyEvents = safety.Count } });
});

app.Run();
