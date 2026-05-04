# 📽️ Project Presentation: B2B Storefront

## 🎯 The Vision
To bridge the gap between traditional wholesale and modern ecommerce by providing a high-performance, real-time platform for B2B transactions.

---

## 🏗️ Architecture & Tech Stack
-   **Next.js 15 (App Router)**: For server-side rendering and optimal performance.
-   **Prisma 7 & Supabase**: Robust data modeling and reliable PostgreSQL hosting.
-   **Auth.js v5**: Secure, role-based access control (Admin, Seller, Buyer).
-   **Serwist PWA**: Delivering a native app experience on mobile and desktop.
-   **Web-Push**: Keeping users engaged with real-time browser notifications.

---

## 🌟 Key Innovations

### 1. 💬 Real-Time Order Discussion
We've moved beyond static orders. Every transaction now has a dedicated **Negotiation Drawer**, allowing buyers and sellers to:
-   Clarify product details.
-   Negotiate pricing or delivery terms.
-   Keep a full history of communication tied to the specific order.

### 2. 🔔 Proactive Notifications
No more manual checking. Users stay informed via **Native Push Notifications**:
-   **Sellers** are notified when a new order arrives.
-   **Buyers** are notified when their order status changes (Shipped/Completed).
-   **Both parties** receive alerts for new messages.

### 3. 📱 Full PWA Integration
-   **Installable**: Works as a standalone app on iOS, Android, and Desktop.
-   **Performance**: Optimized caching for lightning-fast loads.
-   **Offline Ready**: Core features remain accessible even with spotty connectivity.

---

## 📊 Business Logic
-   **Dynamic Pricing & Inventory**: Automatic stock decrementing on purchase.
-   **Role-Based Visibility**: Sellers only see their own products and relevant buyer requests, ensuring data privacy and focused management.
-   **Global Admin Oversight**: One-click user approval and business monitoring.

---

## 🛠️ Infrastructure Resilience
-   **IPv4 Compatibility**: Specialized Supavisor Pooler integration to support all network environments.
-   **Supabase Storage**: Integrated CDN-backed image handling for product catalogs.

---

## 🚀 Future Roadmap
-   **Analytics Dashboard**: Visualizing sales trends and inventory turnover.
-   **Bulk CSV Import**: Allowing sellers to upload thousands of products instantly.
-   **Multi-Currency Support**: For global B2B operations.
