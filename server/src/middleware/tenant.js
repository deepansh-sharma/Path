import Lab from "../models/Lab.js";

export async function attachTenant(req, res, next) {
  // Super admin may act across tenants, others must provide their tenantId
  const requestTenantId =
    req.headers["x-tenant-id"] || (req.user && req.user.tenantId);

  if (!requestTenantId && (!req.user || req.user.role !== "super_admin")) {
    return res.status(400).json({ error: "tenantId required" });
  }

  if (requestTenantId) {
    const lab = await Lab.findOne({ tenantId: requestTenantId }).lean();
    if (!lab) return res.status(404).json({ error: "Tenant not found" });
    req.tenant = { id: lab.tenantId, lab };
  }

  return next();
}

export function requireFeature(featureKey) {
  return function (req, res, next) {
    // Super admin bypass
    if (req.user && req.user.role === "super_admin") return next();
    if (!req.tenant || !req.tenant.lab)
      return res.status(400).json({ error: "Tenant context missing" });
    const enabled = req.tenant.lab.features?.[featureKey];
    if (!enabled) return res.status(403).json({ error: "Feature not enabled" });
    return next();
  };
}
