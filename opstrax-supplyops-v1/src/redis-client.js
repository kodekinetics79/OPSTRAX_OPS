import { createClient } from 'redis';

let _client = null;
let _ready = false;

export function getRedisUrl(env = process.env) {
  return (env.REDIS_URL || '').trim();
}

export async function connectRedis(env = process.env) {
  const url = getRedisUrl(env);
  if (!url) return null;
  if (_client) return _client;
  _client = createClient({ url });
  _client.on('error', (err) => process.stderr.write(`[redis] ${err.message}\n`));
  _client.on('ready', () => { _ready = true; });
  _client.on('end', () => { _ready = false; });
  try {
    await _client.connect();
    _ready = true;
  } catch (err) {
    process.stderr.write(`[redis] connect failed: ${err.message}\n`);
  }
  return _client;
}

// Returns the client only when connected and ready. Returns null if Redis is
// unavailable — callers must treat Redis as optional and never block on it.
export function getRedisClient() {
  return _ready ? _client : null;
}

export async function pingRedis() {
  try {
    const redis = getRedisClient();
    if (!redis) return false;
    const pong = await redis.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}
