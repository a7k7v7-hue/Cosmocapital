export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Коммерческая недвижимость Москвы — Космо Капитал",
  description: "Аренда и продажа офисов, складов, торговых помещений в Москве и МО. Консультант RICS с 2006 года. Каталог 32+ объектов.",
  openGraph: {
    title: "Коммерческая недвижимость Москвы — Космо Капитал",
    description: "Аренда и продажа офисов, складов, торговых помещений в Москве и МО.",
    url: "https://cosmacapital.onrender.com",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
};
import Hero from "@/components/Hero";
import StatsBar from "@/components/StatsBar";
import Directions from "@/components/Directions";
import ClientMatrix from "@/components/ClientMatrix";
import FeaturedObjects from "@/components/FeaturedObjects";
import About from "@/components/About";
import Contacts from "@/components/Contacts";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <StatsBar />
        <Directions />
        <ClientMatrix />
        <FeaturedObjects />
        <About />
        <Contacts />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
