import Log from "../models/Log.js";

export async function logAction({
  tenantId,
  userId,
  action,
  entity,
  entityId,
  metadata,
}) {
  try {
    await Log.create({ tenantId, userId, action, entity, entityId, metadata });
  } catch (_) {
    // swallow logging errors
  }
}
