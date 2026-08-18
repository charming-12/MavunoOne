import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

const SECRET_PREFIX = "enc:v1:";

function getKey() {
  const secret = process.env.MAVUNO_SESSION_SECRET;
  if (!secret) throw new Error("MAVUNO_SESSION_SECRET is required for encrypted configuration");
  return createHash("sha256").update(secret).digest();
}

export function encryptConfigValue(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${SECRET_PREFIX}${iv.toString("base64url")}.${tag.toString("base64url")}.${encrypted.toString("base64url")}`;
}

export function decryptConfigValue(value: string) {
  if (!value.startsWith(SECRET_PREFIX)) return value;
  const [ivPart, tagPart, dataPart] = value.slice(SECRET_PREFIX.length).split(".");
  if (!ivPart || !tagPart || !dataPart) throw new Error("Invalid encrypted configuration format");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(ivPart, "base64url"));
  decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(dataPart, "base64url")), decipher.final()]).toString("utf8");
}

export function isEncryptedConfigValue(value: string) {
  return value.startsWith(SECRET_PREFIX);
}
