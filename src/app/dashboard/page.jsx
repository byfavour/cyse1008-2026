import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { CONFIG } from 'src/config-global';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const metadata = { title: `Dashboard - ${CONFIG.appName}` };

export default function Page() {
  return (
    <DashboardContent>
      <Stack spacing={3}>
        <Typography variant="h4">Dashboard</Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Button variant="contained" href={paths.dashboard.order.root}>
            View orders
          </Button>
          <Button variant="outlined" href={paths.dashboard.product.root}>
            Manage products
          </Button>
          <Button variant="outlined" href={paths.dashboard.vendor.root}>
            Manage vendors
          </Button>
        </Stack>
      </Stack>
    </DashboardContent>
  );
}
