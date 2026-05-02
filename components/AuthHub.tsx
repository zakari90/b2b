"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import LoginForm from "@/components/LoginForm";
import UserForm from "@/components/UserForm";
import { cn } from "@/lib/utils";

export default function AuthHub() {
  const [activeTab, setActiveTab] = useState<"signin" | "client" | "manager">("signin");

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Tab Switcher */}
      <div className="flex p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
        <button
          onClick={() => setActiveTab("signin")}
          className={cn(
            "flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === "signin" 
              ? "bg-white text-zinc-950 shadow-lg" 
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          Sign In
        </button>
        <button
          onClick={() => setActiveTab("client")}
          className={cn(
            "flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === "client" 
              ? "bg-white text-blue-600 shadow-lg" 
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          Client
        </button>
        <button
          onClick={() => setActiveTab("manager")}
          className={cn(
            "flex-1 py-3 text-sm font-black uppercase tracking-widest rounded-xl transition-all",
            activeTab === "manager" 
              ? "bg-white text-indigo-600 shadow-lg" 
              : "text-zinc-500 hover:text-zinc-800"
          )}
        >
          Manager
        </button>
      </div>

      {/* Form Content */}
      <Card className="rounded-[2.5rem] shadow-2xl border-zinc-200 overflow-hidden bg-white">
        <div className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-3xl font-black font-heading text-zinc-900">
            {activeTab === "signin" && "Welcome Back"}
            {activeTab === "client" && "Create Client Account"}
            {activeTab === "manager" && "Register as Manager"}
          </CardTitle>
          <CardDescription className="text-zinc-500 font-medium">
            {activeTab === "signin" && "Enter your credentials to access your portal"}
            {activeTab === "client" && "Join our platform to browse and order inventory"}
            {activeTab === "manager" && "Manage products and process business orders"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {activeTab === "signin" && <LoginForm />}
          {activeTab === "client" && <UserForm fixedRole="buyer" />}
          {activeTab === "manager" && <UserForm fixedRole="saller" />}
        </CardContent>
      </Card>
    </div>
  );
}
