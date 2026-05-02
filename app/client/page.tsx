import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { getProducts } from "@/app/actions";
import AddToCartButton from "@/components/AddToCartButton";
import CartDrawer from "@/components/CartDrawer";

export default async function ClientPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const session = await auth();

  if (!session) redirect("/");

  // Fetch the current user to get their ID and orders
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

  // Check if the user has the 'buyer' or 'admin' role
  const hasAccess = (session.user as any).role === "buyer" || (session.user as any).role === "admin";

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4">This page is for Clients only.</p>
        <Link href="/" className="mt-8 underline">Back to Home</Link>
      </div>
    );
  }

  const { products, totalPages } = await getProducts(page, 6); // Fetch available products

  return (
    <div className="flex min-h-screen flex-col items-center p-8 bg-zinc-50 relative">
      <CartDrawer />
      <div className="max-w-6xl w-full space-y-12">
        <div className="flex justify-between items-center border-b pb-4">
          <h1 className="text-3xl font-bold">Client Portal</h1>
          <Link href="/" className="text-sm underline text-zinc-500">Back to Home</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Catalog Section */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold">Product Catalog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product: any) => (

                <div key={product.id} className="p-6 bg-white rounded-2xl border shadow-sm flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{product.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider">{product.publisher || "Global"}</p>
                    <p className="text-blue-600 font-bold mt-1">${Number(product.price).toFixed(2)}</p>
                    <p className="text-[10px] text-zinc-400 mt-1 uppercase font-black">{product.quantity} in stock</p>
                  </div>
                  <AddToCartButton product={product} />
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex gap-4 items-center justify-center pt-8">
                <Link 
                  href={`?page=${Math.max(1, page - 1)}`}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border ${page <= 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-zinc-100 transition-colors'}`}
                >
                  Previous
                </Link>
                <span className="text-sm font-medium text-zinc-500">Page {page} of {totalPages}</span>
                <Link 
                  href={`?page=${Math.min(totalPages, page + 1)}`}
                  className={`px-4 py-2 rounded-xl text-sm font-bold border ${page >= totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-zinc-100 transition-colors'}`}
                >
                  Next
                </Link>
              </div>
            )}
          </section>

          {/* Orders Section */}
          <section className="space-y-6">
            <h2 className="text-2xl font-bold">My Orders</h2>
            <div className="space-y-4">
              {user.orders.length === 0 && <p className="text-zinc-400 italic">No orders yet.</p>}
              {user.orders.map((order: any) => (

                <div key={order.id} className="p-4 bg-white rounded-xl border border-zinc-100 shadow-sm space-y-2">
                  <div className="flex justify-between text-xs font-bold uppercase text-zinc-400">
                    <span>Order #{order.id}</span>
                    <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="text-sm">
                    {order.products.map((op: any) => (

                      <div key={op.id} className="flex justify-between">
                        <span>{op.quantity}x {op.product.name}</span>
                        <span className="font-medium">${(Number(op.price) * op.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {order.status}
                    </span>
                    <span className="font-bold text-lg">${Number(order.total).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
