using MySqlConnector;
using System.Text.Json;

namespace OpsTrax.Api.Services;

public class DataService(IConfiguration configuration)
{
    private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "server=localhost;database=opstrax;user=opstrax;password=opstraxpass";

    private static readonly Dictionary<string, string> ModuleTables = new()
    {
        ["command-center"] = "kpi_records",
        ["control-tower"] = "location_events",
        ["dispatch-board"] = "dispatch_assignments",
        ["jobs-orders"] = "jobs",
        ["route-planning"] = "routes",
        ["vehicles"] = "vehicles",
        ["drivers"] = "drivers",
        ["assets"] = "assets",
        ["maintenance"] = "maintenance_items",
        ["work-orders"] = "work_orders",
        ["fuel-idling"] = "fuel_transactions",
        ["safety"] = "safety_events",
        ["dashcam"] = "dashcam_events",
        ["compliance"] = "compliance_documents",
        ["hos-eld"] = "hos_logs",
        ["dvir-inspections"] = "inspections",
        ["customer-eta-portal"] = "jobs",
        ["clients-customers"] = "customers",
        ["contracts-rates"] = "contracts",
        ["carrier-management"] = "carriers",
        ["expenses"] = "expenses",
        ["documents"] = "documents",
        ["reports-analytics"] = "kpi_records",
        ["sla-kpi-center"] = "sla_records",
        ["predictive-cost-margin"] = "kpi_records",
        ["audit-logs"] = "audit_logs",
        ["ai-copilot"] = "ai_insights",
        ["integrations"] = "integrations",
        ["user-management"] = "users",
        ["settings"] = "integrations",
        ["billing-subscription"] = "subscription_plans"
    };

    public string TableFor(string key) => ModuleTables.TryGetValue(key, out var table) ? table : "kpi_records";

