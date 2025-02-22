'use client';
import Grid from '@mui/material/Unstable_Grid2';

import { DashboardContent } from 'src/layouts/dashboard';
import { EncryptionRSA } from '../encryption-rsa';
// ----------------------------------------------------------------------


export function OverviewEncryptionView() {
  return (
    <DashboardContent maxWidth="xl">
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <EncryptionRSA 
            title="RSA"
            subheader="Encryption"
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
