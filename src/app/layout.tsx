import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Cosmocapital - Коммерческая недвижимость Москва",
    template: "%s | Cosmocapital",
  },
  description: "Аренда и продажа коммерческой недвижимости в Москве. Офисы, торговые площади, склады. Полное сопровождение сделки.",
  keywords: ["коммерческая недвижимость", "аренда офиса", "продажа склада", "торговое помещение", "Москва"],
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "Cosmocapital",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
