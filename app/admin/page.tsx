import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import UserForm from "@/components/UserForm";
import { ensureDefaultBusiness } from "@/app/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
// Re-check types: 2026-05-01 19:23

export default async function AdminDashboard() {
  const session = await auth();
  const adminCount = await (prisma.user as any).count({ where: { role: "admin" } });

  // 1. AUTO-BOOTSTRAP: Ensure a business exists
  await ensureDefaultBusiness();

  // 2. BOOTSTRAP MODE: If no admins exist, show setup form
  if (adminCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-8">
          <div className="text-center space-y-2">
            <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 w-16 h-16 flex items-center justify-center rounded-2xl mx-auto text-2xl font-bold mb-4">
              B2B
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Setup</h1>
            <p className="text-zinc-500 text-sm">
              Register the primary Administrator account to initialize the system.
            </p>
          </div>
          <UserForm fixedRole="admin" />
        </div>
      </div>
    );
  }

  // 3. AUTH PROTECTION: If users exist, only allow Admin to see this page
  if (!session) {
    redirect("/");
  }

  const isAdmin = (session.user as any).role === "admin";
  if (!isAdmin) {
    redirect("/");
  }

  // 4. DASHBOARD OVERVIEW
  const productCount = await prisma.product.count();
  const activeUsers = await prisma.user.count();
  const businessCount = await prisma.business.count();
  
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 mt-2 text-lg">Welcome back, {(session?.user as any)?.name}. Here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Users" value={activeUsers} icon="👥" color="bg-blue-500" />
        <StatCard title="Active Businesses" value={businessCount} icon="🏢" color="bg-purple-500" />
        <StatCard title="Inventory Products" value={productCount} icon="📦" color="bg-emerald-500" />
        <StatCard title="System Status" value="Healthy" icon="✅" color="bg-orange-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-center items-center text-center space-y-4">
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center text-3xl">
            🚀
          </div>
          <div>
            <h3 className="text-xl font-bold">Quick Start Guide</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-xs mx-auto">
              Use the sidebar to manage users, configure roles, or update your inventory stock.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: any, icon: string, color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.03] rounded-bl-full group-hover:opacity-[0.05] transition-opacity`}></div>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{icon}</span>
          <span className={`w-2 h-2 rounded-full ${color}`}></span>
        </div>
        <div>
          <div className="text-zinc-500 text-sm font-medium">{title}</div>
          <div className="text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">{value}</div>
        </div>
      </div>
    </div>
  );
}
