import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { updateOrderStatus } from "@/app/actions";

export default async function ManagerOrdersPage() {
  const session = await auth();
  if (!session) redirect("/");

  const user = await prisma.user.findUnique({
    where: { email: session.user?.email || "" },
  });

  if (!user || (user.role !== "saller" && user.role !== "admin")) {
    redirect("/");
  }

  // Fetch orders for this business
  const orders = await prisma.order.findMany({
    where: user.role === "admin" ? {} : { businessId: user.businessId },
    include: {
      user: true,
      products: {
        include: { product: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight">
          Order Management
        </h1>
        <p className="text-zinc-500 mt-1">
          Manage and track customer orders for your business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {orders.length === 0 ? (
          <div className="p-12 text-center bg-zinc-50 rounded-3xl border border-dashed text-zinc-400">
            No orders found.
          </div>
        ) : (
          orders.map((order: any) => (
            <div
              key={order.id}
              className="bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase text-zinc-400">
                      Order #{order.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        order.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : order.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : order.status === "SHIPPED"
                              ? "bg-blue-100 text-blue-700"
                              : order.status === "PROCESSING"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-zinc-100 text-zinc-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold">
                    Customer: {order.user.username}
                  </h3>
                  <p className="text-sm text-zinc-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black italic">
                    ${Number(order.total).toFixed(2)}
                  </p>

                  {/* Status Actions */}
                  <div className="flex gap-2 mt-4">
                    {order.status === "PENDING" && (
                      <form
                        action={async () => {
                          "use server";
                          await updateOrderStatus(order.id, "PROCESSING");
                        }}
                      >
                        <button className="text-[10px] font-black uppercase px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                          Process
                        </button>
                      </form>
                    )}
                    {order.status === "PROCESSING" && (
                      <form
                        action={async () => {
                          "use server";
                          await updateOrderStatus(order.id, "SHIPPED");
                        }}
                      >
                        <button className="text-[10px] font-black uppercase px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          Ship
                        </button>
                      </form>
                    )}
                    {order.status === "SHIPPED" && (
                      <form
                        action={async () => {
                          "use server";
                          await updateOrderStatus(order.id, "COMPLETED");
                        }}
                      >
                        <button className="text-[10px] font-black uppercase px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                          Complete
                        </button>
                      </form>
                    )}
                    {order.status !== "COMPLETED" &&
                      order.status !== "CANCELLED" && (
                        <form
                          action={async () => {
                            "use server";
                            await updateOrderStatus(order.id, "CANCELLED");
                          }}
                        >
                          <button className="text-[10px] font-black uppercase px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                            Cancel
                          </button>
                        </form>
                      )}
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 dark:border-zinc-800 pt-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-zinc-400 text-[10px] uppercase font-bold tracking-wider">
                      <th className="pb-3">Product</th>
                      <th className="pb-3 text-right">Qty</th>
                      <th className="pb-3 text-right">Price</th>
                      <th className="pb-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-50 dark:divide-zinc-800/50">
                    {order.products.map((op: any) => (
                      <tr key={op.id}>
                        <td className="py-3 font-medium">{op.product.name}</td>
                        <td className="py-3 text-right text-zinc-500">
                          {op.quantity}
                        </td>
                        <td className="py-3 text-right text-zinc-500">
                          ${Number(op.price).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-bold">
                          ${(Number(op.price) * op.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
