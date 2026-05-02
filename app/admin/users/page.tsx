import { auth } from "@/auth";
import UserForm from "@/components/UserForm";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { updateUserStatus } from "@/app/actions";

export default async function UsersPage() {
  const session = await auth();
  const canViewUsers = await hasPermission("view_users");
  const canCreateUser = await hasPermission("create_user");

  const users = canViewUsers ? await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  }) : [];

  const adminCount = await (prisma.user as any).count({ where: { role: "admin" } });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">User Management</h1>
          <p className="text-zinc-500 mt-1">Manage system users and their assigned roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {canViewUsers ? (
            <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-zinc-900 dark:bg-zinc-100 rounded-full"></span>
                System Users
              </h2>
              <div className="overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-zinc-400 text-xs uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                      <th className="pb-3 font-medium">User</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium text-center">Role</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {users.map((u: any) => (

                      <tr key={u.id} className="group hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="py-4 font-medium text-zinc-900 dark:text-zinc-100">{u.username}</td>
                        <td className="py-4 text-zinc-500 text-sm">{u.email}</td>
                        <td className="py-4 text-center">
                          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md uppercase font-bold text-zinc-600 dark:text-zinc-400">
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${
                              u.status === 'ACTIVE' ? 'text-green-600' :
                              u.status === 'PENDING' ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {u.status}
                            </span>
                            {u.status === 'PENDING' && (
                              <form action={async () => { "use server"; await updateUserStatus(u.id, "ACTIVE"); }}>
                                <button className="bg-zinc-900 text-white text-[10px] px-2 py-1 rounded-md font-bold uppercase hover:bg-zinc-800">Approve</button>
                              </form>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <div className="p-12 text-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
              You don't have permission to view users.
            </div>
          )}
        </div>

        <div className="space-y-6">
          {canCreateUser && (
            <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                Create New User
              </h2>
              <UserForm disableAdmin={adminCount > 0} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
