#!/usr/bin/env node
/**
 * browser-smoke.mjs — Playwright-backed browser verification for OpsTrax SupplyOps.
 *
 * Starts the server, opens a real Chromium browser, enters the local workspace
 * through the visible UI gate, and asserts the expected shell structure for a
 * full-tenant and restricted-tenant session.
 *
 * Exit 0: all checks pass.
 * Exit 1: one or more checks fail.
 *
 * Usage:
 *   node scripts/browser-smoke.mjs
 *   OPSTRAX_ALLOW_DEV_CONTEXT=1 node scripts/browser-smoke.mjs
 *
 * Screenshots are written to dist/screenshots/ for each checked page.
 */
import { chromium } from 'playwright';
import { start, server } from '../server.js';
import { mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = dirname(__dirname);
const screenshotDir = join(rootDir, 'dist', 'screenshots');
mkdirSync(screenshotDir, { recursive: true });

process.env.OPSTRAX_ALLOW_DEV_CONTEXT = '1';

const FULL_TENANT = 'tenant_intelliflow_systems';
const FULL_ADMIN = 'tenant_intelliflow_systems_user_admin';
const RESTR_TENANT = 'tenant_evostel';
const RESTR_ADMIN = 'tenant_evostel_user_admin';

const CHROME_EXE = await (async () => {
  const { existsSync } = await import('node:fs');
  const candidates = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
    '/usr/bin/chromium'
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
})();

const results = [];

function pass(name) {
  results.push({ name, ok: true });
  process.stdout.write(`  ✔ ${name}\n`);
}

function fail(name, reason) {
  results.push({ name, ok: false, reason });
  process.stderr.write(`  ✖ ${name}: ${reason}\n`);
}

async function check(name, fn) {
  try {
    await fn();
    pass(name);
  } catch (e) {
    fail(name, e.message);
  }
}

async function createPage(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  return page;
}

async function waitForApp(page, timeout = 12000) {
  await page.waitForSelector('#app', { timeout });
  await page.waitForFunction(() => !document.querySelector('.skeleton-line'), { timeout });
}

async function clickDemoWorkspace(page) {
  await page.locator('button[data-action="demo-login"]').click();
  await page.waitForFunction(() => !document.body.textContent.includes('Sign in with SSO'), { timeout: 12000 });
  await waitForApp(page);
}

function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function checkAuthGate(page, port) {
  process.stdout.write('\n[browser] Local demo auth gate\n');

  await page.goto(`http://localhost:${port}/`);
  await waitForApp(page);

  await check('SSO gate appears', async () => {
    const text = await page.textContent('#app');
    if (!text.includes('Sign in with SSO')) throw new Error('SSO gate missing');
  });

  await check('Enter Demo Workspace appears in local demo mode', async () => {
    const button = page.locator('button[data-action="demo-login"]');
    if ((await button.count()) === 0) throw new Error('Demo entry button missing');
    const helper = await page.textContent('#app');
    if (!helper.includes('Local demo mode only')) throw new Error('Local demo helper text missing');
    if (!helper.includes('Enter Demo Workspace')) throw new Error('Demo button label missing');
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: join(screenshotDir, '00-auth-gate.png'), fullPage: false });
}

async function checkSecurityHeaders(port) {
  process.stdout.write('\n[browser] Security headers via fetch\n');
  const resp = await fetch(`http://localhost:${port}/healthz`);

  await check('X-Content-Type-Options: nosniff', () => {
    const val = resp.headers.get('x-content-type-options');
    if (val !== 'nosniff') throw new Error(`Got: ${val}`);
  });

  await check('X-Frame-Options: DENY', () => {
    const val = resp.headers.get('x-frame-options');
    if (val !== 'DENY') throw new Error(`Got: ${val}`);
  });

  await check('Content-Security-Policy is set', () => {
    const val = resp.headers.get('content-security-policy');
    if (!val) throw new Error('CSP header missing');
  });
}

async function checkFullTenantShell(page, port) {
  process.stdout.write('\n[browser] Full-tenant shell after demo login\n');

  await page.goto(`http://localhost:${port}/`);
  await waitForApp(page);

  const commandCenterNav = page.locator('button[data-page="Command Center"]').first();
  if ((await commandCenterNav.count()) > 0) {
    await commandCenterNav.click();
    await waitForApp(page);
  }

  await check('Full shell layout renders', async () => {
    const leftNav = await page.locator('.sidebar').count();
    const topBar = await page.locator('.topbar').count();
    const canvas = await page.locator('.main-canvas, main, #app').count();
    if (!leftNav || !topBar || !canvas) throw new Error('Shell regions not found');
  });

  await check('Command Center appears', async () => {
    const text = await page.textContent('#app');
    if (!text.includes('Command Center')) throw new Error('Command Center missing');
  });

  await check('Command Center reads like a commercial workspace', async () => {
    const text = await page.textContent('#app');
    const required = ['Operational Summary', 'Executive Briefing', 'Controlled Facility Advantage', 'Workspace Status', 'Active Modules', 'Finance Readiness', 'Workspace: IntelliFlow Systems'];
    for (const needle of required) {
      if (!text.includes(needle)) throw new Error(`Missing "${needle}"`);
    }
    if (/demo|prototype|scaffold|browser-smoke|RFP demo/i.test(text)) {
      throw new Error('Stale demo/prototype language still visible in the shell');
    }
  });

  await check('Main navigation is visible', async () => {
    const navItems = await page.locator('.nav-item').count();
    if (navItems < 10) throw new Error(`Expected a full nav, found ${navItems} items`);
  });

  await check('Topbar shows IntelliFlow admin session', async () => {
    const text = await page.textContent('#app');
    if (!text.includes('IntelliFlow Systems') || !text.includes('Avery Grant')) {
      throw new Error('Topbar does not show IntelliFlow admin session');
    }
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: join(screenshotDir, '01-full-shell.png'), fullPage: false });
}

async function checkModulePages(page, port) {
  process.stdout.write('\n[browser] Module pages\n');
  const modules = [
    { navText: 'Inventory Control', expectText: ['Inventory', 'Stock', 'SKU'] },
    { navText: 'Request Center', expectText: ['Request', 'REQ-'] },
    { navText: 'Warehouse Workflows', expectText: ['Warehouse', 'Task'] },
    { navText: 'Procurement Center', expectText: ['Procurement Center', 'Supplier governance', 'Budget control'] },
    { navText: 'Supplier Governance', expectText: ['Supplier Governance', 'Governance enabled', 'Lifecycle'] },
    { navText: 'Contract Repository', expectText: ['Contract Repository', 'Renewal', 'Leakage'] },
    { navText: 'Budget Control', expectText: ['Budget Control', 'Allocated', 'Reserved'] },
    { navText: 'Invoice Intelligence', expectText: ['Invoice Intelligence', 'Extraction', 'Matching', 'Export readiness'] },
    { navText: 'Receiving Center', expectText: ['Receiving', 'Session'] },
    { navText: 'Evidence Vault', expectText: ['Evidence Vault', 'Linked records', 'Audit'] },
    { navText: 'Audit Trail', expectText: ['Audit Log Explorer', 'Denied', 'Entity types'] },
    { navText: 'Finance Export Hub', expectText: ['Finance Export Hub', 'Export', 'Batch', 'Readiness'] },
    { navText: 'Integration Center', expectText: ['Integration', 'Connection'] },
    { navText: 'DeviceOps Center', expectText: ['Device', 'Trusted'] },
    { navText: 'Offline Sync', expectText: ['Offline', 'Sync'] },
    { navText: 'AI Operations', expectText: ['AI Operations', 'Provider not configured', 'Advisory'] },
    { navText: 'Reports', expectText: ['Reports Center', 'Report Catalog', 'Recent Runs'] },
    { navText: 'Inventory Optimization', expectText: ['Inventory Optimization', 'Cycle Count', 'Variance', 'Replenishment'] },
    { navText: 'Asset & Custody', expectText: ['Asset', 'Custody', 'Disposal', 'Maintenance'] }
  ];

  for (const mod of modules) {
    const nav = page.locator('.nav-item').filter({ hasText: new RegExp(mod.navText, 'i') }).first();
    await check(`${mod.navText} nav item exists`, async () => {
      if ((await nav.count()) === 0) throw new Error('Nav item missing');
    });
    if ((await nav.count()) === 0) continue;

    await nav.click();
    await page.waitForTimeout(450);

    await check(`${mod.navText} renders expected content`, async () => {
      const text = await page.textContent('#app');
      const matched = mod.expectText.some((needle) => text.toLowerCase().includes(needle.toLowerCase()));
      if (!matched) throw new Error(`Expected one of [${mod.expectText.join(', ')}]`);
      if (/demo|prototype|scaffold|sample only|browser-smoke|RFP demo/i.test(text)) {
        throw new Error('Stale demo/prototype language still visible on module page');
      }
    });

    await page.waitForTimeout(250);
    await page.screenshot({ path: join(screenshotDir, `${slug(mod.navText)}.png`), fullPage: false });
  }

  // Navigate to Reports Center before report-run checks (module loop may have ended on a different page)
  const reportsNavItem = page.locator('.nav-item[data-page="Reports"]').first();
  if ((await reportsNavItem.count()) > 0) {
    await reportsNavItem.click();
    await page.waitForTimeout(600);
  }

  let reportRunId = null;
  await check('Reports center can run and open a governed report', async () => {
    const runButton = page.locator('button[data-action="run-report"]').first();
    if ((await runButton.count()) === 0) throw new Error('Report run button missing');
    await runButton.evaluate((el) => el.click());
    await page.waitForFunction(() => document.querySelectorAll('tr[data-report-run]').length > 0, null, { timeout: 5000 });
    const openButton = page.locator('tr[data-report-run] button[data-drawer-focus="report-run"]').first();
    if ((await openButton.count()) === 0) throw new Error('Report run open button missing');
    reportRunId = await openButton.evaluate((el) => el.closest('tr[data-report-run]')?.getAttribute('data-report-run') || null);
    await openButton.evaluate((el) => el.click());
    await page.waitForSelector('.drawer-shell', { timeout: 5000 });
    await page.locator('button[data-drawer-tab="Actions"]').first().evaluate((el) => el.click());
    const drawerText = await page.textContent('.drawer-shell');
    for (const needle of ['Download CSV', 'Download PDF']) {
      if (!drawerText.includes(needle)) throw new Error(`Missing report drawer section: ${needle}`);
    }
    await page.locator('button[data-drawer-tab="Audit trail"]').first().evaluate((el) => el.click());
    const auditText = await page.textContent('.drawer-shell');
    if (!auditText.includes('Audit trail')) throw new Error('Missing report audit trail section');
  });

  await check('Reports CSV export route returns text/csv with correct content', async () => {
    if (!reportRunId) throw new Error('No report run ID captured from previous step');
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`http://127.0.0.1:${port}/api/reports/runs/${reportRunId}/export.csv`, {
      headers: { Cookie: cookieHeader }
    });
    if (res.status !== 200) throw new Error(`CSV export returned ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/csv')) throw new Error(`CSV export content-type wrong: ${contentType}`);
    const text = await res.text();
    if (!text || text.length === 0) throw new Error('CSV export body is empty');
  });

  await check('Reports PDF export route returns application/pdf binary', async () => {
    if (!reportRunId) throw new Error('No report run ID captured from previous step');
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`http://127.0.0.1:${port}/api/reports/runs/${reportRunId}/export.pdf`, {
      headers: { Cookie: cookieHeader }
    });
    if (res.status !== 200) throw new Error(`PDF export returned ${res.status}`);
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/pdf')) throw new Error(`PDF export content-type wrong: ${contentType}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length === 0) throw new Error('PDF export body is empty');
    if (buf.slice(0, 4).toString('ascii') !== '%PDF') throw new Error('PDF export does not start with %PDF magic bytes');
  });

  await page.waitForTimeout(250);
  await page.screenshot({ path: join(screenshotDir, 'reports-center-drawer.png'), fullPage: false });

  await check('Inventory Optimization API returns summary with KPIs', async () => {
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`http://127.0.0.1:${port}/api/inventory-optimization/summary`, {
      headers: { Cookie: cookieHeader }
    });
    if (res.status !== 200) throw new Error(`/api/inventory-optimization/summary returned ${res.status}`);
    const payload = await res.json();
    if (!payload.summary) throw new Error('Summary KPIs missing from response');
    if (typeof payload.summary.total_items !== 'number') throw new Error('total_items KPI missing');
  });

  await check('Inventory Optimization cycle count plans list returns array', async () => {
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`http://127.0.0.1:${port}/api/inventory-optimization/cycle-count-plans`, {
      headers: { Cookie: cookieHeader }
    });
    if (res.status !== 200) throw new Error(`/api/inventory-optimization/cycle-count-plans returned ${res.status}`);
    const payload = await res.json();
    if (!Array.isArray(payload.plans)) throw new Error('plans array missing from response');
  });

  await page.screenshot({ path: join(screenshotDir, 'inventory-optimization-center.png'), fullPage: false });

  await check('Asset Custody API returns summary with KPIs', async () => {
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`http://127.0.0.1:${port}/api/assets/summary`, {
      headers: { Cookie: cookieHeader }
    });
    if (res.status !== 200) throw new Error(`/api/assets/summary returned ${res.status}`);
    const payload = await res.json();
    if (!payload.summary) throw new Error('Asset custody summary KPIs missing from response');
    if (typeof payload.summary.total_assets !== 'number') throw new Error('total_assets KPI missing');
  });

  await check('Asset Custody API returns asset list', async () => {
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`http://127.0.0.1:${port}/api/assets`, {
      headers: { Cookie: cookieHeader }
    });
    if (res.status !== 200) throw new Error(`/api/assets returned ${res.status}`);
    const payload = await res.json();
    if (!Array.isArray(payload.assets)) throw new Error('assets array missing from response');
    if (payload.assets.length === 0) throw new Error('No seeded assets found');
  });

  await check('OCR status API returns provider status without secrets', async () => {
    const cookies = await page.context().cookies();
    const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join('; ');
    const res = await fetch(`http://127.0.0.1:${port}/api/ocr/status`, {
      headers: { Cookie: cookieHeader }
    });
    if (res.status !== 200) throw new Error(`/api/ocr/status returned ${res.status}`);
    const payload = await res.json();
    if (!payload.ocrStatus) throw new Error('ocrStatus missing from response');
    const statusJson = JSON.stringify(payload);
    if (statusJson.includes('secret') || statusJson.includes('accessKey') || statusJson.includes('secretKey')) throw new Error('OCR status response must not expose secrets');
    if (!['LOCAL', 'NOT_CONFIGURED', 'CONFIGURED', 'ERROR'].includes(payload.ocrStatus.status)) throw new Error(`Invalid OCR status: ${payload.ocrStatus.status}`);
  });

  await check('P2P page shows OCR provider status panel', async () => {
    const nav = page.locator('.nav-item').filter({ hasText: /Invoice Intelligence/i }).first();
    if ((await nav.count()) === 0) throw new Error('Invoice Intelligence nav missing');
    await nav.click();
    await page.waitForTimeout(600);
    const text = await page.textContent('#main-content, #app, body');
    if (!text.includes('OCR Provider Status')) throw new Error('OCR Provider Status panel missing from P2P page');
    if (!text.includes('OCR proposes values only')) throw new Error('OCR proposes values only copy missing');
    if (!text.includes('Review required')) throw new Error('Review required copy missing');
  });

  await check('Procure-to-Pay invoice drawer exposes extraction and matching panels', async () => {
    const nav = page.locator('.nav-item').filter({ hasText: /Invoice Intelligence/i }).first();
    if ((await nav.count()) === 0) throw new Error('Invoice Intelligence nav missing for P2P proof');
    await nav.click();
    await page.waitForTimeout(450);
    const invoiceButton = page.locator('button[data-drawer-focus="vendor-invoice"]').first();
    if ((await invoiceButton.count()) === 0) throw new Error('No invoice row available to open the drawer');
    await invoiceButton.click();
    await page.waitForTimeout(450);
    const text = await page.textContent('.drawer-shell');
    const required = ['Extraction panel', 'Matching panel', 'Exception queue', 'Export delivery', 'Approval trail'];
    for (const needle of required) {
      if (!text.includes(needle)) throw new Error(`Missing invoice drawer section: ${needle}`);
    }
  });

  await page.screenshot({ path: join(screenshotDir, 'invoice-intelligence-drawer.png'), fullPage: false });
}

