import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateOrderStatus } from "@/app/actions";
import { Package, Clock, Truck, CheckCircle2, XCircle, ChevronRight, User, Building2, Calendar, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import SellerOrdersList from "@/components/SellerOrdersList";

export const dynamic = "force-dynamic";

export default async function SellerOrdersPage() {
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
          <SellerOrdersList orders={orders} />
        )}
      </div>
    </div>
  );
}
