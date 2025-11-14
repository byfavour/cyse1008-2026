'use server';

import { _tours } from 'src/_mock/_tour';
import { CONFIG } from 'src/config-global';

import { TourEditView } from 'src/sections/tour/view';

export default async function Page({ params }) {
  const { id } = params;

  const currentTour = _tours.find((tour) => tour.id === id);

  return <TourEditView tour={currentTour} />;
}

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    return _tours.map((tour) => ({ id: tour.id }));
  }
  return [];
}
