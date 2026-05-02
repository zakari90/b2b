"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions";
import ProductForm from "./ProductForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";

export default function ProductList({ 
  products, 
  canDelete = false, 
  canEdit = false,
  currentPage = 1,
  totalPages = 1
}: { 
  products: any[], 
  canDelete?: boolean,
  canEdit?: boolean,
  currentPage?: number,
  totalPages?: number
}) {
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const router = useRouter();

  return (
    <div className="space-y-6">
      {editingProduct && (
        <div className="mb-8">
          <ProductForm 
            initialData={editingProduct} 
            onSuccess={() => setEditingProduct(null)} 
          />
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50/50">
            <TableRow className="hover:bg-transparent border-zinc-100">
              <TableHead className="font-black uppercase text-[10px] tracking-widest text-zinc-400 py-4">Product Details</TableHead>
              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-zinc-400 py-4">Wholesale Price</TableHead>
              <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-zinc-400 py-4">Stock Level</TableHead>
              {(canDelete || canEdit) && <TableHead className="text-right font-black uppercase text-[10px] tracking-widest text-zinc-400 py-4">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 && (
              <TableRow>
                <TableCell colSpan={(canDelete || canEdit) ? 5 : 4} className="h-24 text-center text-zinc-400 italic">
                  No products in inventory.
                </TableCell>
              </TableRow>
            )}
            {products.map((product: any) => (

              <TableRow 
                key={product.id}
                className={cn(
                  "group transition-colors",
                  product.quantity < 10 && "bg-amber-50/30 hover:bg-amber-50/50"
                )}
              >
                <TableCell className="relative">
                  {product.quantity < 10 && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                  )}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-zinc-200">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt="" 
                          className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                      ) : (
                        <span className="text-zinc-300 font-black text-xs uppercase tracking-widest">{product.name[0]}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-black text-sm text-zinc-900 group-hover:text-indigo-600 transition-colors">{product.name}</p>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{product.publisher || "Global Source"}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <p className="font-black text-sm text-zinc-900">${Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end">
                    <Badge 
                      variant={product.quantity <= 0 ? "destructive" : product.quantity < 10 ? "secondary" : "outline"} 
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2 py-0.5",
                        product.quantity < 10 && product.quantity > 0 && "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200"
                      )}
                    >
                      {product.quantity <= 0 ? "Out of Stock" : product.quantity < 10 ? `Low Stock: ${product.quantity}` : `${product.quantity} Units`}
                    </Badge>
                  </div>
                </TableCell>
                {(canDelete || canEdit) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {canEdit && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setEditingProduct(product)}
                          className="h-8 w-8 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
                        >
                          <Pencil size={14} />
                        </Button>
                      )}
                      {canDelete && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={async () => {
                            if (confirm("Permanently delete this product from inventory?")) {
                              await deleteProduct(product.id);
                            }
                          }}
                          className="h-8 w-8 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 rounded-xl border border-zinc-200">
          <button 
            disabled={currentPage <= 1}
            onClick={() => router.push(`?page=${currentPage - 1}`)}
            className="px-4 py-2 text-xs font-bold bg-zinc-100 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-zinc-500">
            Page {currentPage} of {totalPages}
          </span>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => router.push(`?page=${currentPage + 1}`)}
            className="px-4 py-2 text-xs font-bold bg-zinc-100 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
