USE opstrax;

INSERT INTO geofences (name, type, center_latitude, center_longitude, radius_meters, polygon_json, status) VALUES
('Manassas Terminal', 'approved_zone', 38.7509, -77.4753, 2800, '{"points":[[-77.49,38.74],[-77.46,38.75],[-77.47,38.77]]}', 'Healthy'),
('Woodbridge Customer Site', 'customer_site', 38.6582, -77.2497, 1800, '{"points":[[-77.26,38.65],[-77.24,38.66],[-77.25,38.67]]}', 'Healthy'),
('Alexandria Delay Zone', 'high_delay_zone', 38.8048, -77.0469, 2200, '{"points":[[-77.06,38.79],[-77.03,38.80],[-77.04,38.82]]}', 'Warning'),
('Dulles Air Cargo', 'customer_site', 38.9531, -77.4565, 2600, '{"points":[[-77.47,38.94],[-77.44,38.95],[-77.45,38.97]]}', 'Healthy'),
('Fairfax Maintenance Yard', 'maintenance_yard', 38.8462, -77.3064, 1600, '{"points":[[-77.32,38.84],[-77.30,38.85],[-77.31,38.86]]}', 'Watch'),
('DC Restricted Core', 'restricted_zone', 38.9072, -77.0369, 3000, '{"points":[[-77.06,38.89],[-77.02,38.90],[-77.03,38.93]]}', 'Critical');

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
(1,'asset',301,'geofence.exited',DATE_SUB(UTC_TIMESTAMP(), INTERVAL 78 MINUTE));

INSERT INTO route_paths (route_id, path_json, status) VALUES
(1, '{"points":[[-77.47,38.75],[-77.31,38.84],[-77.04,38.90]]}', 'Active'),
(2, '{"points":[[-77.45,38.95],[-77.30,38.85],[-77.25,38.66]]}', 'Active'),
(3, '{"points":[[-77.04,38.90],[-77.05,38.80],[-77.25,38.66]]}', 'SLA Watch'),
(4, '{"points":[[-77.31,38.84],[-77.46,38.75],[-77.45,38.95]]}', 'Active'),
(5, '{"points":[[-77.25,38.66],[-77.05,38.80],[-77.04,38.90]]}', 'Delayed'),
(6, '{"points":[[-77.46,38.75],[-77.25,38.66],[-77.31,38.84]]}', 'Active'),
(7, '{"points":[[-77.45,38.95],[-77.04,38.90],[-77.25,38.66]]}', 'Deviation'),
(8, '{"points":[[-77.31,38.84],[-77.45,38.95],[-77.04,38.90]]}', 'Maintenance Risk');

INSERT INTO eta_updates (job_id, customer_id, channel, message, status, sent_at) VALUES
(6, 4, 'portal', 'Revised ETA sent for JOB-1006 due to Alexandria delay zone.', 'Sent', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 12 MINUTE)),
(12, 1, 'email', 'SLA watch update sent to Northstar Retail.', 'Sent', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 44 MINUTE)),
(18, 4, 'sms', 'Dock dwell delay notification sent.', 'Sent', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 88 MINUTE));
