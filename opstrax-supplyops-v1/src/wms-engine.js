function toMs(value, field = 'timestamp') {
  const ms = Date.parse(value);
  if (!Number.isFinite(ms)) throw new Error(`${field} must be a valid ISO timestamp`);
  return ms;
}

export const DEFAULT_SELLABLE_RELEASE_CONFIDENCE = 80;

export function intervalsOverlap(startA, endA, startB, endB) {
  const a0 = toMs(startA, 'startA');
  const a1 = toMs(endA, 'endA');
  const b0 = toMs(startB, 'startB');
  const b1 = toMs(endB, 'endB');
  if (a1 <= a0 || b1 <= b0) throw new Error('interval end must be after start');
  return a0 < b1 && b0 < a1;
}

export function validateQualitySplit(totalQty, acceptedQty, rejectedQty) {
  const total = Number(totalQty);
  const accepted = Number(acceptedQty);
  const rejected = Number(rejectedQty);
  if (![total, accepted, rejected].every(Number.isFinite)) throw new Error('quality quantities must be numeric');
  if (total <= 0 || accepted < 0 || rejected < 0) throw new Error('quality quantities are invalid');
  if (accepted + rejected > total + 1e-9) throw new Error('accepted plus rejected cannot exceed received quantity');
  const pending = Math.max(0, total - accepted - rejected);
  const outcome = pending > 1e-9 ? 'PARTIAL_PENDING' : accepted > 0 && rejected > 0 ? 'PARTIAL' : accepted > 0 ? 'ACCEPTED' : 'REJECTED';
  return { total, accepted, rejected, pending, outcome };
}

export function allocateFefo(units, requestedQty) {
  const request = Number(requestedQty);
  if (!Number.isFinite(request) || request <= 0) throw new Error('requested quantity must be positive');
  const eligible = units
    .filter((u) => String(u.inventory_status || '').toUpperCase() === 'AVAILABLE')
    .map((u) => ({ ...u, available_qty: Math.max(0, Number(u.available_qty ?? u.quantity ?? 0)) }))
    .filter((u) => u.available_qty > 0)
    .sort((a, b) => {
      const ax = a.expiry_date ? Date.parse(a.expiry_date) : Number.POSITIVE_INFINITY;
      const bx = b.expiry_date ? Date.parse(b.expiry_date) : Number.POSITIVE_INFINITY;
      if (ax !== bx) return ax - bx;
      return Date.parse(a.received_at || a.created_at || 0) - Date.parse(b.received_at || b.created_at || 0);
    });
  const allocations = [];
  let remaining = request;
  for (const unit of eligible) {
    if (remaining <= 1e-9) break;
    const quantity = Math.min(remaining, unit.available_qty);
    allocations.push({ handling_unit_id: unit.id, quantity });
    remaining -= quantity;
  }
  return { requested: request, allocated: request - Math.max(0, remaining), short: Math.max(0, remaining), allocations };
}

export function computeStorageCharge({ startedAt, endedAt, ratePerDay, minimumDays = 1 }) {
  const start = toMs(startedAt, 'startedAt');
  const end = toMs(endedAt, 'endedAt');
  if (end < start) throw new Error('endedAt cannot be before startedAt');
  const rate = Number(ratePerDay || 0);
  if (!Number.isFinite(rate) || rate < 0) throw new Error('ratePerDay must be non-negative');
  const elapsedDays = Math.max(0, (end - start) / 86_400_000);
  const billableDays = Math.max(Number(minimumDays || 0), Math.ceil(elapsedDays || 0));
  return { elapsedDays, billableDays, amount: Math.round(billableDays * rate * 100) / 100 };
}

export function scoreReleaseConfidence({ pickComplete = false, packed = false, dockAssigned = false, carrierConfirmed = false, loaded = false } = {}) {
  let score = 35;
  if (pickComplete) score += 15;
  if (packed) score += 15;
  if (dockAssigned) score += 10;
  if (carrierConfirmed) score += 10;
  if (loaded) score += 15;
  return Math.min(100, score);
}

function reservationBlocks(unit, at) {
  for (const reservation of unit.reservations || []) {
    if (!['HELD', 'CONFIRMED', 'ACTIVE'].includes(String(reservation.status).toUpperCase())) continue;
    const from = Date.parse(reservation.reserved_from);
    const until = Date.parse(reservation.reserved_until);
    if (from <= at && at < until) return true;
  }
  return false;
}

export function unitAvailableAt(unit, atIso, { minReleaseConfidence = DEFAULT_SELLABLE_RELEASE_CONFIDENCE } = {}) {
  const at = toMs(atIso, 'at');
  if (unit.blocked) return false;
  const occupancy = unit.occupancy;
  if (occupancy && String(occupancy.status).toUpperCase() === 'ACTIVE') {
    if (!occupancy.expected_release_at) return false;
    if (Date.parse(occupancy.expected_release_at) > at) return false;
    if (Number(occupancy.release_confidence || 0) < Number(minReleaseConfidence)) return false;
  }
  return !reservationBlocks(unit, at);
}

export function forecastCapacity(units, nowIso, horizonsHours = [0, 4, 24], { minReleaseConfidence = DEFAULT_SELLABLE_RELEASE_CONFIDENCE } = {}) {
  const now = toMs(nowIso, 'now');
  const result = {};
  for (const hours of horizonsHours) {
    const horizon = Number(hours);
    const atIso = new Date(now + horizon * 3_600_000).toISOString();
    result[hours] = units.filter((unit) => {
      if (unit.blocked) return false;
      if (horizon === 0 && unit.occupancy && String(unit.occupancy.status).toUpperCase() === 'ACTIVE') return false;
      return unitAvailableAt(unit, atIso, { minReleaseConfidence });
    }).length;
  }
  return result;
}

export function selectBookableUnits(units, reservedFrom, reservedUntil, quantity, { minReleaseConfidence = DEFAULT_SELLABLE_RELEASE_CONFIDENCE } = {}) {
  const start = toMs(reservedFrom, 'reservedFrom');
  const end = toMs(reservedUntil, 'reservedUntil');
  if (end <= start) throw new Error('reservation end must be after start');
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty <= 0) throw new Error('reservation quantity must be a positive integer');
  const candidates = units.filter((unit) => {
    if (unit.blocked) return false;
    const occupancy = unit.occupancy;
    if (occupancy && String(occupancy.status).toUpperCase() === 'ACTIVE') {
      if (!occupancy.expected_release_at || Date.parse(occupancy.expected_release_at) > start) return false;
      if (Number(occupancy.release_confidence || 0) < Number(minReleaseConfidence)) return false;
    }
    return !(unit.reservations || []).some((reservation) => {
      if (!['HELD', 'CONFIRMED', 'ACTIVE'].includes(String(reservation.status).toUpperCase())) return false;
      return intervalsOverlap(reservedFrom, reservedUntil, reservation.reserved_from, reservation.reserved_until);
    });
  });
  return { selected: candidates.slice(0, qty), short: Math.max(0, qty - candidates.length) };
}
