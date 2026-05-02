"use client";

import { useState, useMemo } from "react";
import { useActionState } from "react";
import { createUser } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function UserForm({ 
  fixedRole,
  disableAdmin
}: { 
  fixedRole?: "admin" | "saller" | "buyer",
  disableAdmin?: boolean
}) {
  const [state, formAction, isPending] = useActionState(
    async (prevState: any, formData: FormData) => {
      return await createUser(formData);
    },
    null
  );

  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const strength = useMemo(() => {
    if (!password) return 0;
    let s = 0;
    if (password.length > 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  }, [password]);

  const strengthColor = [
    "bg-zinc-200",
    "bg-red-500",
    "bg-amber-500",
    "bg-blue-500",
    "bg-emerald-500"
  ][strength];

  const strengthText = [
    "Too short",
    "Weak",
    "Fair",
    "Good",
    "Strong"
  ][strength];

  return (
    <div className="space-y-8">
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
          {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl border border-emerald-200 text-sm font-bold animate-in fade-in slide-in-from-top-2">
          Registration successful! Redirecting...
        </div>
      )}

      <form action={formAction} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-black uppercase text-zinc-400 ml-1">Email Address</Label>
            <Input 
              id="email"
              name="email" 
              type="email" 
              required 
              onBlur={() => setTouched(t => ({ ...t, email: true }))}
              placeholder="zack@company.com"
              className={cn(
                "h-12 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-600 font-medium",
                touched.email && "invalid:border-red-500"
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-xs font-black uppercase text-zinc-400 ml-1">Username</Label>
            <Input 
              id="username"
              name="username" 
              type="text" 
              required 
              onBlur={() => setTouched(t => ({ ...t, username: true }))}
              placeholder="zakaria_dev"
              className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-600 font-medium"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="password_reg" className="text-xs font-black uppercase text-zinc-400 ml-1">Password</Label>
            <div className="space-y-3">
              <Input 
                id="password_reg"
                name="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-12 rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-indigo-600 font-medium"
              />
              
              {/* Strength Indicator */}
              <div className="space-y-2 px-1">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-400">Security Strength</span>
                  <span className={cn(
                    strength === 0 ? "text-zinc-300" : 
                    strength === 1 ? "text-red-500" :
                    strength === 2 ? "text-amber-500" :
                    strength === 3 ? "text-blue-500" : "text-emerald-500"
                  )}>{strengthText}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div 
                      key={step}
                      className={cn(
                        "h-full flex-1 transition-all duration-500 rounded-full",
                        strength >= step ? strengthColor : "bg-zinc-200"
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {!fixedRole && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="role" className="text-xs font-black uppercase text-zinc-400 ml-1">Account Type</Label>
              <select 
                id="role" 
                name="role" 
                className="flex h-12 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 transition-all"
              >
                <option value="buyer">Client / Buyer</option>
                <option value="saller">Manager / Seller</option>
                {!disableAdmin && <option value="admin">Administrator</option>}
              </select>
            </div>
          )}
          {fixedRole && <input type="hidden" name="role" value={fixedRole} />}
        </div>
        
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full h-12 bg-zinc-950 hover:bg-black text-white rounded-xl font-black uppercase tracking-widest shadow-xl transition-all mt-4"
        >
          {isPending ? "Creating Account..." : "Join Platform"}
        </Button>
      </form>
    </div>
  );
}
