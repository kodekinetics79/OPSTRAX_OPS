import { Worker } from 'node:worker_threads';
import { TextDecoder, TextEncoder } from 'node:util';

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function createSynchronousWorkerBridge(workerUrl, workerData = {}, { timeoutMs = 300000, bufferSize = 8 * 1024 * 1024 } = {}) {
  const effectiveTimeoutMs = Number(process.env.OPSTRAX_WORKER_TIMEOUT_MS || timeoutMs || 30000);
  const controlBuffer = new SharedArrayBuffer(Int32Array.BYTES_PER_ELEMENT * 4);
  const dataBuffer = new SharedArrayBuffer(bufferSize);
  const control = new Int32Array(controlBuffer);
  const data = new Uint8Array(dataBuffer);
  const worker = new Worker(workerUrl, {
    type: 'module',
    workerData: {
      ...workerData,
      controlBuffer,
      dataBuffer
    }
  });

  function request(method, payload = {}) {
    control.fill(0);
    worker.postMessage({ method, payload });
    const waitResult = Atomics.wait(control, 0, 0, effectiveTimeoutMs);
    if (waitResult === 'timed-out') {
      const error = new Error(`Worker request timed out after ${effectiveTimeoutMs}ms: ${method}`);
      error.code = 'WORKER_TIMEOUT';
      error.status = 503;
      throw error;
    }
    const status = Atomics.load(control, 0);
    const length = Atomics.load(control, 1);
    const raw = decoder.decode(data.slice(0, length));
    const response = raw ? JSON.parse(raw) : {};
    if (status === 2) {
      const error = new Error(response.message || response.error || `Worker request failed: ${method}`);
      if (response.status) error.status = response.status;
      if (response.code) error.code = response.code;
      throw error;
    }
    return response;
  }

  function close() {
    return worker.terminate();
  }

  return { request, close, worker, control, data };
}

export function writeSynchronousWorkerResponse(controlBuffer, dataBuffer, payload, { ok = true, status = 1 } = {}) {
  const control = new Int32Array(controlBuffer);
  const data = new Uint8Array(dataBuffer);
  const json = encoder.encode(JSON.stringify(payload));
  if (json.length > data.length) {
    throw new Error(`Synchronous worker response exceeded buffer size (${json.length} > ${data.length})`);
  }
  data.fill(0);
  data.set(json, 0);
  Atomics.store(control, 1, json.length);
  Atomics.store(control, 0, ok ? status : 2);
  Atomics.notify(control, 0, 1);
}
