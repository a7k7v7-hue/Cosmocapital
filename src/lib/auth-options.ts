import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

function credentialsMatch(email: string, pass: string): boolean {
  const e = process.env.ADMIN_EMAIL ?? "";
  const p = process.env.ADMIN_PASSWORD ?? "";
  return e.length > 0 && p.length > 0 && email === e && pass === p;
}

const loginPage = { signIn: "/admin/login" };
const sessionCfg = { strategy: "jwt" as const };

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        pass: { label: "Пароль", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.pass) return null;
        if (credentialsMatch(credentials.email, credentials.pass)) {
          return { id: "1", email: credentials.email, name: "Admin" };
        }
        return null;
      },
    }),
  ],
  pages: loginPage,
  session: sessionCfg,
  secret: process.env.NEXTAUTH_SECRET,
};
