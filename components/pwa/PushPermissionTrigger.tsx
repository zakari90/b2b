"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";

export default function PushPermissionTrigger() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!("Notification" in window)) {
      setPermission("unsupported");
    } else {
      setPermission(Notification.permission);
    }
  }, []);

  const subscribe = async () => {
    setLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        const registration = await navigator.serviceWorker.ready;
        
        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
          });
        }

        await fetch("/api/push/subscribe", {
          method: "POST",
          body: JSON.stringify(subscription),
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("Failed to subscribe:", error);
    } finally {
      setLoading(false);
    }
  };

  if (permission === "unsupported") return null;

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${
          permission === "granted" ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
        }`}>
          {permission === "granted" ? <CheckCircle2 size={24} /> : <Bell size={24} />}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">
            {permission === "granted" ? "Notifications Enabled" : "Enable Push Notifications"}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {permission === "granted" 
              ? "You'll receive real-time updates about your orders and inventory."
              : "Get notified about new orders, price changes, and stock updates."}
          </p>
          
          {permission === "default" && (
            <button
              onClick={subscribe}
              disabled={loading}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {loading ? "Subscribing..." : "Enable Notifications"}
            </button>
          )}

          {permission === "denied" && (
            <p className="mt-4 text-xs text-red-500 flex items-center gap-1">
              <BellOff size={14} />
              Notifications are blocked. Please enable them in your browser settings.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
