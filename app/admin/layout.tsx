import { auth } from "@/auth";
import AdminSidebar from "@/components/AdminSidebar";
import Link from "next/link";
import LoginForm from "@/components/LoginForm";
import prisma from "@/lib/prisma";
import { adminNavItems } from "@/lib/navigation";
import MobileNav from "@/components/MobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const userCount = await prisma.user.count();

  // 1. BOOTSTRAP MODE: If no users exist, allow public access to create the first admin
  if (userCount === 0) {
    return <>{children}</>;
  }

  // 2. LOGIN MODE: If users exist but no session, show login form
  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
        <div className="max-w-sm w-full p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-6 text-center">
           <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 w-12 h-12 flex items-center justify-center rounded-xl mx-auto text-xl font-bold">
            B2B
          </div>
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <LoginForm />
        </div>
      </div>
    );
  }

  // 3. PROTECTED ADMIN CHECK
  const isAdmin = (session.user as any).role === "admin";

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-zinc-500">This area is reserved for Administrators.</p>
        <Link href="/" className="mt-8 px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-950">
      <MobileNav items={adminNavItems} title="Admin Panel" badge="B2B" badgeColor="bg-zinc-900" />
      <AdminSidebar user={session.user} />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
