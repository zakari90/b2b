import { auth } from "@/auth";
import ManagerSidebar from "@/components/ManagerSidebar";
import Link from "next/link";
import { redirect } from "next/navigation";
import { managerNavItems } from "@/lib/navigation";
import MobileNav from "@/components/MobileNav";

export default async function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/");
  }

  // Check if the user has the 'saller' or 'admin' role
  const hasAccess = (session.user as any).role === "saller" || (session.user as any).role === "admin";

  if (!hasAccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-zinc-500">This area is reserved for Managers.</p>
        <Link href="/" className="mt-8 px-6 py-2 bg-blue-600 text-white rounded-full font-medium">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-zinc-50 dark:bg-zinc-950">
      <MobileNav items={managerNavItems} title="Manager Portal" badge="MGR" badgeColor="bg-blue-600" />
      <ManagerSidebar user={session.user} />
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
