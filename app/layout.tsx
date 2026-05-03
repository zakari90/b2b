import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Script from "next/script";
import { Inter, Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import PWAWrapper from "@/components/pwa/PWAWrapper";

const outfitHeading = Outfit({
  subsets: ["latin"],
  variable: "--font-heading",
});

const interSans = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "B2B Storefront",
  description: "Premium B2B Inventory Solutions and Storefront",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "B2B Store",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased",
        "font-sans",
        interSans.variable,
        outfitHeading.variable,
      )}
    >
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="min-h-full flex flex-col">
        <PWAWrapper>
          <CartProvider>{children}</CartProvider>
        </PWAWrapper>
      </body>
    </html>
  );
}
