import Link from "next/link";
import { WifiOff } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 px-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full text-red-600">
            <WifiOff size={48} />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">You're Offline</h1>
        <p className="text-slate-600 mb-8">
          It looks like you've lost your internet connection. Don't worry, you can still access some features of the app.
        </p>
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 px-4 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Try Refreshing
          </button>
          <Link 
            href="/"
            className="block w-full py-3 px-4 bg-slate-100 text-slate-900 rounded-lg font-medium hover:bg-slate-200 transition-colors"
          >
            Go to Dashboard
          </Link>
        </div>
        <p className="mt-8 text-sm text-slate-400">
          The app will automatically reconnect when you're back online.
        </p>
      </div>
    </div>
  );
}
