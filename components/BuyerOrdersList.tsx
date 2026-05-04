"use client";

import { useState } from "react";
import { Package, Calendar, Tag, CheckCircle2, Clock, Truck, ChevronRight, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import OrderDiscussion from "./OrderDiscussion";

interface BuyerOrdersListProps {
  orders: any[];
}

export default function BuyerOrdersList({ orders }: BuyerOrdersListProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': return { color: 'bg-blue-500', icon: Clock, text: 'Processing' };
      case 'SHIPPED': return { color: 'bg-amber-500', icon: Truck, text: 'In Transit' };
      case 'COMPLETED': return { color: 'bg-emerald-500', icon: CheckCircle2, text: 'Delivered' };
      default: return { color: 'bg-zinc-500', icon: Package, text: status };
    }
  };

  return (
    <>
      <div className="space-y-4">
        {orders.length === 0 && (
          <div className="bg-white rounded-[2rem] border border-dashed border-zinc-200 p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mx-auto">
              <Calendar size={32} />
            </div>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px]">No orders found</p>
          </div>
        )}
        
        {orders.map((order: any) => {
          const config = getStatusConfig(order.status);
          return (
            <div key={order.id} className="group bg-white rounded-3xl border border-zinc-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all overflow-hidden relative">
              <div className={cn("absolute top-0 left-0 bottom-0 w-1", config.color)} />
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Order Ref</p>
                    <p className="font-bold text-sm text-zinc-900">#{String(order.id).padStart(6, '0')}</p>
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
                  <button 
                    onClick={() => setSelectedOrderId(order.id)}
                    className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm active:scale-95"
                  >
                    <MessageSquare size={14} />
                    Discussion
                  </button>
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
          currentUserRole="buyer"
        />
      )}
    </>
  );
}
