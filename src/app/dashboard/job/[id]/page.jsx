'use server';

import { _jobs } from 'src/_mock/_job';
import { CONFIG } from 'src/config-global';

import { JobDetailsView } from 'src/sections/job/view';

export default async function Page({ params }) {
  const { id } = params;

  const currentJob = _jobs.find((job) => job.id === id);

  return <JobDetailsView job={currentJob} />;
}

/**
 * [2] Static exports
 * https://nextjs.org/docs/app/building-your-application/deploying/static-exports
 */
export async function generateStaticParams() {
  if (CONFIG.isStaticExport) {
    return _jobs.map((job) => ({ id: job.id }));
  }
  return [];
}
