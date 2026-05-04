"use client";

import { useState } from "react";
import { Package, Clock, Truck, CheckCircle2, XCircle, Building2, Calendar, DollarSign, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import OrderDiscussion from "./OrderDiscussion";
import { updateOrderStatus } from "@/app/actions";

interface SellerOrdersListProps {
  orders: any[];
}

export default function SellerOrdersList({ orders }: SellerOrdersListProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

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
    <>
      <div className="grid grid-cols-1 gap-8">
        {orders.map((order: any) => {
          const config = getStatusConfig(order.status);
          return (
            <div key={order.id} className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-800 shadow-sm overflow-hidden group hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500">
              <div className="p-8 space-y-8">
                {/* Order Header */}
                <div className="flex flex-col xl:flex-row justify-between items-start gap-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Order ID</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">#{String(order.id).padStart(6, '0')}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-black shadow-lg">
                          {order.user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-black text-xl text-zinc-900 dark:text-zinc-100 leading-none mb-2">{order.user.username}</h3>
                          <div className="flex items-center gap-2 text-zinc-400">
                            <Building2 size={12} />
                            <span className="text-[10px] font-black uppercase tracking-widest">{order.user.business?.name || "Independent Buyer"}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="h-px md:h-14 md:w-px bg-zinc-100 dark:bg-zinc-800" />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-zinc-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={12} className="text-zinc-400" />
                        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tighter">${Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-6 w-full xl:w-auto">
                    <div className={cn("flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest", config.color)}>
                      <config.icon size={16} />
                      {config.text}
                    </div>

                    <div className="flex gap-2 w-full xl:w-auto">
                      <button 
                        onClick={() => setSelectedOrderId(order.id)}
                        className="flex-1 xl:flex-none flex items-center justify-center gap-2 text-[10px] font-black uppercase px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                      >
                        <MessageSquare size={14} />
                        Discuss
                      </button>

                      {order.status === "PENDING" && (
                        <button 
                          onClick={async () => await updateOrderStatus(order.id, "PROCESSING")}
                          className="flex-1 xl:flex-none text-[10px] font-black uppercase px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-2xl hover:bg-black dark:hover:bg-white transition-all shadow-lg active:scale-95"
                        >
                          Accept
                        </button>
                      )}
                      {order.status === "PROCESSING" && (
                        <button 
                          onClick={async () => await updateOrderStatus(order.id, "SHIPPED")}
                          className="flex-1 xl:flex-none text-[10px] font-black uppercase px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                        >
                          Ship
                        </button>
                      )}
                      {order.status === "SHIPPED" && (
                        <button 
                          onClick={async () => await updateOrderStatus(order.id, "COMPLETED")}
                          className="flex-1 xl:flex-none text-[10px] font-black uppercase px-6 py-3 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg active:scale-95"
                        >
                          Deliver
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order Items Table */}
                <div className="bg-zinc-50/50 dark:bg-zinc-800/30 rounded-3xl p-6 border border-zinc-100 dark:border-zinc-800">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">
                        <th className="pb-4">Product Unit</th>
                        <th className="pb-4 text-center">Unit Price</th>
                        <th className="pb-4 text-center">Quantity</th>
                        <th className="pb-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {order.products.map((op: any) => (
                        <tr key={op.id}>
                          <td className="py-4">
                            <p className="font-bold text-sm text-zinc-900 dark:text-zinc-100">{op.product.name}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{op.product.publisher || "Global Source"}</p>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-xs font-bold text-zinc-500">${Number(op.price).toFixed(2)}</span>
                          </td>
                          <td className="py-4 text-center">
                            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-3 py-1 rounded-full border border-zinc-100 dark:border-zinc-800">{op.quantity}</span>
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
        })}
      </div>

      {selectedOrderId && (
        <OrderDiscussion 
          orderId={selectedOrderId}
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          currentUserRole="seller"
        />
      )}
    </>
  );
}
