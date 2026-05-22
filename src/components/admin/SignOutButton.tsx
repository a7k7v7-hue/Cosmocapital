"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
    >
      Выйти
    </button>
  );
}
