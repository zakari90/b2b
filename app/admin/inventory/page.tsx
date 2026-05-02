import CreateProductSection from "@/components/CreateProductSection";
import ProductList from "@/components/ProductList";
import { getProducts } from "@/app/actions";

export default async function InventoryPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ page?: string }> 
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const { products, totalPages, total } = await getProducts(page, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Inventory Control</h1>
        <p className="text-zinc-500 mt-1">Manage products, stock levels, and pricing.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        <div className="xl:col-span-3">
          <section className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
               <h2 className="text-xl font-bold flex items-center gap-2">
                <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                Product List
              </h2>
              <span className="text-sm text-zinc-500 font-medium">{total} products in total</span>
            </div>
            <div className="p-0">
              <ProductList 
                products={products} 
                canDelete={true} 
                canEdit={true} 
                currentPage={page}
                totalPages={totalPages}
              />
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="w-2 h-6 bg-orange-500 rounded-full"></span>
              Add Product
            </h2>
            <CreateProductSection />
          </section>
        </div>
      </div>
    </div>
  );
}
