'use client';

// import Stack from '@mui/material/Stack';

import { BackToTop } from 'src/components/animate/back-to-top';
import { ScrollProgress, useScrollProgress } from 'src/components/animate/scroll-progress';

import { HomeHeroCYSE1008 } from '../home-hero-cyse1008';
// import { HomeFAQs } from '../home-faqs';
// import { HomeZoneUI } from '../home-zone-ui';
// import { HomeMinimal } from '../home-minimal';
// import { HomePricing } from '../home-pricing';
// import { HomeForDesigner } from '../home-for-designer';
// import { HomeTestimonials } from '../home-testimonials';
// import { HomeIntegrations } from '../home-integrations';
// import { HomeAdvertisement } from '../home-advertisement';
// import { HomeHugePackElements } from '../home-hugepack-elements';
// import { HomeHighlightFeatures } from '../home-highlight-features';

// ----------------------------------------------------------------------
// CYSE_1008_ASSIGNMENT_5_PARENT_COMPONENT
// This component is the parent of the child component you will edit
// See the import above? ^^^ HomeHeroCYSE1008 
// Try to find the name of the component below where it is used
// ----------------------------------------------------------------------
export function HomeView() {
  const pageProgress = useScrollProgress();

  return (
    <>
      <ScrollProgress
        variant="linear"
        progress={pageProgress.scrollYProgress}
        sx={{ position: 'fixed' }}
      />
      
      <BackToTop />

      <HomeHeroCYSE1008 /> {/* Here I am!  This inserts this code here */}
      {/* <Stack sx={{ position: 'relative', bgcolor: 'background.default' }}>
        <HomeMinimal />

        <HomeHugePackElements />

        <HomeForDesigner />

        <HomeHighlightFeatures />

        <HomeIntegrations />

        <HomePricing />

        <HomeTestimonials />

        <HomeFAQs />

        <HomeZoneUI />

        <HomeAdvertisement />
      </Stack> */}
    </>
  );
}
