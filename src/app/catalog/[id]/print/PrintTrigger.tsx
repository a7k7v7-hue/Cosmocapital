"use client";

import { useEffect } from "react";

export default function PrintTrigger({ title }: { title: string }) {
  useEffect(() => {
    document.querySelectorAll<HTMLElement>("header, footer, nav").forEach((el) => {
      el.style.setProperty("display", "none", "important");
    });
    if (title) document.title = title;
    const t = setTimeout(() => window.print(), 900);
    return () => clearTimeout(t);
  }, [title]);
  return null;
}
