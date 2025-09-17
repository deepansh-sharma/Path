let counter = 1;
export function generateInvoiceNumber(tenantId) {
  const ts = new Date().toISOString().replace(/[-:.TZ]/g, "");
  const seq = (counter++).toString().padStart(4, "0");
  return `${tenantId.toUpperCase()}-${ts}-${seq}`;
}
