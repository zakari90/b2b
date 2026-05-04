"use server";
// Prisma types updated with publisher field

import prisma from "@/lib/prisma";
// Force recompile: 2026-05-01 19:12
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/permissions";
import { uploadImage } from "@/lib/supabase";

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as any) || "buyer";

  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if email or username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return { error: "A user with this email already exists." };
    }
    return { error: "This username is already taken." };
  }

  const session = await auth();
  let businessId: number;

  if (session?.user?.businessId) {
    businessId = session.user.businessId;
  } else {
    // Public registration
    let defaultBusiness = await prisma.business.findFirst();
    if (!defaultBusiness) {
      defaultBusiness = await prisma.business.create({
        data: { name: "Default Business" }
      });
    }
    businessId = defaultBusiness.id;
  }

  const adminCount = await (prisma.user as any).count({ where: { role: "admin" } });
  
  // Enforce "Only One Admin" rule
  if (role === "admin" && adminCount > 0) {
    return { error: "The system already has an administrator. Only one admin account is permitted." };
  }

  const status = (adminCount === 0 || session?.user?.role === "admin") ? "ACTIVE" : "PENDING";

  try {
    await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        businessId,
        role,
        status,
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("User creation error:", e);
    return { error: "Failed to create user." };
  }
}

export async function login(prevState: any, formData: FormData) {
  try {
    await signIn("credentials", {
      ...Object.fromEntries(formData),
      redirect: true,
      redirectTo: "/",
    });
  } catch (error: any) {
    // 1. Check if it's a redirect (Normal success behavior for Auth.js v5)
    if (error.message === "NEXT_REDIRECT") {
      throw error; 
    }

    // 2. Handle known credential errors
    if (error.type === "CredentialsSignin") {
      return { error: "Invalid username or password." };
    }

    // 3. Handle custom ACCOUNT_NOT_ACTIVE error
    if (error.cause?.err?.message === "ACCOUNT_NOT_ACTIVE" || error.message?.includes("ACCOUNT_NOT_ACTIVE")) {
      return { error: "Your account is pending approval. Please contact an administrator." };
    }

    console.error("Login error details:", error);
    return { error: "Authentication failed. Please try again." };
  }
}

export async function logout() {
  await signOut({ redirectTo: "/" });
}

export async function deleteAllData() {
  // Clear everything in the correct order
  await prisma.orderProduct.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();
  await prisma.business.deleteMany();

  await signOut();
  redirect("/");
}

export async function ensureDefaultBusiness() {
  // 0. Ensure a Business exists
  let business = await prisma.business.findFirst();
  if (!business) {
    business = await prisma.business.create({
      data: { name: "B2B Storefront" }
    });
  }
  return business;
}

export async function createProduct(formData: FormData) {
  const canCreate = await hasPermission("create_item");
  if (!canCreate) return { error: "You do not have permission to create products." };

  const session = await auth();
  if (!session?.user?.email || !session.user.businessId) return { error: "You must be logged in to create products." };

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  const creatorName = user?.username || "Unknown";

  const name = formData.get("name") as string;
  const priceStr = formData.get("price") as string;
  const quantityStr = formData.get("quantity") as string;
  const publisher = creatorName;
  const businessId = session.user.businessId;

  if (!name || !priceStr || !quantityStr) {
    return { error: "All fields are required." };
  }

  const price = parseFloat(priceStr);
  const quantity = parseInt(quantityStr);

  if (isNaN(price) || isNaN(quantity)) {
    return { error: "Invalid price or quantity." };
  }

  // Handle Image Upload
  let imageUrl = null;
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadImage(imageFile);
    } catch (e: any) {
      console.error("Image upload failed:", e);
      // We'll continue without image or return error? Let's return error for now to be explicit.
      return { error: `Image upload failed: ${e.message}` };
    }
  }

  try {
    await prisma.product.create({
      data: { name, price, quantity, publisher, businessId, imageUrl },
    });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Failed to create product:", e);
    return { error: "Failed to create product." };
  }
}

export async function updateProduct(id: number, formData: FormData) {
  const canEdit = await hasPermission("edit_item");
  if (!canEdit) return { error: "You do not have permission to edit products." };

  const session = await auth();
  if (!session?.user?.businessId) return { error: "Not authenticated" };
  const isAdmin = session?.user?.role === "admin";

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.businessId !== session.user.businessId) return { error: "Product not found." };

  // Everyone (including admins) can only edit their own products
  if (product.publisher !== session?.user?.name) {
    return { error: "You can only edit your own products." };
  }

  const name = formData.get("name") as string;
  const priceStr = formData.get("price") as string;
  const quantityStr = formData.get("quantity") as string;

  if (!name || !priceStr || !quantityStr) {
    return { error: "All fields are required." };
  }

  const price = parseFloat(priceStr);
  const quantity = parseInt(quantityStr);

  if (isNaN(price) || isNaN(quantity)) {
    return { error: "Invalid price or quantity." };
  }

  // Handle Image Upload (Update)
  let imageUrl = product.imageUrl;
  const imageFile = formData.get("image") as File;
  if (imageFile && imageFile.size > 0) {
    try {
      imageUrl = await uploadImage(imageFile);
    } catch (e: any) {
      console.error("Image upload failed:", e);
      return { error: `Image upload failed: ${e.message}` };
    }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { 
        name, 
        price, 
        quantity,
        imageUrl
      },
    });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: "Failed to update product." };
  }
}

