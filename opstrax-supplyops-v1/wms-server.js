import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { server } from './server.js';
import { runStartupChecks } from './src/startup.js';
import { connectRedis } from './src/redis-client.js';
import { authEnabled, requireCsrf } from './src/auth.js';
import { auditDenied, resolveContext } from './src/services.js';
import { ensureWmsSchema } from './src/wms-schema.js';
import {
  allocateWmsInventory,
  checkInWmsHandlingUnit,
  createWmsCapacityUnit,
  getWmsControlTower,
  getWmsCustomerEconomics,
  getWmsExceptions,
  listWmsBillableEvents,
  listWmsCapacity,
  listWmsHandlingUnits,
  recordWmsQuality,
  releaseWmsHandlingUnit,
  reserveWmsCapacity,
  saveWmsCustomerContract,
  syncWmsCapacityFromBins
} from './src/wms.js';

const baseHandlers = server.listeners('request');
const baseHandler = baseHandlers[0];
if (!baseHandler) throw new Error('Base OpsTrax request handler not found');
server.removeAllListeners('request');

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), camera=(self), microphone=()'
};

function sendJson(res, status, payload) {
  if (res.writableEnded) return;
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS });
  res.end(JSON.stringify(payload));
}

async function readJson(req, maxBytes = Number(process.env.WMS_MAX_JSON_BYTES || 1024 * 1024)) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > maxBytes) {
      const error = new Error(`Request body exceeds ${maxBytes} bytes`);
      error.status = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};
  try { return JSON.parse(raw); } catch { const error = new Error('Request body must be valid JSON'); error.status = 400; throw error; }
}

function wmsAction(pathname, method) {
  if (pathname === '/api/wms/control-tower') return 'VIEW_WMS_CONTROL_TOWER';
  if (pathname === '/api/wms/capacity') return 'VIEW_WMS_CAPACITY';
  if (pathname === '/api/wms/capacity/sync-bins') return 'SYNC_WMS_CAPACITY';
  if (pathname === '/api/wms/capacity/units') return method === 'POST' ? 'CREATE_WMS_CAPACITY_UNIT' : 'VIEW_WMS_CAPACITY';
  if (pathname === '/api/wms/capacity/reservations') return 'RESERVE_WMS_CAPACITY';
  if (pathname === '/api/wms/handling-units') return 'VIEW_WMS_HANDLING_UNITS';
  if (pathname === '/api/wms/handling-units/check-in') return 'CHECK_IN_WMS_HANDLING_UNIT';
  if (/^\/api\/wms\/handling-units\/[^/]+\/quality$/.test(pathname)) return 'DECIDE_WMS_QUALITY';
  if (/^\/api\/wms\/handling-units\/[^/]+\/release$/.test(pathname)) return 'RELEASE_WMS_HANDLING_UNIT';
  if (pathname === '/api/wms/allocations') return 'ALLOCATE_WMS_INVENTORY';
  if (pathname === '/api/wms/contracts') return 'MANAGE_WMS_CONTRACTS';
  if (pathname === '/api/wms/billing/events') return 'VIEW_WMS_BILLING';
  if (pathname === '/api/wms/economics/customers') return 'VIEW_WMS_ECONOMICS';
  if (pathname === '/api/wms/exceptions') return 'VIEW_WMS_EXCEPTIONS';
  return `${method}_WMS`;
}

function applyWmsCors(req, res) {
  const origin = String(req.headers.origin || '').replace(/\/$/, '');
  const allowed = String(process.env.ALLOWED_ORIGINS || process.env.APP_BASE_URL || '')
    .split(',').map((v) => v.trim().replace(/\/$/, '')).filter(Boolean);
  if (origin && allowed.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }
}

async function handleWms(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (!url.pathname.startsWith('/api/wms/')) return false;
  applyWmsCors(req, res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Request-Id, X-CSRF-Token, Authorization',
      'Access-Control-Max-Age': '86400',
      ...SECURITY_HEADERS
    });
    res.end();
    return true;
  }

  const requestId = String(req.headers['x-request-id'] || randomUUID());
  res.setHeader('X-Request-Id', requestId);
  let context = null;
  try {
    context = resolveContext(req.headers, Object.fromEntries(url.searchParams.entries()));
    context.requestId = requestId;
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(req.method) && authEnabled()) requireCsrf(req.headers, context.session);
    const query = Object.fromEntries(url.searchParams.entries());
    const body = ['POST', 'PATCH', 'PUT'].includes(req.method) ? await readJson(req) : {};
    let result;
    if (req.method === 'GET' && url.pathname === '/api/wms/control-tower') result = getWmsControlTower(context, query);
    else if (req.method === 'GET' && url.pathname === '/api/wms/capacity') result = listWmsCapacity(context, query);
    else if (req.method === 'POST' && url.pathname === '/api/wms/capacity/sync-bins') result = syncWmsCapacityFromBins(context, body);
    else if (req.method === 'POST' && url.pathname === '/api/wms/capacity/units') result = createWmsCapacityUnit(context, body);
    else if (req.method === 'POST' && url.pathname === '/api/wms/capacity/reservations') result = reserveWmsCapacity(context, body);
    else if (req.method === 'GET' && url.pathname === '/api/wms/handling-units') result = listWmsHandlingUnits(context, query);
    else if (req.method === 'POST' && url.pathname === '/api/wms/handling-units/check-in') result = checkInWmsHandlingUnit(context, body);
    else if (req.method === 'POST' && /^\/api\/wms\/handling-units\/[^/]+\/quality$/.test(url.pathname)) result = recordWmsQuality(context, url.pathname.split('/')[4], body);
    else if (req.method === 'POST' && /^\/api\/wms\/handling-units\/[^/]+\/release$/.test(url.pathname)) result = releaseWmsHandlingUnit(context, url.pathname.split('/')[4], body);
    else if (req.method === 'POST' && url.pathname === '/api/wms/allocations') result = allocateWmsInventory(context, body);
    else if (req.method === 'POST' && url.pathname === '/api/wms/contracts') result = saveWmsCustomerContract(context, body);
    else if (req.method === 'GET' && url.pathname === '/api/wms/billing/events') result = listWmsBillableEvents(context, query);
    else if (req.method === 'GET' && url.pathname === '/api/wms/economics/customers') result = getWmsCustomerEconomics(context);
    else if (req.method === 'GET' && url.pathname === '/api/wms/exceptions') result = getWmsExceptions(context, query);
    else return sendJson(res, 404, { error: 'WMS route not found', requestId }) || true;
    sendJson(res, 200, { ...result, requestId });
  } catch (error) {
    const status = Number(error.status || 500);
    if (context && (status === 403 || status === 409)) {
      try { auditDenied(context, { route: url.pathname, method: req.method, action: wmsAction(url.pathname, req.method), reason: error.message, requestId }); } catch { /* audit must not mask primary denial */ }
    }
    if (status >= 500) process.stderr.write(`[wms] ERROR ${req.method} ${url.pathname} ${requestId}: ${error.stack || error.message}\n`);
    sendJson(res, status, { error: status === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message, requestId });
  }
  return true;
}

ensureWmsSchema();
server.on('request', async (req, res) => {
  if (await handleWms(req, res)) return;
  baseHandler(req, res);
});

export function startWms(port = Number(process.env.PORT || 9899)) {
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  runStartupChecks();
  connectRedis().then((redis) => { if (redis) console.log('[redis] connected'); });
  startWms().then(() => console.log(`OpsTrax Warehouse Profitability OS running at http://localhost:${server.address().port}`));
}
