import { parentPort, workerData } from 'node:worker_threads';
import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { writeSynchronousWorkerResponse } from './sync-rpc.js';

const controlBuffer = workerData.controlBuffer;
const dataBuffer = workerData.dataBuffer;

let client = null;
let bucket = '';

function ensureClient() {
  if (client) return client;
  const {
    bucket: workerBucket,
    region,
    endpoint,
    accessKeyId,
    secretAccessKey,
    sessionToken,
    forcePathStyle
  } = workerData.config || {};
  if (!workerBucket || !region) {
    throw new Error('Object storage is not configured.');
  }
  bucket = workerBucket;
  client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: Boolean(forcePathStyle),
    credentials: accessKeyId && secretAccessKey ? { accessKeyId, secretAccessKey, sessionToken: sessionToken || undefined } : undefined
  });
  return client;
}

async function putObject(payload) {
  const s3 = ensureClient();
  const body = Buffer.from(payload.contentBase64, 'base64');
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: payload.key,
    Body: body,
    ContentType: payload.mimeType || 'application/octet-stream',
    Metadata: payload.metadata || {}
  }));
  return { ok: true, key: payload.key, size: body.length };
}

async function getObject(payload) {
  const s3 = ensureClient();
  const result = await s3.send(new GetObjectCommand({
    Bucket: bucket,
    Key: payload.key
  }));
  const bytes = Buffer.from(await result.Body.transformToByteArray());
  return {
    ok: true,
    key: payload.key,
    contentBase64: bytes.toString('base64'),
    contentType: result.ContentType || 'application/octet-stream',
    contentLength: bytes.length,
    metadata: result.Metadata || {}
  };
}

async function headObject(payload) {
  const s3 = ensureClient();
  const result = await s3.send(new HeadObjectCommand({
    Bucket: bucket,
    Key: payload.key
  }));
  return {
    ok: true,
    key: payload.key,
    contentType: result.ContentType || 'application/octet-stream',
    contentLength: result.ContentLength || 0,
    metadata: result.Metadata || {}
  };
}

async function pingStorage() {
  const s3 = ensureClient();
  await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  return { ok: true, configured: true, bucket };
}

parentPort.on('message', async ({ method, payload }) => {
  try {
    let result;
    switch (method) {
      case 'init':
        ensureClient();
        result = { ok: true, configured: true };
        break;
      case 'put':
        result = await putObject(payload);
        break;
      case 'get':
        result = await getObject(payload);
        break;
      case 'head':
        result = await headObject(payload);
        break;
      case 'ping':
        result = await pingStorage();
        break;
      case 'info':
        result = { ok: true, info: { provider: 's3', bucket, configured: Boolean(bucket) } };
        break;
      default:
        throw new Error(`Unknown evidence storage worker method: ${method}`);
    }
    writeSynchronousWorkerResponse(controlBuffer, dataBuffer, result, { ok: true });
  } catch (error) {
    writeSynchronousWorkerResponse(controlBuffer, dataBuffer, {
      ok: false,
      message: error.message,
      status: error.status || 500,
      code: error.code || ''
    }, { ok: false, status: 2 });
  }
});
