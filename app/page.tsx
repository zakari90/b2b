import Link from "next/link";
import { auth } from "@/auth";
import { login, logout } from "./actions";
import prisma from "@/lib/prisma";
import UserForm from "@/components/UserForm";
import LoginForm from "@/components/LoginForm";
import AuthHub from "@/components/AuthHub";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();

  // 1. Force Admin Setup: If no admins exist, redirect to /admin to create the first admin
  const adminCount = await (prisma.user as any).count({
    where: { role: "admin" },
  });
  if (adminCount === 0) {
    redirect("/admin");
  }

  // Fetch products for the home page showcase safely
  let featuredProducts: any[] = [];
  try {
    featuredProducts = await prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    });
  } catch (e) {
    console.error("Prisma loading error:", e);
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans">
      {/* 1. Header/Navbar */}
      <nav className="border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
          <Link
            href="/"
            className="text-xl font-black tracking-tighter uppercase italic"
          >
            B2B <span className="text-blue-600">Store</span>
          </Link>
          <div className="flex gap-6 items-center">
            {session ? (
              <>
                <Link
                  href={
                    (session.user as any).role === "admin"
                      ? "/admin"
                      : (session.user as any).role === "saller"
                        ? "/manager"
                        : "/client"
                  }
                  className="text-sm font-bold bg-zinc-900 text-white px-4 py-2 rounded-full"
                >
                  My Dashboard
                </Link>
                <form action={logout}>
                  <button className="text-sm text-zinc-500 hover:text-red-600 transition-colors">
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <a
                href="#auth"
                className="text-sm font-bold border border-zinc-900 px-4 py-2 rounded-full hover:bg-zinc-900 hover:text-white transition-all"
              >
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 opacity-60 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700 animate-gradient"></div>
        <div className="absolute inset-0 dot-grid opacity-30"></div>
        <div className="relative z-10 text-center space-y-8 px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest backdrop-blur-md mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            New Inventory Just Landed
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-white tracking-tight leading-[0.9] font-heading">
            PREMIUM B2B <br />{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
              SOLUTIONS
            </span>
          </h1>
          <p className="text-zinc-300 max-w-2xl mx-auto text-lg md:text-xl font-medium">
            Streamline your business operations with our state-of-the-art
            authentication and inventory management platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="#shop"
              className="w-full sm:w-auto bg-white text-zinc-900 px-10 py-4 rounded-full font-bold hover:scale-105 transition-transform shadow-2xl shadow-white/10"
            >
              Shop Now
            </a>
            <a
              href="#auth"
              className="w-full sm:w-auto border border-white/30 text-white px-10 py-4 rounded-full font-bold backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              Register Business
            </a>
          </div>
          <div className="pt-8 flex justify-center gap-8 md:gap-16 border-t border-white/10 mt-8">
            <div className="text-center">
              <p className="text-white font-black text-2xl">500+</p>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Products</p>
            </div>
            <div className="text-center">
              <p className="text-white font-black text-2xl">50+</p>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Businesses</p>
            </div>
            <div className="text-center">
              <p className="text-white font-black text-2xl">99.9%</p>
              <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section id="shop" className="max-w-7xl mx-auto py-24 px-6 space-y-12">
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">
              Latest Arrivals
            </h2>
            <p className="text-zinc-500">
              Discover our newest inventory additions.
            </p>
          </div>
          <Link
            href="/client"
            className="text-sm font-bold underline text-blue-600"
          >
            View Catalog
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredProducts.map((product: any) => (

            <div key={product.id} className="group cursor-pointer relative">
              <div className="aspect-[4/5] bg-zinc-100 rounded-3xl mb-4 overflow-hidden flex items-center justify-center transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 relative border border-zinc-200">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-blue-500 to-violet-600 flex items-center justify-center text-white">
                    <span className="text-4xl font-black opacity-40 font-heading">
                      {product.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Price Badge Overlay */}
                <div className="absolute top-4 right-4 z-20">
                  <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                    ${Number(product.price).toFixed(2)}
                  </span>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center p-6">
                  <Link
                    href="/client"
                    className="w-full bg-white text-zinc-900 py-3 rounded-xl text-center block text-sm font-black shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-all duration-500"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              
              <div className="space-y-1 px-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1 font-heading">
                    {product.name}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    product.quantity > 10 ? "bg-emerald-500" : product.quantity > 0 ? "bg-amber-500" : "bg-red-500"
                  )}></div>
                  <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                    {product.publisher || "Direct Global"} · {product.quantity > 0 ? `${product.quantity} in stock` : 'Out of stock'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {featuredProducts.length === 0 && (
            <div className="col-span-full py-12 text-center bg-zinc-50 rounded-3xl border border-dashed text-zinc-400">
              Your inventory is currently empty. Add products from the Admin
              panel to see them here!
            </div>
          )}
        </div>
      </section>

      {/* 4. Auth Hub (Login/Register) */}
      {!session && (
        <section id="auth" className="bg-zinc-50 py-32 border-t border-zinc-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter font-heading text-zinc-900">
                Join the <span className="text-indigo-600">Community</span>
              </h2>
              <p className="text-zinc-500 max-w-lg mx-auto font-medium">
                Access your dedicated portal to manage orders, inventory, and
                business operations.
              </p>
            </div>

            <AuthHub />
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-zinc-100 relative pt-24 pb-12 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 opacity-30" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          <div className="space-y-6">
            <Link
              href="/"
              className="text-2xl font-black tracking-tighter uppercase italic"
            >
              B2B <span className="text-indigo-600">Store</span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs font-medium">
              The ultimate platform for business inventory management and wholesale storefront solutions.
            </p>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900">Quick Links</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-bold">
              <li><Link href="#shop" className="hover:text-indigo-600 transition-colors">Catalog</Link></li>
              <li><Link href="#auth" className="hover:text-indigo-600 transition-colors">Register</Link></li>
              <li><Link href="/client" className="hover:text-indigo-600 transition-colors">My Orders</Link></li>
            </ul>
          </div>

          <div className="space-y-6">
            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900">Contact</h4>
            <ul className="space-y-4 text-sm text-zinc-500 font-bold">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                support@b2bstore.com
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                +1 (555) 000-1234
              </li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-12 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
            &copy; 2024 B2B Store Platform. All Rights Reserved.
          </p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <Link href="#" className="hover:text-zinc-900">Privacy Policy</Link>
            <Link href="#" className="hover:text-zinc-900">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
