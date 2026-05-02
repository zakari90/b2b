"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";

export default function AddToCartButton({ product }: { product: any }) {
  const { addToCart } = useCart();

  const handleAdd = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      publisher: product.publisher
    });
  };

  return (
    <Button 
      onClick={handleAdd}
      className="rounded-lg font-bold shadow-sm"
    >
      Add to Cart
    </Button>
  );
}