    public async Task<List<Dictionary<string, object?>>> QueryAsync(string sql, Dictionary<string, object?>? parameters = null)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new MySqlCommand(sql, connection);
        foreach (var parameter in parameters ?? [])
        {
            command.Parameters.AddWithValue(parameter.Key, parameter.Value);
        }
        await using var reader = await command.ExecuteReaderAsync();
        var rows = new List<Dictionary<string, object?>>();
        while (await reader.ReadAsync())
        {
            var row = new Dictionary<string, object?>();
            for (var i = 0; i < reader.FieldCount; i++)
            {
                var value = await reader.IsDBNullAsync(i) ? null : reader.GetValue(i);
                row[ToCamel(reader.GetName(i))] = value;
            }
            rows.Add(row);
        }
        return rows;
    }

    public async Task<int> ExecuteAsync(string sql, Dictionary<string, object?> parameters)
    {
        await using var connection = new MySqlConnection(_connectionString);
        await connection.OpenAsync();
        await using var command = new MySqlCommand(sql, connection);
        foreach (var parameter in parameters)
        {
            command.Parameters.AddWithValue(parameter.Key, parameter.Value);
        }
        return await command.ExecuteNonQueryAsync();
    }

    public Task<int> ExecuteAsync(string sql) => ExecuteAsync(sql, new Dictionary<string, object?>());

    public async Task EnsureCommandCenterAsync()
    {
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS command_center_actions (
              id INT AUTO_INCREMENT PRIMARY KEY,
              tenant_id INT NOT NULL DEFAULT 1,
              title VARCHAR(180) NOT NULL,
              description VARCHAR(600) NOT NULL,
              category VARCHAR(80) NOT NULL,
              priority VARCHAR(40) NOT NULL,
              status VARCHAR(40) NOT NULL DEFAULT 'Open',
              linked_entity_type VARCHAR(80) NOT NULL,
              linked_entity_id INT NULL,
              owner_role VARCHAR(100) NOT NULL,
              due_at DATETIME NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_cca_tenant (tenant_id),
              INDEX idx_cca_status (status),
              INDEX idx_cca_priority (priority),
              INDEX idx_cca_linked (linked_entity_type, linked_entity_id)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS operational_events (
              id INT AUTO_INCREMENT PRIMARY KEY,
              tenant_id INT NOT NULL DEFAULT 1,
              event_type VARCHAR(80) NOT NULL,
              severity VARCHAR(40) NOT NULL,
              title VARCHAR(180) NOT NULL,
              description VARCHAR(600) NOT NULL,
              linked_entity_type VARCHAR(80) NOT NULL,
              linked_entity_id INT NULL,
              occurred_at DATETIME NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_oe_tenant (tenant_id),
              INDEX idx_oe_severity (severity),
              INDEX idx_oe_occurred (occurred_at),
              INDEX idx_oe_linked (linked_entity_type, linked_entity_id)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS ai_recommendations (
              id INT AUTO_INCREMENT PRIMARY KEY,
              tenant_id INT NOT NULL DEFAULT 1,
              category VARCHAR(90) NOT NULL,
              severity VARCHAR(40) NOT NULL,
              title VARCHAR(180) NOT NULL,
              insight VARCHAR(800) NOT NULL,
              evidence_json JSON NULL,
              recommended_action VARCHAR(500) NOT NULL,
              linked_entity_type VARCHAR(80) NOT NULL,
              linked_entity_id INT NULL,
              status VARCHAR(40) NOT NULL DEFAULT 'Open',
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_air_tenant (tenant_id),
              INDEX idx_air_status (status),
              INDEX idx_air_severity (severity),
              INDEX idx_air_linked (linked_entity_type, linked_entity_id)
            )
        """);

        var actionCount = await QueryAsync("SELECT COUNT(*) AS count FROM command_center_actions");
        if (Convert.ToInt32(actionCount[0]["count"]) == 0)
        {
            await ExecuteAsync("""
                INSERT INTO command_center_actions (title, description, category, priority, status, linked_entity_type, linked_entity_id, owner_role, due_at) VALUES
                ('Review delayed JOB-1006', 'Weather and route congestion pushed JOB-1006 into exception status. Customer ETA update is required.', 'Review late job', 'Critical', 'Open', 'job', 6, 'Dispatcher', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 30 MINUTE)),
                ('Create work order for Vehicle 112', 'Vehicle 112 has a critical diagnostic fault and high idle cost exposure.', 'Create work order', 'Critical', 'Open', 'vehicle', 12, 'Maintenance Manager', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 HOUR)),
                ('Coach Ethan Reed', 'Driver has repeated harsh braking trend and camera review flags.', 'Coach driver', 'High', 'Open', 'driver', 3, 'Safety Manager', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 4 HOUR)),
                ('Send UrbanMed ETA notice', 'UrbanMed expedited SLA is in watch status and needs proactive customer messaging.', 'Send customer ETA', 'High', 'Open', 'customer', 4, 'Customer Success', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 45 MINUTE)),
                ('Review dashcam clip 6', 'Potential incident clip requires safety manager review and evidence disposition.', 'Review safety event', 'High', 'Acknowledged', 'dashcam_event', 6, 'Safety Manager', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 HOUR)),
                ('Renew insurance certificate', 'Carrier insurance certificate expires in 12 days and is audit-visible.', 'Renew compliance document', 'High', 'Open', 'compliance_document', 1, 'Compliance Manager', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY)),
                ('Investigate Vehicle 108 fuel anomaly', 'Fuel spend and idle cost are both above expected lane baseline.', 'Investigate fuel anomaly', 'Medium', 'Open', 'vehicle', 8, 'Fleet Manager', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR)),
                ('Resequence CMH retail route', 'Route delay risk can be reduced by moving Dock 5 ahead of Dock 7.', 'Review late job', 'Medium', 'Open', 'route', 5, 'Dispatcher', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 HOUR)),
                ('Pull forward PM for Vehicle 103', 'Preventive maintenance due in two days should be advanced before long-haul assignment.', 'Create work order', 'Medium', 'Open', 'vehicle', 3, 'Mechanic', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 12 HOUR)),
                ('Audit HOS warning for Nina Brooks', 'ELD shows 1.2 hours remaining and next dispatch assignment may create violation risk.', 'Review safety event', 'Medium', 'Open', 'driver', 2, 'Compliance Manager', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 HOUR)),
                ('Validate RapidRelay insurance hold', 'Carrier score is constrained by insurance review status.', 'Renew compliance document', 'Low', 'Open', 'carrier', 2, 'Carrier Manager', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 DAY)),
                ('Confirm POD workflow for JOB-1005', 'Completed job has proof-of-delivery available for customer portal publishing.', 'Send customer ETA', 'Low', 'Completed', 'job', 5, 'Dispatcher', DATE_ADD(UTC_TIMESTAMP(), INTERVAL 6 HOUR))
            """);
        }

        var eventCount = await QueryAsync("SELECT COUNT(*) AS count FROM operational_events");
        if (Convert.ToInt32(eventCount[0]["count"]) == 0)
        {
            await ExecuteAsync("""
                INSERT INTO operational_events (event_type, severity, title, description, linked_entity_type, linked_entity_id, occurred_at) VALUES
                ('vehicle_arrived','Healthy','Vehicle 104 arrived at Gary geofence','Vehicle 104 crossed the planned geofence and remains on time.','vehicle',4,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 MINUTE)),
                ('job_delayed','High','JOB-1006 entered delay exception','Weather corridor and dock congestion pushed ETA beyond SLA tolerance.','job',6,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 8 MINUTE)),
                ('route_deviated','Warning','CMH route deviated from planned corridor','Route 5 deviated around a delay zone near Columbus.','route',5,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 13 MINUTE)),
                ('maintenance_warning','Critical','Vehicle 112 diagnostic fault active','Check engine fault requires recovery action and work order creation.','vehicle',12,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 18 MINUTE)),
                ('driver_safety_event','High','Harsh braking event flagged','Safety review queue received repeat harsh braking pattern.','driver',3,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 23 MINUTE)),
                ('eta_sent','Healthy','Customer ETA sent for JOB-1006','Portal notification sent with revised delivery window.','job',6,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 29 MINUTE)),
                ('compliance_expiring','Warning','Insurance certificate expiring','Document expires in 12 days and is visible in audit queue.','compliance_document',1,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 36 MINUTE)),
                ('work_order_created','Healthy','WO-7001 created','Diagnostic work order created for Vehicle 112.','work_order',1,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 42 MINUTE)),
                ('vehicle_arrived','Healthy','Vehicle 107 arrived at Indianapolis crossdock','Cold chain remains stable.','vehicle',7,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 48 MINUTE)),
                ('job_delayed','Warning','JOB-1012 SLA watch','Customer lane entered watch status from stop dwell.','job',12,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 54 MINUTE)),
                ('route_deviated','Warning','Night linehaul rerouted','Driver swap route adjusted for HOS compliance.','route',7,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 62 MINUTE)),
                ('maintenance_warning','High','Vehicle 109 brake inspection due','Brake inspection is due before next dispatch.','vehicle',9,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 75 MINUTE)),
                ('driver_safety_event','Warning','Following distance event received','Camera AI marked event for coaching review.','driver',12,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 82 MINUTE)),
                ('eta_sent','Healthy','ETA sent for Northstar delivery','Customer portal updated with accurate arrival window.','customer',1,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 92 MINUTE)),
                ('compliance_expiring','Warning','Medical card renewals due','Five driver qualification files have renewal risk.','compliance_document',3,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 105 MINUTE)),
                ('fuel_anomaly','High','Vehicle 108 fuel anomaly detected','Fuel spend above lane baseline with elevated idle time.','vehicle',8,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 118 MINUTE)),
                ('vehicle_arrived','Healthy','Vehicle 111 arrived at Louisville terminal','Trailer handoff completed successfully.','vehicle',11,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 132 MINUTE)),
                ('job_delayed','High','JOB-1018 delayed at stop','Dock dwell exceeded planned service window.','job',18,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 145 MINUTE)),
                ('work_order_created','Healthy','WO-7007 tire set in progress','Maintenance team started tire replacement.','work_order',7,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 158 MINUTE)),
                ('route_deviated','Warning','UrbanMed route resequenced','Expedited stop order changed to protect SLA.','route',3,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 170 MINUTE)),
                ('maintenance_warning','Critical','RF-09 reefer temperature alarm','Reefer asset generated critical temperature alarm.','asset',8,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 185 MINUTE)),
                ('driver_safety_event','High','Ivy Ross camera review opened','Dashcam clip requires safety disposition.','driver',12,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 196 MINUTE)),
                ('eta_sent','Healthy','Pioneer Foods ETA sent','Cold chain shipment ETA published to portal.','customer',2,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 210 MINUTE)),
                ('compliance_expiring','Warning','IFTA filing due soon','Quarter close filing requires finance review.','compliance_document',5,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 225 MINUTE)),
                ('fuel_anomaly','Medium','Vehicle 102 high idle pattern','Idle time is above terminal staging baseline.','vehicle',2,DATE_SUB(UTC_TIMESTAMP(), INTERVAL 240 MINUTE))
            """);
        }

        var aiCount = await QueryAsync("SELECT COUNT(*) AS count FROM ai_recommendations");
        if (Convert.ToInt32(aiCount[0]["count"]) == 0)
        {
            await ExecuteAsync("""
                INSERT INTO ai_recommendations (category, severity, title, insight, evidence_json, recommended_action, linked_entity_type, linked_entity_id, status) VALUES
                ('Risk detected','Critical','Vehicle 112 threatens dispatch continuity','Vehicle 112 has a critical diagnostic fault and active recovery-route dependency. This matters because it can strand the CIN recovery route and increase SLA exposure.','{"sources":["vehicles","maintenance_items","work_orders"],"entities":["Vehicle 112","WO-7001"]}','Dispatch substitute vehicle and complete diagnostic work order within one hour.','vehicle',12,'Open'),
                ('Cost leakage','High','Idle cost increased materially today','Idle cost is concentrated on Vehicles 102, 105, 108, and 112. This matters because wait patterns are eroding lane margin before invoicing.','{"sources":["fuel_transactions"],"idleCost":463,"vehicles":["Vehicle 102","Vehicle 105","Vehicle 108","Vehicle 112"]}','Review staging, detention, and driver wait patterns with dispatch.','vehicle',112,'Open'),
                ('Maintenance prediction','High','Maintenance risk is clustered in tractor and reefer assets','Critical and due maintenance items are concentrated around Vehicle 103, Vehicle 109, Vehicle 112, and RF-09.','{"sources":["maintenance_items","assets"],"dueItems":4,"criticalItems":2}','Create or pull forward work orders before assigning long-haul work.','maintenance_item',1,'Open'),
                ('Driver coaching','High','Coaching queue should be prioritized','Ethan Reed and Ivy Ross show repeat safety review patterns. This matters because repeated camera events increase insurance and incident risk.','{"sources":["drivers","safety_events","dashcam_events"],"drivers":["Ethan Reed","Ivy Ross"]}','Create coaching tasks and review dashcam evidence packages.','driver',3,'Open'),
                ('SLA/customer issue','High','UrbanMed SLA is in watch status','UrbanMed expedited load has penalty exposure and a delayed route context.','{"sources":["customers","jobs","routes"],"customer":"UrbanMed Supply"}','Send proactive ETA and assign highest-availability vehicle.','customer',4,'Open'),
                ('Compliance warning','Warning','Documents require renewal before audit window','Insurance, medical cards, and IFTA filing are approaching expiration or review.','{"sources":["compliance_documents"],"warnings":5}','Renew high-priority documents and record audit trail.','compliance_document',1,'Open'),
                ('Fuel anomaly','Medium','Vehicle 108 fuel spend exceeds lane baseline','Fuel transaction review suggests higher spend than expected for lane profile.','{"sources":["fuel_transactions"],"vehicle":"Vehicle 108"}','Investigate fuel purchase and idling against route plan.','vehicle',8,'Open'),
                ('Dispatch optimization','Medium','CMH retail route can be resequenced','Stop order changes can reduce expected delay and protect SLA.','{"sources":["routes","route_stops"],"route":"CMH Retail Route"}','Move high-risk dock stop earlier and notify customer success.','route',5,'Open'),
                ('Asset utilization','Medium','Reefer and trailer utilization has imbalance','Reefer risk and trailer assignments indicate underutilization in some assets.','{"sources":["assets","jobs"],"assetTypes":["Reefer","Trailer"]}','Rebalance equipment assignments before next dispatch wave.','asset',8,'Open'),
                ('Executive summary','Watch','Today is in WATCH status','The operation is healthy overall but has delayed jobs, idle cost leakage, maintenance risk, and compliance warnings requiring action.','{"sources":["dashboard","command_center_actions"],"status":"Watch"}','Work the critical and high-priority action queue first.','company',1,'Open')
            """);
        }
    }

    public async Task<Dictionary<string, object?>> GetCommandCenterSummaryAsync()
    {
        await EnsureCommandCenterAsync();

        var vehicles = await QueryAsync("SELECT id, name, status, owner, metric, priority, location FROM vehicles ORDER BY id");
        var drivers = await QueryAsync("SELECT id, name, status, owner, metric, priority, location, safety_score AS safetyScore FROM drivers ORDER BY id");
        var jobs = await QueryAsync("SELECT id, name, status, owner, metric, priority, location, customer_id AS customerId FROM jobs ORDER BY id");
        var assets = await QueryAsync("SELECT id, name, status, owner, metric, priority, location FROM assets ORDER BY id");
        var maintenance = await QueryAsync("SELECT id, name, status, owner, metric, priority, location FROM maintenance_items ORDER BY id");
        var safety = await QueryAsync("SELECT id, name, status, owner, metric, priority, location FROM safety_events ORDER BY id");
        var compliance = await QueryAsync("SELECT id, name, status, owner, metric, priority, location FROM compliance_documents ORDER BY id");
        var fuel = await QueryAsync("SELECT COALESCE(SUM(amount),0) AS fuelSpend, COALESCE(SUM(idle_cost),0) AS idleCost FROM fuel_transactions");
        var weekly = await QueryAsync("SELECT label AS day, value AS completed, target AS onTime FROM kpi_records WHERE category='weekly' ORDER BY id LIMIT 7");
        var actions = await QueryAsync("SELECT id, title, description, category, priority, status, linked_entity_type AS linkedEntityType, linked_entity_id AS linkedEntityId, owner_role AS ownerRole, due_at AS dueAt, updated_at AS updatedAt FROM command_center_actions ORDER BY FIELD(priority, 'Critical','High','Medium','Low'), due_at LIMIT 20");
        var timeline = await QueryAsync("SELECT id, event_type AS eventType, severity, title, description, linked_entity_type AS linkedEntityType, linked_entity_id AS linkedEntityId, occurred_at AS occurredAt FROM operational_events ORDER BY occurred_at DESC LIMIT 25");
        var aiBrief = await QueryAsync("SELECT id, category, severity, title, insight, JSON_UNQUOTE(JSON_EXTRACT(evidence_json, '$')) AS evidenceJson, recommended_action AS recommendedAction, linked_entity_type AS linkedEntityType, linked_entity_id AS linkedEntityId, status, created_at AS createdAt FROM ai_recommendations ORDER BY FIELD(severity, 'Critical','High','Warning','Medium','Low'), created_at DESC LIMIT 10");
        var alerts = await QueryAsync("SELECT id, name AS title, priority AS severity, metric AS message, updated_at AS updatedAt FROM notifications ORDER BY id DESC LIMIT 8");

        var delayedJobs = jobs.Count(j => Has(j, "status", "Delayed"));
        var jobsAtRisk = jobs.Count(j => Has(j, "status", "Delayed") || Has(j, "priority", "High"));
        var activeVehicles = vehicles.Count(v => Has(v, "status", "Active"));
        var vehiclesOffline = vehicles.Count(v => Has(v, "status", "Critical") || Has(v, "status", "Maintenance"));
        var maintenanceDue = maintenance.Count(m => Has(m, "status", "Due") || Has(m, "priority", "High"));
        var criticalMaintenance = maintenance.Count(m => Has(m, "status", "Critical") || Has(m, "priority", "Critical"));
        var openIncidents = safety.Count(s => Has(s, "status", "Review") || Has(s, "priority", "High"));
        var complianceRisk = compliance.Count(c => Has(c, "status", "Warning") || Has(c, "priority", "High"));
        var completedJobs = jobs.Count(j => Has(j, "status", "Completed"));
        var onTimeDelivery = jobs.Count == 0 ? 0 : (int)Math.Round((completedJobs + jobs.Count(j => !Has(j, "status", "Delayed"))) * 100m / Math.Max(jobs.Count, 1));
        var avgSafety = drivers.Count == 0 ? 0 : (int)Math.Round(drivers.Average(d => Convert.ToDecimal(d.GetValueOrDefault("safetyScore") ?? 0)));
        var driverUtilization = drivers.Count == 0 ? 0 : (int)Math.Round(drivers.Count(d => Has(d, "status", "Active") || Has(d, "status", "At Stop") || Has(d, "status", "Delayed")) * 100m / drivers.Count);
        var assetUtilization = assets.Count == 0 ? 0 : (int)Math.Round(assets.Count(a => Has(a, "status", "Active") || Has(a, "status", "At Stop")) * 100m / assets.Count);
        var idleCost = Convert.ToDecimal(fuel[0]["idleCost"] ?? 0);
        var fuelSpend = Convert.ToDecimal(fuel[0]["fuelSpend"] ?? 0);

        var fleetRisk = Math.Min(100, delayedJobs * 8 + maintenanceDue * 5 + criticalMaintenance * 10 + complianceRisk * 4 + openIncidents * 4 + (idleCost > 400 ? 10 : 0));
        var vehicleRisk = Math.Min(100, vehiclesOffline * 12 + criticalMaintenance * 8 + (idleCost > 400 ? 12 : 0));
        var jobRisk = Math.Min(100, jobsAtRisk * 8 + delayedJobs * 7);
        var driverRisk = Math.Min(100, openIncidents * 10 + drivers.Count(d => Has(d, "status", "Review") || Has(d, "status", "Coaching")) * 7);
        var operationalStatus = fleetRisk >= 75 ? "Critical" : fleetRisk >= 55 ? "At Risk" : fleetRisk >= 30 ? "Watch" : "Healthy";

        var kpis = new[]
        {
            Kpi("activeVehicles", "Active Vehicles", activeVehicles, "+4.2%", "Healthy", "Vehicles actively available or moving right now.", "vehicles", "Truck"),
            Kpi("vehiclesOffline", "Vehicles Offline", vehiclesOffline, vehiclesOffline > 2 ? "+1" : "Stable", vehiclesOffline > 2 ? "Watch" : "Healthy", "Vehicles offline, critical, or blocked by maintenance.", "vehicles?filter=offline", "Power"),
            Kpi("jobsInProgress", "Jobs in Progress", jobs.Count(j => !Has(j, "status", "Completed")), "Live", "In Motion", "Loads not yet completed across the operation.", "jobs-orders", "PackageCheck"),
            Kpi("jobsAtRisk", "Jobs At Risk", jobsAtRisk, "+2 risk", jobsAtRisk > 5 ? "At Risk" : "Watch", "Jobs with high priority, delay, or SLA exposure.", "dispatch-board?filter=risk", "AlertTriangle"),
            Kpi("delayedJobs", "Delayed Jobs", delayedJobs, delayedJobs > 0 ? "Needs action" : "Clear", delayedJobs > 0 ? "Watch" : "Healthy", "Jobs currently delayed or in exception status.", "dispatch-board?filter=delayed", "Clock"),
            Kpi("onTimeDelivery", "On-Time Delivery %", $"{onTimeDelivery}%", "+3.1%", onTimeDelivery >= 90 ? "Healthy" : "Watch", "Current on-time delivery posture from seeded jobs.", "reports-analytics?report=otd", "Gauge"),
            Kpi("fleetSafetyScore", "Fleet Safety Score", $"{avgSafety}%", "+1.8%", avgSafety >= 90 ? "Healthy" : "Watch", "Average driver safety score and incident posture.", "safety", "ShieldCheck"),
            Kpi("maintenanceDue", "Maintenance Due", maintenanceDue, "48h window", maintenanceDue > 3 ? "Watch" : "Healthy", "Maintenance tasks due or high priority.", "maintenance", "Wrench"),
            Kpi("criticalMaintenance", "Critical Maintenance", criticalMaintenance, criticalMaintenance > 0 ? "Immediate" : "None", criticalMaintenance > 0 ? "Critical" : "Healthy", "Critical maintenance or asset alarms.", "work-orders?filter=critical", "Siren"),
            Kpi("idleCostToday", "Idle Cost Today", $"${idleCost:N0}", "+18%", idleCost > 400 ? "High Idle" : "Healthy", "Idle cost leakage from fuel transactions.", "fuel-idling?filter=idle", "Timer"),
            Kpi("fuelSpendToday", "Fuel Spend Today", $"${fuelSpend:N0}", "MTD sample", "Tracked", "Fuel spend from seeded transaction records.", "fuel-idling", "Fuel"),
            Kpi("complianceRisk", "Compliance Risk", complianceRisk, "Audit watch", complianceRisk > 0 ? "Audit Risk" : "Healthy", "Expiring or warning-level compliance documents.", "compliance", "FileWarning"),
            Kpi("openIncidents", "Open Incidents", openIncidents, "Review", openIncidents > 0 ? "Coaching" : "Healthy", "Safety and incident review items needing action.", "dashcam", "CarFront"),
            Kpi("customerSlaRisk", "Customer SLA Risk", jobsAtRisk, "Portal watch", jobsAtRisk > 4 ? "SLA Watch" : "Healthy", "Customer-facing service risk based on job status.", "customer-eta-portal", "RadioTower"),
            Kpi("driverUtilization", "Driver Utilization %", $"{driverUtilization}%", "+5.4%", "Optimized", "Driver availability and active assignment posture.", "drivers", "Users"),
            Kpi("assetUtilization", "Asset Utilization %", $"{assetUtilization}%", "Balanced", assetUtilization >= 70 ? "Healthy" : "Watch", "Trailer, reefer, chassis, and equipment utilization.", "assets", "Boxes")
        };

        var dispatchStatuses = new[] { "Unassigned", "Assigned", "En Route", "At Stop", "Completed", "Delayed / Exception" };

        return new Dictionary<string, object?>
        {
            ["operationalStatus"] = operationalStatus,
            ["generatedAt"] = DateTimeOffset.UtcNow,
            ["executiveBrief"] = $"Today's operation is in {operationalStatus.ToUpperInvariant()} status. {activeVehicles} vehicles are active, {jobsAtRisk} jobs are at risk, idle cost is ${idleCost:N0}, and {maintenanceDue} maintenance items require action within 48 hours.",
            ["riskHeatScore"] = new { fleet = fleetRisk, vehicles = vehicleRisk, jobs = jobRisk, drivers = driverRisk },
            ["costLeakageRadar"] = new[]
            {
                new { category = "Idle cost", value = idleCost, severity = idleCost > 400 ? "High" : "Medium", explanation = "Driver wait and staging patterns are creating margin leakage." },
                new { category = "Delayed jobs", value = Convert.ToDecimal(delayedJobs * 175), severity = delayedJobs > 2 ? "High" : "Medium", explanation = "Delayed jobs create detention, overtime, and SLA penalty exposure." },
                new { category = "Repeated maintenance", value = Convert.ToDecimal(criticalMaintenance * 420), severity = criticalMaintenance > 0 ? "High" : "Low", explanation = "Repeat maintenance patterns reduce vehicle availability." },
                new { category = "Fuel anomalies", value = 640m, severity = "Medium", explanation = "Outlier transactions exceed expected lane baseline." },
                new { category = "Underutilized vehicles", value = Convert.ToDecimal(Math.Max(0, vehicles.Count - activeVehicles) * 210), severity = "Watch", explanation = "Offline or underused equipment reduces earning capacity." }
            },
            ["kpis"] = kpis,
            ["aiBrief"] = aiBrief,
            ["priorityActions"] = actions,
            ["timeline"] = timeline,
            ["charts"] = new
            {
                weeklyCompletedJobs = weekly,
                onTimeDeliveryTrend = weekly.Select((w, i) => new { day = w["day"], percent = 88 + (i % 4) + (i > 3 ? 2 : 0) }),
                idleCostTrend = weekly.Select((w, i) => new { day = w["day"], cost = 42 + i * 8 + (i % 2 == 0 ? 14 : 0) }),
                safetyScoreTrend = weekly.Select((w, i) => new { day = w["day"], score = 90 + (i % 5) }),
                maintenanceRiskByVehicleType = new[] { new { name = "Tractor", value = 42 }, new { name = "Reefer", value = 28 }, new { name = "Trailer", value = 18 }, new { name = "Equipment", value = 12 } },
                jobsByStatus = dispatchStatuses.Select(status => new { status, count = jobs.Count(j => $"{j.GetValueOrDefault("status")}" == status) })
            },
            ["fleetSnapshot"] = vehicles.Select((v, i) => new
            {
                vehicle = v["name"],
                driver = drivers.Count == 0 ? "Unassigned" : drivers[i % drivers.Count]["name"],
                status = v["status"],
                currentJob = jobs.Count == 0 ? "No active job" : jobs[i % jobs.Count]["name"],
                location = v["location"],
                eta = Has(v, "status", "Delayed") ? "42m late" : i % 3 == 0 ? "At stop" : "On track",
                riskScore = Math.Min(100, (Has(v, "priority", "Critical") ? 88 : Has(v, "priority", "High") ? 72 : Has(v, "status", "Maintenance") ? 64 : 18 + i * 3)),
                recommendedAction = Has(v, "priority", "Critical") ? "Create recovery work order" : Has(v, "status", "Delayed") ? "Send ETA and resequence route" : "Monitor"
            }).OrderByDescending(v => v.riskScore).Take(8),
            ["dispatchSnapshot"] = dispatchStatuses.Select(status => new { status, count = jobs.Count(j => $"{j.GetValueOrDefault("status")}" == status), risk = status.Contains("Delayed") ? "High" : status == "Unassigned" ? "Watch" : "Normal" }),
            ["mapPreview"] = new
            {
                vehicles = vehicles.Select((v, i) => new { id = v["id"], name = v["name"], status = v["status"], priority = v["priority"], location = v["location"], x = 10 + (i * 8) % 78, y = 16 + (i * 12) % 62 }),
                geofences = new[] { new { name = "Chicago Terminal", severity = "Healthy" }, new { name = "Toledo Delay Zone", severity = "Warning" }, new { name = "Cincinnati Recovery", severity = "Critical" } },
                selectedVehicle = new { vehicle = "Vehicle 112", driver = "Ben Carter", currentJob = "JOB-1006", speed = "0 mph", eta = "Recovery required", safetyScore = 84, fuelIdling = "High idle", lastEvent = "Critical diagnostic fault", recommendedAction = "Dispatch substitute vehicle" }
            },
            ["alerts"] = alerts,
            ["permissions"] = new
            {
                visibleTo = new[] { "Super Admin", "Company Admin", "Fleet Manager", "Dispatcher", "Safety Manager", "Compliance Manager", "Maintenance Manager", "Mechanic", "Read-only Auditor" },
                restrictedFor = new[] { "Driver", "Customer" },
                routeGuardFoundation = true
            }
        };
    }

    public async Task<Dictionary<string, object?>> UpdateCommandActionAsync(int actionId, string status, string actor)
    {
        await EnsureCommandCenterAsync();
        await ExecuteAsync("UPDATE command_center_actions SET status = @status, updated_at = UTC_TIMESTAMP() WHERE id = @id", new() { ["@status"] = status, ["@id"] = actionId });
        var rows = await QueryAsync("SELECT id, title, category, priority, status, linked_entity_type AS linkedEntityType, linked_entity_id AS linkedEntityId, owner_role AS ownerRole, due_at AS dueAt FROM command_center_actions WHERE id = @id", new() { ["@id"] = actionId });
        var title = rows.Count > 0 ? $"{rows[0]["title"]}" : $"Command action {actionId}";
        var linkedType = rows.Count > 0 ? $"{rows[0]["linkedEntityType"]}" : "command_center_action";
        var linkedId = rows.Count > 0 ? $"{rows[0]["linkedEntityId"]}" : $"{actionId}";
        await ExecuteAsync("""
            INSERT INTO audit_logs (name, status, owner, metric, priority, location, actor, updated_at)
            VALUES (@name, 'Recorded', 'Command Center', @metric, 'Normal', 'OpsTrax', @actor, UTC_TIMESTAMP())
        """, new()
        {
            ["@name"] = $"Command action {status.ToLowerInvariant()}",
            ["@metric"] = $"{title} {status.ToLowerInvariant()} by {actor}; linked entity {linkedType}:{linkedId}",
            ["@actor"] = actor
        });
        return rows.FirstOrDefault() ?? new Dictionary<string, object?> { ["id"] = actionId, ["status"] = status };
    }

    public async Task EnsureControlTowerAsync()
    {
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS geofences (
              id INT AUTO_INCREMENT PRIMARY KEY,
              tenant_id INT NOT NULL DEFAULT 1,
              name VARCHAR(160) NOT NULL,
              type VARCHAR(80) NOT NULL,
              center_latitude DECIMAL(10,6) NOT NULL,
              center_longitude DECIMAL(10,6) NOT NULL,
              radius_meters INT NOT NULL,
              polygon_json JSON NULL,
              status VARCHAR(40) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
              INDEX idx_geofence_tenant (tenant_id),
              INDEX idx_geofence_status (status)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS geofence_events (
              id INT AUTO_INCREMENT PRIMARY KEY,
              tenant_id INT NOT NULL DEFAULT 1,
              geofence_id INT NOT NULL,
              entity_type VARCHAR(60) NOT NULL,
              entity_id INT NOT NULL,
              event_type VARCHAR(80) NOT NULL,
              occurred_at DATETIME NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_gfe_tenant (tenant_id),
              INDEX idx_gfe_geofence (geofence_id),
              INDEX idx_gfe_entity (entity_type, entity_id),
              INDEX idx_gfe_occurred (occurred_at)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS route_paths (
              id INT AUTO_INCREMENT PRIMARY KEY,
              tenant_id INT NOT NULL DEFAULT 1,
              route_id INT NOT NULL,
              path_json JSON NOT NULL,
              status VARCHAR(40) NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_route_path_tenant (tenant_id),
              INDEX idx_route_path_route (route_id),
              INDEX idx_route_path_status (status)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS eta_updates (
              id INT AUTO_INCREMENT PRIMARY KEY,
              tenant_id INT NOT NULL DEFAULT 1,
              job_id INT NOT NULL,
              customer_id INT NULL,
              channel VARCHAR(60) NOT NULL,
              message VARCHAR(600) NOT NULL,
              status VARCHAR(40) NOT NULL,
              sent_at DATETIME NOT NULL,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_eta_tenant (tenant_id),
              INDEX idx_eta_job (job_id),
              INDEX idx_eta_status (status)
            )
        """);

        var geoCount = await QueryAsync("SELECT COUNT(*) AS count FROM geofences");
        if (Convert.ToInt32(geoCount[0]["count"]) == 0)
        {
            await ExecuteAsync("""
                INSERT INTO geofences (name, type, center_latitude, center_longitude, radius_meters, polygon_json, status) VALUES
                ('Manassas Terminal', 'approved_zone', 38.7509, -77.4753, 2800, '{"points":[[-77.49,38.74],[-77.46,38.75],[-77.47,38.77]]}', 'Healthy'),
                ('Woodbridge Customer Site', 'customer_site', 38.6582, -77.2497, 1800, '{"points":[[-77.26,38.65],[-77.24,38.66],[-77.25,38.67]]}', 'Healthy'),
                ('Alexandria Delay Zone', 'high_delay_zone', 38.8048, -77.0469, 2200, '{"points":[[-77.06,38.79],[-77.03,38.80],[-77.04,38.82]]}', 'Warning'),
                ('Dulles Air Cargo', 'customer_site', 38.9531, -77.4565, 2600, '{"points":[[-77.47,38.94],[-77.44,38.95],[-77.45,38.97]]}', 'Healthy'),
                ('Fairfax Maintenance Yard', 'maintenance_yard', 38.8462, -77.3064, 1600, '{"points":[[-77.32,38.84],[-77.30,38.85],[-77.31,38.86]]}', 'Watch'),
                ('DC Restricted Core', 'restricted_zone', 38.9072, -77.0369, 3000, '{"points":[[-77.06,38.89],[-77.02,38.90],[-77.03,38.93]]}', 'Critical')
            """);
        }

        var pathCount = await QueryAsync("SELECT COUNT(*) AS count FROM route_paths");
        if (Convert.ToInt32(pathCount[0]["count"]) == 0)
        {
            await ExecuteAsync("""
                INSERT INTO route_paths (route_id, path_json, status) VALUES
                (1, '{"points":[[-77.47,38.75],[-77.31,38.84],[-77.04,38.90]]}', 'Active'),
                (2, '{"points":[[-77.45,38.95],[-77.30,38.85],[-77.25,38.66]]}', 'Active'),
                (3, '{"points":[[-77.04,38.90],[-77.05,38.80],[-77.25,38.66]]}', 'SLA Watch'),
                (4, '{"points":[[-77.31,38.84],[-77.46,38.75],[-77.45,38.95]]}', 'Active'),
                (5, '{"points":[[-77.25,38.66],[-77.05,38.80],[-77.04,38.90]]}', 'Delayed'),
                (6, '{"points":[[-77.46,38.75],[-77.25,38.66],[-77.31,38.84]]}', 'Active'),
                (7, '{"points":[[-77.45,38.95],[-77.04,38.90],[-77.25,38.66]]}', 'Deviation'),
                (8, '{"points":[[-77.31,38.84],[-77.45,38.95],[-77.04,38.90]]}', 'Maintenance Risk')
            """);
        }

        var gfEventCount = await QueryAsync("SELECT COUNT(*) AS count FROM geofence_events");
        if (Convert.ToInt32(gfEventCount[0]["count"]) == 0)
        {
            await ExecuteAsync("""
                INSERT INTO geofence_events (geofence_id, entity_type, entity_id, event_type, occurred_at) VALUES
                (1,'vehicle',101,'geofence.entered',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6 MINUTE)),
                (2,'job',1006,'geofence.exited',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 12 MINUTE)),
                (3,'vehicle',105,'geofence.entered',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 18 MINUTE)),
                (4,'asset',302,'geofence.entered',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 MINUTE)),
                (5,'vehicle',112,'geofence.exited',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 31 MINUTE)),
                (6,'vehicle',108,'geofence.entered',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 40 MINUTE)),
                (2,'asset',440,'geofence.entered',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 48 MINUTE)),
                (3,'job',1018,'geofence.entered',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 54 MINUTE)),
                (5,'vehicle',103,'geofence.entered',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 64 MINUTE)),
                (1,'asset',301,'geofence.exited',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 78 MINUTE))
            """);
        }

        var etaCount = await QueryAsync("SELECT COUNT(*) AS count FROM eta_updates");
        if (Convert.ToInt32(etaCount[0]["count"]) == 0)
        {
            await ExecuteAsync("""
                INSERT INTO eta_updates (job_id, customer_id, channel, message, status, sent_at) VALUES
                (6, 4, 'portal', 'Revised ETA sent for JOB-1006 due to Alexandria delay zone.', 'Sent', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 12 MINUTE)),
                (12, 1, 'email', 'SLA watch update sent to Northstar Retail.', 'Sent', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 44 MINUTE)),
                (18, 4, 'sms', 'Dock dwell delay notification sent.', 'Sent', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 88 MINUTE))
            """);
        }
    }

    public async Task<List<Dictionary<string, object?>>> GetControlTowerEntitiesAsync(string? type = null, string? status = null, string? risk = null, string? search = null)
    {
        await EnsureControlTowerAsync();
        var vehicles = await QueryAsync("SELECT id, name, status, owner, metric, priority, location FROM vehicles ORDER BY id");
        var drivers = await QueryAsync("SELECT id, name, safety_score AS safetyScore FROM drivers ORDER BY id");
        var jobs = await QueryAsync("SELECT id, name, status, priority, location, customer_id AS customerId, pickup_window AS pickupWindow, delivery_window AS deliveryWindow FROM jobs ORDER BY id");
        var assets = await QueryAsync("SELECT id, name, status, priority, location, asset_type AS assetType, metric FROM assets ORDER BY id");

        var entities = new List<Dictionary<string, object?>>();
        for (var i = 0; i < vehicles.Count; i++)
        {
            var v = vehicles[i];
            var driver = drivers.Count > 0 ? drivers[i % drivers.Count] : new Dictionary<string, object?>();
            var job = jobs.Count > 0 ? jobs[i % jobs.Count] : new Dictionary<string, object?>();
            entities.Add(ControlEntity("vehicle", Convert.ToInt32(v["id"]), $"{v["name"]}", $"{driver.GetValueOrDefault("name") ?? "Unassigned"}", $"{v["status"]}", $"{v["location"]}", EtaFor(v, i), RiskFor(v, i), Convert.ToInt32(driver.GetValueOrDefault("safetyScore") ?? 88), $"{job.GetValueOrDefault("name") ?? "No job"}", 38.62m + i * 0.031m, -77.52m + i * 0.041m, $"{v["priority"]}", $"{v["metric"]}", "Review route and service posture"));
        }
        for (var i = 0; i < jobs.Count; i++)
        {
            var j = jobs[i];
            entities.Add(ControlEntity("job", Convert.ToInt32(j["id"]), $"{j["name"]}", $"Customer {j["customerId"]}", $"{j["status"]}", $"{j["location"]}", Has(j, "status", "Delayed") ? "Late" : "On track", RiskFor(j, i), 0, $"{j["name"]}", 38.66m + i * 0.018m, -77.47m + i * 0.023m, $"{j["priority"]}", $"Pickup {j["pickupWindow"]} / Delivery {j["deliveryWindow"]}", Has(j, "status", "Delayed") ? "Send customer ETA" : "Monitor SLA"));
        }
        for (var i = 0; i < assets.Count; i++)
        {
            var a = assets[i];
            entities.Add(ControlEntity("asset", Convert.ToInt32(a["id"]), $"{a["name"]}", $"{a["assetType"]}", $"{a["status"]}", $"{a["location"]}", "Last seen now", RiskFor(a, i), 0, $"Assigned load {1000 + i}", 38.72m + i * 0.027m, -77.38m + i * 0.019m, $"{a["priority"]}", $"{a["metric"]}", Has(a, "status", "Critical") ? "Create maintenance review" : "Monitor geofence"));
        }

        IEnumerable<Dictionary<string, object?>> query = entities;
        if (!string.IsNullOrWhiteSpace(type)) query = query.Where(e => $"{e["type"]}".Equals(type, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(status) && status != "All") query = query.Where(e => $"{e["status"]}".Contains(status, StringComparison.OrdinalIgnoreCase) || $"{e["etaRisk"]}".Contains(status, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(risk)) query = query.Where(e => $"{e["riskBand"]}".Contains(risk, StringComparison.OrdinalIgnoreCase));
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(e => string.Join(" ", e.Values).Contains(search, StringComparison.OrdinalIgnoreCase));
        return query.ToList();
    }

    public async Task<Dictionary<string, object?>> GetControlTowerSummaryAsync()
    {
        await EnsureControlTowerAsync();
        var entities = await GetControlTowerEntitiesAsync();
        var events = await GetControlTowerEventsAsync();
        var routes = await QueryAsync("SELECT rp.id, rp.route_id AS routeId, r.name, rp.path_json AS pathJson, rp.status FROM route_paths rp LEFT JOIN routes r ON r.id = rp.route_id ORDER BY rp.id");
        var geofences = await QueryAsync("SELECT id, name, type, center_latitude AS centerLatitude, center_longitude AS centerLongitude, radius_meters AS radiusMeters, status FROM geofences ORDER BY id");
        var ai = ControlTowerAi(entities);
        var activeVehicles = entities.Count(e => $"{e["type"]}" == "vehicle" && (Has(e, "status", "Active") || Has(e, "status", "At Stop") || Has(e, "status", "Delayed")));
        var delayedJobs = entities.Count(e => $"{e["type"]}" == "job" && Has(e, "status", "Delayed"));
        var idleVehicles = entities.Count(e => $"{e["status"]}".Contains("Idle", StringComparison.OrdinalIgnoreCase) || $"{e["fuelIdling"]}".Contains("idle", StringComparison.OrdinalIgnoreCase));
        var offline = entities.Count(e => Has(e, "status", "Offline") || Has(e, "status", "Critical"));
        var geofenceAlerts = await QueryAsync("SELECT COUNT(*) AS count FROM geofence_events WHERE event_type LIKE '%exited%' OR geofence_id = 6");
        var maintenanceRisk = entities.Count(e => Has(e, "status", "Maintenance") || Has(e, "priority", "Critical") || Has(e, "riskBand", "Critical"));
        var slaRisk = entities.Count(e => Has(e, "etaRisk", "At Risk") || Has(e, "etaRisk", "Late"));
        return new Dictionary<string, object?>
        {
            ["generatedAt"] = DateTimeOffset.UtcNow,
            ["snapshot"] = $"{activeVehicles} vehicles are active. {slaRisk} jobs are at risk, {idleVehicles} vehicles are idle beyond threshold, and {events.Count(e => Has(e, "eventType", "route.deviated"))} route deviation requires dispatcher review.",
            ["kpis"] = new[]
            {
                Kpi("activeVehicles", "Active vehicles", activeVehicles, "Streaming", "Live", "Vehicles currently visible in the control tower.", "Filter active vehicles", "RadioTower"),
                Kpi("delayedJobs", "Delayed jobs", delayedJobs, "SLA watch", delayedJobs > 0 ? "Watch" : "Healthy", "Jobs projected late or already delayed.", "Open delayed jobs", "Clock"),
                Kpi("idleVehicles", "Idle vehicles", idleVehicles, "Cost leakage", idleVehicles > 0 ? "High Idle" : "Healthy", "Vehicles beyond idle threshold.", "Review idle units", "Gauge"),
                Kpi("offlineDevices", "Offline devices", offline, "Device health", offline > 0 ? "Critical" : "Healthy", "Vehicles or trackers without healthy signal.", "Inspect offline devices", "WifiOff"),
                Kpi("geofenceAlerts", "Geofence alerts", Convert.ToInt32(geofenceAlerts[0]["count"] ?? 0), "Zone intelligence", "Watch", "Entry/exit activity requiring review.", "Open geofence alerts", "MapPinned"),
                Kpi("slaRisk", "SLA risk", slaRisk, "Customer ETA", slaRisk > 0 ? "SLA Watch" : "Healthy", "Customer commitments requiring attention.", "Send ETA updates", "Navigation"),
                Kpi("safetyEventsToday", "Safety events today", events.Count(e => Has(e, "eventType", "safety.event")), "Today", "Review", "Safety events surfaced in the live feed.", "Open safety review", "ShieldAlert"),
                Kpi("maintenanceRisk", "Maintenance risk", maintenanceRisk, "Predictive", maintenanceRisk > 0 ? "Service Soon" : "Healthy", "Units with maintenance risk or critical posture.", "Create maintenance review", "Wrench")
            },
            ["mapEntities"] = entities,
            ["routes"] = routes,
            ["geofences"] = geofences,
            ["delayZones"] = geofences.Where(g => Has(g, "type", "delay") || Has(g, "status", "Warning")),
            ["incidents"] = events.Where(e => Has(e, "severity", "High") || Has(e, "severity", "Critical")).Take(8),
            ["selectedEntityDefaults"] = entities.OrderByDescending(e => Convert.ToInt32(e["riskScore"] ?? 0)).FirstOrDefault(),
            ["liveEvents"] = events,
            ["aiRecommendations"] = ai,
            ["filters"] = new[] { "All", "On Route", "At Stop", "Delayed", "Idle", "Offline", "Maintenance Risk", "Safety Event", "Geofence Alert", "Customer SLA Risk", "Assets", "Trailers" },
            ["permissions"] = new { visibleTo = new[] { "Super Admin", "Company Admin", "Fleet Manager", "Dispatcher", "Safety Manager", "Compliance Manager", "Customer Service", "Read-only Auditor" }, restrictedFor = new[] { "Driver", "Customer" }, routeGuardFoundation = true }
        };
    }

    public async Task<List<Dictionary<string, object?>>> GetControlTowerEventsAsync()
    {
        await EnsureControlTowerAsync();
        var events = await QueryAsync("SELECT id, event_type AS eventType, severity, title, description, linked_entity_type AS entityType, linked_entity_id AS entityId, occurred_at AS occurredAt FROM operational_events ORDER BY occurred_at DESC LIMIT 30");
        var gf = await QueryAsync("""
            SELECT ge.id, ge.event_type AS eventType, IF(g.status='Critical','Critical',IF(g.status='Warning','Warning','Healthy')) AS severity,
                   CONCAT(g.name, ' ', REPLACE(ge.event_type, 'geofence.', '')) AS title,
                   CONCAT(ge.entity_type, ' ', ge.entity_id, ' ', REPLACE(ge.event_type, 'geofence.', ''), ' ', g.name) AS description,
                   ge.entity_type AS entityType, ge.entity_id AS entityId, ge.occurred_at AS occurredAt
            FROM geofence_events ge JOIN geofences g ON g.id = ge.geofence_id
            ORDER BY ge.occurred_at DESC LIMIT 10
        """);
        return events.Concat(gf).OrderByDescending(e => Convert.ToDateTime(e["occurredAt"])).Take(30).ToList();
    }

    public async Task<Dictionary<string, object?>> GetControlTowerEntityAsync(string entityType, int id)
    {
        var entity = (await GetControlTowerEntitiesAsync(entityType)).FirstOrDefault(e => Convert.ToInt32(e["id"] ?? 0) == id);
        return entity ?? new Dictionary<string, object?> { ["id"] = id, ["type"] = entityType, ["status"] = "Not Found" };
    }

    public async Task<Dictionary<string, object?>> CreateControlTowerActionAsync(string actionType, Dictionary<string, object?> payload, string actor)
    {
        await EnsureControlTowerAsync();
        var entityType = PayloadString(payload, "entityType", "vehicle");
        var entityId = PayloadInt(payload, "entityId", 0);
        var jobId = PayloadInt(payload, "jobId", Math.Max(entityId, 1));
        var title = actionType switch
        {
            "send-eta-update" => "ETA update sent from Control Tower",
            "create-dispatch-review" => "Dispatch review created from Control Tower",
            "create-maintenance-review" => "Maintenance review created from Control Tower",
            _ => "Control Tower action"
        };
        if (actionType == "send-eta-update")
        {
            await ExecuteAsync("INSERT INTO eta_updates (job_id, customer_id, channel, message, status, sent_at) VALUES (@jobId, @customerId, 'portal', @message, 'Sent', UTC_TIMESTAMP())", new()
            {
                ["@jobId"] = jobId,
                ["@customerId"] = PayloadInt(payload, "customerId", 1),
                ["@message"] = PayloadString(payload, "message", "Control Tower ETA update sent.")
            });
        }
        if (actionType == "create-dispatch-review" || actionType == "create-maintenance-review")
        {
            await EnsureCommandCenterAsync();
            await ExecuteAsync("INSERT INTO command_center_actions (title, description, category, priority, status, linked_entity_type, linked_entity_id, owner_role, due_at) VALUES (@title, @description, @category, @priority, 'Open', @entityType, @entityId, @owner, DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 HOUR))", new()
            {
                ["@title"] = title,
                ["@description"] = PayloadString(payload, "description", "Created from Live Map / Control Tower."),
                ["@category"] = actionType == "create-maintenance-review" ? "Create work order" : "Review late job",
                ["@priority"] = actionType == "create-maintenance-review" ? "High" : "Medium",
                ["@entityType"] = entityType,
                ["@entityId"] = entityId,
                ["@owner"] = actionType == "create-maintenance-review" ? "Maintenance Manager" : "Dispatcher"
            });
        }
        await ExecuteAsync("INSERT INTO audit_logs (name, status, owner, metric, priority, location, actor, updated_at) VALUES (@name, 'Recorded', 'Control Tower', @metric, 'Normal', 'OpsTrax', @actor, UTC_TIMESTAMP())", new()
        {
            ["@name"] = title,
            ["@metric"] = $"{title} by {actor}; linked entity {entityType}:{entityId}",
            ["@actor"] = actor
        });
        return new Dictionary<string, object?> { ["accepted"] = true, ["action"] = actionType, ["entityType"] = entityType, ["entityId"] = entityId, ["message"] = title };
    }

    private static Dictionary<string, object?> ControlEntity(string type, int id, string name, string operatorName, string status, string zone, string eta, int riskScore, int safetyScore, string currentJob, decimal lat, decimal lng, string priority, string evidence, string recommendedAction)
    {
        var riskBand = riskScore >= 81 ? "Critical" : riskScore >= 61 ? "High" : riskScore >= 31 ? "Watch" : "Low";
        var etaRisk = status.Contains("Delayed", StringComparison.OrdinalIgnoreCase) ? "Late" : priority.Contains("High", StringComparison.OrdinalIgnoreCase) ? "At Risk" : status.Contains("At Stop", StringComparison.OrdinalIgnoreCase) ? "Watch" : "On Track";
        return new Dictionary<string, object?>
        {
            ["type"] = type, ["id"] = id, ["name"] = name, ["operator"] = operatorName, ["status"] = status,
            ["zone"] = zone, ["eta"] = eta, ["etaRisk"] = etaRisk, ["riskScore"] = riskScore, ["riskBand"] = riskBand,
            ["safetyScore"] = safetyScore, ["currentJob"] = currentJob, ["route"] = "Northern Virginia / DC Corridor",
            ["lat"] = lat, ["lng"] = lng, ["speed"] = status.Contains("At Stop") || status.Contains("Critical") ? 0 : 48 + (id % 18),
            ["heading"] = (id * 37) % 360, ["fuelIdling"] = id % 4 == 0 ? "Idle threshold watch" : "Normal",
            ["maintenanceStatus"] = priority.Contains("Critical") ? "Critical" : priority.Contains("High") ? "Service Soon" : "Clear",
            ["lastEvent"] = evidence, ["recommendedAction"] = recommendedAction, ["priority"] = priority
        };
    }

    private static int RiskFor(Dictionary<string, object?> row, int index)
    {
        var risk = 18 + (index % 7) * 7;
        if (Has(row, "status", "Delayed")) risk += 35;
        if (Has(row, "status", "Critical")) risk += 55;
        if (Has(row, "status", "Maintenance")) risk += 30;
        if (Has(row, "priority", "High")) risk += 22;
        if (Has(row, "priority", "Warning")) risk += 15;
        if (Has(row, "priority", "Critical")) risk += 38;
        return Math.Min(100, risk);
    }

    private static string EtaFor(Dictionary<string, object?> row, int index) => Has(row, "status", "Delayed") ? "Late by 14m" : Has(row, "status", "At Stop") ? "At stop" : $"{24 + index * 3} min";

    private static IEnumerable<object> ControlTowerAi(List<Dictionary<string, object?>> entities) => new[]
    {
        new { severity = "High", title = "VAN-218 is projected to miss SLA by 14 minutes", evidence = "Delayed job and Alexandria delay zone overlap.", recommendedAction = "Send ETA update and notify customer service.", action = "send-eta-update" },
        new { severity = "Warning", title = "TRK-117 exceeded idle threshold", evidence = "Idle threshold watch and fuel leakage radar signal.", recommendedAction = "Review staging delay with dispatcher.", action = "create-dispatch-review" },
        new { severity = "High", title = "BOX-331 route deviation detected", evidence = "Route path status indicates deviation near DC restricted core.", recommendedAction = "Create dispatch review and resequence route.", action = "create-dispatch-review" },
        new { severity = "Critical", title = "Asset TRL-44 exited approved geofence", evidence = "Geofence event shows restricted-zone proximity.", recommendedAction = "Escalate geofence alert and verify asset movement.", action = "create-dispatch-review" },
        new { severity = "High", title = "Vehicle 112 maintenance risk blocks route recovery", evidence = "Critical vehicle status and maintenance review requirement.", recommendedAction = "Create maintenance review.", action = "create-maintenance-review" },
        new { severity = "Medium", title = "Customer ETA should be refreshed for delayed loads", evidence = "SLA watch jobs with stale ETA update windows.", recommendedAction = "Send ETA update.", action = "send-eta-update" },
        new { severity = "Warning", title = "Dulles cargo dwell is increasing", evidence = "At-stop vehicles and geofence dwell pattern.", recommendedAction = "Review pickup staging sequence.", action = "create-dispatch-review" },
        new { severity = "Medium", title = "Trailer utilization imbalance detected", evidence = "Asset pins show uneven assignment across customer sites.", recommendedAction = "Rebalance trailers before next dispatch wave.", action = "create-dispatch-review" }
    };

    public async Task EnsureMasterDataAsync()
    {
        var vehicleColumns = new Dictionary<string, string>
        {
            ["tenant_id"] = "INT NOT NULL DEFAULT 1", ["vehicle_code"] = "VARCHAR(60)", ["plate_number"] = "VARCHAR(40)", ["vehicle_type"] = "VARCHAR(80)",
            ["make"] = "VARCHAR(80)", ["model"] = "VARCHAR(80)", ["model_year"] = "INT", ["fuel_type"] = "VARCHAR(50)", ["ownership_type"] = "VARCHAR(60)",
            ["region"] = "VARCHAR(120)", ["assigned_driver_id"] = "INT", ["device_id"] = "VARCHAR(80)", ["camera_id"] = "VARCHAR(80)",
            ["engine_hours"] = "DECIMAL(10,1)", ["utilization_percent"] = "INT", ["safety_score"] = "INT", ["risk_score"] = "INT",
            ["maintenance_status"] = "VARCHAR(80)", ["compliance_status"] = "VARCHAR(80)", ["device_status"] = "VARCHAR(80)", ["camera_status"] = "VARCHAR(80)",
            ["notes"] = "TEXT", ["created_at"] = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", ["deleted_at"] = "DATETIME NULL"
        };
        foreach (var column in vehicleColumns) await EnsureColumnAsync("vehicles", column.Key, column.Value);

        var driverColumns = new Dictionary<string, string>
        {
            ["tenant_id"] = "INT NOT NULL DEFAULT 1", ["driver_code"] = "VARCHAR(60)", ["first_name"] = "VARCHAR(80)", ["last_name"] = "VARCHAR(80)",
            ["phone"] = "VARCHAR(40)", ["email"] = "VARCHAR(160)", ["license_number"] = "VARCHAR(80)", ["license_class"] = "VARCHAR(40)",
            ["license_expiry"] = "DATE", ["medical_card_expiry"] = "DATE", ["region"] = "VARCHAR(120)", ["availability"] = "VARCHAR(80)",
            ["assigned_vehicle_id"] = "INT", ["driver_type"] = "VARCHAR(80)", ["utilization_percent"] = "INT", ["hos_status"] = "VARCHAR(80)",
            ["coaching_status"] = "VARCHAR(80)", ["compliance_status"] = "VARCHAR(80)", ["risk_score"] = "INT", ["notes"] = "TEXT",
            ["created_at"] = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP", ["deleted_at"] = "DATETIME NULL"
        };
        foreach (var column in driverColumns) await EnsureColumnAsync("drivers", column.Key, column.Value);

        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS vehicle_documents (
              id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, vehicle_id INT NOT NULL, document_type VARCHAR(80),
              document_number VARCHAR(100), expiry_date DATE, status VARCHAR(40), file_url VARCHAR(240), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_vdoc_tenant (tenant_id), INDEX idx_vdoc_vehicle (vehicle_id), INDEX idx_vdoc_expiry (expiry_date)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS driver_documents (
              id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, driver_id INT NOT NULL, document_type VARCHAR(80),
              document_number VARCHAR(100), expiry_date DATE, status VARCHAR(40), file_url VARCHAR(240), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_ddoc_tenant (tenant_id), INDEX idx_ddoc_driver (driver_id), INDEX idx_ddoc_expiry (expiry_date)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS vehicle_assignments (
              id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, vehicle_id INT NOT NULL, driver_id INT NOT NULL,
              assignment_type VARCHAR(80), start_at DATETIME, end_at DATETIME NULL, status VARCHAR(40), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_va_tenant (tenant_id), INDEX idx_va_vehicle (vehicle_id), INDEX idx_va_driver (driver_id), INDEX idx_va_status (status)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS driver_certifications (
              id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, driver_id INT NOT NULL, certification_type VARCHAR(100),
              issued_at DATE, expires_at DATE, status VARCHAR(40), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_dc_tenant (tenant_id), INDEX idx_dc_driver (driver_id), INDEX idx_dc_expiry (expires_at)
            )
        """);
        await ExecuteAsync("""
            CREATE TABLE IF NOT EXISTS entity_timeline_events (
              id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, entity_type VARCHAR(40), entity_id INT, event_type VARCHAR(80),
              severity VARCHAR(40), title VARCHAR(180), description VARCHAR(600), occurred_at DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_ete_tenant (tenant_id), INDEX idx_ete_entity (entity_type, entity_id), INDEX idx_ete_occurred (occurred_at)
            )
        """);

        await ExecuteAsync("""
            UPDATE vehicles SET
              vehicle_code = COALESCE(vehicle_code, CONCAT('TRK-', 100 + id)),
              plate_number = COALESCE(plate_number, CONCAT('OPX-', 1000 + id)),
              vehicle_type = COALESCE(vehicle_type, ELT((id % 5)+1,'Sleeper Tractor','Box Truck','Cargo Van','Reefer','Day Cab')),
              make = COALESCE(make, ELT((id % 4)+1,'Freightliner','Ford','International','Volvo')),
              model = COALESCE(model, ELT((id % 4)+1,'Cascadia','Transit','MV607','VNL')),
              model_year = COALESCE(model_year, 2018 + (id % 7)),
              fuel_type = COALESCE(fuel_type, ELT((id % 4)+1,'Diesel','Diesel','Gasoline','Electric')),
              ownership_type = COALESCE(ownership_type, IF(id % 4 = 0,'Leased','Owned')),
              region = COALESCE(region, ELT((id % 7)+1,'Manassas','Woodbridge','Alexandria','Dulles','Fairfax','Arlington','Washington DC')),
              assigned_driver_id = COALESCE(assigned_driver_id, IF(id <= 12, id, NULL)),
              device_id = COALESCE(device_id, CONCAT('TEL-', 7000 + id)),
              camera_id = COALESCE(camera_id, CONCAT('CAM-', 5000 + id)),
              engine_hours = COALESCE(engine_hours, 2400 + id * 91.5),
              utilization_percent = COALESCE(utilization_percent, 48 + (id * 7) % 49),
              safety_score = COALESCE(safety_score, 72 + (id * 5) % 27),
              maintenance_status = COALESCE(maintenance_status, IF(status LIKE '%Maintenance%' OR priority IN ('High','Critical'),'Due Soon','Current')),
              compliance_status = COALESCE(compliance_status, IF(id % 6 = 0,'Expiring','Current')),
              device_status = COALESCE(device_status, IF(status='Critical' OR id % 9 = 0,'Offline','Online')),
              camera_status = COALESCE(camera_status, IF(id % 8 = 0,'Review','Online')),
              risk_score = COALESCE(risk_score, LEAST(100, 15 + IF(priority='Critical',55,0) + IF(priority='High',30,0) + IF(status LIKE '%Maintenance%' OR status='Critical',22,0) + IF(id % 6=0,18,0))),
              notes = COALESCE(notes, 'Seeded OpsTrax enterprise vehicle profile.'),
              created_at = COALESCE(created_at, UTC_TIMESTAMP())
            WHERE deleted_at IS NULL
        """);

        await ExecuteAsync("""
            UPDATE drivers SET
              driver_code = COALESCE(driver_code, CONCAT('DRV-', 100 + id)),
              first_name = COALESCE(first_name, SUBSTRING_INDEX(name, ' ', 1)),
              last_name = COALESCE(last_name, IF(LOCATE(' ', name)>0, SUBSTRING_INDEX(name, ' ', -1), 'Driver')),
              phone = COALESCE(phone, CONCAT('+1-703-555-', LPAD(1000 + id, 4, '0'))),
              email = COALESCE(email, CONCAT(LOWER(REPLACE(name, ' ', '.')), '@opstrax.demo')),
              license_number = COALESCE(license_number, license_no),
              license_class = COALESCE(license_class, ELT((id % 3)+1,'A','B','C')),
              license_expiry = COALESCE(license_expiry, DATE_ADD(CURDATE(), INTERVAL (30 + id * 11) DAY)),
              medical_card_expiry = COALESCE(medical_card_expiry, DATE_ADD(CURDATE(), INTERVAL (20 + id * 9) DAY)),
              region = COALESCE(region, ELT((id % 7)+1,'Manassas','Woodbridge','Alexandria','Dulles','Fairfax','Arlington','Washington DC')),
              availability = COALESCE(availability, IF(status IN ('Active','At Stop'),'Available',IF(status LIKE '%Review%' OR status='Review','Needs Review','Assigned'))),
              assigned_vehicle_id = COALESCE(assigned_vehicle_id, IF(id <= 12, id, NULL)),
              driver_type = COALESCE(driver_type, ELT((id % 4)+1,'Company','Company','Contractor','Specialized')),
              utilization_percent = COALESCE(utilization_percent, 45 + (id * 8) % 48),
              hos_status = COALESCE(hos_status, IF(id % 5 = 0,'HOS Risk','Compliant')),
              coaching_status = COALESCE(coaching_status, IF(status LIKE '%Review%' OR priority='Warning','Coaching Needed','Clear')),
              compliance_status = COALESCE(compliance_status, IF(id % 6 = 0,'Expiring','Current')),
              risk_score = COALESCE(risk_score, LEAST(100, 20 + IF(safety_score < 82,28,0) + IF(priority IN ('High','Warning'),22,0) + IF(id % 5=0,18,0) + IF(id % 6=0,18,0))),
              notes = COALESCE(notes, 'Seeded OpsTrax enterprise driver profile.'),
              created_at = COALESCE(created_at, UTC_TIMESTAMP())
            WHERE deleted_at IS NULL
        """);

        var vehicleCount = await QueryAsync("SELECT COUNT(*) AS count FROM vehicles WHERE deleted_at IS NULL");
        if (Convert.ToInt32(vehicleCount[0]["count"]) < 20)
        {
            await ExecuteAsync("""
                INSERT INTO vehicles (name,status,owner,metric,priority,location,vin,odometer,vehicle_code,plate_number,vehicle_type,make,model,model_year,fuel_type,ownership_type,region,device_id,camera_id,engine_hours,utilization_percent,safety_score,risk_score,maintenance_status,compliance_status,device_status,camera_status,notes) VALUES
                ('Vehicle 113','Idle','Fleet Ops','Idle 32 min','Warning','Dulles','VIN113',89210,'VAN-213','OPX-2113','Cargo Van','Ford','Transit',2021,'Gasoline','Owned','Dulles','TEL-7113','CAM-5113',1810,54,91,48,'Current','Current','Online','Online','Airport cargo standby.'),
                ('Vehicle 114','Offline','Fleet Ops','Device offline','High','Alexandria','VIN114',132443,'BOX-214','OPX-2114','Box Truck','International','MV607',2020,'Diesel','Leased','Alexandria','TEL-7114','CAM-5114',3130,39,87,72,'Current','Current','Offline','Online','Needs telematics review.'),
                ('Vehicle 115','Active','Dispatch','On route DC-ARL','Normal','Arlington','VIN115',77140,'TRK-215','OPX-2115','Day Cab','Volvo','VNL',2022,'Diesel','Owned','Arlington','TEL-7115','CAM-5115',1688,83,95,24,'Current','Current','Online','Online','Urban delivery loop.'),
                ('Vehicle 116','Maintenance','Shop','PM overdue','Critical','Fairfax','VIN116',243881,'TRK-216','OPX-2116','Sleeper Tractor','Freightliner','Cascadia',2018,'Diesel','Owned','Fairfax','TEL-7116','CAM-5116',5612,22,79,91,'Critical','Expiring','Online','Review','Pull from dispatch.'),
                ('Vehicle 117','Active','Dispatch','High utilization','Normal','Woodbridge','VIN117',109220,'VAN-217','OPX-2117','Cargo Van','Ford','Transit',2023,'Gasoline','Owned','Woodbridge','TEL-7117','CAM-5117',1142,92,96,18,'Current','Current','Online','Online','Strong local route fit.'),
                ('Vehicle 118','Delayed','Dispatch','SLA watch','High','Washington DC','VIN118',156900,'BOX-218','OPX-2118','Box Truck','International','MV607',2019,'Diesel','Leased','Washington DC','TEL-7118','CAM-5118',3901,68,83,78,'Due Soon','Current','Online','Online','Customer ETA risk.'),
                ('Vehicle 119','Active','Dispatch','Available','Normal','Manassas','VIN119',66540,'TRK-219','OPX-2119','Day Cab','Volvo','VNL',2024,'Diesel','Owned','Manassas','TEL-7119','CAM-5119',920,76,94,21,'Current','Current','Online','Online','Ready for assignment.'),
                ('Vehicle 120','Unassigned','Fleet Ops','No active driver','Warning','Fairfax','VIN120',120442,'RF-220','OPX-2120','Reefer','Freightliner','M2',2021,'Diesel','Owned','Fairfax','TEL-7120','CAM-5120',2250,31,88,52,'Current','Expiring','Online','Online','Needs driver assignment.')
            """);
        }

        var driverCount = await QueryAsync("SELECT COUNT(*) AS count FROM drivers WHERE deleted_at IS NULL");
        if (Convert.ToInt32(driverCount[0]["count"]) < 20)
        {
            await ExecuteAsync("""
                INSERT INTO drivers (name,status,owner,metric,priority,location,license_no,safety_score,driver_code,first_name,last_name,phone,email,license_number,license_class,license_expiry,medical_card_expiry,region,availability,driver_type,utilization_percent,hos_status,coaching_status,compliance_status,risk_score,notes) VALUES
                ('Caleb Stone','Available','Dispatch','Ready','Normal','Manassas','D113',93,'DRV-113','Caleb','Stone','+1-703-555-1113','caleb.stone@opstrax.demo','D113','A',DATE_ADD(CURDATE(),INTERVAL 210 DAY),DATE_ADD(CURDATE(),INTERVAL 160 DAY),'Manassas','Available','Company',72,'Compliant','Clear','Current',18,'Available regional driver.'),
                ('Mina Patel','Assigned','Dispatch','DC loop','Normal','Arlington','D114',95,'DRV-114','Mina','Patel','+1-703-555-1114','mina.patel@opstrax.demo','D114','B',DATE_ADD(CURDATE(),INTERVAL 120 DAY),DATE_ADD(CURDATE(),INTERVAL 90 DAY),'Arlington','Assigned','Company',81,'Compliant','Clear','Current',22,'Urban delivery specialist.'),
                ('Devon Price','Off Duty','Dispatch','Rest cycle','Normal','Dulles','D115',88,'DRV-115','Devon','Price','+1-703-555-1115','devon.price@opstrax.demo','D115','A',DATE_ADD(CURDATE(),INTERVAL 75 DAY),DATE_ADD(CURDATE(),INTERVAL 65 DAY),'Dulles','Off Duty','Company',46,'Compliant','Clear','Current',30,'Returns next shift.'),
                ('Hannah Kim','Suspended','Safety','Incident review','High','Fairfax','D116',68,'DRV-116','Hannah','Kim','+1-703-555-1116','hannah.kim@opstrax.demo','D116','A',DATE_ADD(CURDATE(),INTERVAL 42 DAY),DATE_ADD(CURDATE(),INTERVAL 33 DAY),'Fairfax','Unavailable','Company',12,'HOS Risk','Coaching Needed','Review',88,'Suspended pending review.'),
                ('Andre Miller','Available','Dispatch','Low risk','Healthy','Woodbridge','D117',97,'DRV-117','Andre','Miller','+1-703-555-1117','andre.miller@opstrax.demo','D117','B',DATE_ADD(CURDATE(),INTERVAL 250 DAY),DATE_ADD(CURDATE(),INTERVAL 190 DAY),'Woodbridge','Available','Company',69,'Compliant','Clear','Current',14,'Best match for Woodbridge cargo vans.'),
                ('Sofia Grant','Assigned','Dispatch','Customer SLA','Normal','Alexandria','D118',89,'DRV-118','Sofia','Grant','+1-703-555-1118','sofia.grant@opstrax.demo','D118','B',DATE_ADD(CURDATE(),INTERVAL 18 DAY),DATE_ADD(CURDATE(),INTERVAL 44 DAY),'Alexandria','Assigned','Contractor',78,'Compliant','Clear','Expiring',55,'License renewal due soon.'),
                ('Noah Wright','Available','Dispatch','HOS watch','Warning','Washington DC','D119',82,'DRV-119','Noah','Wright','+1-703-555-1119','noah.wright@opstrax.demo','D119','A',DATE_ADD(CURDATE(),INTERVAL 140 DAY),DATE_ADD(CURDATE(),INTERVAL 16 DAY),'Washington DC','Available','Company',64,'HOS Risk','Clear','Expiring',63,'Medical card and HOS require monitoring.'),
                ('Elena Rivera','Available','Dispatch','Top performer','Healthy','Fairfax','D120',99,'DRV-120','Elena','Rivera','+1-703-555-1120','elena.rivera@opstrax.demo','D120','A',DATE_ADD(CURDATE(),INTERVAL 300 DAY),DATE_ADD(CURDATE(),INTERVAL 220 DAY),'Fairfax','Available','Specialized',86,'Compliant','Clear','Current',10,'Best candidate for critical reassignment.')
            """);
        }

        var docCount = await QueryAsync("SELECT COUNT(*) AS count FROM vehicle_documents");
        if (Convert.ToInt32(docCount[0]["count"]) == 0)
        {
            await ExecuteAsync("""
                INSERT INTO vehicle_documents (vehicle_id,document_type,document_number,expiry_date,status,file_url)
                SELECT id, ELT((id % 3)+1,'Registration','Insurance','DOT Inspection'), CONCAT('VDOC-', id), DATE_ADD(CURDATE(), INTERVAL (20 + id * 8) DAY), IF(id % 6=0,'Expiring','Current'), 'demo://vehicle-document' FROM vehicles WHERE deleted_at IS NULL LIMIT 24
            """);
            await ExecuteAsync("""
                INSERT INTO driver_documents (driver_id,document_type,document_number,expiry_date,status,file_url)
                SELECT id, ELT((id % 3)+1,'License','Medical Card','MVR'), CONCAT('DDOC-', id), DATE_ADD(CURDATE(), INTERVAL (16 + id * 7) DAY), IF(id % 6=0,'Expiring','Current'), 'demo://driver-document' FROM drivers WHERE deleted_at IS NULL LIMIT 24
            """);
            await ExecuteAsync("""
                INSERT INTO vehicle_assignments (vehicle_id,driver_id,assignment_type,start_at,status)
                SELECT v.id, v.assigned_driver_id, 'Primary', DATE_SUB(UTC_TIMESTAMP(), INTERVAL v.id DAY), 'Active' FROM vehicles v WHERE v.assigned_driver_id IS NOT NULL AND v.deleted_at IS NULL
            """);
            await ExecuteAsync("""
                INSERT INTO driver_certifications (driver_id,certification_type,issued_at,expires_at,status)
                SELECT id, ELT((id % 3)+1,'Hazmat','TWIC','Cold Chain'), DATE_SUB(CURDATE(), INTERVAL 180 DAY), DATE_ADD(CURDATE(), INTERVAL (45 + id * 10) DAY), IF(id % 7=0,'Expiring','Current') FROM drivers WHERE deleted_at IS NULL
            """);
            await ExecuteAsync("""
                INSERT INTO entity_timeline_events (entity_type,entity_id,event_type,severity,title,description,occurred_at)
                SELECT 'vehicle', id, 'profile.updated', IF(risk_score > 80,'Critical',IF(risk_score > 60,'High','Healthy')), CONCAT(vehicle_code, ' profile synchronized'), CONCAT('Master data, telematics, documents, and risk score refreshed for ', name), DATE_SUB(UTC_TIMESTAMP(), INTERVAL id HOUR) FROM vehicles WHERE deleted_at IS NULL
            """);
            await ExecuteAsync("""
                INSERT INTO entity_timeline_events (entity_type,entity_id,event_type,severity,title,description,occurred_at)
                SELECT 'driver', id, 'profile.updated', IF(risk_score > 80,'Critical',IF(risk_score > 60,'High','Healthy')), CONCAT(driver_code, ' profile synchronized'), CONCAT('Driver compliance, HOS, safety, and assignment profile refreshed for ', name), DATE_SUB(UTC_TIMESTAMP(), INTERVAL id HOUR) FROM drivers WHERE deleted_at IS NULL
            """);
        }
    }

    public async Task<List<Dictionary<string, object?>>> GetVehiclesAsync(string? search, string? status, string? type, string? region, string? riskLevel, string? maintenanceStatus, string? complianceStatus, string? assignedDriver, int page = 1, int pageSize = 100)
    {
        await EnsureMasterDataAsync();
        var rows = await QueryAsync(VehicleSelectSql() + " WHERE v.deleted_at IS NULL ORDER BY v.updated_at DESC, v.id DESC");
        return FilterRows(rows, search, status, type, region, riskLevel, maintenanceStatus, complianceStatus, assignedDriver, null, page, pageSize);
    }

    public async Task<Dictionary<string, object?>> GetVehicleAsync(int id)
    {
        await EnsureMasterDataAsync();
        var rows = await QueryAsync(VehicleSelectSql() + " WHERE v.id=@id AND v.deleted_at IS NULL", new() { ["@id"] = id });
        var vehicle = rows.FirstOrDefault() ?? new Dictionary<string, object?>();
        if (vehicle.Count == 0) return vehicle;
        vehicle["documents"] = await QueryAsync("SELECT id, document_type AS documentType, document_number AS documentNumber, expiry_date AS expiryDate, status, file_url AS fileUrl FROM vehicle_documents WHERE vehicle_id=@id ORDER BY expiry_date", new() { ["@id"] = id });
        vehicle["timeline"] = await GetEntityTimelineAsync("vehicle", id);
        vehicle["recommendations"] = await GetEntityRecommendationsAsync("vehicle", id);
        vehicle["smartAssignment"] = (await QueryAsync("SELECT id, driver_code AS driverCode, name, region, safety_score AS safetyScore, risk_score AS riskScore FROM drivers WHERE deleted_at IS NULL AND availability='Available' ORDER BY ABS(COALESCE(risk_score,50)) ASC, safety_score DESC LIMIT 1")).FirstOrDefault();
        return vehicle;
    }

    public async Task<Dictionary<string, object?>> GetVehicleSummaryAsync()
    {
        var rows = await GetVehiclesAsync(null, null, null, null, null, null, null, null, 1, 500);
        var total = rows.Count;
        var readiness = total == 0 ? 0 : (int)Math.Round(rows.Count(r => Has(r, "status", "Active") && Has(r, "maintenanceStatus", "Current") && Has(r, "complianceStatus", "Current") && Has(r, "deviceStatus", "Online")) * 100m / total);
        return new()
        {
            ["fleetReadinessScore"] = readiness,
            ["masterDataCompletenessScore"] = total == 0 ? 0 : (int)Math.Round(rows.Count(r => !string.IsNullOrWhiteSpace($"{r.GetValueOrDefault("vin")}") && !string.IsNullOrWhiteSpace($"{r.GetValueOrDefault("deviceId")}") && !string.IsNullOrWhiteSpace($"{r.GetValueOrDefault("assignedDriver")}")) * 100m / total),
            ["reports"] = new[] { "Fleet roster", "Maintenance due", "Compliance expiring", "Offline devices", "High-risk vehicles", "Utilization summary" },
            ["kpis"] = MasterKpis(rows, true)
        };
    }

    public async Task<List<Dictionary<string, object?>>> GetDriversAsync(string? search, string? status, string? region, string? riskLevel, string? availability, string? assignedVehicle, int page = 1, int pageSize = 100)
    {
        await EnsureMasterDataAsync();
        var rows = await QueryAsync(DriverSelectSql() + " WHERE d.deleted_at IS NULL ORDER BY d.updated_at DESC, d.id DESC");
        return FilterRows(rows, search, status, null, region, riskLevel, null, null, null, availability, page, pageSize, assignedVehicle);
    }

    public async Task<Dictionary<string, object?>> GetDriverAsync(int id)
    {
        await EnsureMasterDataAsync();
        var rows = await QueryAsync(DriverSelectSql() + " WHERE d.id=@id AND d.deleted_at IS NULL", new() { ["@id"] = id });
        var driver = rows.FirstOrDefault() ?? new Dictionary<string, object?>();
        if (driver.Count == 0) return driver;
        driver["documents"] = await QueryAsync("SELECT id, document_type AS documentType, document_number AS documentNumber, expiry_date AS expiryDate, status, file_url AS fileUrl FROM driver_documents WHERE driver_id=@id ORDER BY expiry_date", new() { ["@id"] = id });
        driver["certifications"] = await QueryAsync("SELECT id, certification_type AS certificationType, issued_at AS issuedAt, expires_at AS expiresAt, status FROM driver_certifications WHERE driver_id=@id ORDER BY expires_at", new() { ["@id"] = id });
        driver["timeline"] = await GetEntityTimelineAsync("driver", id);
        driver["recommendations"] = await GetEntityRecommendationsAsync("driver", id);
        driver["smartAssignment"] = (await QueryAsync("SELECT id, vehicle_code AS vehicleCode, name, region, utilization_percent AS utilizationPercent, risk_score AS riskScore FROM vehicles WHERE deleted_at IS NULL AND assigned_driver_id IS NULL ORDER BY risk_score ASC, utilization_percent DESC LIMIT 1")).FirstOrDefault();
        return driver;
    }

    public async Task<Dictionary<string, object?>> GetDriverSummaryAsync()
    {
        var rows = await GetDriversAsync(null, null, null, null, null, null, 1, 500);
        var total = rows.Count;
        var readiness = total == 0 ? 0 : (int)Math.Round(rows.Count(r => Has(r, "status", "Active") && Has(r, "availability", "Available") && Has(r, "hosStatus", "Compliant") && Has(r, "complianceStatus", "Current")) * 100m / total);
        return new()
        {
            ["driverReadinessScore"] = readiness,
            ["masterDataCompletenessScore"] = total == 0 ? 0 : (int)Math.Round(rows.Count(r => !string.IsNullOrWhiteSpace($"{r.GetValueOrDefault("email")}") && !string.IsNullOrWhiteSpace($"{r.GetValueOrDefault("licenseExpiry")}") && !string.IsNullOrWhiteSpace($"{r.GetValueOrDefault("assignedVehicle")}")) * 100m / total),
            ["reports"] = new[] { "Driver roster", "Expiring licenses", "Coaching queue", "HOS risk", "High-risk drivers", "Utilization summary" },
            ["kpis"] = MasterKpis(rows, false)
        };
    }

    public async Task<Dictionary<string, object?>> CreateVehicleAsync(Dictionary<string, object?> payload, string actor)
    {
        await EnsureMasterDataAsync();
        var code = PayloadString(payload, "vehicleCode", PayloadString(payload, "vehicleId", $"TRK-{DateTimeOffset.UtcNow.ToUnixTimeSeconds() % 100000}"));
        await ValidateVehicleAsync(payload, null, code);
        await ExecuteAsync("""
            INSERT INTO vehicles (name,status,owner,metric,priority,location,vin,odometer,vehicle_code,plate_number,vehicle_type,make,model,model_year,fuel_type,ownership_type,region,assigned_driver_id,device_id,camera_id,engine_hours,utilization_percent,safety_score,risk_score,maintenance_status,compliance_status,device_status,camera_status,notes,updated_at)
            VALUES (@name,@status,'Fleet Manager','Created from Vehicles module',@priority,@region,@vin,@odometer,@code,@plate,@type,@make,@model,@year,@fuel,@ownership,@region,@driver,@device,@camera,@hours,@utilization,@safety,@risk,@maintenance,@compliance,@deviceStatus,@cameraStatus,@notes,UTC_TIMESTAMP())
        """, VehicleParams(payload, code));
        var created = (await QueryAsync("SELECT id FROM vehicles WHERE vehicle_code=@code ORDER BY id DESC LIMIT 1", new() { ["@code"] = code })).First();
        await AuditAsync("Vehicle created", "Vehicles", $"{code} created by {actor}", actor);
        return await GetVehicleAsync(Convert.ToInt32(created["id"]));
    }

    public async Task<Dictionary<string, object?>> UpdateVehicleAsync(int id, Dictionary<string, object?> payload, string actor)
    {
        await EnsureMasterDataAsync();
        var current = await GetVehicleAsync(id);
        var code = PayloadString(payload, "vehicleCode", $"{current.GetValueOrDefault("vehicleCode") ?? $"TRK-{id}"}");
        await ValidateVehicleAsync(payload, id, code);
        var p = VehicleParams(payload, code); p["@id"] = id;
        await ExecuteAsync("""
            UPDATE vehicles SET name=@name,status=@status,priority=@priority,location=@region,vin=@vin,odometer=@odometer,vehicle_code=@code,plate_number=@plate,vehicle_type=@type,make=@make,model=@model,model_year=@year,fuel_type=@fuel,ownership_type=@ownership,region=@region,assigned_driver_id=@driver,device_id=@device,camera_id=@camera,engine_hours=@hours,utilization_percent=@utilization,safety_score=@safety,risk_score=@risk,maintenance_status=@maintenance,compliance_status=@compliance,device_status=@deviceStatus,camera_status=@cameraStatus,notes=@notes,updated_at=UTC_TIMESTAMP() WHERE id=@id
        """, p);
        await AuditAsync("Vehicle updated", "Vehicles", $"{code} updated by {actor}", actor);
        return await GetVehicleAsync(id);
    }

    public async Task<Dictionary<string, object?>> CreateDriverAsync(Dictionary<string, object?> payload, string actor)
    {
        await EnsureMasterDataAsync();
        var code = PayloadString(payload, "driverCode", PayloadString(payload, "driverId", $"DRV-{DateTimeOffset.UtcNow.ToUnixTimeSeconds() % 100000}"));
        await ValidateDriverAsync(payload, null, code);
        await ExecuteAsync("""
            INSERT INTO drivers (name,status,owner,metric,priority,location,license_no,safety_score,driver_code,first_name,last_name,phone,email,license_number,license_class,license_expiry,medical_card_expiry,region,availability,assigned_vehicle_id,driver_type,utilization_percent,hos_status,coaching_status,compliance_status,risk_score,notes,updated_at)
            VALUES (@name,@status,'Fleet Manager','Created from Drivers module',@priority,@region,@license,@safety,@code,@first,@last,@phone,@email,@license,@class,@licenseExpiry,@medicalExpiry,@region,@availability,@vehicle,@driverType,@utilization,@hos,@coaching,@compliance,@risk,@notes,UTC_TIMESTAMP())
        """, DriverParams(payload, code));
        var created = (await QueryAsync("SELECT id FROM drivers WHERE driver_code=@code ORDER BY id DESC LIMIT 1", new() { ["@code"] = code })).First();
        await AuditAsync("Driver created", "Drivers", $"{code} created by {actor}", actor);
        return await GetDriverAsync(Convert.ToInt32(created["id"]));
    }

    public async Task<Dictionary<string, object?>> UpdateDriverAsync(int id, Dictionary<string, object?> payload, string actor)
    {
        await EnsureMasterDataAsync();
        var current = await GetDriverAsync(id);
        var code = PayloadString(payload, "driverCode", $"{current.GetValueOrDefault("driverCode") ?? $"DRV-{id}"}");
        await ValidateDriverAsync(payload, id, code);
        var p = DriverParams(payload, code); p["@id"] = id;
        await ExecuteAsync("""
            UPDATE drivers SET name=@name,status=@status,priority=@priority,location=@region,license_no=@license,safety_score=@safety,driver_code=@code,first_name=@first,last_name=@last,phone=@phone,email=@email,license_number=@license,license_class=@class,license_expiry=@licenseExpiry,medical_card_expiry=@medicalExpiry,region=@region,availability=@availability,assigned_vehicle_id=@vehicle,driver_type=@driverType,utilization_percent=@utilization,hos_status=@hos,coaching_status=@coaching,compliance_status=@compliance,risk_score=@risk,notes=@notes,updated_at=UTC_TIMESTAMP() WHERE id=@id
        """, p);
        await AuditAsync("Driver updated", "Drivers", $"{code} updated by {actor}", actor);
        return await GetDriverAsync(id);
    }

    public async Task<Dictionary<string, object?>> ArchiveVehicleAsync(int id, string actor)
    {
        await EnsureMasterDataAsync();
        await ExecuteAsync("UPDATE vehicles SET deleted_at=UTC_TIMESTAMP(), status='Archived', updated_at=UTC_TIMESTAMP() WHERE id=@id", new() { ["@id"] = id });
        await AuditAsync("Vehicle archived", "Vehicles", $"Vehicle {id} archived by {actor}", actor);
        return new() { ["id"] = id, ["archived"] = true };
    }

    public async Task<Dictionary<string, object?>> ArchiveDriverAsync(int id, string actor)
    {
        await EnsureMasterDataAsync();
        await ExecuteAsync("UPDATE drivers SET deleted_at=UTC_TIMESTAMP(), status='Archived', updated_at=UTC_TIMESTAMP() WHERE id=@id", new() { ["@id"] = id });
        await AuditAsync("Driver archived", "Drivers", $"Driver {id} archived by {actor}", actor);
        return new() { ["id"] = id, ["archived"] = true };
    }

    public async Task<Dictionary<string, object?>> AssignDriverAsync(int vehicleId, Dictionary<string, object?> payload, string actor)
    {
        await EnsureMasterDataAsync();
        var driverId = PayloadInt(payload, "driverId", 0);
        await ExecuteAsync("UPDATE vehicles SET assigned_driver_id=@driverId, updated_at=UTC_TIMESTAMP() WHERE id=@vehicleId", new() { ["@driverId"] = driverId == 0 ? DBNull.Value : driverId, ["@vehicleId"] = vehicleId });
        if (driverId > 0) await ExecuteAsync("UPDATE drivers SET assigned_vehicle_id=@vehicleId, availability='Assigned', updated_at=UTC_TIMESTAMP() WHERE id=@driverId", new() { ["@driverId"] = driverId, ["@vehicleId"] = vehicleId });
        await ExecuteAsync("INSERT INTO vehicle_assignments (vehicle_id,driver_id,assignment_type,start_at,status) VALUES (@vehicleId,@driverId,'Manual',UTC_TIMESTAMP(),'Active')", new() { ["@vehicleId"] = vehicleId, ["@driverId"] = driverId });
        await AuditAsync("Driver assigned", "Vehicles", $"Driver {driverId} assigned to vehicle {vehicleId} by {actor}", actor);
        return await GetVehicleAsync(vehicleId);
    }

    public async Task<Dictionary<string, object?>> AssignVehicleAsync(int driverId, Dictionary<string, object?> payload, string actor)
    {
        await EnsureMasterDataAsync();
        var vehicleId = PayloadInt(payload, "vehicleId", 0);
        await ExecuteAsync("UPDATE drivers SET assigned_vehicle_id=@vehicleId, availability='Assigned', updated_at=UTC_TIMESTAMP() WHERE id=@driverId", new() { ["@vehicleId"] = vehicleId == 0 ? DBNull.Value : vehicleId, ["@driverId"] = driverId });
        if (vehicleId > 0) await ExecuteAsync("UPDATE vehicles SET assigned_driver_id=@driverId, updated_at=UTC_TIMESTAMP() WHERE id=@vehicleId", new() { ["@driverId"] = driverId, ["@vehicleId"] = vehicleId });
        await AuditAsync("Vehicle assigned", "Drivers", $"Vehicle {vehicleId} assigned to driver {driverId} by {actor}", actor);
        return await GetDriverAsync(driverId);
    }

    public async Task<Dictionary<string, object?>> ChangeVehicleStatusAsync(int id, Dictionary<string, object?> payload, string actor)
    {
        var status = PayloadString(payload, "status", "Active");
        await ExecuteAsync("UPDATE vehicles SET status=@status, updated_at=UTC_TIMESTAMP() WHERE id=@id", new() { ["@status"] = status, ["@id"] = id });
        await AuditAsync("Vehicle status changed", "Vehicles", $"Vehicle {id} status changed to {status} by {actor}", actor);
        return await GetVehicleAsync(id);
    }

    public async Task<Dictionary<string, object?>> ChangeDriverStatusAsync(int id, Dictionary<string, object?> payload, string actor)
    {
        var status = PayloadString(payload, "status", "Active");
        await ExecuteAsync("UPDATE drivers SET status=@status, updated_at=UTC_TIMESTAMP() WHERE id=@id", new() { ["@status"] = status, ["@id"] = id });
        await AuditAsync("Driver status changed", "Drivers", $"Driver {id} status changed to {status} by {actor}", actor);
        return await GetDriverAsync(id);
    }

    public async Task<List<Dictionary<string, object?>>> GetEntityTimelineAsync(string entityType, int id)
    {
        await EnsureMasterDataAsync();
        return await QueryAsync("SELECT id, event_type AS eventType, severity, title, description, occurred_at AS occurredAt FROM entity_timeline_events WHERE entity_type=@type AND entity_id=@id ORDER BY occurred_at DESC LIMIT 25", new() { ["@type"] = entityType, ["@id"] = id });
    }

    public async Task<List<Dictionary<string, object?>>> GetEntityRecommendationsAsync(string entityType, int id)
    {
        await EnsureMasterDataAsync();
        var rows = entityType == "vehicle"
            ? await QueryAsync(VehicleSelectSql() + " WHERE v.id=@id AND v.deleted_at IS NULL", new() { ["@id"] = id })
            : await QueryAsync(DriverSelectSql() + " WHERE d.id=@id AND d.deleted_at IS NULL", new() { ["@id"] = id });
        var detail = rows.FirstOrDefault() ?? new Dictionary<string, object?>();
        var risk = Convert.ToInt32(detail.GetValueOrDefault("riskScore") ?? 0);
        var name = $"{detail.GetValueOrDefault("name") ?? $"{entityType} {id}"}";
        return new()
        {
            new() { ["severity"] = risk > 80 ? "Critical" : risk > 60 ? "High" : risk > 30 ? "Watch" : "Low", ["title"] = $"{name} risk posture", ["insight"] = entityType == "vehicle" ? VehicleAction(detail) : DriverAction(detail), ["evidence"] = $"Risk score {risk}; status {detail.GetValueOrDefault("status")}; compliance {detail.GetValueOrDefault("complianceStatus")}.", ["recommendedAction"] = entityType == "vehicle" ? VehicleAction(detail) : DriverAction(detail) },
            new() { ["severity"] = "AI", ["title"] = "Smart assignment suggestion", ["insight"] = entityType == "vehicle" ? "Match with the lowest-risk available driver in the same region where possible." : "Match with the lowest-risk unassigned vehicle in the same region where possible.", ["evidence"] = "Region, availability, risk, utilization, and safety score are considered.", ["recommendedAction"] = "Review the smart assignment card before dispatch." }
        };
    }

    public async Task<Dictionary<string, object?>> ImportPreviewAsync(string entity, Dictionary<string, object?> payload)
    {
        await EnsureMasterDataAsync();
        return new()
        {
            ["entity"] = entity,
            ["accepted"] = true,
            ["detectedRows"] = PayloadInt(payload, "rows", 24),
            ["validRows"] = PayloadInt(payload, "rows", 24) - 2,
            ["warnings"] = new[] { "2 rows have missing optional document references.", "CSV import is staged as a preview placeholder." },
            ["requiredColumns"] = entity == "vehicles"
                ? new[] { "vehicle_code", "plate_number", "vin", "vehicle_type", "make", "model", "model_year", "fuel_type", "region", "status" }
                : new[] { "driver_code", "first_name", "last_name", "phone", "email", "license_number", "license_class", "license_expiry", "region", "status" }
        };
    }

    public Task<List<Dictionary<string, object?>>> ModuleAsync(string key)
    {
        var table = TableFor(key);
        return QueryAsync($"SELECT id, name, status, owner, metric, priority, location, updated_at AS updatedAt FROM `{table}` ORDER BY updated_at DESC, id DESC LIMIT 100");
    }

    public Task<List<Dictionary<string, object?>>> ModuleByIdAsync(string key, int id)
    {
        var table = TableFor(key);
        return QueryAsync($"SELECT * FROM `{table}` WHERE id = @id", new() { ["@id"] = id });
    }

    public async Task<List<Dictionary<string, object?>>> CreateModuleAsync(string key, Dictionary<string, object?> payload)
    {
        var table = TableFor(key);
        await ExecuteAsync($"INSERT INTO `{table}` (name, status, owner, metric, priority, location, updated_at) VALUES (@name, @status, @owner, @metric, @priority, @location, UTC_TIMESTAMP())", new()
        {
            ["@name"] = payload.GetValueOrDefault("name") ?? $"New {key}",
            ["@status"] = payload.GetValueOrDefault("status") ?? "Active",
            ["@owner"] = payload.GetValueOrDefault("owner") ?? "Ops Control",
            ["@metric"] = payload.GetValueOrDefault("metric") ?? "Created from API",
            ["@priority"] = payload.GetValueOrDefault("priority") ?? "Normal",
            ["@location"] = payload.GetValueOrDefault("location") ?? "Operations HQ"
        });
        return await QueryAsync($"SELECT id, name, status, owner, metric, priority, location, updated_at AS updatedAt FROM `{table}` ORDER BY id DESC LIMIT 1");
    }

    private static string ToCamel(string value)
    {
        var parts = value.Split('_', StringSplitOptions.RemoveEmptyEntries);
        return parts[0] + string.Concat(parts.Skip(1).Select(part => char.ToUpperInvariant(part[0]) + part[1..]));
    }

    private async Task EnsureColumnAsync(string table, string column, string definition)
    {
        var exists = await QueryAsync("""
            SELECT COUNT(*) AS count FROM information_schema.columns
            WHERE table_schema = DATABASE() AND table_name = @table AND column_name = @column
        """, new() { ["@table"] = table, ["@column"] = column });
        if (Convert.ToInt32(exists[0]["count"]) == 0)
        {
            try
            {
                await ExecuteAsync($"ALTER TABLE `{table}` ADD COLUMN `{column}` {definition}");
            }
            catch (MySqlException exception) when (exception.Message.Contains("Duplicate column", StringComparison.OrdinalIgnoreCase))
            {
                // Another concurrent request may have completed the local demo schema upgrade first.
            }
        }
    }

    private static string VehicleSelectSql() => """
        SELECT v.id, v.vehicle_code AS vehicleCode, v.name, v.plate_number AS plateNumber, v.vin, v.vehicle_type AS vehicleType,
               v.make, v.model, v.model_year AS modelYear, v.fuel_type AS fuelType, v.ownership_type AS ownershipType,
               v.region, v.status, v.location, v.assigned_driver_id AS assignedDriverId, d.name AS assignedDriver,
               v.device_id AS deviceId, v.camera_id AS cameraId, v.odometer, v.engine_hours AS engineHours,
               v.utilization_percent AS utilizationPercent, v.safety_score AS safetyScore, v.risk_score AS riskScore,
               CASE WHEN v.risk_score >= 81 THEN 'Critical' WHEN v.risk_score >= 61 THEN 'High' WHEN v.risk_score >= 31 THEN 'Watch' ELSE 'Low' END AS riskLevel,
               v.maintenance_status AS maintenanceStatus, v.compliance_status AS complianceStatus, v.device_status AS deviceStatus,
               v.camera_status AS cameraStatus, v.notes, v.priority, v.metric, v.updated_at AS updatedAt,
               CASE
                 WHEN v.maintenance_status IN ('Critical','Due Soon') THEN 'Schedule preventive maintenance'
                 WHEN v.device_status='Offline' THEN 'Review device offline'
                 WHEN v.compliance_status='Expiring' THEN 'Renew registration'
                 WHEN v.assigned_driver_id IS NULL THEN 'Assign vehicle'
                 WHEN v.utilization_percent < 40 THEN 'Reassign to active route'
                 ELSE 'Monitor fleet readiness'
               END AS recommendedAction
        FROM vehicles v LEFT JOIN drivers d ON d.id = v.assigned_driver_id
    """;

    private static string DriverSelectSql() => """
        SELECT d.id, d.driver_code AS driverCode, d.name, d.first_name AS firstName, d.last_name AS lastName, d.phone, d.email,
               d.license_number AS licenseNumber, d.license_class AS licenseClass, d.license_expiry AS licenseExpiry,
               d.medical_card_expiry AS medicalCardExpiry, d.region, d.status, d.availability, d.assigned_vehicle_id AS assignedVehicleId,
               v.vehicle_code AS assignedVehicle, d.driver_type AS driverType, d.safety_score AS safetyScore,
               d.utilization_percent AS utilizationPercent, d.hos_status AS hosStatus, d.coaching_status AS coachingStatus,
               d.compliance_status AS complianceStatus, d.risk_score AS riskScore,
               CASE WHEN d.risk_score >= 81 THEN 'Critical' WHEN d.risk_score >= 61 THEN 'High' WHEN d.risk_score >= 31 THEN 'Watch' ELSE 'Low' END AS riskLevel,
               d.notes, d.priority, d.metric, d.updated_at AS updatedAt,
               CASE
                 WHEN d.coaching_status='Coaching Needed' THEN 'Coach driver'
                 WHEN d.hos_status='HOS Risk' THEN 'Review HOS status'
                 WHEN d.compliance_status='Expiring' THEN 'Renew license'
                 WHEN d.assigned_vehicle_id IS NULL THEN 'Assign vehicle'
                 ELSE 'Monitor driver readiness'
               END AS recommendedAction
        FROM drivers d LEFT JOIN vehicles v ON v.id = d.assigned_vehicle_id
    """;

    private static List<Dictionary<string, object?>> FilterRows(List<Dictionary<string, object?>> rows, string? search, string? status, string? type, string? region, string? riskLevel, string? maintenanceStatus, string? complianceStatus, string? assignedDriver, string? availability, int page, int pageSize, string? assignedVehicle = null)
    {
        IEnumerable<Dictionary<string, object?>> query = rows;
        bool Match(Dictionary<string, object?> row, string key, string? value) => string.IsNullOrWhiteSpace(value) || value == "All" || $"{row.GetValueOrDefault(key)}".Contains(value, StringComparison.OrdinalIgnoreCase);
        if (!string.IsNullOrWhiteSpace(search)) query = query.Where(r => string.Join(" ", r.Values).Contains(search, StringComparison.OrdinalIgnoreCase));
        query = query.Where(r => Match(r, "status", status) && Match(r, "vehicleType", type) && Match(r, "region", region) && Match(r, "riskLevel", riskLevel) && Match(r, "maintenanceStatus", maintenanceStatus) && Match(r, "complianceStatus", complianceStatus) && Match(r, "assignedDriver", assignedDriver) && Match(r, "availability", availability) && Match(r, "assignedVehicle", assignedVehicle));
        return query.Skip(Math.Max(0, page - 1) * Math.Clamp(pageSize, 1, 500)).Take(Math.Clamp(pageSize, 1, 500)).ToList();
    }

    private static object[] MasterKpis(List<Dictionary<string, object?>> rows, bool vehicles)
    {
        var total = rows.Count;
        var avgUtil = total == 0 ? 0 : (int)Math.Round(rows.Average(r => Convert.ToDecimal(r.GetValueOrDefault("utilizationPercent") ?? 0)));
        var avgSafety = total == 0 ? 0 : (int)Math.Round(rows.Average(r => Convert.ToDecimal(r.GetValueOrDefault("safetyScore") ?? 0)));
        return vehicles
            ? new object[]
            {
                Kpi("total","Total Vehicles",total,"Roster","Live","Total non-archived vehicles.","fleet-roster","Truck"),
                Kpi("active","Active Vehicles",rows.Count(r => Has(r,"status","Active")),"Ready","Healthy","Vehicles active now.","filter-active","Activity"),
                Kpi("onRoute","On Route",rows.Count(r => Has(r,"status","Active") || Has(r,"status","Delayed")),"Dispatch","Live","Vehicles moving or assigned.","filter-route","Route"),
                Kpi("idle","Idle",rows.Count(r => Has(r,"status","Idle")),"Cost","Watch","Idle vehicles.","filter-idle","Gauge"),
                Kpi("offline","Offline Devices",rows.Count(r => Has(r,"deviceStatus","Offline")),"Telematics","Critical","Offline devices.","filter-offline","WifiOff"),
                Kpi("maintenance","Maintenance Due",rows.Count(r => !Has(r,"maintenanceStatus","Current")),"Shop","Watch","Maintenance due soon.","filter-maintenance","Wrench"),
                Kpi("criticalMaintenance","Critical Maintenance",rows.Count(r => Has(r,"maintenanceStatus","Critical")),"Shop","Critical","Critical maintenance.","filter-critical","AlertTriangle"),
                Kpi("compliance","Compliance Expiring",rows.Count(r => Has(r,"complianceStatus","Expiring")),"Audit","Watch","Expiring compliance.","filter-compliance","FileWarning"),
                Kpi("unassigned","Unassigned Vehicles",rows.Count(r => string.IsNullOrWhiteSpace($"{r.GetValueOrDefault("assignedDriver")}")),"Assignment","Watch","Unassigned units.","filter-unassigned","UserPlus"),
                Kpi("utilization","Average Utilization",$"{avgUtil}%","Efficiency","Optimized","Average utilization.","utilization","BarChart3"),
                Kpi("safety","Average Safety Score",avgSafety,"Safety","Healthy","Average vehicle safety score.","safety","ShieldCheck"),
                Kpi("idleCost","Estimated Idle Cost",$"${rows.Count(r => Has(r,"status","Idle")) * 185:N0}","Today","Watch","Estimated idle cost today.","idle-cost","DollarSign")
            }
            : new object[]
            {
                Kpi("total","Total Drivers",total,"Roster","Live","Total non-archived drivers.","driver-roster","Users"),
                Kpi("active","Active Drivers",rows.Count(r => Has(r,"status","Active")),"Ready","Healthy","Active drivers.","filter-active","Activity"),
                Kpi("available","Available",rows.Count(r => Has(r,"availability","Available")),"Dispatch","Healthy","Available drivers.","filter-available","UserCheck"),
                Kpi("assigned","Assigned",rows.Count(r => Has(r,"availability","Assigned")),"Dispatch","Live","Assigned drivers.","filter-assigned","Route"),
                Kpi("offDuty","Off Duty",rows.Count(r => Has(r,"availability","Off Duty")),"Roster","Normal","Off duty drivers.","filter-off-duty","Clock"),
                Kpi("suspended","Suspended",rows.Count(r => Has(r,"status","Suspended")),"Safety","Critical","Suspended drivers.","filter-suspended","Ban"),
                Kpi("license","License Expiring",rows.Count(r => Has(r,"complianceStatus","Expiring")),"Audit","Watch","Expiring files.","filter-license","FileWarning"),
                Kpi("compliance","Compliance Risk",rows.Count(r => !Has(r,"complianceStatus","Current")),"Audit","Watch","Compliance risk.","filter-compliance","ShieldAlert"),
                Kpi("coaching","Coaching Needed",rows.Count(r => Has(r,"coachingStatus","Coaching Needed")),"Safety","High","Coaching queue.","filter-coaching","MessageSquareWarning"),
                Kpi("safety","Average Safety Score",avgSafety,"Safety","Healthy","Average driver score.","safety","ShieldCheck"),
                Kpi("hos","HOS Risk",rows.Count(r => Has(r,"hosStatus","HOS Risk")),"ELD","Watch","HOS risk drivers.","filter-hos","Clock3"),
                Kpi("utilization","Average Utilization",$"{avgUtil}%","Efficiency","Optimized","Average utilization.","utilization","BarChart3")
            };
    }

    private Dictionary<string, object?> VehicleParams(Dictionary<string, object?> payload, string code) => new()
    {
        ["@name"] = PayloadString(payload, "name", code), ["@status"] = PayloadString(payload, "status", "Active"), ["@priority"] = PayloadString(payload, "priority", "Normal"),
        ["@region"] = PayloadString(payload, "region", PayloadString(payload, "zone", "Manassas")), ["@vin"] = PayloadString(payload, "vin", ""), ["@odometer"] = PayloadInt(payload, "odometer", 0),
        ["@code"] = code, ["@plate"] = PayloadString(payload, "plateNumber", PayloadString(payload, "plate", "")), ["@type"] = PayloadString(payload, "vehicleType", PayloadString(payload, "type", "Sleeper Tractor")),
        ["@make"] = PayloadString(payload, "make", "Freightliner"), ["@model"] = PayloadString(payload, "model", "Cascadia"), ["@year"] = PayloadInt(payload, "modelYear", PayloadInt(payload, "year", DateTime.UtcNow.Year)),
        ["@fuel"] = PayloadString(payload, "fuelType", "Diesel"), ["@ownership"] = PayloadString(payload, "ownershipType", "Owned"), ["@driver"] = PayloadInt(payload, "assignedDriverId", 0) == 0 ? DBNull.Value : PayloadInt(payload, "assignedDriverId", 0),
        ["@device"] = PayloadString(payload, "deviceId", ""), ["@camera"] = PayloadString(payload, "cameraId", ""), ["@hours"] = PayloadDecimal(payload, "engineHours", 0), ["@utilization"] = PayloadInt(payload, "utilizationPercent", 55),
        ["@safety"] = PayloadInt(payload, "safetyScore", 90), ["@risk"] = PayloadInt(payload, "riskScore", 25), ["@maintenance"] = PayloadString(payload, "maintenanceStatus", "Current"),
        ["@compliance"] = PayloadString(payload, "complianceStatus", "Current"), ["@deviceStatus"] = PayloadString(payload, "deviceStatus", "Online"), ["@cameraStatus"] = PayloadString(payload, "cameraStatus", "Online"), ["@notes"] = PayloadString(payload, "notes", "")
    };

    private Dictionary<string, object?> DriverParams(Dictionary<string, object?> payload, string code)
    {
        var first = PayloadString(payload, "firstName", "New");
        var last = PayloadString(payload, "lastName", "Driver");
        return new()
        {
            ["@name"] = PayloadString(payload, "name", $"{first} {last}"), ["@status"] = PayloadString(payload, "status", "Active"), ["@priority"] = PayloadString(payload, "priority", "Normal"),
            ["@region"] = PayloadString(payload, "region", "Manassas"), ["@license"] = PayloadString(payload, "licenseNumber", PayloadString(payload, "licenseNo", code)),
            ["@safety"] = PayloadInt(payload, "safetyScore", 90), ["@code"] = code, ["@first"] = first, ["@last"] = last, ["@phone"] = PayloadString(payload, "phone", ""),
            ["@email"] = PayloadString(payload, "email", $"{code.ToLowerInvariant()}@opstrax.demo"), ["@class"] = PayloadString(payload, "licenseClass", "A"),
            ["@licenseExpiry"] = PayloadDate(payload, "licenseExpiry", DateTime.UtcNow.AddMonths(12)), ["@medicalExpiry"] = PayloadDate(payload, "medicalCardExpiry", DateTime.UtcNow.AddMonths(9)),
            ["@availability"] = PayloadString(payload, "availability", "Available"), ["@vehicle"] = PayloadInt(payload, "assignedVehicleId", 0) == 0 ? DBNull.Value : PayloadInt(payload, "assignedVehicleId", 0),
            ["@driverType"] = PayloadString(payload, "driverType", "Company"), ["@utilization"] = PayloadInt(payload, "utilizationPercent", 60), ["@hos"] = PayloadString(payload, "hosStatus", "Compliant"),
            ["@coaching"] = PayloadString(payload, "coachingStatus", "Clear"), ["@compliance"] = PayloadString(payload, "complianceStatus", "Current"), ["@risk"] = PayloadInt(payload, "riskScore", 20), ["@notes"] = PayloadString(payload, "notes", "")
        };
    }

    private async Task ValidateVehicleAsync(Dictionary<string, object?> payload, int? id, string code)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new InvalidOperationException("Vehicle ID is required.");
        var year = PayloadInt(payload, "modelYear", PayloadInt(payload, "year", DateTime.UtcNow.Year));
        if (year < 1980 || year > DateTime.UtcNow.Year + 1) throw new InvalidOperationException("Vehicle year is invalid.");
        if (PayloadInt(payload, "odometer", 0) < 0) throw new InvalidOperationException("Odometer must be non-negative.");
        await ValidateUniqueAsync("vehicles", "vin", PayloadString(payload, "vin", ""), id, "VIN must be unique.");
        await ValidateUniqueAsync("vehicles", "plate_number", PayloadString(payload, "plateNumber", PayloadString(payload, "plate", "")), id, "Plate must be unique.");
    }

    private async Task ValidateDriverAsync(Dictionary<string, object?> payload, int? id, string code)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new InvalidOperationException("Driver ID is required.");
        if (PayloadDate(payload, "licenseExpiry", DateTime.UtcNow.AddDays(1)) < DateTime.UtcNow.Date) throw new InvalidOperationException("License expiry must be valid.");
        await ValidateUniqueAsync("drivers", "email", PayloadString(payload, "email", ""), id, "Driver email must be unique.");
        await ValidateUniqueAsync("drivers", "license_number", PayloadString(payload, "licenseNumber", ""), id, "License number must be unique.");
    }

    private async Task ValidateUniqueAsync(string table, string column, string value, int? id, string message)
    {
        if (string.IsNullOrWhiteSpace(value)) return;
        var rows = await QueryAsync($"SELECT id FROM `{table}` WHERE `{column}`=@value AND deleted_at IS NULL AND (@id IS NULL OR id<>@id) LIMIT 1", new() { ["@value"] = value, ["@id"] = id });
        if (rows.Count > 0) throw new InvalidOperationException(message);
    }

    private async Task AuditAsync(string name, string owner, string metric, string actor) =>
        await ExecuteAsync("INSERT INTO audit_logs (name,status,owner,metric,priority,location,actor,updated_at) VALUES (@name,'Recorded',@owner,@metric,'Normal','OpsTrax',@actor,UTC_TIMESTAMP())", new() { ["@name"] = name, ["@owner"] = owner, ["@metric"] = metric, ["@actor"] = actor });

    private static string VehicleAction(Dictionary<string, object?> row)
    {
        if (Has(row, "maintenanceStatus", "Critical") || Has(row, "maintenanceStatus", "Due")) return "Schedule preventive maintenance";
        if (Has(row, "deviceStatus", "Offline")) return "Review device offline";
        if (Has(row, "complianceStatus", "Expiring")) return "Renew registration";
        if (string.IsNullOrWhiteSpace($"{row.GetValueOrDefault("assignedDriver")}")) return "Assign vehicle";
        return "Monitor fleet readiness";
    }

    private static string DriverAction(Dictionary<string, object?> row)
    {
        if (Has(row, "coachingStatus", "Coaching Needed")) return "Coach driver";
        if (Has(row, "hosStatus", "HOS Risk")) return "Review HOS status";
        if (Has(row, "complianceStatus", "Expiring")) return "Renew license";
        if (string.IsNullOrWhiteSpace($"{row.GetValueOrDefault("assignedVehicle")}")) return "Assign vehicle";
        return "Monitor driver readiness";
    }

    private static bool Has(Dictionary<string, object?> row, string key, string value) => $"{row.GetValueOrDefault(key)}".Contains(value, StringComparison.OrdinalIgnoreCase);

    private static string PayloadString(Dictionary<string, object?> payload, string key, string fallback)
    {
        if (!payload.TryGetValue(key, out var value) || value is null) return fallback;
        if (value is JsonElement json)
        {
            return json.ValueKind == JsonValueKind.String ? json.GetString() ?? fallback : json.ToString();
        }
        return $"{value}";
    }

    private static int PayloadInt(Dictionary<string, object?> payload, string key, int fallback)
    {
        if (!payload.TryGetValue(key, out var value) || value is null) return fallback;
        if (value is JsonElement json)
        {
            if (json.ValueKind == JsonValueKind.Number && json.TryGetInt32(out var number)) return number;
            if (json.ValueKind == JsonValueKind.String && int.TryParse(json.GetString(), out number)) return number;
            return fallback;
        }
        return int.TryParse($"{value}", out var parsed) ? parsed : fallback;
    }

    private static decimal PayloadDecimal(Dictionary<string, object?> payload, string key, decimal fallback)
    {
        if (!payload.TryGetValue(key, out var value) || value is null) return fallback;
        if (value is JsonElement json)
        {
            if (json.ValueKind == JsonValueKind.Number && json.TryGetDecimal(out var number)) return number;
            if (json.ValueKind == JsonValueKind.String && decimal.TryParse(json.GetString(), out number)) return number;
            return fallback;
        }
        return decimal.TryParse($"{value}", out var parsed) ? parsed : fallback;
    }

    private static DateTime PayloadDate(Dictionary<string, object?> payload, string key, DateTime fallback)
    {
        if (!payload.TryGetValue(key, out var value) || value is null) return fallback.Date;
        if (value is JsonElement json)
        {
            if (json.ValueKind == JsonValueKind.String && DateTime.TryParse(json.GetString(), out var date)) return date.Date;
            return fallback.Date;
        }
        return DateTime.TryParse($"{value}", out var parsed) ? parsed.Date : fallback.Date;
    }

    private static object Kpi(string key, string label, object value, string trend, string status, string explanation, string actionIntent, string icon) => new
    {
        key,
        label,
        value,
        trend,
        status,
        explanation,
        actionIntent,
        icon
    };
}
