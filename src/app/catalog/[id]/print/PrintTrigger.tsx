"use client";

import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    const t = setTimeout(() => window.print(), 1000);
    return () => clearTimeout(t);
  }, []);
  return null;
}
