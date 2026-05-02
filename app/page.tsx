import Link from "next/link";
import { auth } from "@/auth";
import { login, logout } from "./actions";
import prisma from "@/lib/prisma";
import UserForm from "@/components/UserForm";
import LoginForm from "@/components/LoginForm";
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
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-zinc-900">
        <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-blue-600 to-indigo-900"></div>
        <div className="relative z-10 text-center space-y-6 px-6">
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-tight">
            Premium B2B <br />{" "}
            <span className="text-blue-400">Inventory Solutions</span>
          </h1>
          <p className="text-zinc-300 max-w-xl mx-auto text-lg">
            Streamline your business operations with our state-of-the-art
            authentication and inventory management platform.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="#shop"
              className="bg-white text-zinc-900 px-8 py-3 rounded-full font-bold hover:scale-105 transition-transform"
            >
              Shop Now
            </a>
            <a
              href="#auth"
              className="border border-white/30 text-white px-8 py-3 rounded-full font-bold backdrop-blur-sm hover:bg-white/10 transition-all"
            >
              Register Business
            </a>
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

            <div key={product.id} className="group cursor-pointer">
              <div className="aspect-square bg-zinc-100 rounded-2xl mb-4 overflow-hidden flex items-center justify-center text-zinc-300 transition-all group-hover:scale-[1.02] relative border">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-xs uppercase font-black tracking-widest opacity-20">
                    Preview Image
                  </span>
                )}
                <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <Link
                    href="/client"
                    className="w-full bg-white text-zinc-900 py-2 rounded-lg text-center block text-sm font-bold shadow-xl"
                  >
                    View Details
                  </Link>
                </div>
              </div>
              <h3 className="font-bold text-lg group-hover:text-blue-600 transition-colors">
                {product.name}
              </h3>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest -mt-1 mb-1">
                {product.publisher || "Global"}
              </p>
              <p className="text-zinc-500 font-bold">
                ${Number(product.price).toFixed(2)}
              </p>
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
        <section id="auth" className="bg-zinc-50 py-24 border-t">
          <div className="max-w-7xl mx-auto px-6 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">
                Join the Community
              </h2>
              <p className="text-zinc-500 max-w-lg mx-auto">
                Access your dedicated portal to manage orders, inventory, and
                business operations.
              </p>
            </div>

            <div className="flex flex-wrap gap-8 justify-center items-start">
              {/* Login Card */}
              <Card className="w-full max-w-sm rounded-3xl shadow-xl border-zinc-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">
                    Secure Sign In
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LoginForm />
                </CardContent>
              </Card>

              {/* Client Register Card */}
              <Card className="w-full max-w-sm rounded-3xl shadow-xl border-zinc-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-blue-600">
                    Register as Client
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserForm fixedRole="buyer" />
                </CardContent>
              </Card>

              {/* Manager Register Card */}
              <Card className="w-full max-w-sm rounded-3xl shadow-xl border-zinc-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-indigo-600">
                    Register as Manager
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UserForm fixedRole="saller" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-12 border-t text-center text-zinc-400 text-xs font-bold uppercase tracking-widest">
        &copy; 2024 B2B Store Platform. All Rights Reserved.
      </footer>
    </div>
  );
}
