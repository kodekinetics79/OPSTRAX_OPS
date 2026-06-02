using Vantelyx.Api.Data;
using Vantelyx.Api.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("dev", policy => policy
        .WithOrigins("http://localhost:9701", "http://127.0.0.1:9701", "http://localhost:9702", "http://127.0.0.1:9702")
        .AllowAnyHeader()
        .AllowAnyMethod());
});

builder.Services.AddSingleton<InMemoryStore>();

var app = builder.Build();
app.UseCors("dev");

app.MapGet("/", () => Results.Ok(new
{
    name = "Vantelyx CLM API",
    version = "2.0.0",
    endpoints = new[]
    {
        "/health",
        "/api/contracts",
        "/api/obligations",
        "/api/workflows",
        "/api/vendors",
        "/api/templates",
        "/api/clause-playbook",
        "/api/integrations",
        "/api/audit",
        "/api/ai/intake/preview",
        "/api/reports/summary"
    }
}));

app.MapGet("/health", () => Results.Ok(new { status = "healthy", service = "vantelyx-clm-api", utc = DateTime.UtcNow }));

app.MapGet("/api/contracts", (InMemoryStore store) => Results.Ok(ApiResponse<List<Contract>>.Ok(store.Contracts)));
app.MapGet("/api/contracts/{id}", (string id, InMemoryStore store) =>
{
    var contract = store.Contracts.FirstOrDefault(c => c.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
    return contract is null ? Results.NotFound(ApiResponse<Contract>.Fail($"Contract {id} was not found.")) : Results.Ok(ApiResponse<Contract>.Ok(contract));
});

app.MapPost("/api/contracts", (ContractCreateRequest request, InMemoryStore store) =>
{
    if (string.IsNullOrWhiteSpace(request.Title) || string.IsNullOrWhiteSpace(request.Counterparty))
        return Results.BadRequest(ApiResponse<Contract>.Fail("Title and counterparty are required."));

    var score = request.RiskScore ?? 45;
    var start = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));
    var end = start.AddYears(1);
    var renewal = end.AddDays(-90);
    var contract = new Contract(
        store.NextContractId(),
        request.Title,
        request.Counterparty,
        request.Type,
        "Intake",
        request.Value,
        "USD",
        request.Owner,
        request.Department,
        request.LegalEntity ?? "Kode Kinetics LLC",
        request.Jurisdiction ?? "Virginia",
        request.PaymentTerms ?? "Net 30",
        start,
        end,
        renewal,
        90,
        score,
        InMemoryStore.RiskFromScore(score),
        InMemoryStore.RiskFromScore(score),
        18,
        new[] { "New Intake", "API Created" },
        "New contract created through API. Run AI extraction to complete clauses, obligations, and workflow routing.",
        "Complete metadata, upload document, and launch review workflow."
    );
    store.Contracts.Insert(0, contract);
    store.WorkflowSteps.Insert(0, new WorkflowStep(store.NextWorkflowId(), contract.Id, "Business Intake Review", "Business Owner", contract.Owner, "Active", 12, DateTimeOffset.UtcNow, null, null));
    store.AuditEvents.Insert(0, new AuditEvent(Guid.NewGuid().ToString("N"), DateTimeOffset.UtcNow, "API User", "Contract created", contract.Id, $"Created {contract.Title}."));
    return Results.Created($"/api/contracts/{contract.Id}", ApiResponse<Contract>.Ok(contract));
});

