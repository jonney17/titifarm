declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: "ADMIN" | "CUSTOMER";
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    role: "ADMIN" | "CUSTOMER";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "CUSTOMER";
  }
}