export async function deleteProduct(id: number) {
  const canDelete = await hasPermission("delete_item");
  if (!canDelete) return { error: "You do not have permission to delete products." };

  const session = await auth();
  if (!session?.user?.businessId) return { error: "Not authenticated" };
  const isAdmin = session?.user?.role === "admin";

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product || product.businessId !== session.user.businessId) return { error: "Product not found." };

  // If not admin, must be the owner (publisher)
  if (!isAdmin && product.publisher !== session?.user?.name) {
    return { error: "You can only delete your own products." };
  }

  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (e) {
    return { error: "Failed to delete product." };
  }
}

export async function getProducts(page: number = 1, pageSize: number = 10, publisher?: string) {
  const session = await auth();
  const businessId = session?.user?.businessId;
  
  if (!businessId) {
    return { products: [], total: 0, totalPages: 0, currentPage: page, error: "Not authenticated" };
  }

  const skip = (page - 1) * pageSize;
  const isAdmin = session?.user?.role === "admin";
  const isSeller = session?.user?.role === "saller";
  const isBuyer = session?.user?.role === "buyer";
  const userPublisher = session?.user?.name || "";

  const where: any = { businessId };
  
  // Sellers only see their own products. Admins and Buyers see everything in the business.
  if (isSeller) {
    where.publisher = userPublisher;
  } else if (isAdmin && publisher) {
    where.publisher = publisher;
  }
  
  try {
    const [rawProducts, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    const products = rawProducts.map((product: any) => ({
      ...product,
      price: product.price.toNumber()
    }));


    return {
      products,
      total,
      totalPages: Math.ceil(total / pageSize),
      currentPage: page
    };
  } catch (e) {
    console.error("Failed to fetch products:", e);
    return { products: [], total: 0, totalPages: 0, currentPage: page, error: "Failed to fetch products" };
  }
}

export async function placeOrder(productId: number, quantity: number) {
  try {
    const session = await auth();
    if (!session?.user?.email) return { error: "You must be logged in to place an order." };

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    if (!user) return { error: "User profile not found." };

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return { error: "Product not found." };

    if (product.quantity < quantity) {
      return { error: `Only ${product.quantity} units available in stock.` };
    }

    const total = product.price.toNumber() * quantity; // Decimal to Number

    await prisma.$transaction([
      prisma.order.create({
        data: {
          userId: user.id,
          businessId: user.businessId,
          total,
          products: {
            create: {
              productId: product.id,
              quantity,
              price: product.price
            }
          }
        }
      }),
      prisma.product.update({
        where: { id: product.id },
        data: { quantity: { decrement: quantity } }
      })
    ]);

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Order error:", e);
    return { error: "There was a problem processing your order. Please try again." };
  }
}

export async function placeBulkOrder(cartProducts: { productId: number, quantity: number, price: number }[]) {
  try {
    console.log("[placeBulkOrder] Starting checkout for", cartProducts.length, "items");
    const session = await auth();
    if (!session?.user?.email) return { error: "You must be logged in to place an order." };

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    if (!user) return { error: "User profile not found." };

    // Fetch latest product data to ensure availability and correct prices
    const productIds = cartProducts.map(p => p.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } }
    });

    // Validate and calculate total using DB prices for security
    let total = 0;
    const validatedItems: { productId: number; quantity: number; price: any }[] = [];

    for (const cartItem of cartProducts) {
      const dbProduct = dbProducts.find(p => p.id === cartItem.productId);
      if (!dbProduct) return { error: `Product not found.` };
      
      if (dbProduct.quantity < cartItem.quantity) {
        return { error: `Insufficient stock for ${dbProduct.name}. Only ${dbProduct.quantity} left.` };
      }

      const itemPrice = Number(dbProduct.price);
      total += itemPrice * cartItem.quantity;
      
      validatedItems.push({
        productId: dbProduct.id,
        quantity: cartItem.quantity,
        price: dbProduct.price
      });
    }

    console.log("[placeBulkOrder] Validation successful. Total:", total);

    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Create the Order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          businessId: user.businessId,
          total: total,
          status: "PENDING",
          products: {
            create: validatedItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      });

      // 2. Decrement inventory for each product
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { quantity: { decrement: item.quantity } }
        });
      }

      return order;
    });

    console.log("[placeBulkOrder] Order created successfully:", newOrder.id);
    revalidatePath("/buyer");
    revalidatePath("/seller/orders");
    revalidatePath("/");
    
    return { success: true, orderId: newOrder.id };
  } catch (e: any) {
    console.error("Bulk order error:", e);
    return { error: `Failed to process checkout: ${e.message || 'Unknown error'}` };
  }
}

