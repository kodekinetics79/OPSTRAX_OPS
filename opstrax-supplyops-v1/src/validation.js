function fail(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function requireString(value, field, { min = 1, max = 512 } = {}) {
  if (typeof value !== 'string') throw fail(`${field} must be a string`);
  const trimmed = value.trim();
  if (trimmed.length < min) throw fail(`${field} is required`);
  if (trimmed.length > max) throw fail(`${field} is too long`);
  return trimmed;
}

export function requirePositiveInt(value, field, { max = 100000 } = {}) {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) throw fail(`${field} must be a positive integer`);
  if (num > max) throw fail(`${field} is too large`);
  return num;
}

export function optionalString(value, field, { max = 512 } = {}) {
  if (value === undefined || value === null || value === '') return '';
  return requireString(value, field, { min: 0, max });
}

export function parseJsonBody(body) {
  if (!body || typeof body !== 'object') throw fail('Request body must be JSON');
  return body;
}

export function requireArray(value, field) {
  if (!Array.isArray(value) || value.length === 0) throw fail(`${field} must be a non-empty array`);
  return value;
}

export function requireEnum(value, field, allowed) {
  if (!allowed.includes(value)) throw fail(`${field} must be one of: ${allowed.join(', ')}`);
  return value;
}

export function asBool(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

export function asJson(value, fallback = {}) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export { fail };
