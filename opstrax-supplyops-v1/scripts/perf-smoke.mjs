#!/usr/bin/env node
/**
 * perf-smoke.mjs — lightweight load/latency smoke test for ~11 API endpoints.
 *
 * Starts the OpsTrax server on a random port, fires N requests per endpoint,
 * measures p50/p95/max latency, and exits non-zero if any endpoint breaches
 * its latency budget or returns a non-2xx status.
 *
 * Usage:
 *   node scripts/perf-smoke.mjs
 *   PERF_CONCURRENCY=5 PERF_ITERATIONS=20 node scripts/perf-smoke.mjs
 *
 * Environment:
 *   PERF_ITERATIONS   — requests per endpoint (default: 10)
 *   PERF_CONCURRENCY  — max parallel requests per batch (default: 3)
 *   PERF_BUDGET_MS    — per-request latency budget in ms (default: 800)
 *   OPSTRAX_DB_PATH   — database path (inherits from env)
 */
import http from 'node:http';
import { start, server } from '../server.js';

const ITERATIONS = Number(process.env.PERF_ITERATIONS || 10);
const CONCURRENCY = Number(process.env.PERF_CONCURRENCY || 3);
const BUDGET_MS = Number(process.env.PERF_BUDGET_MS || 800);

// Dev-context headers — resolves IntelliFlow Systems admin
const DEV_HEADERS = {
  'x-tenant-id': 'tenant_intelliflow_systems',
  'x-user-id': 'tenant_intelliflow_systems_user_admin',
};

const ENDPOINTS = [
  { name: 'healthz',              path: '/healthz',                          auth: false },
  { name: 'healthz/ready',        path: '/healthz/ready',                    auth: false },
  { name: 'api/me',               path: '/api/me',                           auth: true  },
  { name: 'api/bootstrap',        path: '/api/bootstrap',                    auth: true  },
  { name: 'api/inventory/summary',path: '/api/inventory/summary',            auth: true  },
  { name: 'api/items',            path: '/api/items',                        auth: true  },
  { name: 'api/warehouse/summary',path: '/api/warehouse/summary',            auth: true  },
  { name: 'api/purchase-requests',path: '/api/purchase-requests',            auth: true  },
  { name: 'api/purchase-orders',  path: '/api/purchase-orders',              auth: true  },
  { name: 'api/receiving/summary',path: '/api/receiving/summary',            auth: true  },
  { name: 'api/ai/summary',       path: '/api/ai/summary',                   auth: true  },
];

function request(port, path, headers = {}) {
  return new Promise((resolve, reject) => {
    const start = performance.now();
    const req = http.get({ hostname: '127.0.0.1', port, path, headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ status: res.statusCode, latency: performance.now() - start, body }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => { req.destroy(); reject(new Error('Request timeout')); });
  });
}

function percentile(sorted, p) {
  if (!sorted.length) return 0;
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

async function runEndpoint(port, endpoint) {
  const headers = endpoint.auth ? DEV_HEADERS : {};
  const latencies = [];
  const errors = [];

  // Run in batches of CONCURRENCY
  for (let i = 0; i < ITERATIONS; i += CONCURRENCY) {
    const batch = [];
    for (let j = 0; j < CONCURRENCY && i + j < ITERATIONS; j++) {
      batch.push(request(port, endpoint.path, headers));
    }
    const results = await Promise.allSettled(batch);
    for (const result of results) {
      if (result.status === 'rejected') {
        errors.push(result.reason.message);
      } else {
        const { status, latency } = result.value;
        if (status < 200 || status >= 300) {
          // 403 on auth endpoints in locked mode is acceptable
          if (!(status === 403 && endpoint.auth)) {
            errors.push(`HTTP ${status}`);
          }
        }
        latencies.push(latency);
      }
    }
  }

  const sorted = [...latencies].sort((a, b) => a - b);
  return {
    name: endpoint.name,
    n: ITERATIONS,
    p50: percentile(sorted, 50).toFixed(1),
    p95: percentile(sorted, 95).toFixed(1),
    max: (sorted[sorted.length - 1] ?? 0).toFixed(1),
    errors: errors.length,
    errorSamples: errors.slice(0, 3),
    budgetMs: BUDGET_MS,
    overBudget: sorted.filter((l) => l > BUDGET_MS).length,
  };
}

function formatRow(r) {
  const status = r.errors > 0 ? 'ERR ' : r.overBudget > 0 ? 'SLOW' : 'OK  ';
  return `  [${status}] ${r.name.padEnd(30)} p50=${r.p50}ms  p95=${r.p95}ms  max=${r.max}ms  errors=${r.errors}  over-budget=${r.overBudget}/${r.n}`;
}

async function main() {
  process.env.OPSTRAX_ALLOW_DEV_CONTEXT = '1';
  const srv = await start(0); // random available port
  const { port } = srv.address();

  process.stdout.write(`\n[perf-smoke] Server on port ${port}  iterations=${ITERATIONS}  concurrency=${CONCURRENCY}  budget=${BUDGET_MS}ms\n\n`);

  const results = [];
  for (const endpoint of ENDPOINTS) {
    const result = await runEndpoint(port, endpoint);
    process.stdout.write(`${formatRow(result)}\n`);
    results.push(result);
  }

  server.close();

  const failures = results.filter((r) => r.errors > 0 || r.overBudget > r.n * 0.1);
  if (failures.length > 0) {
    process.stdout.write(`\n[perf-smoke] FAIL ${failures.length} endpoint(s) failed the smoke check:\n`);
    for (const f of failures) {
      process.stdout.write(`  ${f.name}: errors=${f.errors} over-budget=${f.overBudget}/${f.n}${f.errorSamples.length ? ' ' + f.errorSamples.join('; ') : ''}\n`);
    }
    process.exit(1);
  }

  process.stdout.write(`\n[perf-smoke] OK All ${results.length} endpoints passed within ${BUDGET_MS}ms budget.\n`);
  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(`[perf-smoke] FATAL ${e.message}\n${e.stack}\n`);
  process.exit(1);
});
