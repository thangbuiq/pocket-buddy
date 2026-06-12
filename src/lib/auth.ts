import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import md5 from "blueimp-md5";
import { z } from "zod";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const demoEmail = process.env.DEMO_USER_EMAIL ?? "demo@pocketbuddy.app";
const demoPasswordHash = process.env.DEMO_USER_PASSWORD_HASH ?? bcrypt.hashSync("Password123!", 10);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;
        if (parsed.data.email !== demoEmail) return null;
        const valid = await bcrypt.compare(parsed.data.password, demoPasswordHash);
        if (!valid) return null;

        return {
          id: `user_${parsed.data.email}`,
          email: parsed.data.email,
          name: "Pocket Buddy User",
          image: `https://www.gravatar.com/avatar/${md5(parsed.data.email.trim().toLowerCase())}?d=identicon`,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
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
