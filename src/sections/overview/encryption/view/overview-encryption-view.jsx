'use client';

import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';

import { EncryptionRSA } from '../encryption-rsa';
import { EncryptionSimplifiedRSA } from '../encryption-simplified-rsa';
// ----------------------------------------------------------------------

export function OverviewEncryptionView() {
  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} md={12}>
          <EncryptionSimplifiedRSA title="RSA Step by Step" subheader="Step by Step" />
        </Grid>
        <Grid xs={12} md={12}>
          <EncryptionRSA title="RSA Key Generator" subheader="(node-forge) & Encrypt/Decrypt" />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
