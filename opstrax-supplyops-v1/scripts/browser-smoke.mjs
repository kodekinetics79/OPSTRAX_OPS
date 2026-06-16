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
    { navText: 'AI Operations', expectText: ['AI Operations', 'Provider not configured', 'Advisory'] }
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

  await check('Evostel shows Audit Trail', async () => {
    const text = await page.textContent('#app');
    if (!text.includes('Audit Trail')) throw new Error('Audit Trail should be visible');
  });

  await page.waitForTimeout(300);
  await page.screenshot({ path: join(screenshotDir, '99-evostel-restricted.png'), fullPage: false });
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
