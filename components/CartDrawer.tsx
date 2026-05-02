"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { placeBulkOrder } from "@/app/actions";
import { Button } from "@/components/ui/button";

export default function CartDrawer() {
  const { products, removeFromCart, updateQuantity, totalPrice, clearCart, totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (products.length === 0) return;
    setIsCheckingOut(true);
    setError(null);

    const result = await placeBulkOrder(products.map(p => ({ 
      productId: p.id, 
      quantity: p.quantity, 
      price: p.price 
    })));

    if (result?.error) {
      setError(result.error);
    } else {
      clearCart();
      setIsOpen(false);
      alert("Order placed successfully!");
    }
    setIsCheckingOut(false);
  };

  return (
    <>
      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-zinc-900 text-white p-4 rounded-2xl shadow-2xl z-40 hover:scale-110 transition-all flex items-center gap-3 border border-zinc-800"
      >
        <span className="text-xl">🛒</span>
        {totalItems > 0 && (
          <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-1 rounded-full absolute -top-2 -right-2 min-w-[20px]">
            {totalItems}
          </span>
        )}
        <span className="font-bold text-sm hidden md:inline">View Cart</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-all"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-[60] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b flex justify-between items-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter italic">Your Cart</h2>
            <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-900">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {products.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <div className="text-5xl opacity-20">🛒</div>
                <p className="text-zinc-400 font-medium italic">Your cart is empty.</p>
              </div>
            ) : (
              products.map(product => (
                <div key={product.id} className="flex justify-between items-start border-b border-zinc-50 dark:border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <h3 className="font-bold">{product.name}</h3>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold">{product.publisher || "Global"}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, product.quantity - 1)}
                        className="w-6 h-6 rounded-md"
                      >-</Button>
                      <span className="text-sm font-bold">{product.quantity}</span>
                      <Button 
                        variant="outline"
                        size="icon"
                        onClick={() => updateQuantity(product.id, product.quantity + 1)}
                        className="w-6 h-6 rounded-md"
                      >+</Button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">${(product.price * product.quantity).toFixed(2)}</p>
                    <button 
                      onClick={() => removeFromCart(product.id)}
                      className="text-[10px] text-red-400 hover:text-red-600 font-bold uppercase mt-2 transition-colors"
                    >Remove</button>
                  </div>
                </div>
              ))
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-xs font-bold">
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-zinc-50 dark:bg-zinc-800/50 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-zinc-500 font-bold uppercase text-xs">Subtotal</span>
              <span className="text-2xl font-black italic">${totalPrice.toFixed(2)}</span>
            </div>
            <Button 
              size="lg"
              onClick={handleCheckout}
              disabled={products.length === 0 || isCheckingOut}
              className="w-full bg-zinc-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all h-14"
            >
              {isCheckingOut ? "Processing..." : "Complete Checkout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
