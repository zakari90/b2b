import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import UserForm from "@/components/UserForm";
import { ensureDefaultBusiness } from "@/app/actions";
import { redirect } from "next/navigation";
import { Users, Building2, Package, ShieldCheck, Clock, UserPlus, Box, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import PushPermissionTrigger from "@/components/pwa/PushPermissionTrigger";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await auth();
  const adminCount = await (prisma.user as any).count({ where: { role: "admin" } });

  await ensureDefaultBusiness();

  if (adminCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] border border-zinc-200 shadow-2xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 to-indigo-600" />
          <div className="text-center space-y-4">
            <div className="bg-indigo-600 text-white w-20 h-20 flex items-center justify-center rounded-[2rem] mx-auto text-3xl font-black shadow-xl shadow-indigo-500/20">
              B2B
            </div>
            <div className="space-y-1">
              <h1 className="text-3xl font-black text-zinc-900 font-heading">System Initialization</h1>
              <p className="text-zinc-500 text-sm font-medium">
                Create the master Administrator account to begin.
              </p>
            </div>
          </div>
          <UserForm fixedRole="admin" />
        </div>
      </div>
    );
  }

  if (!session) redirect("/");

  const isAdmin = (session.user as any).role === "admin";
  if (!isAdmin) redirect("/");

  // Fetch real stats
  const productCount = await prisma.product.count();
  const activeUsers = await prisma.user.count();
  const businessCount = await prisma.business.count();
  const pendingApprovals = await (prisma.user as any).count({ where: { status: 'PENDING' } });

  // Fetch recent activity
  const recentUsers = await prisma.user.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: { username: true, role: true, status: true, createdAt: true }
  });

  const recentProducts = await prisma.product.findMany({
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: { name: true, price: true, publisher: true, imageUrl: true }
  });
  
  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 font-heading tracking-tight">System Console</h1>
          <p className="text-zinc-500 font-medium">Welcome back, {(session?.user as any)?.username}. Here's the platform pulse.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          System Operational
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <StatCard title="Total Users" value={activeUsers} icon={Users} color="indigo" />
        <StatCard title="Businesses" value={businessCount} icon={Building2} color="blue" />
        <StatCard title="Inventory" value={productCount} icon={Package} color="violet" />
        <StatCard title="Pending" value={pendingApprovals} icon={Clock} color="amber" highlight={pendingApprovals > 0} />
        <StatCard title="Uptime" value="99.9%" icon={ShieldCheck} color="emerald" />
      </div>

      <div className="max-w-xl">
        <PushPermissionTrigger />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users Panel */}
        <section className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <UserPlus size={20} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-sm text-zinc-900">Recent Registrations</h3>
            </div>
            <Link href="/admin/users" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-indigo-600 transition-colors">View All</Link>
          </div>
          
          <div className="space-y-4">
            {recentUsers.map((u, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:bg-white hover:border-indigo-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-black text-xs">
                    {u.username[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900">{u.username}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{u.role}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                  u.status === 'ACTIVE' ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                )}>
                  {u.status}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Products Panel */}
        <section className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Box size={20} />
              </div>
              <h3 className="font-black uppercase tracking-widest text-sm text-zinc-900">New Inventory</h3>
            </div>
            <Link href="/admin/inventory" className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-blue-600 transition-colors">View All</Link>
          </div>

          <div className="space-y-4">
            {recentProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-zinc-50 rounded-2xl border border-zinc-100 group hover:bg-white hover:border-blue-100 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] font-black text-zinc-400">{p.name[0]}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-zinc-900 truncate max-w-[150px]">{p.name}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">${Number(p.price).toFixed(2)}</p>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-zinc-300 group-hover:text-blue-600 transition-colors">
                  {p.publisher || "Global"}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, highlight }: { title: string, value: any, icon: any, color: string, highlight?: boolean }) {
  const colors: { [key: string]: string } = {
    indigo: "text-indigo-600 bg-indigo-50",
    blue: "text-blue-600 bg-blue-50",
    violet: "text-violet-600 bg-violet-50",
    amber: "text-amber-600 bg-amber-50",
    emerald: "text-emerald-600 bg-emerald-50",
  };

  return (
    <div className={cn(
      "bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all",
      highlight && "border-amber-200 ring-4 ring-amber-500/5 shadow-xl shadow-amber-500/5"
    )}>
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}>
            <Icon size={20} />
          </div>
          {highlight && <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-ping" />}
        </div>
        <div>
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black mt-1 text-zinc-900 font-heading">{value}</p>
        </div>
      </div>
    </div>
  );
}
