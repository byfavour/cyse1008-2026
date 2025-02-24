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
        <Grid xs={12} md={6}>
          <EncryptionRSA title="RSA Key Generator" subheader="(node-forge) & Encrypt/Decrypt" />
        </Grid>
        <Grid xs={12} md={6}>
          <EncryptionSimplifiedRSA title="RSA Simple Model" subheader="Simplified Version" />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
