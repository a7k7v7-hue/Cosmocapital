"use client";

import { useState } from "react";

const navLinks = [
  { label: "Главная", href: "/" },
  { label: "О компании", href: "#about" },
  { label: "Направления", href: "#directions" },
  { label: "Каталог объектов", href: "/catalog" },
  { label: "Контакты", href: "#contacts" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      background: "rgba(247,245,240,.92)", backdropFilter: "blur(12px)",
      borderBottom: "1px solid var(--border)",
      boxShadow: "0 2px 20px rgba(15,23,36,.06)",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 40px",
        height: 68, display: "flex", alignItems: "center", gap: 32,
      }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{
            width: 36, height: 36, background: "var(--accent)", borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "var(--font-cormorant, serif)", fontSize: 14, fontWeight: 600,
            color: "#fff", letterSpacing: ".5px", flexShrink: 0,
          }}>КК</div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: ".12em", color: "var(--dark)" }}>КОСМО КАПИТАЛ</span>
            <span style={{ fontSize: 10, fontWeight: 400, letterSpacing: ".18em", color: "var(--muted)" }}>COMMERCIAL REAL ESTATE</span>
          </div>
        </a>

        <nav className="hidden md:flex" style={{ flex: 1, display: "flex", gap: 4 }}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} style={{
              padding: "7px 14px", borderRadius: 6, fontSize: "13.5px",
              color: "var(--muted)", transition: "var(--trans)", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--text)";
              (e.currentTarget as HTMLElement).style.background = "var(--surface2)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
            >{link.label}</a>
          ))}
        </nav>

        <div className="hidden md:flex" style={{ alignItems: "center", gap: 16, marginLeft: "auto", display: "flex" }}>
          <a href="tel:+79035374488" style={{ fontSize: 14, fontWeight: 600, color: "var(--dark)", letterSpacing: ".01em" }}>
            +7 (903) 537-44-88
          </a>
          <a href="#contacts" style={{
            background: "var(--dark)", color: "#fff", padding: "10px 20px",
            borderRadius: 6, fontSize: 13, fontWeight: 500, transition: "var(--trans)",
          }}>Подобрать объект</a>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ padding: 8, color: "var(--muted)", background: "none", border: "none", cursor: "pointer", marginLeft: "auto" }}
        >
          <span style={{ display: "block", width: 20, height: 1.5, background: "currentcolor", marginBottom: 5 }} />
          <span style={{ display: "block", width: 20, height: 1.5, background: "currentcolor", marginBottom: 5 }} />
          <span style={{ display: "block", width: 20, height: 1.5, background: "currentcolor" }} />
        </button>
      </div>

      {menuOpen && (
        <div style={{
          background: "var(--surface)", borderTop: "1px solid var(--border)",
          padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12,
        }}>
          {navLinks.map((link) => (
            <a key={link.href} href={link.href} style={{ fontSize: 14, color: "var(--text)" }} onClick={() => setMenuOpen(false)}>
              {link.label}
            </a>
          ))}
          <a href="tel:+79035374488" style={{ fontSize: 14, fontWeight: 600, color: "var(--accent)" }}>
            +7 (903) 537-44-88
          </a>
        </div>
      )}
    </header>
  );
}
