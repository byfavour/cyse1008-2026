'use client';

import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { EmptyContent } from 'src/components/empty-content';

import { useGetVendor } from 'src/actions/vendor';

// ----------------------------------------------------------------------

export function VendorDetailsView({ id }) {
  const router = useRouter();
  const { vendor, vendorLoading } = useGetVendor(id);

  if (vendorLoading) {
    return (
      <DashboardContent>
        <EmptyContent title="Loading vendor..." />
      </DashboardContent>
    );
  }

  if (!vendor) {
    return (
      <DashboardContent>
        <EmptyContent title="Vendor not found" description="Check the URL or go back." />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading={vendor.name}
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendor', href: paths.dashboard.vendor.root },
          { name: vendor.name },
        ]}
        action={
          <Button variant="contained" onClick={() => router.push(paths.dashboard.vendor.edit(id))}>
            Edit vendor
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h5">About</Typography>
              <Typography color="text.secondary">{vendor.description || '—'}</Typography>
              <Divider />
              <Stack spacing={1}>
                <Typography variant="subtitle2">Address</Typography>
                <Typography color="text.secondary">{vendor.address || '—'}</Typography>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Website</Typography>
                <Typography color="text.secondary">{vendor.website || '—'}</Typography>
              </Stack>
            </Stack>
          </Card>
        </Grid>
        <Grid xs={12} md={4}>
          <Card sx={{ p: 3 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2">Contact</Typography>
              <Typography color="text.secondary">{vendor.contactEmail || '—'}</Typography>
              <Typography color="text.secondary">{vendor.contactPhone || '—'}</Typography>
              <Divider />
              <Alert severity={vendor.isActive ? 'success' : 'warning'}>
                {vendor.isActive ? 'Active vendor' : 'Inactive vendor'}
              </Alert>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