async function checkMeAfterDemoLogin(page, port) {
  process.stdout.write('\n[browser] /api/me after demo login\n');

  const payload = await page.evaluate(async () => {
    const response = await fetch('/api/me', { credentials: 'include' });
    return response.json();
  });

  await check('/api/me returns IntelliFlow admin identity', async () => {
    if (payload.tenant?.id !== FULL_TENANT) throw new Error(`Unexpected tenant ${payload.tenant?.id}`);
    if (payload.user?.id !== FULL_ADMIN) throw new Error(`Unexpected user ${payload.user?.id}`);
    if (!Array.isArray(payload.capabilities) || payload.capabilities.length === 0) throw new Error('Capabilities missing');
    if (!Array.isArray(payload.features) || payload.features.length === 0) throw new Error('Features missing');
    if (!payload.scopes?.facilityScopes?.length) throw new Error('Facility scopes missing');
    if (!payload.scopes?.departmentScopes?.length) throw new Error('Department scopes missing');
  });
}

async function checkRestrictedTenant(browser, port) {
  process.stdout.write('\n[browser] Restricted tenant (Evostel LLC)\n');
  const page = await createPage(browser);

  await page.goto(`http://localhost:${port}/`);
  await waitForApp(page);

  await page.evaluate(async () => {
    await fetch('/api/dev/demo-login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tenantId: 'tenant_evostel', userId: 'tenant_evostel_user_admin' })
    });
  });

  await page.goto(`http://localhost:${port}/`);
  await waitForApp(page);

  await check('Evostel shows restricted navigation', async () => {
    const navItems = await page.locator('.nav-item').count();
    if (navItems >= 15) throw new Error(`Expected a reduced nav, found ${navItems} items`);
  });

  await check('Evostel does not show Procurement Center', async () => {
    const text = await page.textContent('#app');
    if (text.includes('Procurement Center')) throw new Error('Procurement Center should be hidden');
  });

  await check('Evostel still sees the permitted Reports module', async () => {
    const text = await page.textContent('#app');
    if (!text.includes('Reports')) throw new Error('Reports should remain visible');
  });

  await check('Evostel does not show Inventory Optimization (feature-gated)', async () => {
    const text = await page.textContent('#app');
    if (text.includes('Inventory Optimization')) throw new Error('Inventory Optimization should be hidden for restricted tenant');
  });

  await check('Evostel does not show Asset & Custody Center (feature-gated)', async () => {
    const text = await page.textContent('#app');
    if (text.includes('Asset & Custody')) throw new Error('Asset & Custody Center should be hidden for restricted tenant');
  });

  await check('Evostel shows Audit Trail', async () => {
    const text = await page.textContent('#app');
    if (!text.includes('Audit Trail')) throw new Error('Audit Trail should be visible');
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: join(screenshotDir, '99-evostel-restricted.png'), fullPage: false });
  await page.context().close();
}

