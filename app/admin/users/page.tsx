import { auth } from "@/auth";
import ProvisionUserDialog from "@/components/ProvisionUserDialog";
import prisma from "@/lib/prisma";
import { hasPermission } from "@/lib/permissions";
import { updateUserStatus } from "@/app/actions";
import { UserPlus, Shield, UserCheck, UserX, Clock, Check, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const canViewUsers = await hasPermission("view_users");
  const canCreateUser = await hasPermission("create_user");

  const users = canViewUsers ? await prisma.user.findMany({
    orderBy: { createdAt: "desc" }
  }) : [];

  const adminCount = await (prisma.user as any).count({ where: { role: "admin" } });
  
  // Summary Stats
  const totalActive = users.filter((u: any) => u.status === 'ACTIVE').length;
  const totalPending = users.filter((u: any) => u.status === 'PENDING').length;
  const totalInactive = users.filter((u: any) => u.status === 'INACTIVE').length;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 font-heading tracking-tight">Identity Manager</h1>
          <p className="text-zinc-500 font-medium">Control system access and authenticate organization members.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User Table (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {canViewUsers ? (
            <section className="bg-white p-8 rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-900 border border-zinc-100">
                    <Shield size={20} />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-widest font-heading">System Accounts</h2>
                </div>
              </div>

              <div className="overflow-x-auto -mx-8 px-8">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-zinc-400 text-[10px] font-black uppercase tracking-widest border-b border-zinc-50">
                      <th className="pb-4 font-black">User Profile</th>
                      <th className="pb-4 font-black text-center">Permissions</th>
                      <th className="pb-4 font-black text-right">Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50">
                    {users.map((u: any) => (
                      <tr key={u.id} className="group hover:bg-zinc-50/50 transition-colors">
                        <td className="py-5">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg",
                              u.role === 'admin' ? 'bg-zinc-900' : u.role === 'saller' ? 'bg-indigo-600' : 'bg-blue-500'
                            )}>
                              {u.username[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-sm text-zinc-900">{u.username}</p>
                              <p className="text-xs text-zinc-400 font-medium">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 text-center">
                          <span className={cn(
                            "text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest",
                            u.role === 'admin' ? "bg-zinc-100 text-zinc-600" : 
                            u.role === 'saller' ? "bg-indigo-50 text-indigo-600" : "bg-blue-50 text-blue-600"
                          )}>
                            {u.role === 'saller' ? 'MANAGER' : u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center justify-end gap-4">
                            <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full",
                              u.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                              u.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                            )}>
                              {u.status}
                            </span>
                            {u.status === 'PENDING' && (
                              <form action={async () => { "use server"; await updateUserStatus(u.id, "ACTIVE"); }}>
                                <button className="bg-zinc-950 text-white p-2 rounded-lg hover:bg-black transition-all shadow-lg hover:scale-110 active:scale-95">
                                  <Check size={14} />
                                </button>
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
            <div className="p-12 text-center bg-white rounded-[2.5rem] border border-dashed border-zinc-200 text-zinc-400">
              Identity logs restricted. Contact system owner.
            </div>
          )}
        </div>

        {/* Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Summary Stats Card */}
          <section className="bg-zinc-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">User Base Summary</h3>
            <div className="grid grid-cols-3 gap-4 relative z-10">
              <div className="space-y-1">
                <p className="text-2xl font-black">{totalActive}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Active</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black">{totalPending}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-amber-400">Pending</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-black">{totalInactive}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-red-400">Restricted</p>
              </div>
            </div>
          </section>

          {canCreateUser && (
            <ProvisionUserDialog disableAdmin={adminCount > 0} />
          )}
        </div>
      </div>
    </div>
  );
}
