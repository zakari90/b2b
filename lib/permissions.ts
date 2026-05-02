import { auth } from "@/auth";
import prisma from "@/lib/prisma";

/**
 * Checks if the currently logged-in user has a specific permission.
 * @param permissionName The name of the permission to check (e.g., 'view_reports')
 * @returns boolean
 */
export async function hasPermission(permissionName: string): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;

  // Since we now store permissions in the session JWT/Session object
  // (mapped from the role enum in auth.ts), we can check them directly.
  const permissions = (session.user as any).permissions || [];

  return permissions.includes(permissionName) || permissions.includes("manage_all");
}
