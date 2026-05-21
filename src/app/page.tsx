export const dynamic = "force-dynamic";

import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeaturedObjects from "@/components/FeaturedObjects";
import About from "@/components/About";
import Services from "@/components/Services";
import Contacts from "@/components/Contacts";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeaturedObjects />
        <About />
        <Services />
        <Contacts />
      </main>
      <Footer />
    </>
  );
}
