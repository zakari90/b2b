import CreateProductSection from "@/components/CreateProductSection";
import ProductList from "@/components/ProductList";
import { hasPermission } from "@/lib/permissions";
import { getProducts } from "@/app/actions";
import { auth } from "@/auth";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Manager Inventory</h1>
        <p className="text-zinc-500 mt-1">Manage products and stock levels.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          {canViewItems ? (
            <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                 <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                  Product List
                </h2>
                <span className="text-sm text-zinc-500 font-medium">{total} products</span>
              </div>
              <ProductList 
                products={products} 
                canDelete={canDeleteItem} 
                canEdit={canEditItem} 
                currentPage={page}
                totalPages={totalPages}
              />
            </section>
          ) : (
            <div className="p-12 text-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500">
              You don't have permission to view products.
            </div>
          )}
        </div>

        <div className="space-y-6">
          {canCreateItem && (
            <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
                Add Product
              </h2>
              <CreateProductSection />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
