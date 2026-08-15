import test from 'node:test';
import assert from 'node:assert/strict';
import { intervalsOverlap, validateQualitySplit, allocateFefo, computeStorageCharge, scoreReleaseConfidence, unitAvailableAt, forecastCapacity, selectBookableUnits } from '../src/wms-engine.js';

test('half-open reservations allow back-to-back use', () => {
  assert.equal(intervalsOverlap('2026-08-13T10:00:00Z','2026-08-13T12:00:00Z','2026-08-13T12:00:00Z','2026-08-13T13:00:00Z'), false);
});
test('overlapping reservations are detected', () => {
  assert.equal(intervalsOverlap('2026-08-13T10:00:00Z','2026-08-13T12:00:00Z','2026-08-13T11:59:00Z','2026-08-13T13:00:00Z'), true);
});
test('quality accepts full receipt', () => assert.equal(validateQualitySplit(10,10,0).outcome,'ACCEPTED'));
test('quality splits partial acceptance', () => assert.deepEqual(validateQualitySplit(10,7,3), { total:10, accepted:7, rejected:3, pending:0, outcome:'PARTIAL' }));
test('quality rejects impossible split', () => assert.throws(() => validateQualitySplit(10,8,3), /cannot exceed/));
test('FEFO allocates earliest expiry first', () => {
  const r = allocateFefo([{id:'late',inventory_status:'AVAILABLE',quantity:5,expiry_date:'2026-12-01'},{id:'early',inventory_status:'AVAILABLE',quantity:3,expiry_date:'2026-09-01'}],6);
  assert.deepEqual(r.allocations,[{handling_unit_id:'early',quantity:3},{handling_unit_id:'late',quantity:3}]);
});
test('FEFO excludes quarantine stock', () => {
  const r = allocateFefo([{id:'q',inventory_status:'QUARANTINE',quantity:10,expiry_date:'2026-08-01'},{id:'a',inventory_status:'AVAILABLE',quantity:4}],5);
  assert.equal(r.allocated,4); assert.equal(r.short,1);
});
test('storage bills minimum day and rounds', () => {
  assert.deepEqual(computeStorageCharge({startedAt:'2026-08-13T10:00:00Z',endedAt:'2026-08-13T12:00:00Z',ratePerDay:8.25}), {elapsedDays:2/24,billableDays:1,amount:8.25});
});
test('storage bills ceiling elapsed days', () => {
  const r = computeStorageCharge({startedAt:'2026-08-10T10:00:00Z',endedAt:'2026-08-12T11:00:00Z',ratePerDay:10}); assert.equal(r.billableDays,3); assert.equal(r.amount,30);
});
test('release confidence increases with execution evidence', () => {
  assert.equal(scoreReleaseConfidence({}),35);
  assert.equal(scoreReleaseConfidence({pickComplete:true,packed:true,dockAssigned:true,carrierConfirmed:true,loaded:true}),100);
});
test('future availability respects release confidence and reservations', () => {
  const unit={occupancy:{status:'ACTIVE',expected_release_at:'2026-08-13T12:00:00Z',release_confidence:90},reservations:[{status:'CONFIRMED',reserved_from:'2026-08-13T13:00:00Z',reserved_until:'2026-08-13T16:00:00Z'}]};
  assert.equal(unitAvailableAt(unit,'2026-08-13T11:00:00Z'),false);
  assert.equal(unitAvailableAt(unit,'2026-08-13T12:30:00Z'),true);
  assert.equal(unitAvailableAt(unit,'2026-08-13T14:00:00Z'),false);
});
test('low-confidence future release is not firm sellable capacity', () => {
  const unit={occupancy:{status:'ACTIVE',expected_release_at:'2026-08-13T12:00:00Z',release_confidence:65},reservations:[]};
  assert.equal(unitAvailableAt(unit,'2026-08-13T13:00:00Z'),false);
  assert.equal(selectBookableUnits([unit],'2026-08-13T13:00:00Z','2026-08-13T14:00:00Z',1).short,1);
});
test('capacity forecast never calls an active occupancy available now', () => {
  const units=[{},{occupancy:{status:'ACTIVE',expected_release_at:'2026-08-13T09:00:00Z',release_confidence:100},reservations:[]}];
  const f=forecastCapacity(units,'2026-08-13T10:00:00Z',[0]);
  assert.equal(f[0],1);
});
test('capacity forecast counts high-confidence released space in the future', () => {
  const units=[{},{occupancy:{status:'ACTIVE',expected_release_at:'2026-08-13T13:00:00Z',release_confidence:90},reservations:[]}];
  const f=forecastCapacity(units,'2026-08-13T10:00:00Z',[0,4]); assert.equal(f[0],1); assert.equal(f[4],2);
});
test('bookable selection avoids overlapping reservations', () => {
  const units=[{id:'A',reservations:[{status:'CONFIRMED',reserved_from:'2026-08-13T11:00:00Z',reserved_until:'2026-08-13T12:00:00Z'}]},{id:'B',reservations:[]}];
  const r=selectBookableUnits(units,'2026-08-13T11:30:00Z','2026-08-13T13:00:00Z',1); assert.equal(r.selected[0].id,'B'); assert.equal(r.short,0);
});
