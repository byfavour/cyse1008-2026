'use client';

import { BackToTop } from 'src/components/animate/back-to-top';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

// import { useGetProducts } from 'src/actions/product';

import { HomeHeroCYSE1008 } from '../home-hero-cyse1008';

// ----------------------------------------------------------------------

export function HomeView() {
  // ❌ Remove "async"
  const pageProgress = useScrollProgress(); // ✅ Now correctly used inside a normal function

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: 'fixed' }}
      />
      <BackToTop />
      <HomeHeroCYSE1008 />
    </>
  );
}
