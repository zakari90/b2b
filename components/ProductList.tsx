"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/app/actions";
import ProductForm from "./ProductForm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
          <TableHeader className="bg-zinc-50 dark:bg-zinc-800/50">
            <TableRow>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider">Name</TableHead>
              <TableHead className="font-bold uppercase text-[10px] tracking-wider">Publisher</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-wider">Price</TableHead>
              <TableHead className="text-right font-bold uppercase text-[10px] tracking-wider">Qty</TableHead>
              {(canDelete || canEdit) && <TableHead className="text-right font-bold uppercase text-[10px] tracking-wider">Actions</TableHead>}
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt="" 
                        className="w-8 h-8 rounded object-cover border"
                      />
                    )}
                    <span>{product.name}</span>
                  </div>
                </TableCell>
                <TableCell className="text-zinc-500">{product.publisher || "-"}</TableCell>
                <TableCell className="text-right">${Number(product.price).toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={product.quantity < 5 ? "destructive" : "secondary"} className="text-[10px] font-bold">
                    {product.quantity}
                  </Badge>
                </TableCell>
                {(canDelete || canEdit) && (
                  <TableCell className="text-right space-x-2">
                    {canEdit && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setEditingProduct(product)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={async () => {
                          if (confirm("Delete this product?")) {
                            await deleteProduct(product.id);
                          }
                        }}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
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
