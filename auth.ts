import NextAuth from "next-auth";
import "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      businessId: number;
      role: string;
      permissions: string[];
    };
  }

  interface User {
    businessId?: number;
    role?: string;
    permissions?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    businessId?: number;
    role?: string;
    permissions?: string[];
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { username: credentials.username as string },
        });

        if (!user) return null;

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!isPasswordValid) return null;

        // Block users who are not active
        if (user.status !== "ACTIVE") {
          throw new Error("ACCOUNT_NOT_ACTIVE");
        }

        // Hardcoded permissions based on role enum
        let permissions: string[] = [];
        if (user.role === "admin") {
          permissions = [
            "manage_all",
            "create_user",
            "delete_user",
            "view_users",
            "manage_roles",
            "create_item",
            "edit_item",
            "delete_item",
            "view_items",
          ];
        } else if (user.role === "saller") {
          permissions = [
            "view_reports",
            "view_dashboard",
            "view_users",
            "edit_profile",
            "create_item",
            "edit_item",
            "delete_item",
            "view_items",
          ];
        } else if (user.role === "buyer") {
          permissions = ["view_dashboard", "edit_profile", "view_items"];
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.username,
          businessId: user.businessId,
          role: user.role,
          permissions: permissions,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.permissions = user.permissions;
        token.businessId = user.businessId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
        session.user.permissions = (token.permissions as string[]) || [];
        session.user.businessId = token.businessId as number;
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Redirect to home for sign in
  },
});
