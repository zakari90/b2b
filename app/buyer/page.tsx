import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getProducts } from "@/app/actions";
import AddToCartButton from "@/components/AddToCartButton";
import CartDrawer from "@/components/CartDrawer";
import { ShoppingBag, ChevronRight, Package, Calendar, Tag, CheckCircle2, Clock, Truck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BuyerPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const session = await auth();

  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
    include: {
      orders: {
        include: { products: { include: { product: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) redirect("/");

  const hasAccess = (session.user as any).role === "buyer" || (session.user as any).role === "admin";

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-white">
        <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-4xl font-black font-heading text-zinc-900 uppercase tracking-tighter">Access Denied</h1>
        <p className="mt-4 text-zinc-500 font-medium max-w-sm">This secure portal is restricted to authorized buyers only.</p>
        <Link href="/" className="mt-8 inline-flex items-center gap-2 bg-zinc-900 text-white px-8 py-3 rounded-full font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  const { products, totalPages } = await getProducts(page, 6);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': return { color: 'bg-blue-500', icon: Clock, text: 'Processing' };
      case 'SHIPPED': return { color: 'bg-amber-500', icon: Truck, text: 'In Transit' };
      case 'COMPLETED': return { color: 'bg-emerald-500', icon: CheckCircle2, text: 'Delivered' };
      default: return { color: 'bg-zinc-500', icon: Package, text: status };
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <CartDrawer />
      
      {/* Premium Header Banner */}
      <div className="bg-zinc-950 pt-12 pb-24 px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-transparent to-violet-600/10" />
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Secure Buyer Portal
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white font-heading tracking-tight">
                Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">{user.username}</span>
              </h1>
              <p className="text-zinc-400 font-medium">Browse our latest wholesale inventory and track your orders.</p>
            </div>
            <Link href="/" className="text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              Back to Home
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 -mt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Catalog Section (8 cols) */}
          <section className="lg:col-span-8 space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-indigo-600">
                  <ShoppingBag size={20} />
                </div>
                <h2 className="text-xl font-black uppercase tracking-widest font-heading text-zinc-900">Wholesale Catalog</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {products.map((product: any) => (
                <div key={product.id} className="group bg-white rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 overflow-hidden flex flex-col">
                  <div className="aspect-[16/9] bg-zinc-100 relative overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center">
                        <span className="text-3xl font-black text-indigo-200 uppercase font-heading">{product.name[0]}</span>
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full shadow-lg">
                      <p className="text-indigo-600 font-black text-sm">${Number(product.price).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-black text-lg text-zinc-900 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-1">{product.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          product.quantity > 10 ? "bg-emerald-500" : product.quantity > 0 ? "bg-amber-500" : "bg-red-500"
                        )} />
                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">
                          {product.publisher || "Direct Global"} · {product.quantity} units available
                        </p>
                      </div>
                    </div>
                    <AddToCartButton product={product} />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex gap-4 items-center justify-center pt-12">
                <Link 
                  href={`?page=${Math.max(1, page - 1)}`}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-zinc-100 shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all",
                    page <= 1 && "opacity-20 pointer-events-none"
                  )}
                >
                  <ChevronRight size={20} className="rotate-180" />
                </Link>
                <div className="bg-white border border-zinc-100 px-6 py-3 rounded-2xl shadow-sm text-xs font-black uppercase tracking-widest text-zinc-400">
                  Page <span className="text-zinc-900">{page}</span> of {totalPages}
                </div>
                <Link 
                  href={`?page=${Math.min(totalPages, page + 1)}`}
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-zinc-100 shadow-sm hover:border-indigo-500 hover:text-indigo-600 transition-all",
                    page >= totalPages && "opacity-20 pointer-events-none"
                  )}
                >
                  <ChevronRight size={20} />
                </Link>
              </div>
            )}
          </section>

          {/* Sidebar / Orders (4 cols) */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-violet-600">
                <Package size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest font-heading text-zinc-900">Purchase History</h2>
            </div>

            <div className="space-y-4">
              {user.orders.length === 0 && (
                <div className="bg-white rounded-[2rem] border border-dashed border-zinc-200 p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mx-auto">
                    <Calendar size={32} />
                  </div>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No orders found</p>
                </div>
              )}
              
              {user.orders.map((order: any) => {
                const config = getStatusConfig(order.status);
                return (
                  <div key={order.id} className="group bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all overflow-hidden relative">
                    <div className={cn("absolute top-0 left-0 bottom-0 w-1", config.color)} />
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Order Ref</p>
                          <p className="font-bold text-sm text-zinc-900">#{order.id.slice(-6).toUpperCase()}</p>
                        </div>
                        <div className={cn("flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", config.color.replace('bg-', 'text-'), config.color.replace('bg-', 'bg-') + '/10')}>
                          <config.icon size={12} />
                          {config.text}
                        </div>
                      </div>

                      <details className="group/details">
                        <summary className="list-none cursor-pointer flex items-center justify-between text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors">
                          <span className="flex items-center gap-2">
                            <Tag size={12} />
                            View {order.products.length} line items
                          </span>
                          <ChevronRight size={14} className="group-open/details:rotate-90 transition-transform" />
                        </summary>
                        <div className="mt-4 space-y-3 pt-4 border-t border-zinc-50">
                          {order.products.map((op: any) => (
                            <div key={op.id} className="flex justify-between items-center text-xs">
                              <div className="flex flex-col">
                                <span className="font-black text-zinc-900">{op.product.name}</span>
                                <span className="text-zinc-400 text-[10px] uppercase font-bold">{op.quantity} x ${Number(op.price).toFixed(2)}</span>
                              </div>
                              <span className="font-black text-indigo-600">${(Number(op.price) * op.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </details>

                      <div className="pt-4 border-t border-zinc-50 flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Amount</p>
                          <p className="font-black text-xl text-zinc-900">${Number(order.total).toFixed(2)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Placed on</p>
                          <p className="text-[10px] font-bold text-zinc-600">{new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
