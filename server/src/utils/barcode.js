import crypto from "crypto";

export function generateSampleBarcode({
  patientId,
  testCode,
  at = new Date(),
}) {
  const ts = at.toISOString().replace(/[-:.TZ]/g, "");
  const raw = `${patientId}|${testCode}|${ts}`;
  const digest = crypto
    .createHash("sha256")
    .update(raw)
    .digest("hex")
    .slice(0, 16);
  return `S${digest.toUpperCase()}`;
}
