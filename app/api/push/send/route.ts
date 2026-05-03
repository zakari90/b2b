import { NextResponse } from "next/server";
import webpush from "web-push";
import prisma from "@/lib/prisma";

// Configure web-push
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:admin@example.com",
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const { title, body, url } = await req.json();
    
    // Get all subscriptions (for testing, send to all)
    const subscriptions = await prisma.pushSubscription.findMany();

    const notifications = subscriptions.map((sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      return webpush.sendNotification(
        pushSubscription,
        JSON.stringify({ title, body, url })
      ).catch(async (err) => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          // Subscription expired or gone, remove it
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
        }
        console.error("Error sending notification:", err);
      });
    });

    await Promise.all(notifications);

    return NextResponse.json({ success: true, count: notifications.length });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