async function checkPlatformControlPlane(browser, port) {
  process.stdout.write('\n[browser] Platform control plane\n');
  const page = await createPage(browser);

  await page.goto(`http://localhost:${port}/platform`);
  await waitForApp(page);

  await check('Platform auth gate appears', async () => {
    const text = await page.textContent('#app');
    if (!text.includes('Platform Admin Sign-In')) throw new Error('Platform auth gate missing');
    if (!text.includes('Enter Platform Workspace')) throw new Error('Platform demo entry missing');
    if (!text.includes('Local demo mode only')) throw new Error('Platform helper text missing');
  });

  await page.locator('button[data-action="platform-demo-login"]').click();
  await page.waitForSelector('text=Platform Overview', { timeout: 12000 });
  await page.waitForSelector('text=Tenant Directory', { timeout: 12000 });

  await check('Platform dashboard loads after demo login', async () => {
    const text = await page.textContent('#app');
    const required = ['Platform Dashboard', 'Tenant Directory', 'Subscription & Plans', 'Support Sessions', 'Security & Audit', 'System Health'];
    for (const needle of required) {
      if (!text.includes(needle)) throw new Error(`Missing ${needle}`);
    }
    if (!text.includes('IntelliFlow Systems') || !text.includes('Evostel LLC') || !text.includes('Northstar Logistics')) {
      throw new Error('Platform tenant directory missing seeded tenants');
    }
    if (!text.includes('Government Control Plane') || !text.includes('Enterprise Logistics Plan') || !text.includes('Starter Restricted Ops Plan')) {
      throw new Error('Platform plan tiers missing from tenant directory');
    }
  });

  await check('Platform /api/platform/me reflects platform owner workspace', async () => {
    const payload = await page.evaluate(async () => (await fetch('/api/platform/me', { credentials: 'include' })).json());
    if (payload.user?.role_key !== 'PLATFORM_OWNER') throw new Error(`Unexpected platform role ${payload.user?.role_key}`);
    if (!Array.isArray(payload.capabilities) || payload.capabilities.length === 0) throw new Error('Platform capabilities missing');
    if (payload.tenant) throw new Error('Platform session should not expose a tenant');
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: join(screenshotDir, '02-platform-dashboard.png'), fullPage: false });

  const supportNav = page.locator('.nav-item').filter({ hasText: /Support Sessions/i }).first();
  if ((await supportNav.count()) > 0) {
    await supportNav.click();
    await page.waitForTimeout(450);
    await check('Platform support sessions page exposes status lifecycle', async () => {
      const text = await page.textContent('#app');
      const required = ['Support Sessions', 'REQUESTED', 'ACTIVE', 'EXPIRED', 'REVOKED', 'DENIED'];
      for (const needle of required) {
        if (!text.includes(needle)) throw new Error(`Missing support lifecycle value: ${needle}`);
      }
      if (!text.includes('Northstar Logistics')) throw new Error('Northstar support session missing');
      if ((await page.locator('button[data-action="platform-end-support-session"]').count()) === 0) {
        throw new Error('Support end action missing');
      }
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(screenshotDir, '02-platform-support-sessions.png'), fullPage: false });
  }

  const tenantDirectoryNav = page.locator('.nav-item').filter({ hasText: /Tenant Directory/i }).first();
  if ((await tenantDirectoryNav.count()) > 0) {
    await tenantDirectoryNav.click();
    await page.waitForURL(/\/platform\/tenants$/, { timeout: 12000 });
  }

  const tenantRow = page.locator('tr[data-platform-tenant="tenant_intelliflow_systems"]').first();
  await tenantRow.waitFor({ state: 'visible', timeout: 12000 });
  await tenantRow.click();
  await page.waitForURL(/\/platform\/tenants\/tenant_intelliflow_systems/, { timeout: 12000 });
  await page.waitForTimeout(1200);
  await page.waitForFunction(() => {
    const text = document.querySelector('.drawer-shell')?.textContent || '';
    return text.includes('Government Control Plane');
  }, { timeout: 12000 });
  const planTab = page.locator('.drawer-tab[data-drawer-tab="Plan"]').first();
  if ((await planTab.count()) > 0) {
    await planTab.click();
    await page.waitForFunction(() => {
      const text = document.querySelector('.drawer-shell')?.textContent || '';
      return text.includes('Plan code') && text.includes('Government Control Plane');
    }, { timeout: 12000 });
  }
  await check('Platform tenant detail drawer opens', async () => {
    const text = await page.textContent('.drawer-shell');
    if (!text.includes('IntelliFlow Systems') || !text.includes('Government Control Plane') || !text.includes('Plan code')) {
      throw new Error('Platform tenant detail not visible');
    }
    if (!text.includes('Support sessions') && !text.includes('Support posture') && !text.includes('Plan code')) {
      throw new Error('Platform detail drawer missing content');
    }
  });
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(screenshotDir, '03-platform-tenant-detail.png'), fullPage: false });

  await page.context().close();
}

