import CreateProductSection from "@/components/CreateProductSection";
import ProductList from "@/components/ProductList";
import { hasPermission } from "@/lib/permissions";
import { getProducts } from "@/app/actions";
import { auth } from "@/auth";
import { Package, Plus, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ManagerInventoryPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const session = await auth();
  
  const canViewItems = await hasPermission("view_items");
  const canCreateItem = await hasPermission("create_item");
  const canEditItem = await hasPermission("edit_item");
  const canDeleteItem = await hasPermission("delete_item");

  const { products, totalPages, total } = canViewItems 
    ? await getProducts(page, 10) 
    : { products: [], totalPages: 0, total: 0 };

  const lowStockCount = products.filter((p: any) => p.quantity < 10).length;

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-zinc-900 font-heading tracking-tight">Stock Terminal</h1>
          <p className="text-zinc-500 font-medium">Synchronize physical inventory with the digital storefront.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-8 space-y-8">
          {/* Summary Stats Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total SKU</p>
              <p className="text-2xl font-black text-zinc-900">{total}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-zinc-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-500 mb-1">Critical Stock</p>
              <p className="text-2xl font-black text-zinc-900">{lowStockCount}</p>
            </div>
          </div>

          {canViewItems ? (
            <section className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
                 <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <h2 className="text-lg font-black uppercase tracking-widest font-heading">Inventory Database</h2>
                </div>
              </div>
              <div className="p-2">
                <ProductList 
                  products={products} 
                  canDelete={canDeleteItem} 
                  canEdit={canEditItem} 
                  currentPage={page}
                  totalPages={totalPages}
                />
              </div>
            </section>
          ) : (
            <div className="p-12 text-center bg-white rounded-[2.5rem] border border-dashed border-zinc-200 text-zinc-400">
              Inventory logs restricted. Contact system owner.
            </div>
          )}
        </div>

        <div className="xl:col-span-4 space-y-6">
          {canCreateItem && (
            <CreateProductSection />
          )}
          
          {/* Legend or Quick Tips */}
          <section className="bg-zinc-900 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full" />
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-6">Stock Legend</h3>
            <div className="space-y-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Healthy (&gt;10 units)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Low Stock (&lt;10 units)</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Out of Stock</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
