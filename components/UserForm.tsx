"use client";

import { useActionState } from "react";
import { createUser } from "@/app/actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="space-y-6">
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg border border-red-200 text-sm font-medium">
          <b>Error:</b> {state.error}
        </div>
      )}

      {state?.success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-lg border border-green-200 text-sm font-medium">
          <b>Success!</b> User created successfully.
        </div>
      )}

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="block text-xs font-bold uppercase text-zinc-500">Email Address</Label>
            <Input 
              id="email"
              name="email" 
              type="email" 
              required 
              placeholder="user@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username" className="block text-xs font-bold uppercase text-zinc-500">Username</Label>
            <Input 
              id="username"
              name="username" 
              type="text" 
              required 
              placeholder="johndoe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="block text-xs font-bold uppercase text-zinc-500">Password</Label>
            <Input 
              id="password"
              name="password" 
              type="password" 
              required 
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            {fixedRole ? (
              <input type="hidden" name="role" value={fixedRole} />
            ) : (
              <>
                <Label htmlFor="role" className="block text-xs font-bold uppercase text-zinc-500">Assign Role</Label>
                <select id="role" name="role" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="buyer">Buyer</option>
                  <option value="saller">Saller (Manager)</option>
                  {!disableAdmin && <option value="admin">Admin</option>}
                </select>
              </>
            )}
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={isPending}
          className="w-full md:w-auto mt-2"
        >
          {isPending ? "Processing..." : "Create Account"}
        </Button>
      </form>
    </div>
  );
}
