import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret || sessionSecret.length < 32) {
  throw new Error("SESSION_SECRET must contain at least 32 characters");
}

function encode(value: string): string {
  return Buffer.from(value).toString("base64url");
}

function decode(value: string): string {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(payload: string): string {
  return createHmac("sha256", sessionSecret!)
    .update(payload)
    .digest("base64url");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function safeCompare(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

export function createSessionToken(
  sessionId: string,
  expiresAt: Date
): { token: string; tokenHash: string } {
  const nonce = randomBytes(32).toString("base64url");

  const payload = [
    sessionId,
    expiresAt.getTime().toString(),
    nonce,
  ].join(".");

  const encodedPayload = encode(payload);
  const signature = sign(encodedPayload);
  const token = `${encodedPayload}.${signature}`;

  return {
    token,
    tokenHash: hashToken(token),
  };
}

export function verifySessionToken(token: string): {
  sessionId: string;
  expiresAt: Date;
  tokenHash: string;
} | null {
  const [encodedPayload, receivedSignature] = token.split(".");

  if (!encodedPayload || !receivedSignature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);

  if (!safeCompare(receivedSignature, expectedSignature)) {
    return null;
  }

  const [sessionId, expiresAtTimestamp, nonce] = decode(
    encodedPayload
  ).split(".");

  if (!sessionId || !expiresAtTimestamp || !nonce) {
    return null;
  }

  const expiresAt = new Date(Number(expiresAtTimestamp));

  if (
    Number.isNaN(expiresAt.getTime()) ||
    expiresAt.getTime() <= Date.now()
  ) {
    return null;
  }

  return {
    sessionId,
    expiresAt,
    tokenHash: hashToken(token),
  };
}