app.MapPatch("/api/contracts/{id}/status", (string id, ContractStatusUpdateRequest request, InMemoryStore store) =>
{
    var index = store.Contracts.FindIndex(c => c.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
    if (index < 0) return Results.NotFound(ApiResponse<Contract>.Fail($"Contract {id} was not found."));
    var current = store.Contracts[index];
    var updated = current with { Status = request.Status, Stage = Math.Min(100, current.Stage + 10) };
    store.Contracts[index] = updated;
    store.AuditEvents.Insert(0, new AuditEvent(Guid.NewGuid().ToString("N"), DateTimeOffset.UtcNow, request.Actor ?? "API User", "Status updated", updated.Id, $"Status changed to {request.Status}."));
    return Results.Ok(ApiResponse<Contract>.Ok(updated));
});

app.MapGet("/api/obligations", (InMemoryStore store) => Results.Ok(ApiResponse<List<Obligation>>.Ok(store.Obligations)));
app.MapPost("/api/obligations", (ObligationCreateRequest request, InMemoryStore store) =>
{
    if (!store.Contracts.Any(c => c.Id.Equals(request.ContractId, StringComparison.OrdinalIgnoreCase)))
        return Results.BadRequest(ApiResponse<Obligation>.Fail("ContractId does not exist."));

    var obligation = new Obligation(store.NextObligationId(), request.ContractId, request.Title, request.Owner, request.Department, request.DueDate, "Open", request.Priority, request.SourceClause, request.EvidenceRequired);
    store.Obligations.Insert(0, obligation);
    store.AuditEvents.Insert(0, new AuditEvent(Guid.NewGuid().ToString("N"), DateTimeOffset.UtcNow, "API User", "Obligation created", obligation.ContractId, obligation.Title));
    return Results.Created($"/api/obligations/{obligation.Id}", ApiResponse<Obligation>.Ok(obligation));
});

app.MapPatch("/api/obligations/{id}/status", (string id, ObligationStatusUpdateRequest request, InMemoryStore store) =>
{
    var index = store.Obligations.FindIndex(o => o.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
    if (index < 0) return Results.NotFound(ApiResponse<Obligation>.Fail($"Obligation {id} was not found."));
    var updated = store.Obligations[index] with { Status = request.Status };
    store.Obligations[index] = updated;
    store.AuditEvents.Insert(0, new AuditEvent(Guid.NewGuid().ToString("N"), DateTimeOffset.UtcNow, request.Actor ?? "API User", "Obligation updated", id, $"Status changed to {request.Status}."));
    return Results.Ok(ApiResponse<Obligation>.Ok(updated));
});

app.MapGet("/api/workflows", (InMemoryStore store) => Results.Ok(ApiResponse<List<WorkflowStep>>.Ok(store.WorkflowSteps)));
app.MapPost("/api/workflows/{id}/approve", (string id, InMemoryStore store) =>
{
    var index = store.WorkflowSteps.FindIndex(w => w.Id.Equals(id, StringComparison.OrdinalIgnoreCase));
    if (index < 0) return Results.NotFound(ApiResponse<WorkflowStep>.Fail($"Workflow step {id} was not found."));
    var current = store.WorkflowSteps[index];
    var updated = current with { Status = "Approved", CompletedAt = DateTimeOffset.UtcNow, Note = "Approved through API." };
    store.WorkflowSteps[index] = updated;
    var next = store.WorkflowSteps.FirstOrDefault(w => w.ContractId == current.ContractId && w.Status == "Waiting");
    if (next is not null)
    {
        var nextIndex = store.WorkflowSteps.FindIndex(w => w.Id == next.Id);
        store.WorkflowSteps[nextIndex] = next with { Status = "Active", StartedAt = DateTimeOffset.UtcNow };
    }
    store.AuditEvents.Insert(0, new AuditEvent(Guid.NewGuid().ToString("N"), DateTimeOffset.UtcNow, "API User", "Workflow approved", current.ContractId, current.Name));
    return Results.Ok(ApiResponse<WorkflowStep>.Ok(updated));
});

app.MapGet("/api/vendors", (InMemoryStore store) => Results.Ok(ApiResponse<List<Vendor>>.Ok(store.Vendors)));
app.MapGet("/api/templates", (InMemoryStore store) => Results.Ok(ApiResponse<List<Template>>.Ok(store.Templates)));
app.MapGet("/api/clause-playbook", (InMemoryStore store) => Results.Ok(ApiResponse<List<ClausePlaybookItem>>.Ok(store.ClausePlaybook)));
app.MapGet("/api/integrations", (InMemoryStore store) => Results.Ok(ApiResponse<List<Integration>>.Ok(store.Integrations)));
app.MapGet("/api/audit", (InMemoryStore store) => Results.Ok(ApiResponse<List<AuditEvent>>.Ok(store.AuditEvents)));

app.MapPost("/api/ai/intake/preview", (AiIntakeRequest request) =>
{
    var text = request.Text ?? string.Empty;
    var hasData = text.Contains("data", StringComparison.OrdinalIgnoreCase) || text.Contains("privacy", StringComparison.OrdinalIgnoreCase);
    var hasRenewal = text.Contains("auto-renew", StringComparison.OrdinalIgnoreCase) || text.Contains("renewal", StringComparison.OrdinalIgnoreCase);
    var hasLiability = text.Contains("uncapped", StringComparison.OrdinalIgnoreCase) || text.Contains("unlimited liability", StringComparison.OrdinalIgnoreCase);
    var score = 35 + (hasData ? 22 : 0) + (hasRenewal ? 15 : 0) + (hasLiability ? 24 : 0);
    var preview = new AiIntakePreview(
        Guid.NewGuid().ToString("N"),
        request.FileName,
        hasData ? "Data Processing Agreement" : hasRenewal ? "Software License" : "Master Services Agreement",
        request.CounterpartyHint ?? "Detected Counterparty LLC",
        hasLiability ? 525000 : hasData ? 245000 : 85000,
        score,
        InMemoryStore.RiskFromScore(score),
        new[] { "Effective date detected", hasRenewal ? "Renewal notice detected" : "No renewal notice found" },
        new[]
        {
            hasData ? "Data/privacy language detected; DPA and security review recommended." : "No obvious personal-data language detected.",
            hasRenewal ? "Auto-renewal or renewal notice language detected." : "Renewal language may be missing or unclear.",
            hasLiability ? "Potential uncapped liability exposure detected." : "No explicit unlimited liability phrase detected."
        },
        new[] { "Business Owner", "Legal", hasData ? "Security / Privacy" : "Finance" },
        88
    );
    return Results.Ok(ApiResponse<AiIntakePreview>.Ok(preview));
});

app.MapGet("/api/reports/summary", (InMemoryStore store) =>
{
    var totalValue = store.Contracts.Sum(c => c.Value);
    var highRisk = store.Contracts.Count(c => c.RiskLevel is "High" or "Critical");
    var openObligations = store.Obligations.Count(o => o.Status != "Completed");
    var renewalsSoon = store.Contracts.Count(c => c.RenewalDate <= DateOnly.FromDateTime(DateTime.UtcNow.AddDays(90)));
    return Results.Ok(ApiResponse<object>.Ok(new { totalContracts = store.Contracts.Count, totalValue, highRisk, openObligations, renewalsSoon }));
});

app.Run();
