import Hero from "@/components/home/Hero";
import GeographicReach from "@/components/home/GeographicReach";
import TwoPaths from "@/components/home/TwoPaths";
import FinalCTA from "@/components/home/FinalCTA";
import GradientBackground from "@/components/ui/GradientBackground";

export default function Home() {
  return (
    <>
      <Hero />
      <GradientBackground>
        <TwoPaths />
        <GeographicReach />
        <FinalCTA />
      </GradientBackground>
    </>
  );
}
