"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginForm() {
  const [state, action, isPending] = useActionState(login, null);

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
          className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-blue-600 transition-all"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs font-black uppercase text-zinc-400 ml-1">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-blue-600 transition-all"
        />
      </div>

      {state?.error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl animate-in fade-in slide-in-from-top-1">
          {state.error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all"
      >
        {isPending ? "Verifying..." : "Access Portal"}
      </Button>
    </form>
  );
}
