namespace Vantelyx.Api.Models;

public record ApiResponse<T>(bool Success, T? Data, string Message, string[] Errors)
{
    public static ApiResponse<T> Ok(T data, string message = "OK") => new(true, data, message, Array.Empty<string>());
    public static ApiResponse<T> Fail(string error) => new(false, default, "Request failed", new[] { error });
}

public record Contract(
    string Id,
    string Title,
    string Counterparty,
    string Type,
    string Status,
    decimal Value,
    string Currency,
    string Owner,
    string Department,
    string LegalEntity,
    string Jurisdiction,
    string PaymentTerms,
    DateOnly StartDate,
    DateOnly EndDate,
    DateOnly RenewalDate,
    int RenewalNoticeDays,
    int RiskScore,
    string RiskLevel,
    string BusinessPriority,
    int Stage,
    string[] Tags,
    string AiSummary,
    string NextAction
);

public record ContractCreateRequest(
    string Title,
    string Counterparty,
    string Type,
    decimal Value,
    string Owner,
    string Department,
    string? LegalEntity,
    string? Jurisdiction,
    string? PaymentTerms,
    int? RiskScore
);

public record ContractStatusUpdateRequest(string Status, string? Actor);

public record Obligation(
    string Id,
    string ContractId,
    string Title,
    string Owner,
    string Department,
    DateOnly DueDate,
    string Status,
    string Priority,
    string SourceClause,
    bool EvidenceRequired
);

public record ObligationCreateRequest(
    string ContractId,
    string Title,
    string Owner,
    string Department,
    DateOnly DueDate,
    string Priority,
    string SourceClause,
    bool EvidenceRequired
);

public record ObligationStatusUpdateRequest(string Status, string? Actor);

public record WorkflowStep(
    string Id,
    string ContractId,
    string Name,
    string Role,
    string Assignee,
    string Status,
    int SlaHours,
    DateTimeOffset? StartedAt,
    DateTimeOffset? CompletedAt,
    string? Note
);

public record Vendor(
    string Id,
    string Name,
    string Category,
    string Risk,
    int ActiveContracts,
    int ExpiringSoon,
    DateOnly LastReview,
    string InsuranceStatus,
    bool DataProcessing,
    int PerformanceScore
);

public record AuditEvent(
    string Id,
    DateTimeOffset Timestamp,
    string Actor,
    string Action,
    string Object,
    string Detail
);

public record Template(
    string Id,
    string Name,
    string Type,
    string Department,
    string Risk,
    string Version,
    string Status,
    DateOnly LastUpdated
);

public record ClausePlaybookItem(
    string Id,
    string Name,
    string Category,
    string PreferredLanguage,
    string FallbackLanguage,
    string EscalationRule,
    string Risk
);

public record Integration(
    string Id,
    string Name,
    string Category,
    string Status,
    string Description
);

public record AiIntakeRequest(string FileName, string Text, string? CounterpartyHint);

public record AiIntakePreview(
    string Id,
    string FileName,
    string AgreementType,
    string Counterparty,
    decimal Value,
    int RiskScore,
    string RiskLevel,
    string[] DetectedDates,
    string[] Flags,
    string[] SuggestedRoute,
    int Confidence
);
