"use client";

import { useActionState, useEffect, useState } from "react";
import { createProduct, updateProduct } from "@/app/actions";
import { Camera, X } from "lucide-react";

export default function ProductForm({ 
  initialData, 
  onSuccess 
}: { 
  initialData?: any, 
  onSuccess?: () => void 
}) {
  const [preview, setPreview] = useState<string | null>(initialData?.imageUrl || null);
  const [name, setName] = useState(initialData?.name || "");
  
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      if (initialData) {
        return await updateProduct(initialData.id, formData);
      }
      return await createProduct(formData);
    },
    null
  );

  useEffect(() => {
    if (state?.success && onSuccess) {
      onSuccess();
    }
  }, [state, onSuccess]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    const input = document.getElementById("image-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  return (
    <section className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 shadow-xl max-w-4xl mx-auto">
      <h2 className="text-2xl font-black mb-6 tracking-tight">{initialData ? "Edit Product" : "Add New Product"}</h2>
      
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-xl border border-red-200 text-sm font-medium animate-in fade-in slide-in-from-top-1">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-green-50 text-green-600 p-3 mb-6 rounded-xl border border-green-200 text-sm font-medium">
          Product {initialData ? "updated" : "added"} successfully!
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Side: Basic Info */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-end mb-1.5 px-1">
                <label className="block text-xs font-black uppercase text-zinc-400 tracking-widest">Product Name</label>
                <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                  {name.length}/100
                </span>
              </div>
              <input 
                name="name" 
                type="text" 
                required 
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition-all shadow-sm" 
                placeholder="e.g. Industrial Processor X1" 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 tracking-wider">Price ($)</label>
                <input 
                  name="price" 
                  type="number" 
                  step="0.01" 
                  required 
                  defaultValue={initialData?.price}
                  className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 tracking-wider">Stock Quantity</label>
                <input 
                  name="quantity" 
                  type="number" 
                  required 
                  defaultValue={initialData?.quantity}
                  className="w-full bg-zinc-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-zinc-900 outline-none transition-all" 
                  placeholder="0" 
                />
              </div>
            </div>
          </div>

          {/* Right Side: Image Upload */}
          <div>
            <label className="block text-xs font-bold uppercase text-zinc-400 mb-1.5 tracking-wider">Product Photo</label>
            <div className="relative group">
              <div 
                className={`
                  aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all
                  ${preview ? 'border-zinc-200' : 'border-zinc-300 hover:border-zinc-900 bg-zinc-50'}
                `}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button"
                      onClick={clearImage}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur rounded-full shadow-lg text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </>
                ) : (
                  <div className="text-center p-6 cursor-pointer" onClick={() => document.getElementById('image-input')?.click()}>
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-zinc-400">
                      <Camera size={24} />
                    </div>
                    <p className="text-xs font-bold text-zinc-600">Click to upload photo</p>
                    <p className="text-[10px] text-zinc-400 mt-1">PNG, JPG up to 5MB</p>
                  </div>
                )}
              </div>
              <input 
                id="image-input"
                name="image" 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            type="submit" 
            disabled={isPending}
            className="flex-1 bg-zinc-900 text-white py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-zinc-800 disabled:opacity-50 transition-all shadow-lg active:scale-[0.98]"
          >
            {isPending ? (initialData ? "Syncing..." : "Publishing...") : (initialData ? "Update Product" : "Publish to Inventory")}
          </button>
          {initialData && (
            <button 
              type="button" 
              onClick={onSuccess}
              className="px-6 bg-zinc-100 text-zinc-600 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

