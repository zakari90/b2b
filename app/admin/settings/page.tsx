import { deleteAllData } from "@/app/actions";
import { Cpu, Link as LinkIcon, ShieldAlert } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Settings</h1>
        <p className="text-zinc-500 mt-1">Configure global application behavior and maintenance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-8">
          {/* System Info Card */}
          <section className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Cpu size={20} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 font-heading">System Metadata</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Environment</span>
                <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{process.env.NODE_ENV?.toUpperCase() || 'DEVELOPMENT'}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Next.js Version</span>
                <span className="text-xs font-black text-zinc-900">16.2.4</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-zinc-50">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Database</span>
                <span className="text-xs font-black text-indigo-600">Postgres (Supabase)</span>
              </div>
            </div>
          </section>

          {/* Quick Actions Card */}
          <section className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <LinkIcon size={20} />
              </div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 font-heading">Navigation</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Link href="/admin/users" className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-indigo-600">Manage</p>
                <p className="font-bold text-sm text-zinc-900">Users</p>
              </Link>
              <Link href="/admin/inventory" className="p-4 bg-zinc-50 rounded-2xl border border-zinc-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all group">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-blue-600">Browse</p>
                <p className="font-bold text-sm text-zinc-900">Products</p>
              </Link>
            </div>
          </section>
        </div>

        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Clearing the database will remove all users, roles, and data. This action is irreversible. 
            You will be logged out and the system will return to bootstrap mode.
          </p>
          <form
            action={async () => {
              "use server";
              await deleteAllData();
            }}
          >
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              Reset Entire System
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
