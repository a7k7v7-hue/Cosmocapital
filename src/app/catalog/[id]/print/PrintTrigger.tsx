"use client";

import { useEffect } from "react";

export default function PrintTrigger({ title }: { title: string }) {
  useEffect(() => {
    if (title) document.title = title;
    const t = setTimeout(() => window.print(), 1000);
    return () => clearTimeout(t);
  }, [title]);
  return null;
}
