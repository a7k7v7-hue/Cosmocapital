import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Космо Капитал - Коммерческая недвижимость Москвы",
    template: "%s | Космо Капитал",
  },
  description: "Консультант по коммерческой недвижимости. Офисы, склады, торговые площади, инвестиционные объекты. Москва и МО с 2006 года. RICS.",
  keywords: ["коммерческая недвижимость", "аренда офиса", "продажа склада", "торговое помещение", "RICS", "Москва"],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Космо Капитал",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${cormorant.variable} ${dmSans.variable}`}>
      <body style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>{children}</body>
    </html>
  );
}
