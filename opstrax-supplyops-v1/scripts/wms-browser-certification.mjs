#!/usr/bin/env node
import { mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const tempDir = mkdtempSync(join(tmpdir(), 'opstrax-wms-browser-'));
process.env.OPSTRAX_DB_PATH = join(tempDir, 'wms-browser.sqlite');
process.env.OPSTRAX_ALLOW_DEV_CONTEXT = '1';
process.env.AUTH_MODE = 'dev';

const evidenceDir = join(process.cwd(), 'artifacts', 'wms-browser');
mkdirSync(evidenceDir, { recursive: true });

let browser;
let server;
let db;
function assert(condition, message) { if (!condition) throw new Error(message); }

async function responseJson(response) {
  return response.json().catch(async () => ({ raw: await response.text().catch(() => '') }));
}

try {
  ({ db } = await import('../src/db.js'));
  const wmsServer = await import('../wms-server.js');
  server = wmsServer.server || (await import('../server.js')).server;
  const srv = await wmsServer.startWms(0);
  const port = srv.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1600, height: 1050 },
    extraHTTPHeaders: {
      'x-tenant-id': 'tenant_intelliflow_systems',
      'x-user-id': 'tenant_intelliflow_systems_user_admin'
    }
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto(`${baseUrl}/warehouse.html`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Control Tower' }).waitFor();
  await page.screenshot({ path: join(evidenceDir, '01-control-tower.png'), fullPage: true });

  const stamp = Date.now();
  const customerRef = `BROWSER-3PL-${stamp}`;
  const lpn = `BROWSER-LPN-${stamp}`;
  const demandId = `BROWSER-SO-${stamp}`;

  await page.getByRole('button', { name: '3PL Revenue' }).click();
  const contract = page.locator('#contract-form');
  await contract.locator('input[name="customerRef"]').fill(customerRef);
  await contract.locator('input[name="receivingRatePerUnit"]').fill('4.50');
  await contract.locator('input[name="storageRatePerUnitDay"]').fill('8.25');
  await contract.locator('input[name="outboundRatePerUnit"]').fill('3.25');
  const contractResponsePromise = page.waitForResponse((response) => response.url().endsWith('/api/wms/contracts') && response.request().method() === 'POST');
  await contract.getByRole('button', { name: 'Save rate card' }).click();
  const contractResponse = await contractResponsePromise;
  assert(contractResponse.status() === 200, `Rate card failed HTTP ${contractResponse.status()}: ${JSON.stringify(await responseJson(contractResponse))}`);

  await page.getByRole('button', { name: 'Space & Capacity' }).click();
  const reserve = page.locator('#reserve-form');
  await reserve.locator('input[name="customerRef"]').fill(customerRef);
  await reserve.locator('input[name="quantity"]').fill('1');
  const reserveResponsePromise = page.waitForResponse((response) => response.url().endsWith('/api/wms/capacity/reservations') && response.request().method() === 'POST');
  await reserve.getByRole('button', { name: 'Reserve capacity' }).click();
  const reserveResponse = await reserveResponsePromise;
  assert(reserveResponse.status() === 200, `Capacity reservation failed HTTP ${reserveResponse.status()}: ${JSON.stringify(await responseJson(reserveResponse))}`);
  await page.screenshot({ path: join(evidenceDir, '02-capacity-reserved.png'), fullPage: true });

  await page.getByRole('button', { name: 'Receive & Place' }).click();
  const receive = page.locator('#receive-form');
  await receive.locator('input[name="lpn"]').fill(lpn);
  await receive.locator('input[name="customerRef"]').fill(customerRef);
  const spaceSelect = receive.locator('select[name="capacityUnitId"]');
  await page.waitForFunction(() => [...document.querySelectorAll('#receive-form select[name="capacityUnitId"] option')].some((option) => option.textContent.includes('reserved for this customer')));
  const reservedOption = spaceSelect.locator('option', { hasText: 'reserved for this customer' }).first();
  const capacityUnitId = await reservedOption.getAttribute('value');
  assert(capacityUnitId, 'Customer reservation was not offered to receiving');
  await spaceSelect.selectOption(capacityUnitId);
  await receive.locator('select[name="itemId"]').selectOption({ index: 1 });
  const itemId = await receive.locator('select[name="itemId"]').inputValue();
  assert(itemId, 'Browser journey could not select an inventory item');
  await receive.locator('input[name="quantity"]').fill('10');
  await receive.locator('input[name="uom"]').fill('EA');
  const checkInResponsePromise = page.waitForResponse((response) => response.url().includes('/api/wms/handling-units/check-in') && response.request().method() === 'POST');
  await receive.getByRole('button', { name: 'Check in & place' }).click();
  const checkInResponse = await checkInResponsePromise;
  const checkInBody = await responseJson(checkInResponse);
  assert(checkInResponse.status() === 200, `Check-in failed HTTP ${checkInResponse.status()}: ${JSON.stringify(checkInBody)}`);
  await page.getByText(lpn, { exact: true }).waitFor();
  await page.getByText('RECEIVED_NOT_INSPECTED', { exact: true }).waitFor();
  await page.screenshot({ path: join(evidenceDir, '03-received-quality-gated.png'), fullPage: true });

  await page.getByRole('button', { name: 'Quality & Holds' }).click();
  const qualityForm = page.locator('tr').filter({ hasText: lpn }).locator('.inline-quality').first();
  assert(await qualityForm.count(), 'Quality form for received LPN was not rendered');
  await qualityForm.locator('input[name="acceptedQty"]').fill('10');
  await qualityForm.locator('input[name="rejectedQty"]').fill('0');
  await qualityForm.locator('input[name="reason"]').fill('Visible Chromium acceptance');
  const qualityResponsePromise = page.waitForResponse((response) => response.url().includes(`/api/wms/handling-units/${checkInBody.handlingUnit.id}/quality`) && response.request().method() === 'POST');
  await qualityForm.getByRole('button', { name: 'Post' }).click();
  const qualityResponse = await qualityResponsePromise;
  assert(qualityResponse.status() === 200, `Quality decision failed HTTP ${qualityResponse.status()}: ${JSON.stringify(await responseJson(qualityResponse))}`);
  await page.screenshot({ path: join(evidenceDir, '04-quality-released.png'), fullPage: true });

  await page.getByRole('button', { name: 'Receive & Place' }).click();
  const row = page.locator('tr').filter({ hasText: lpn }).first();
  await row.getByText('AVAILABLE', { exact: true }).waitFor();
  let dialogCount = 0;
  page.on('dialog', async (dialog) => {
    dialogCount += 1;
    if (dialog.type() === 'prompt') await dialog.accept(demandId);
    else await dialog.accept();
  });
  const allocationResponsePromise = page.waitForResponse((response) => response.url().endsWith('/api/wms/allocations') && response.request().method() === 'POST');
  const releaseResponsePromise = page.waitForResponse((response) => response.url().includes(`/api/wms/handling-units/${checkInBody.handlingUnit.id}/release`) && response.request().method() === 'POST');
  await row.getByRole('button', { name: 'Release / ship' }).click();
  const allocationResponse = await allocationResponsePromise;
  assert(allocationResponse.status() === 200, `Visible allocation failed HTTP ${allocationResponse.status()}: ${JSON.stringify(await responseJson(allocationResponse))}`);
  const releaseResponse = await releaseResponsePromise;
  assert(releaseResponse.status() === 200, `Visible shipment failed HTTP ${releaseResponse.status()}: ${JSON.stringify(await responseJson(releaseResponse))}`);
  assert(dialogCount >= 2, 'Visible ship journey must request outbound reference and shipment confirmation');
  await page.screenshot({ path: join(evidenceDir, '05-allocated-shipped-space-released.png'), fullPage: true });

  await page.getByRole('button', { name: '3PL Revenue' }).click();
  await page.getByText(customerRef, { exact: true }).first().waitFor();
  const billingText = await page.locator('#content').innerText();
  assert(billingText.includes('RECEIVING'), 'Receiving billing evidence is not visible');
  assert(billingText.includes('STORAGE'), 'Storage billing evidence is not visible');
  assert(billingText.includes('OUTBOUND_HANDLING'), 'Outbound billing evidence is not visible');
  await page.screenshot({ path: join(evidenceDir, '06-3pl-billing-evidence.png'), fullPage: true });

  const facilityId = await page.locator('#facility').inputValue();
  const [capacity, balances, movements] = await page.evaluate(async (facilityId) => {
    const [capacityResponse, balanceResponse, movementResponse] = await Promise.all([
      fetch(`/api/wms/capacity?facilityId=${encodeURIComponent(facilityId)}`),
      fetch('/api/inventory/balances'),
      fetch('/api/inventory/movements')
    ]);
    return [await capacityResponse.json(), await balanceResponse.json(), await movementResponse.json()];
  }, facilityId);
  const released = capacity.units.find((unit) => unit.id === capacityUnitId);
  assert(released && !released.occupancy, 'Physical position was not released after shipment');
  assert((movements.movements || []).some((movement) => movement.reference_id === checkInBody.handlingUnit.id && movement.movement_type === 'WMS_SHIP'), 'Canonical inventory movement for WMS shipment is not visible');
  assert(Array.isArray(balances.balances), 'Canonical inventory balances are not reachable from WMS runtime');
  assert(consoleErrors.length === 0, `Browser console errors: ${consoleErrors.join(' | ')}`);

  process.stdout.write(`[wms-browser-certification] OK customer=${customerRef} lpn=${lpn} order=${demandId} screenshots=6\n`);
  await context.close();
  await browser.close();
  browser = null;
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
  try { db.close?.(); } catch {}
  rmSync(tempDir, { recursive: true, force: true });
  process.exit(0);
} catch (error) {
  process.stderr.write(`[wms-browser-certification] ERROR ${error.stack || error.message}\n`);
  try { await browser?.close(); } catch {}
  try { server?.closeAllConnections?.(); } catch {}
  try { server?.close?.(); } catch {}
  try { db?.close?.(); } catch {}
  rmSync(tempDir, { recursive: true, force: true });
  process.exit(1);
}
