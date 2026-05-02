"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/actions";
import { Menu, X, Globe, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

export default function MobileNav({ items, title, badge, badgeColor = "bg-zinc-950" }: { 
  items: NavItem[], 
  title: string, 
  badge: string,
  badgeColor?: string 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      {/* Mobile Top Bar */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-zinc-100 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className={cn("w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black text-white", badgeColor)}>
            {badge}
          </div>
          <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest">{title}</h2>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center text-zinc-900 bg-zinc-50 rounded-xl hover:bg-zinc-100 transition-colors"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Drawer Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Drawer */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-80 bg-white z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) border-r border-zinc-100 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-zinc-50 flex items-center justify-between">
           <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 flex items-center justify-center rounded-xl text-xs font-black text-white shadow-lg", badgeColor)}>
              {badge}
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-widest leading-none">{title}</h2>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">Mobile Access</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-colors">
             <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                  isActive
                    ? cn(badgeColor, "text-white shadow-xl shadow-zinc-900/20")
                    : "text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900"
                )}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  {item.name}
                </div>
                {isActive && <ChevronRight size={14} className="opacity-50" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-50 space-y-4 bg-zinc-50/50">
          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/"
              className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white text-zinc-400 hover:text-indigo-600 transition-all border border-zinc-100"
            >
              <Globe size={18} />
              <span className="text-[9px] font-black uppercase tracking-widest">Store</span>
            </Link>
            <form action={logout} className="contents">
              <button
                type="submit"
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white text-zinc-400 hover:text-red-600 transition-all border border-zinc-100"
              >
                <LogOut size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest">Exit</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
