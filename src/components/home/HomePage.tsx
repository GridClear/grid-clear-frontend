"use client";

/** Homepage shell — composes all landing sections. */

import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { CareersCta } from "@/components/home/CareersCta";
import { FeaturedCarousel } from "@/components/home/FeaturedCarousel";
import { FooterCta } from "@/components/home/FooterCta";
import { HeroSection } from "@/components/home/HeroSection";
import { MissionStatement } from "@/components/home/MissionStatement";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { Testimonials } from "@/components/home/Testimonials";

export function HomePage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main>
        <HeroSection />
        <FeaturedCarousel />
        <MissionStatement />
        <ProductShowcase />
        <CareersCta />
        <Testimonials />
        <FooterCta />
      </main>
      <Footer />
    </>
  );
}
