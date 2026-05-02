import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import CreateProductSection from "@/components/CreateProductSection";
import { hasPermission } from "@/lib/permissions";
import { redirect } from "next/navigation";

export default async function ManagerDashboard() {
  const session = await auth();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" }
  });
  if (!user) redirect("/");

  const businessId = user.businessId;
  const isAdmin = user.role === "admin";

  // Real Stats
  const productCount = await prisma.product.count({
    where: {
      businessId,
      ...(isAdmin ? {} : { publisher: user.username })
    }
  });

  const pendingOrders = await prisma.order.count({
    where: {
      businessId,
      status: "PENDING"
    }
  });

  const completedOrders = await prisma.order.findMany({
    where: {
      businessId,
      status: "COMPLETED"
    },
    select: { total: true }
  });

  const totalRevenue = completedOrders.reduce((sum, order) => sum + Number(order.total), 0);

  const recentProducts = await prisma.product.findMany({
    where: {
      businessId,
      ...(isAdmin ? {} : { publisher: user.username })
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });
  
  const canCreateItem = await hasPermission("create_item");
  
  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">Manager Dashboard</h1>
          <p className="text-zinc-500 mt-2 text-lg">Welcome, {session.user?.name}. Here's your business overview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ManagerStatCard 
          title="Total Products" 
          value={productCount} 
          icon="📦" 
          color="bg-blue-500" 
        />
        <ManagerStatCard 
          title="Pending Orders" 
          value={pendingOrders} 
          icon="⏳" 
          color="bg-orange-500" 
        />
        <ManagerStatCard 
          title="Total Revenue" 
          value={`$${totalRevenue.toFixed(2)}`} 
          icon="📈" 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Recent Products
              </h2>
              <a href="/manager/inventory" className="text-sm text-blue-600 hover:underline font-medium">View All</a>
            </div>
            <div className="overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-zinc-400 text-[10px] uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-800">
                    <th className="pb-3">Name</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                  {recentProducts.map(product => (
                    <tr key={product.id}>
                      <td className="py-4 font-medium text-sm">{product.name}</td>
                      <td className="py-4 text-right text-sm text-zinc-500">${Number(product.price).toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${product.quantity < 10 ? 'bg-red-50 text-red-600' : 'bg-zinc-100 text-zinc-600'}`}>
                          {product.quantity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          {canCreateItem && (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                Add New Product
              </h2>
              <CreateProductSection />
            </div>
          )}

          <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <ActivityItem 
                user="John Doe" 
                action="Added 50 units" 
                time="2h ago" 
                icon="➕"
              />
              <ActivityItem 
                user="Jane Smith" 
                action="Updated price" 
                time="5h ago" 
                icon="✏️"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function ManagerStatCard({ title, value, icon, color }: { title: string, value: any, icon: string, color: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
      <div className={`absolute top-0 right-0 w-24 h-24 ${color} opacity-[0.05] rounded-bl-full`}></div>
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-3xl">{icon}</span>
          <span className={`w-2 h-2 rounded-full ${color}`}></span>
        </div>
        <div>
          <div className="text-zinc-500 text-sm font-medium">{title}</div>
          <div className="text-3xl font-bold mt-1 text-zinc-900 dark:text-zinc-50">{value}</div>
        </div>
      </div>
    </div>
  );
}

function ActivityItem({ user, action, time, icon }: { user: string, action: string, time: string, icon: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 flex items-center justify-center shadow-sm text-lg">
          {icon}
        </div>
        <div>
          <div className="font-bold text-sm">{user}</div>
          <div className="text-xs text-zinc-500">{action}</div>
        </div>
      </div>
      <div className="text-[10px] font-bold text-zinc-400 whitespace-nowrap">{time}</div>
    </div>
  );
}
