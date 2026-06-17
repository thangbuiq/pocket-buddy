import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import md5 from "blueimp-md5";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const DEMO_USER_ID = "demo-user";
const DEMO_EMAIL = "demo@pocketbuddy.app";

interface GitHubProfile {
  id: number;
  login: string;
  name?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

const THIRTY_DAYS_IN_SECONDS = 30 * 24 * 60 * 60;

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: THIRTY_DAYS_IN_SECONDS },
  providers: [
    // Demo provider - no auth, uses in-memory mockStore for data.
    Credentials({
      id: "demo",
      name: "demo",
      credentials: {},
      authorize: async () => {
        return {
          id: DEMO_USER_ID,
          email: DEMO_EMAIL,
          name: "Demo User",
          image: `https://www.gravatar.com/avatar/${md5(DEMO_EMAIL.trim().toLowerCase())}?d=identicon`,
        };
      },
    }),
    // GitHub OAuth - real users are persisted to the database and unique by GitHub username.
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
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
    signIn: async ({ account, profile }) => {
      if (account?.provider === "demo") return true;

      if (account?.provider === "github" && profile) {
        const githubProfile = profile as unknown as GitHubProfile;
        const githubId = String(githubProfile.id);
        const githubUsername = githubProfile.login;

        if (!githubUsername) {
          console.error("[auth] GitHub profile missing login username");
          return false;
        }

        try {
          const existing = await db
            .select()
            .from(users)
            .where(eq(users.githubUsername, githubUsername))
            .limit(1);

          if (existing.length > 0) {
            await db
              .update(users)
              .set({
                name: githubProfile.name ?? existing[0].name,
                email: githubProfile.email ?? existing[0].email,
                image: githubProfile.avatar_url ?? existing[0].image,
                updatedAt: new Date(),
              })
              .where(eq(users.id, existing[0].id));
          } else {
            await db.insert(users).values({
              id: githubId,
              name: githubProfile.name,
              email: githubProfile.email,
              githubUsername,
              image: githubProfile.avatar_url,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        } catch (error) {
          console.error("[auth] Failed to sync GitHub user:", error);
          return false;
        }
      }

      return true;
    },
    jwt: async ({ token, user, profile, trigger }) => {
      if (user?.id) token.sub = user.id;

      if (trigger === "signIn" && profile && "login" in profile) {
        const githubProfile = profile as unknown as GitHubProfile;
        token.githubUsername = githubProfile.login;
      }

      // Fallback: if token is missing githubUsername but user id matches a DB user,
      // hydrate it from the database. This keeps existing sessions working after
      // this feature is deployed.
      if (!token.githubUsername && token.sub && token.sub !== DEMO_USER_ID) {
        try {
          const rows = await db
            .select({ githubUsername: users.githubUsername })
            .from(users)
            .where(eq(users.id, token.sub))
            .limit(1);
          if (rows.length > 0) {
            token.githubUsername = rows[0].githubUsername;
          }
        } catch (error) {
          console.error("[auth] Failed to hydrate githubUsername:", error);
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.githubUsername =
          (token.githubUsername as string | null | undefined) ?? null;
      }
      return session;
    },
  },
});
