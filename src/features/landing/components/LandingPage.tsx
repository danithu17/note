import React from 'react';
import confetti from 'canvas-confetti';
import { useCanvasStore } from '@/store/useCanvasStore';
import { Navbar } from './Navbar';
import { HeroSection } from './HeroSection';
import { SocialProofStrip } from './SocialProofStrip';
import { FeatureBentoGrid } from './FeatureBentoGrid';
import { InteractiveMiniCanvas } from './InteractiveMiniCanvas';
import { HowItWorks } from './HowItWorks';
import { PlatformsSection } from './PlatformsSection';
import { PricingSection } from './PricingSection';
import { FaqAccordion } from './FaqAccordion';
import { FooterSection } from './FooterSection';
import type { PlanId } from '@/features/billing/types';

interface LandingPageProps {
  onLaunchApp: () => void;
  onOpenPricing: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onLaunchApp, onOpenPricing }) => {
  const { isDarkMode, toggleDarkMode } = useCanvasStore();

  const handleStartFree = () => {
    confetti({ particleCount: 50, spread: 70 });
    onLaunchApp();
  };

  const handleSelectPlan = (planId: PlanId) => {
    if (planId === 'free') {
      handleStartFree();
    } else {
      // Direct user into app with the plan selection modal open
      onLaunchApp();
      setTimeout(() => {
        onOpenPricing();
      }, 350);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] font-sans antialiased overflow-y-auto selection:bg-[#0071e3] selection:text-white transition-colors duration-200">
      {/* 1. Sticky Frosted-Glass Apple Navigation */}
      <Navbar
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        onLaunchApp={handleStartFree}
      />

      <main>
        {/* 2. Apple-Grade Hero Section with 1180px App Window Mockup */}
        <HeroSection onStartFree={handleStartFree} />

        {/* 3. Social Proof Strip (Beta count, academic institutions, testimonials) */}
        <SocialProofStrip />

        {/* 4. Asymmetric Bento Grid (8 real interactive visual tiles) */}
        <FeatureBentoGrid />

        {/* 5. Live Interactive Drawing Canvas (Try it right here) */}
        <InteractiveMiniCanvas />

        {/* 6. How It Works (Capture, Organize, Study) */}
        <HowItWorks />

        {/* 7. Cross-Platform Reach (Web PWA, Android, Desktop Electron) */}
        <PlatformsSection onLaunchApp={handleStartFree} />

        {/* 8. Simple, Honest Pricing (3 cards, Monthly/Annual, USD/LKR, comparison) */}
        <PricingSection onStartFree={handleStartFree} onSelectPlan={handleSelectPlan} />

        {/* 9. Accessible FAQ Accordion */}
        <FaqAccordion />
      </main>

      {/* 10. Final High-Contrast Dark CTA Band & Proper 5-Column Footer */}
      <FooterSection onStartFree={handleStartFree} />
    </div>
  );
};
