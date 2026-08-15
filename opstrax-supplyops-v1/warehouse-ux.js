const $ = (selector, root = document) => root.querySelector(selector);
let csrfToken = '';

function notify(message, isError = false) {
  const node = document.getElementById('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.toggle('error', isError);
  node.classList.add('show');
  setTimeout(() => {
    node.classList.remove('show');
    node.classList.remove('error');
  }, 3200);
}

async function json(path, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();
  const response = await fetch(path, {
    credentials: 'include',
    ...options,
    headers: {
      accept: 'application/json',
      ...(options.body ? { 'content-type': 'application/json' } : {}),
      ...(['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
  return payload;
}

async function initializeSecurityContext() {
  const bootstrap = await json('/api/bootstrap');
  csrfToken = bootstrap.session?.csrf_token || '';
}

function activeReservations(unit) {
  return (unit.reservations || []).filter((reservation) => ['HELD', 'CONFIRMED', 'ACTIVE'].includes(String(reservation.status).toUpperCase()));
}

async function capacitySnapshot() {
  const facilityId = document.getElementById('facility')?.value || '';
  if (!facilityId) return [];
  const payload = await json(`/api/wms/capacity?facilityId=${encodeURIComponent(facilityId)}`);
  return payload.units || [];
}

async function refreshReceiveChoices(form) {
  const select = $('select[name="capacityUnitId"]', form);
  const customerInput = $('input[name="customerRef"]', form);
  if (!select || !customerInput) return;
  const customerRef = customerInput.value.trim();
  const previous = select.value;
  const units = await capacitySnapshot();
  const usable = units.filter((unit) => {
    if (unit.occupancy || unit.blocked || String(unit.status).toUpperCase() === 'BLOCKED') return false;
    const reservations = activeReservations(unit);
    if (!reservations.length) return true;
    return Boolean(customerRef) && reservations.some((reservation) => reservation.customer_ref === customerRef);
  });
  select.innerHTML = usable.map((unit) => {
    const mine = activeReservations(unit).some((reservation) => reservation.customer_ref === customerRef);
    return `<option value="${String(unit.id).replaceAll('"', '&quot;')}">${unit.code}${mine ? ' — reserved for this customer' : ''}</option>`;
  }).join('');
  if (usable.some((unit) => unit.id === previous)) select.value = previous;
  if (!usable.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = customerRef ? 'No compatible free/reserved space' : 'Enter customer to see reserved space';
    select.appendChild(option);
  }
}

async function enhanceReceive(form) {
  if (form.dataset.safeCapacity === '1') return;
  form.dataset.safeCapacity = '1';
  const customer = $('input[name="customerRef"]', form);
  customer?.addEventListener('input', () => refreshReceiveChoices(form).catch((error) => notify(error.message, true)));
  await refreshReceiveChoices(form);
}

async function enhanceQuality(form) {
  if (form.dataset.rejectDestination === '1') return;
  form.dataset.rejectDestination = '1';
  const handlingUnitId = form.dataset.id;
  if (!handlingUnitId) return;
  const facilityId = document.getElementById('facility')?.value || '';
  const [husPayload, units] = await Promise.all([
    json(`/api/wms/handling-units?facilityId=${encodeURIComponent(facilityId)}`),
    capacitySnapshot()
  ]);
  const hu = (husPayload.handlingUnits || []).find((row) => row.id === handlingUnitId);
  if (!hu) return;
  const available = units.filter((unit) => !unit.occupancy && !unit.blocked && unit.id !== hu.current_capacity_unit_id && activeReservations(unit).length === 0);
  const select = document.createElement('select');
  select.name = 'rejectedCapacityUnitId';
  select.title = 'Reject / quarantine destination';
  select.innerHTML = `<option value="">Reject space (required only for partial reject)</option>${available.map((unit) => `<option value="${unit.id}">${unit.code}</option>`).join('')}`;
  const button = $('button', form);
  form.insertBefore(select, button || null);

  form.addEventListener('submit', (event) => {
    const rejected = Number($('input[name="rejectedQty"]', form)?.value || 0);
    const accepted = Number($('input[name="acceptedQty"]', form)?.value || 0);
    if (accepted > 0 && rejected > 0 && !select.value) {
      event.preventDefault();
      event.stopImmediatePropagation();
      notify('Choose a separate reject / quarantine space for partial acceptance.', true);
    }
  }, true);
}

async function allocateAndShip(button) {
  const handlingUnitId = button.dataset.release;
  const facilityId = document.getElementById('facility')?.value || '';
  const husPayload = await json(`/api/wms/handling-units?facilityId=${encodeURIComponent(facilityId)}`);
  const hu = (husPayload.handlingUnits || []).find((row) => row.id === handlingUnitId);
  if (!hu) throw new Error('Handling unit is no longer available');
  if (hu.inventory_status !== 'AVAILABLE') throw new Error(`Only AVAILABLE inventory can ship; current status is ${hu.inventory_status}`);
  let outboundReference = '';
  if (hu.item_id) {
    outboundReference = window.prompt('Outbound / sales order reference', `SO-${hu.lpn}`) || '';
    if (!outboundReference.trim()) throw new Error('Outbound / sales order reference is required');
  }
  const confirmed = window.confirm(`Allocate and ship ${hu.lpn}${outboundReference ? ` against ${outboundReference}` : ''}, then release its space?`);
  if (!confirmed) return;
  if (hu.item_id) {
    await json('/api/wms/allocations', {
      method: 'POST',
      body: JSON.stringify({
        facilityId,
        itemId: hu.item_id,
        demandType: 'SALES_ORDER',
        demandId: outboundReference.trim(),
        quantity: Number(hu.quantity)
      })
    });
  }
  await json(`/api/wms/handling-units/${encodeURIComponent(handlingUnitId)}/release`, {
    method: 'POST',
    body: JSON.stringify({ reason: 'SHIPPED', outboundReference })
  });
  notify('Inventory allocated, shipped, billed, and space released.');
  document.getElementById('refresh')?.click();
}

function installReleaseInterceptor() {
  document.addEventListener('click', (event) => {
    const button = event.target.closest?.('button[data-release]');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    allocateAndShip(button).catch((error) => notify(error.message, true));
  }, true);
}

async function enhance() {
  const receiveForm = document.getElementById('receive-form');
  if (receiveForm) await enhanceReceive(receiveForm);
  for (const form of document.querySelectorAll('.inline-quality')) await enhanceQuality(form);
}

installReleaseInterceptor();
const observer = new MutationObserver(() => enhance().catch((error) => notify(error.message, true)));
observer.observe(document.getElementById('content'), { childList: true, subtree: true });
document.getElementById('facility')?.addEventListener('change', () => setTimeout(() => enhance().catch((error) => notify(error.message, true)), 0));
initializeSecurityContext()
  .then(() => enhance())
  .catch((error) => notify(error.message, true));
