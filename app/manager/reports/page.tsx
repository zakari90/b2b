import { hasPermission } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function ManagerReportsPage() {
  const canViewReports = await hasPermission("view_reports");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">Business Reports</h1>
        <p className="text-zinc-500 mt-1">Analytics and performance insights.</p>
      </div>

      {canViewReports ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReportCard 
            title="Sales Performance" 
            description="Track monthly revenue and growth." 
            icon="💰" 
            status="Up 12%"
          />
          <ReportCard 
            title="User Activity" 
            description="Analyze how clients interact with the site." 
            icon="👥" 
            status="Stable"
          />
          <ReportCard 
            title="Inventory Value" 
            description="Current total value of stock in warehouse." 
            icon="🏢" 
            status="$45,200"
          />
        </div>
      ) : (
        <div className="p-12 text-center bg-zinc-100 dark:bg-zinc-900 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-500 max-w-2xl mx-auto">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Access Restricted</h2>
          <p>You do not have the necessary permissions to view business reports. Please contact your administrator if you believe this is an error.</p>
        </div>
      )}
    </div>
  );
}

function ReportCard({ title, description, icon, status }: { title: string, description: string, icon: string, status: string }) {
  return (
    <div className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-2xl mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{title}</h3>
      <p className="text-sm text-zinc-500 mt-2">{description}</p>
      <div className="mt-6 flex justify-between items-center pt-4 border-t border-zinc-50 dark:border-zinc-800">
        <span className="text-xs font-bold text-zinc-400 uppercase">Current</span>
        <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
          {status}
        </span>
      </div>
    </div>
  );
}
