import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";

export const authOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        const raw = credentials?.email;
        if (!raw) return null;
        const email = String(raw).toLowerCase().trim();
        const isAdmin = email === "admin@gmail.com";

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: email.split("@")[0],
              role: isAdmin ? "ADMIN" : "CUSTOMER",
            },
          });
        } else if (isAdmin && user.role !== "ADMIN") {
          user = await prisma.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email ?? undefined,
          role: user.role,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: any }) {
      if (user) {
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub ?? undefined;
        session.user.role = (token as any).role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Auth config temporarily disabled
export {};


