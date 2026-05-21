export const dynamic = "force-dynamic";

import Header from "@/components/Header";
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
