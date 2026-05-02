"use client";

import { useState } from "react";
import ProductForm from "./ProductForm";
import { Button } from "@/components/ui/button";

export default function CreateProductSection() {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4">
      <Button
        onClick={() => setShowForm(!showForm)}
        variant={showForm ? "outline" : "default"}
        className="w-full font-bold"
      >
        {showForm ? "✕ Close Form" : "+ Create New Product"}
      </Button>

      {showForm && (
        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
          <ProductForm onSuccess={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}
