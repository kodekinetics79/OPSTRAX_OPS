import express from 'express';
import cors from 'cors';

const app = express();
const port = Number(process.env.PORT || 8090);
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:10000';

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

const eventTypes = [
  ['location.updated', 'Healthy', 'Vehicle location updated', 'TRK-104 reported a fresh GPS position near Fairfax.', 'vehicle', 104, 104, 4, 1004, 38.8462, -77.3064],
  ['geofence.entered', 'Healthy', 'Vehicle entered approved geofence', 'VAN-218 entered Woodbridge Customer Site.', 'vehicle', 218, 218, 8, 1006, 38.6582, -77.2497],
  ['geofence.exited', 'Warning', 'Asset exited geofence', 'TRL-44 exited the Manassas approved zone.', 'asset', 44, 117, 7, 1012, 38.7509, -77.4753],
  ['job.delayed', 'High', 'Job delayed', 'JOB-1006 SLA risk increased by 14 minutes in Alexandria.', 'job', 1006, 218, 8, 1006, 38.8048, -77.0469],
  ['vehicle.idle', 'Warning', 'Idle threshold exceeded', 'TRK-117 has been idling beyond threshold at Dulles Air Cargo.', 'vehicle', 117, 117, 5, 1014, 38.9531, -77.4565],
  ['safety.event', 'Critical', 'Safety event detected', 'BOX-331 generated a hard-braking safety event near Arlington.', 'vehicle', 331, 331, 11, 1018, 38.8799, -77.1068],
  ['maintenance.warning', 'High', 'Maintenance warning', 'Vehicle 112 diagnostic fault requires maintenance review.', 'vehicle', 112, 112, 2, 1009, 38.8462, -77.3064],
  ['eta.sent', 'Healthy', 'Customer ETA sent', 'Updated customer ETA sent for delayed corridor load.', 'job', 1018, 105, 3, 1018, 38.9072, -77.0369]
];

function liveEvent() {
  const [type, severity, title, description, entityType, entityId, vehicleId, driverId, jobId, lat, lng] = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const occurredAt = new Date().toISOString();
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type,
    severity,
    title,
    description,
    message: description,
    entityType,
    entityId,
    vehicleId,
    driverId,
    jobId,
    lat,
    lng,
    occurredAt,
    timestamp: occurredAt
  };
}

app.get('/health', (_req, res) => {
  res.json({ service: 'OpsTrax Node Events', status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/demo/live-feed', (_req, res) => {
  res.json({ success: true, data: Array.from({ length: 8 }, liveEvent), message: 'Demo live feed', errors: [] });
});

app.get('/events/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': corsOrigin
  });
  const send = () => res.write(`data: ${JSON.stringify(liveEvent())}\n\n`);
  send();
  const timer = setInterval(send, 4500);
  req.on('close', () => clearInterval(timer));
});

app.post('/telemetry/location', (req, res) => {
  res.json({ success: true, data: { accepted: true, received: req.body, event: liveEvent() }, message: 'Location telemetry accepted', errors: [] });
});

app.post('/telemetry/safety-event', (req, res) => {
  res.json({ success: true, data: { accepted: true, severity: req.body.severity || 'Warning', event: liveEvent() }, message: 'Safety event accepted', errors: [] });
});

app.post('/ai/generate-brief', (req, res) => {
  res.json({
    success: true,
    data: {
      brief: `OpsTrax AI brief: dispatch has active delay risk, maintenance should prioritize Vehicle 112, and safety coaching should focus on recent high-severity camera events.`,
      prompt: req.body.prompt || 'daily operations brief'
    },
    message: 'AI brief generated from seeded operational context',
    errors: []
  });
});

app.listen(port, () => {
  console.log(`OpsTrax node events listening on ${port}`);
});
