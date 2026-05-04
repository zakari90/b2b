import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  Package, 
  User, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Truck, 
  Search,
  Filter,
  ArrowUpDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import SellerRequestsList from "@/components/SellerRequestsList";

export const dynamic = "force-dynamic";

export default async function SellerRequestsPage() {
  const session = await auth();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  });

  if (!user || (user.role !== "saller" && user.role !== "admin")) {
    redirect("/");
  }

  // Fetch all OrderProduct records where the Product belongs to this seller's business
  const requests = await prisma.orderProduct.findMany({
    where: user.role === "admin" ? {} : {
      product: {
        businessId: user.businessId
      }
    },
    include: {
      product: true,
      order: {
        include: {
          user: {
            include: {
              business: true
            }
          }
        }
      }
    },
    orderBy: {
      order: {
        createdAt: "desc"
      }
    }
  });

  const getStatusConfig = (status: string) => {
    switch(status) {
      case 'PENDING': return { color: 'text-amber-600 bg-amber-50', icon: Clock, text: 'Pending' };
      case 'PROCESSING': return { color: 'text-blue-600 bg-blue-50', icon: Package, text: 'Processing' };
      case 'SHIPPED': return { color: 'text-indigo-600 bg-indigo-50', icon: Truck, text: 'Shipped' };
      case 'COMPLETED': return { color: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2, text: 'Completed' };
      case 'CANCELLED': return { color: 'text-red-600 bg-red-50', icon: XCircle, text: 'Cancelled' };
      default: return { color: 'text-zinc-600 bg-zinc-50', icon: Package, text: status };
    }
  };

  return (
    <div className="space-y-10 pb-20">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full w-fit">
            <Package size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Inventory Flow</span>
          </div>
          <h1 className="text-4xl font-black text-zinc-900 font-heading tracking-tight">Buyer Requests</h1>
          <p className="text-zinc-500 font-medium">Detailed breakdown of product demands by individual buyers.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input 
              type="text" 
              placeholder="Search buyers or products..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-zinc-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
            />
          </div>
          <button className="p-3 bg-white border border-zinc-100 rounded-2xl text-zinc-600 hover:bg-zinc-50 transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Units Requested</p>
          <p className="text-3xl font-black text-zinc-900">{requests.reduce((acc, r) => acc + r.quantity, 0)}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total Volume Value</p>
          <p className="text-3xl font-black text-zinc-900">
            ${requests.reduce((acc, r) => acc + (Number(r.price) * r.quantity), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Unique Buyers</p>
          <p className="text-3xl font-black text-zinc-900">
            {new Set(requests.map(r => r.order.userId)).size}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
        {requests.length === 0 ? (
          <div className="px-8 py-20 text-center">
            <div className="space-y-4 max-w-xs mx-auto">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200 mx-auto">
                <Package size={32} />
              </div>
              <p className="text-zinc-400 font-black uppercase tracking-widest text-xs">No buyer requests found for your products</p>
            </div>
          </div>
        ) : (
          <SellerRequestsList requests={requests} />
        )}
      </div>
    </div>
  );
}
