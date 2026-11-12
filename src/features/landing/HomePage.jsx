import { SiteHeader } from "@/features/landing/components/SiteHeader";
import { Hero } from "@/features/landing/components/Hero";
import { ModulesScroll } from "@/features/landing/components/ModulesScroll";
import { FeatureGrid } from "@/features/landing/components/FeatureGrid";
import { FinalCTA } from "@/features/landing/components/FinalCTA";
import { SiteFooter } from "@/features/landing/components/SiteFooter";

function Home() {
  return (
    <div className="min-h-screen bg-ink-950 font-sans text-ink-50 antialiased selection:bg-lime selection:text-ink-950">
      <SiteHeader />
      <main>
        <Hero />
        <ModulesScroll />
        <FeatureGrid />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}

export default Home;