export async function updateOrderStatus(orderId: number, status: "PENDING" | "PROCESSING" | "SHIPPED" | "COMPLETED" | "CANCELLED") {
  try {
    const session = await auth();
    if (!session?.user?.email) return { error: "Authentication required." };

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return { error: "User not found." };

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { error: "Order not found." };

    // Security: Only allow admin or the business owner to update status
    const isAdmin = user.role === "admin";
    const isOwner = user.role === "saller" && user.businessId === order.businessId;

    if (!isAdmin && !isOwner) {
      return { error: "Unauthorized." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });

    revalidatePath("/seller/orders");
    revalidatePath("/buyer");
    return { success: true };
  } catch (e) {
    console.error("Update status error:", e);
    return { error: "Failed to update order status." };
  }
}

export async function updateUserStatus(userId: number, status: "ACTIVE" | "INACTIVE" | "PENDING") {
  try {
    const session = await auth();
    if (session?.user?.role !== "admin") return { error: "Unauthorized." };

    await prisma.user.update({
      where: { id: userId },
      data: { status }
    });

    revalidatePath("/admin/users");
    return { success: true };
  } catch (e) {
    console.error("Update user status error:", e);
    return { error: "Failed to update user status." };
  }
}

export async function sendOrderMessage(orderId: number, content: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Authentication required." };

    const senderId = parseInt(session.user.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        user: true, 
        business: { 
          include: { 
            users: true 
          } 
        } 
      }
    });

    if (!order) return { error: "Order not found." };

    // Security: Only buyer or seller's business users can message
    const isBuyer = order.userId === senderId;
    const isSeller = order.business.users.some(u => u.id === senderId);

    if (!isBuyer && !isSeller) {
      return { error: "You don't have permission to message on this order." };
    }

    const message = await (prisma as any).orderMessage.create({
      data: {
        content,
        orderId,
        senderId
      }
    });

    // --- PUSH NOTIFICATIONS ---
    try {
      const recipientIds: number[] = [];
      if (isBuyer) {
        // Notify all users in the seller's business
        recipientIds.push(...order.business.users.map(u => u.id));
      } else {
        // Notify the buyer
        recipientIds.push(order.userId);
      }

      // Filter out the sender themselves (if they happen to be in both)
      const uniqueRecipientIds = [...new Set(recipientIds)].filter(id => id !== senderId);

      // Get subscriptions for these recipients
      const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId: { in: uniqueRecipientIds } }
      });

      if (subscriptions.length > 0) {
        // Call the internal push send logic (or just import webpush here)
        // For simplicity and to reuse the API logic, we'll import webpush
        const webpush = (await import("web-push")).default;
        webpush.setVapidDetails(
          process.env.VAPID_SUBJECT || "mailto:admin@example.com",
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
          process.env.VAPID_PRIVATE_KEY!
        );

        const pushPromises = subscriptions.map(sub => {
          const pushSub = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            }
          };

          return webpush.sendNotification(
            pushSub,
            JSON.stringify({
              title: `New Message from ${session.user?.name || 'User'}`,
              body: content.length > 50 ? content.substring(0, 47) + "..." : content,
              url: isBuyer ? "/seller/orders" : "/buyer"
            })
          ).catch(err => console.error("Error sending message notification:", err));
        });

        await Promise.all(pushPromises);
      }
    } catch (pushErr) {
      console.error("Failed to send push notification for message:", pushErr);
      // Don't fail the message creation if notification fails
    }
    // ---------------------------

    revalidatePath("/buyer");
    revalidatePath("/seller/orders");
    
    return { success: true, message };
  } catch (e) {
    console.error("Error sending message:", e);
    return { error: "Failed to send message." };
  }
}

export async function getOrderMessages(orderId: number) {
  try {
    const session = await auth();
    if (!session?.user?.id) return { error: "Authentication required." };

    const userId = parseInt(session.user.id);
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { 
        business: { 
          include: { 
            users: true 
          } 
        } 
      }
    });

    if (!order) return { error: "Order not found." };

    // Security check
    const isBuyer = order.userId === userId;
    const isSeller = order.business.users.some(u => u.id === userId);

    if (!isBuyer && !isSeller) {
      return { error: "Unauthorized" };
    }

    const messages = await (prisma as any).orderMessage.findMany({
      where: { orderId },
      include: { 
        sender: { 
          select: { 
            username: true, 
            role: true 
          } 
        } 
      },
      orderBy: { createdAt: "asc" }
    });

    return { messages };
  } catch (e) {
    console.error("Error fetching messages:", e);
    return { error: "Failed to fetch messages." };
  }
}
