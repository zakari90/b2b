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
  const userPublisher = session?.user?.name || "";

  const where: any = { businessId };
  
  // If not admin, strictly filter by publisher (their own name)
  if (!isAdmin) {
    where.publisher = userPublisher;
  } else if (publisher) {
    // Admins can optionally filter by publisher if they want
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
    const session = await auth();
    if (!session?.user?.email) return { error: "You must be logged in to place an order." };

    const user = await prisma.user.findUnique({ 
      where: { email: session.user.email } 
    });
    if (!user) return { error: "User profile not found." };

    // Calculate total
    const total = cartProducts.reduce((sum, product) => sum + (product.price * product.quantity), 0);

    // Validate all products exist and have enough stock
    for (const p of cartProducts) {
      const dbProduct = await prisma.product.findUnique({ where: { id: p.productId } });
      if (!dbProduct) return { error: `Product ${p.productId} not found.` };
      if (dbProduct.quantity < p.quantity) {
        return { error: `Only ${dbProduct.quantity} units available for ${dbProduct.name}.` };
      }
    }

    await prisma.$transaction(async (tx: any) => {
      // 1. Create the Order
      await tx.order.create({
        data: {
          userId: user.id,
          businessId: user.businessId,
          total,
          products: {
            create: cartProducts.map((p: any) => ({

              productId: p.productId,
              quantity: p.quantity,
              price: p.price
            }))
          }
        }
      });

      // 2. Decrement inventory for each product
      for (const p of cartProducts) {
        await tx.product.update({
          where: { id: p.productId },
          data: { quantity: { decrement: p.quantity } }
        });
      }
    });

    revalidatePath("/");
    return { success: true };
  } catch (e) {
    console.error("Bulk order error:", e);
    return { error: "Failed to process checkout. Please try again." };
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

    revalidatePath("/manager/orders");
    revalidatePath("/client");
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
