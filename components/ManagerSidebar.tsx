"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";
import { managerNavItems } from "@/lib/navigation";
import { LogOut, Globe, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagerSidebar({ user }: { user: any }) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-72 bg-white border-r border-zinc-100 flex-col h-screen sticky top-0">
      <div className="p-8">
        <Link href="/manager" className="flex items-center gap-3 group">
          <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
            MGR
          </div>
          <div>
            <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none">Terminal</h2>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Management Portal</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {managerNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all group",
                isActive
                  ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20"
                  : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("transition-colors", isActive ? "text-white" : "group-hover:text-zinc-900")}>
                  {item.icon}
                </span>
                {item.name}
              </div>
              {isActive && <ChevronRight size={14} className="opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-4">
        {/* User Profile Chip */}
        <div className="mx-2 p-3 bg-zinc-50 rounded-[1.5rem] border border-zinc-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-lg">
            {user?.username?.[0]?.toUpperCase() || "M"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-zinc-900 truncate uppercase tracking-widest">{user?.username || "Manager"}</p>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">{user?.role || "Operator"}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/"
            className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-50 text-zinc-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-zinc-100"
          >
            <Globe size={16} />
            <span className="text-[9px] font-black uppercase tracking-widest text-center">Store</span>
          </Link>
          
          <form action={logout} className="contents">
            <button
              type="submit"
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-zinc-50 text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-all border border-zinc-100"
            >
              <LogOut size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest text-center">Exit</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
