"use client";

import { useState } from "react";
import { useActionState } from "react";
import { login } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username" className="text-xs font-black uppercase text-zinc-400 ml-1">
          Username
        </Label>
        <Input
          id="username"
          name="username"
          type="text"
          required
          placeholder="zakaria_dev"
          className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-600 transition-all font-medium"
        />
      </div>
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <Label htmlFor="password" className="text-xs font-black uppercase text-zinc-400">
            Password
          </Label>
          <a href="#" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors">
            Forgot Password?
          </a>
        </div>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            placeholder="••••••••"
            className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-600 transition-all font-medium pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-1">
          {state.error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 transition-all"
      >
        {isPending ? "Verifying..." : "Access Portal"}
      </Button>
    </form>
  );
}
