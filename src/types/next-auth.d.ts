import type { UserRole } from "@/generated/prisma";

declare module "next-auth" {
  interface User {
    role: UserRole;
    brokerName?: string | null;
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: UserRole;
      brokerName?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole;
    brokerName?: string | null;
  }
}
