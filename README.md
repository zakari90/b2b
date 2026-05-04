# 🚀 B2B Storefront

A premium, high-performance B2B Ecommerce platform built for modern wholesale commerce. This platform enables seamless interaction between Buyers and Sellers with real-time negotiation, granular inventory tracking, and full PWA support.

## ✨ Key Features

-   **🛡️ Multi-Role Architecture**: Specialized dashboards for **Administrators**, **Sellers**, and **Buyers**.
-   **💬 Order Discussion System**: Integrated real-time chat/negotiation drawer for every order, facilitating direct communication between parties.
-   **📦 Advanced Inventory**: Full product management with image uploads via Supabase Storage and ownership-based editing.
-   **🔔 PWA & Push Notifications**: Native-like experience with offline support and real-time push notifications for new orders, status updates, and messages.
-   **📈 Management Portals**: 
    -   **Admin**: Global oversight of users, businesses, and system health.
    -   **Seller**: Inventory control, request tracking, and order fulfillment.
    -   **Buyer**: Seamless ordering, cart management, and order history.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) via [Supabase](https://supabase.com/) & [Prisma ORM](https://www.prisma.io/)
-   **Authentication**: [Auth.js (NextAuth.v5)](https://authjs.dev/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
-   **PWA**: [@serwist/next](https://serwist.js.org/) for Service Worker management.
-   **Push Notifications**: [Web-Push](https://github.com/web-push-libs/web-push)

## 🚀 Getting Started

### 1. Prerequisites
-   Node.js 20+
-   pnpm (`npm install -g pnpm`)

### 2. Installation
```bash
pnpm install
```

### 3. Environment Variables
Create a `.env.local` file with the following:
```env
# Database (Supavisor Pooler recommended for IPv4 compatibility)
DATABASE_URL="postgresql://postgres.[PROJ_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJ_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Auth
AUTH_SECRET="your-secret"

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL="https://[PROJ_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
VAPID_SUBJECT="mailto:admin@example.com"
```

### 4. Database Setup
If your network is **IPv4-only**, ensure you use the **Supavisor Pooler** connection strings. Direct connections to Supabase often require IPv6.

Generate the Prisma client:
```bash
pnpm exec prisma generate
```

## 🌐 Deployment
This project is optimized for deployment on **Vercel**. Ensure all environment variables are mirrored in the Vercel Dashboard, specifically using the Pooler connection strings for database access.

## 📄 License
Private Repository - All Rights Reserved.
