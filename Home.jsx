import React from 'react';
import HeroSection from '../components/home/HeroSection';
import BenefitsSection from '../components/home/BenefitsSection';
import SocialProofSection from '../components/home/SocialProofSection';
import WeeklyDropPreview from '../components/home/WeeklyDropPreview';
import CTASection from '../components/home/CTASection';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <BenefitsSection />
      <WeeklyDropPreview />
      <SocialProofSection />
      <CTASection />
    </div>
  );
}