import React from "react";
import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FAQ from "@/components/landing/FAQ";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export default function LandingPage() {
  return (
    <div>
      <Header />
      <Hero />
      <HowItWorks />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
