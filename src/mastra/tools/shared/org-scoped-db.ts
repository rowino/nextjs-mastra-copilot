import { getDb } from "@/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAuthContext } from "@/lib/auth-context";

export class OrgPermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OrgPermissionError";
  }
}

export function getOrgScopedDb() {
  const { env } = getCloudflareContext();
  return getDb(env.D1Database);
}

export function getAuthenticatedContext() {
  return getAuthContext();
}

export async function validateOrgOwnership<T extends { orgId: string }>(
  record: T | null | undefined,
  expectedOrgId: string,
  resourceType: string
): Promise<T> {
  if (!record) {
    throw new OrgPermissionError(`${resourceType} not found`);
  }
  if (record.orgId !== expectedOrgId) {
    throw new OrgPermissionError(
      `Access denied: ${resourceType} belongs to a different organization`
    );
  }
  return record;
}

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
}
