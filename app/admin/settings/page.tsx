import { deleteAllData } from "@/app/actions";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">System Settings</h1>
        <p className="text-zinc-500 mt-1">Configure global application behavior and maintenance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div></div>

        <section className="bg-white dark:bg-zinc-900 p-8 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
          <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
          <p className="text-zinc-500 text-sm mb-6">
            Clearing the database will remove all users, roles, and data. This action is irreversible. 
            You will be logged out and the system will return to bootstrap mode.
          </p>
          <form
            action={async () => {
              "use server";
              await deleteAllData();
            }}
          >
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 dark:border-red-900/50 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
            >
              Reset Entire System
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
