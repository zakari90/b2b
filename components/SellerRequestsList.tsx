"use client";

import { useState } from "react";
import { Building2, Clock, MessageSquare, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import OrderDiscussion from "./OrderDiscussion";

interface SellerRequestsListProps {
  requests: any[];
}

export default function SellerRequestsList({ requests }: SellerRequestsListProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': return { color: 'text-amber-600 bg-amber-50', icon: Clock, text: 'Pending' };
      case 'PROCESSING': return { color: 'text-blue-600 bg-blue-50', icon: Package, text: 'Processing' };
      case 'SHIPPED': return { color: 'text-indigo-600 bg-indigo-50', icon: Clock, text: 'Shipped' };
      case 'COMPLETED': return { color: 'text-emerald-600 bg-emerald-50', icon: Clock, text: 'Completed' };
      case 'CANCELLED': return { color: 'text-red-600 bg-red-50', icon: Clock, text: 'Cancelled' };
      default: return { color: 'text-zinc-600 bg-zinc-50', icon: Package, text: status };
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50/50 dark:bg-zinc-900/50 border-bottom border-zinc-100 dark:border-zinc-800">
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Buyer & Business</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Requested Product</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Qty</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Total Value</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Date</th>
              <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800">
            {requests.map((request) => {
              const status = getStatusConfig(request.order.status);
              return (
                <tr key={request.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                        {request.order.user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-none mb-1">{request.order.user.username}</p>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <Building2 size={10} />
                          <p className="text-[9px] font-black uppercase tracking-widest">{request.order.user.business.name}</p>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="font-bold text-zinc-900 dark:text-zinc-100 text-sm leading-none">{request.product.name}</p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 italic">SKU: {request.product.id}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-black text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                      {request.quantity}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="font-black text-indigo-600 text-sm tracking-tight">
                      ${(Number(request.price) * request.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-zinc-500">
                      <Clock size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {new Date(request.order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={() => setSelectedOrderId(request.order.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm active:scale-95"
                    >
                      <MessageSquare size={12} />
                      Discuss
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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