async function checkNoConsoleErrors(browser, port) {
  process.stdout.write('\n[browser] Console error check\n');
  const page = await createPage(browser);
  const errors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(`http://localhost:${port}/`);
  await waitForApp(page);
  await page.locator('button[data-action="demo-login"]').click();
  await waitForApp(page);
  await page.waitForTimeout(600);

  await check('No JavaScript console errors during demo entry', () => {
    const serious = errors.filter((e) =>
      !e.includes('favicon') &&
      !e.includes('net::ERR_') &&
      !e.includes('401 (Unauthorized)') &&
      !e.includes('Failed to load resource: the server responded with a status of 401')
    );
    if (serious.length > 0) throw new Error(`Console errors: ${serious.slice(0, 3).join('; ')}`);
  });

  await page.context().close();
}

async function checkDemoFlow(page, port) {
  process.stdout.write('\n[browser] Demo flow smoke\n');

  await page.goto(`http://localhost:${port}/`);
  await waitForApp(page);
  await page.locator('button[data-action="demo-login"]').click();
  await waitForApp(page);

  await check('Full app loads after clicking Enter Demo Workspace', async () => {
    const text = await page.textContent('#app');
    if (!text.includes('Command Center') || !text.includes('OpsTrax')) {
      throw new Error('App shell did not load after demo login');
    }
  });

  await checkMeAfterDemoLogin(page, port);
  await checkModulePages(page, port);
}

