import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateOrderStatus } from "@/app/actions";
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, User, Building2, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ManagerOrdersPage() {
  const session = await auth();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  });

  if (!user || (user.role !== "saller" && user.role !== "admin")) {
    redirect("/");
  }

  const orders = await prisma.order.findMany({
    where: user.role === "admin" ? {} : { businessId: user.businessId },
    include: {
      user: { include: { business: true } },
      products: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': return { color: 'text-amber-600 bg-amber-50', icon: Clock, text: 'Awaiting Review', step: 1 };
      case 'PROCESSING': return { color: 'text-blue-600 bg-blue-50', icon: Package, text: 'In Preparation', step: 2 };
      case 'SHIPPED': return { color: 'text-indigo-600 bg-indigo-50', icon: Truck, text: 'Dispatched', step: 3 };
      case 'COMPLETED': return { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2, text: 'Fulfilled', step: 4 };
      case 'CANCELLED': return { color: 'text-red-600 bg-red-50', icon: XCircle, text: 'Voided', step: 0 };
      default: return { color: 'text-zinc-600 bg-zinc-50', icon: Package, text: status, step: 0 };
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 font-heading tracking-tight">Order Fulfilment</h1>
          <p className="text-zinc-500 font-medium">Process and track wholesale shipments across the network.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {orders.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border border-dashed border-zinc-200 p-24 text-center space-y-4">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mx-auto">
              <Package size={40} />
            </div>
            <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No active orders found</p>
          </div>
        ) : (
          orders.map((order: any) => {
            const config = getStatusConfig(order.status);
            return (
              <div key={order.id} className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
                <div className="p-8 space-y-8">
                  {/* Order Header */}
                  <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                    <div className="flex flex-col md:flex-row gap-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order ID</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-full">#{order.id.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
                            {order.user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-black text-xl text-zinc-900 leading-none mb-2">{order.user.username}</h3>
                            <div className="flex items-center gap-2 text-zinc-400">
                              <Building2 size={12} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{order.user.business?.name || "Independent Client"}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="h-px md:h-14 md:w-px bg-zinc-100" />

                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-zinc-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={12} className="text-zinc-400" />
                          <span className="text-2xl font-black text-zinc-900 tracking-tighter">${Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-6 w-full xl:w-auto">
                      <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest", config.color)}>
                        <config.icon size={16} />
                        {config.text}
                      </div>

                      <div className="flex gap-2 w-full xl:w-auto">
                        {order.status === "PENDING" && (
                          <form action={async () => { "use server"; await updateOrderStatus(order.id, "PROCESSING"); }} className="flex-1 xl:flex-none">
                            <button className="w-full xl:w-auto text-[10px] font-black uppercase px-6 py-3 bg-zinc-900 text-white rounded-2xl hover:bg-black transition-all shadow-lg active:scale-95">Accept Order</button>
                          </form>
                        )}
                        {order.status === "PROCESSING" && (
                          <form action={async () => { "use server"; await updateOrderStatus(order.id, "SHIPPED"); }} className="flex-1 xl:flex-none">
                            <button className="w-full xl:w-auto text-[10px] font-black uppercase px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95">Mark as Shipped</button>
                          </form>
                        )}
                        {order.status === "SHIPPED" && (
                          <form action={async () => { "use server"; await updateOrderStatus(order.id, "COMPLETED"); }} className="flex-1 xl:flex-none">
                            <button className="w-full xl:w-auto text-[10px] font-black uppercase px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95">Confirm Delivery</button>
                          </form>
                        )}
                        {order.status !== "COMPLETED" && order.status !== "CANCELLED" && (
                          <form action={async () => { "use server"; await updateOrderStatus(order.id, "CANCELLED"); }} className="flex-1 xl:flex-none">
                            <button className="w-full xl:w-auto text-[10px] font-black uppercase px-6 py-3 bg-white text-red-500 border border-red-100 rounded-2xl hover:bg-red-50 transition-all active:scale-95">Void</button>
                          </form>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Table */}
                  <div className="bg-zinc-50/50 rounded-3xl p-6 border border-zinc-100">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                          <th className="pb-4">Product Unit</th>
                          <th className="pb-4 text-center">Unit Price</th>
                          <th className="pb-4 text-center">Quantity</th>
                          <th className="pb-4 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100">
                        {order.products.map((op: any) => (
                          <tr key={op.id}>
                            <td className="py-4">
                              <p className="font-bold text-sm text-zinc-900">{op.product.name}</p>
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{op.product.publisher || "Global Source"}</p>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-xs font-bold text-zinc-500">${Number(op.price).toFixed(2)}</span>
                            </td>
                            <td className="py-4 text-center">
                              <span className="text-xs font-black text-zinc-900 bg-white px-3 py-1 rounded-full border border-zinc-100">{op.quantity}</span>
                            </td>
                            <td className="py-4 text-right font-black text-sm text-indigo-600">
                              ${(Number(op.price) * op.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
