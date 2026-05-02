"use client";

import { useState } from "react";
import UserForm from "./UserForm";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";

export default function ProvisionUserDialog({ disableAdmin }: { disableAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-zinc-950 hover:bg-black text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-zinc-500/20 py-6 group">
          <UserPlus size={18} className="mr-2 group-hover:scale-110 transition-transform" />
          Provision Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden">
        <DialogHeader className="p-8 pb-0">
          <DialogTitle className="text-2xl font-black uppercase tracking-tight font-heading">New Identity</DialogTitle>
          <p className="text-zinc-500 text-sm font-medium">Create a new user profile with specific access roles.</p>
        </DialogHeader>
        <div className="p-8">
          <UserForm disableAdmin={disableAdmin} onSuccess={() => setOpen(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
