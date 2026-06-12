import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import md5 from "blueimp-md5";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const DEMO_EMAIL = "demo@pocketbuddy.app";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    // Demo provider - no auth, just bypass
    Credentials({
      id: "demo",
      name: "demo",
      credentials: {},
      authorize: async () => {
        return {
          id: "demo-user",
          email: DEMO_EMAIL,
          name: "Demo User",
          image: `https://www.gravatar.com/avatar/${md5(DEMO_EMAIL.trim().toLowerCase())}?d=identicon`,
        };
      },
    }),
    // Regular credentials login
    Credentials({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        try {
          const user = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

          if (user.length === 0) return null;

          // Check if user has password hash stored
          const dbUser = user[0];
          if (!dbUser.passwordHash) return null;

          const valid = await bcrypt.compare(password, dbUser.passwordHash);
          if (!valid) return null;

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image,
          };
        } catch (error) {
          console.error("[auth] Login error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
