using Vantelyx.Api.Models;

namespace Vantelyx.Api.Data;

public class InMemoryStore
{
    public List<Contract> Contracts { get; } = new();
    public List<Obligation> Obligations { get; } = new();
    public List<WorkflowStep> WorkflowSteps { get; } = new();
    public List<Vendor> Vendors { get; } = new();
    public List<AuditEvent> AuditEvents { get; } = new();
    public List<Template> Templates { get; } = new();
    public List<ClausePlaybookItem> ClausePlaybook { get; } = new();
    public List<Integration> Integrations { get; } = new();

    public InMemoryStore()
    {
        Contracts.AddRange(new[]
        {
            new Contract("VCLM-2026-0001", "Enterprise Analytics SaaS Agreement", "Northstar Analytics LLC", "Software License", "Legal Review", 428000, "USD", "Sarah Patel", "IT", "Kode Kinetics LLC", "Virginia", "Net 30", DateOnly.Parse("2026-07-01"), DateOnly.Parse("2027-06-30"), DateOnly.Parse("2026-09-29"), 90, 78, "High", "High", 56, new[] { "AI Review", "DPA Required", "SaaS" }, "Large-value SaaS agreement with data exposure and non-standard liability language.", "Resolve liability carveouts and DPA/SOC 2 obligations before finance approval."),
            new Contract("VCLM-2026-0002", "Facilities Maintenance Master Services Agreement", "Crown Facilities Group", "Master Services Agreement", "Finance Review", 935000, "USD", "Mark Evans", "Operations", "Kode Kinetics LLC", "Maryland", "Net 45", DateOnly.Parse("2026-06-15"), DateOnly.Parse("2029-06-14"), DateOnly.Parse("2029-03-16"), 90, 65, "Medium", "Critical", 68, new[] { "MSA", "Insurance", "Field Services" }, "Operationally important service agreement with SLA, insurance, and field safety obligations.", "Finance should validate spend authority; Risk should verify insurance."),
            new Contract("VCLM-2026-0003", "Strategic Partner Referral Agreement", "Avenick Commerce Partners", "Partner Agreement", "Approval Pending", 185000, "USD", "Zahid Khan", "Sales", "Kode Kinetics LLC", "Delaware", "Monthly commission settlement", DateOnly.Parse("2026-06-10"), DateOnly.Parse("2027-06-09"), DateOnly.Parse("2027-03-11"), 90, 44, "Medium", "High", 82, new[] { "Revenue", "Partner", "Commission" }, "Referral agreement requires cleaner commission rules and deal ownership definitions.", "Sales leadership should approve commission schedule and dispute handling."),
            new Contract("VCLM-2026-0004", "Public Sector Website Implementation SOW", "Municipal Digital Services", "Statement of Work", "Renewal Window", 39500, "USD", "Nadia Ruiz", "Delivery", "Kode Kinetics LLC", "North Carolina", "Milestone billing", DateOnly.Parse("2026-05-01"), DateOnly.Parse("2026-10-31"), DateOnly.Parse("2026-06-25"), 30, 82, "Critical", "Critical", 91, new[] { "Renewal Window", "Public Sector", "ADA" }, "SOW has high deadline exposure due to renewal/change-order discussion inside notice period.", "Escalate to account owner and confirm written notice evidence.")
        });

        Obligations.AddRange(new[]
        {
            new Obligation("OBL-1001", "VCLM-2026-0001", "Provide SOC 2 Type II report annually", "Security Ops", "Information Security", DateOnly.Parse("2026-07-15"), "In Progress", "High", "Security Exhibit", true),
            new Obligation("OBL-1002", "VCLM-2026-0001", "Send renewal decision before notice deadline", "Procurement", "Procurement", DateOnly.Parse("2026-08-01"), "Open", "Critical", "Renewal Terms", false),
            new Obligation("OBL-1003", "VCLM-2026-0002", "Verify cyber insurance certificate before execution", "Risk Team", "Risk", DateOnly.Parse("2026-06-20"), "Open", "High", "Insurance", true),
            new Obligation("OBL-1006", "VCLM-2026-0004", "Send renewal/change-order notice", "Account Manager", "Sales", DateOnly.Parse("2026-06-05"), "Overdue", "Critical", "Renewal Terms", true)
        });

        WorkflowSteps.AddRange(new[]
        {
            new WorkflowStep("WF-001", "VCLM-2026-0001", "Business Intake Review", "Business Owner", "Sarah Patel", "Approved", 12, DateTimeOffset.UtcNow.AddDays(-3), DateTimeOffset.UtcNow.AddDays(-2), "Approved"),
            new WorkflowStep("WF-002", "VCLM-2026-0001", "Legal Clause Review", "Legal Reviewer", "Priya Shah", "Active", 48, DateTimeOffset.UtcNow.AddDays(-1), null, null),
            new WorkflowStep("WF-003", "VCLM-2026-0001", "Security Review", "Security Reviewer", "Omar Reed", "Waiting", 36, null, null, null),
            new WorkflowStep("WF-004", "VCLM-2026-0002", "Finance Spend Approval", "Finance Approver", "Linda Brooks", "Active", 24, DateTimeOffset.UtcNow.AddHours(-10), null, null)
        });

        Vendors.AddRange(new[]
        {
            new Vendor("VEN-001", "Northstar Analytics LLC", "SaaS / AI", "High", 2, 1, DateOnly.Parse("2026-05-26"), "Current", true, 88),
            new Vendor("VEN-002", "Crown Facilities Group", "Facilities", "Medium", 4, 0, DateOnly.Parse("2026-05-22"), "Pending Review", false, 81),
            new Vendor("VEN-003", "Avenick Commerce Partners", "Partner / Referral", "Medium", 1, 0, DateOnly.Parse("2026-05-15"), "Missing", false, 76)
        });

        Templates.AddRange(new[]
        {
            new Template("TMP-001", "Mutual NDA - Standard", "NDA", "All", "Low", "2.1", "Active", DateOnly.Parse("2026-05-10")),
            new Template("TMP-002", "SaaS Subscription Agreement", "Software License", "IT", "Medium", "1.8", "Active", DateOnly.Parse("2026-05-22")),
            new Template("TMP-003", "Professional Services SOW", "Statement of Work", "Delivery", "Medium", "3.0", "Active", DateOnly.Parse("2026-05-18"))
        });

        ClausePlaybook.AddRange(new[]
        {
            new ClausePlaybookItem("PB-001", "Limitation of Liability", "Legal", "Mutual cap at fees paid in prior 12 months with approved carveouts.", "2x annual fees with legal approval.", "Escalate when cap exceeds 2x fees or carveouts are missing.", "High"),
            new ClausePlaybookItem("PB-002", "DPA / Privacy", "Privacy", "Attach approved DPA when personal or regulated data is processed.", "Security and privacy approval required if DPA is omitted.", "Escalate whenever regulated data is referenced.", "Critical"),
            new ClausePlaybookItem("PB-003", "Renewal Notice", "Commercial", "No auto-renewal without system alert and owner confirmation.", "Auto-renewal allowed with 90-day notice and owner acknowledgment.", "Escalate under 60-day notice or evergreen terms.", "Medium")
        });

        Integrations.AddRange(new[]
        {
            new Integration("INT-001", "Microsoft Entra ID / SSO", "Identity", "Needs Admin", "OIDC/SAML-ready identity integration."),
            new Integration("INT-002", "DocuSign / Adobe Sign", "E-Signature", "Planned", "Signature packet creation and executed PDF retrieval."),
            new Integration("INT-003", "SharePoint / OneDrive", "Document Storage", "Planned", "Storage for signed contracts, exhibits, redlines, and evidence."),
            new Integration("INT-004", "AI/OCR Document Pipeline", "AI/OCR", "Connected", "Extraction, classification, clause comparison, and risk scoring abstraction.")
        });

        AuditEvents.AddRange(new[]
        {
            new AuditEvent("AUD-001", DateTimeOffset.UtcNow.AddHours(-2), "Vantelyx AI", "Risk flag created", "VCLM-2026-0004", "Renewal notice deadline is approaching."),
            new AuditEvent("AUD-002", DateTimeOffset.UtcNow.AddHours(-4), "Priya Shah", "Clause comment added", "VCLM-2026-0001", "Requested data breach carveout in limitation of liability."),
            new AuditEvent("AUD-003", DateTimeOffset.UtcNow.AddHours(-7), "Linda Brooks", "Finance review opened", "VCLM-2026-0002", "Spend authority validation started.")
        });
    }

    public string NextContractId() => $"VCLM-2026-{Contracts.Count + 1:0000}";
    public string NextObligationId() => $"OBL-{1000 + Obligations.Count + 1}";
    public string NextWorkflowId() => $"WF-{WorkflowSteps.Count + 1:000}";

    public static string RiskFromScore(int score) => score >= 85 ? "Critical" : score >= 70 ? "High" : score >= 40 ? "Medium" : "Low";
}
