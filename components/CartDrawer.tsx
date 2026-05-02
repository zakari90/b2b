"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { placeBulkOrder } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { ShoppingBag, X, Trash2, Plus, Minus, AlertCircle } from "lucide-react";

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
      // We could use a better toast here later
      alert("Order placed successfully!");
    }
    setIsCheckingOut(false);
  };

  return (
    <>
      {/* Floating Cart Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white p-4 rounded-2xl shadow-[0_20px_50px_rgba(79,70,229,0.3)] z-40 hover:scale-110 active:scale-95 transition-all flex items-center gap-3 border border-indigo-500 group"
      >
        <div className="relative">
          <ShoppingBag size={24} className="group-hover:rotate-12 transition-transform" />
          {totalItems > 0 && (
            <span className="bg-white text-indigo-600 text-[10px] font-black px-1.5 py-0.5 rounded-full absolute -top-3 -right-3 min-w-[20px] shadow-lg animate-in zoom-in duration-300">
              {totalItems}
            </span>
          )}
        </div>
        <span className="font-black text-sm hidden md:inline uppercase tracking-widest">My Cart</span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/60 backdrop-blur-md z-50 transition-all animate-in fade-in duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 z-[60] shadow-2xl transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-zinc-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <ShoppingBag size={20} />
              </div>
              <h2 className="text-xl font-black uppercase tracking-widest font-heading">Cart <span className="text-zinc-300 ml-1">({totalItems})</span></h2>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8">
            {products.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-200">
                  <ShoppingBag size={48} />
                </div>
                <div className="space-y-2">
                  <p className="text-zinc-900 font-black uppercase tracking-widest text-sm">Your cart is empty</p>
                  <p className="text-zinc-400 text-sm max-w-[200px] mx-auto">Looks like you haven't added anything to your order yet.</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl font-bold border-zinc-200"
                >
                  Start Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {products.map(product => (
                  <div key={product.id} className="group flex gap-4 items-center pb-6 border-b border-zinc-50 last:border-0">
                    <div className="w-16 h-16 bg-zinc-100 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-zinc-300 font-black text-xl">{product.name[0]}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <h3 className="font-bold text-sm truncate">{product.name}</h3>
                      <p className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">{product.publisher || "Direct Global"}</p>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 border border-zinc-200">
                          <button 
                            onClick={() => updateQuantity(product.id, product.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-zinc-500 hover:text-zinc-900 transition-all"
                          ><Minus size={12} /></button>
                          <span className="w-8 text-center text-xs font-black">{product.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(product.id, product.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white text-zinc-500 hover:text-zinc-900 transition-all"
                          ><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <p className="font-black text-indigo-600 text-sm">${(product.price * product.quantity).toFixed(2)}</p>
                      <button 
                        onClick={() => removeFromCart(product.id)}
                        className="text-zinc-300 hover:text-red-500 transition-colors p-1"
                      ><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 text-xs font-bold flex items-center gap-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          <div className="p-8 border-t border-zinc-100 bg-white space-y-6">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Order Total</p>
                <p className="text-3xl font-black font-heading text-zinc-900 tracking-tighter">${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              {products.length > 0 && (
                <button 
                  onClick={clearCart}
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-500 transition-colors"
                >Clear All</button>
              )}
            </div>
            <Button 
              size="lg"
              onClick={handleCheckout}
              disabled={products.length === 0 || isCheckingOut}
              className="w-full bg-zinc-950 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl transition-all h-16 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-10 transition-opacity" />
              {isCheckingOut ? (
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </div>
              ) : "Checkout Now"}
            </Button>
            <p className="text-center text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
              Secure B2B Transaction · Tax calculated at checkout
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
