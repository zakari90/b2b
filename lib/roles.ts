/**
 * Helper to check if a user object (with roles and permissions included)
 * has a specific permission.
 * 
 * Example user object from Prisma:
 * const user = await prisma.user.findUnique({
 *   where: { id: userId },
 *   include: {
 *     roles: {
 *       include: {
 *         role: {
 *           include: {
 *             permissions: {
 *               include: {
 *                 permission: true
 *               }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * });
 */
export function hasPermission(user: any, permissionName: string): boolean {
  if (!user || !user.roles) return false;

  return user.roles.some((userRole: any) => 
    userRole.role.permissions.some((rolePermission: any) => 
      rolePermission.permission.name === permissionName
    )
  );
}

export function hasRole(user: any, roleName: string): boolean {
  if (!user || !user.roles) return false;

  return user.roles.some((userRole: any) => userRole.role.name === roleName);
}