async function main() {
  const srv = await start(0);
  const port = srv.address().port;
  process.stdout.write(`\n[browser-smoke] Server on port ${port}\n`);

  const launchOpts = { headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] };
  if (CHROME_EXE) launchOpts.executablePath = CHROME_EXE;
  const browser = await chromium.launch(launchOpts);

  try {
    const page = await createPage(browser);

    await checkSecurityHeaders(port);
    await checkAuthGate(page, port);
    await checkNoConsoleErrors(browser, port);
    await checkDemoFlow(page, port);
    await checkFullTenantShell(page, port);
    await checkPlatformControlPlane(browser, port);
    await checkRestrictedTenant(browser, port);

    await page.context().close();
  } finally {
    await browser.close();
    server.close();
  }

  const passed = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  const screenshotCount = readdirSync(screenshotDir).filter((file) => file.endsWith('.png')).length;

  process.stdout.write(`\n[browser-smoke] ${passed} passed, ${failed} failed\n`);
  process.stdout.write(`[browser-smoke] Screenshots: ${screenshotCount}\n`);

  if (failed > 0) {
    process.stdout.write('\nFailing checks:\n');
    results.filter((r) => !r.ok).forEach((r) => {
      process.stdout.write(`  ✖ ${r.name}: ${r.reason}\n`);
    });
    process.stdout.write('\nScreenshots saved to dist/screenshots/\n');
    process.exit(1);
  }

  process.stdout.write(`\nScreenshots saved to dist/screenshots/ (${screenshotCount} files)\n`);
  process.exit(0);
}

main().catch((e) => {
  process.stderr.write(`[browser-smoke] FATAL: ${e.message}\n${e.stack}\n`);
  process.exit(1);
});
