'use client';

import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';

import { useAuthContext } from 'src/auth/hooks';

import { useGetVendor } from 'src/actions/vendor';

// ----------------------------------------------------------------------

function InfoRow({ label, value, mono = false }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={2}>
      <Typography
        variant="caption"
        sx={{ color: 'text.disabled', width: 100, flexShrink: 0, pt: 0.25 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ wordBreak: 'break-all', ...(mono && { fontFamily: 'monospace', fontSize: 12 }) }}
      >
        {value || '—'}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function VendorDetailsView({ id }) {
  const { user } = useAuthContext();
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

  const isOwner = user?.uid === vendor.ownerId;

  return (
    <DashboardContent>
      {/* Toolbar */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: { xs: 3, md: 5 } }}>
        <Button
          component={RouterLink}
          href={paths.dashboard.vendor.root}
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
        >
          Back
        </Button>

        <Typography variant="h5" sx={{ flexGrow: 1 }}>
          {vendor.name}
        </Typography>

        <Chip
          size="small"
          label={vendor.isActive ? 'Active' : 'Inactive'}
          color={vendor.isActive ? 'success' : 'default'}
          icon={<Iconify icon={vendor.isActive ? 'eva:checkmark-circle-2-fill' : 'eva:close-circle-fill'} />}
        />

        <Tooltip title="Edit vendor">
          <IconButton component={RouterLink} href={paths.dashboard.vendor.edit(id)}>
            <Iconify icon="solar:pen-bold" />
          </IconButton>
        </Tooltip>
      </Stack>

      <Grid container spacing={3}>
        {/* Main content */}
        <Grid xs={12} md={8}>
          <Stack spacing={3}>
            <Card sx={{ p: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6">About</Typography>
                <Typography color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {vendor.description || 'No description provided.'}
                </Typography>

                <Divider />

                <Stack spacing={1.5}>
                  <InfoRow label="Address" value={vendor.address} />
                  <InfoRow
                    label="Website"
                    value={
                      vendor.website ? (
                        <a href={vendor.website} target="_blank" rel="noreferrer">
                          {vendor.website}
                        </a>
                      ) : null
                    }
                  />
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Grid>

        {/* Sidebar */}
        <Grid xs={12} md={4}>
          <Stack spacing={3}>
            {/* Contact */}
            <Card sx={{ p: 3 }}>
              <Stack spacing={1.5}>
                <Typography variant="subtitle2">Contact</Typography>
                <InfoRow label="Email" value={vendor.contactEmail} />
                <InfoRow label="Phone" value={vendor.contactPhone} />
              </Stack>
            </Card>

            {/* Security context — for classroom demo */}
            <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
              <Stack spacing={1.5}>
                <Typography variant="overline" sx={{ color: 'text.disabled' }}>
                  Security context
                </Typography>

                <InfoRow label="Vendor ID" value={vendor.id} mono />
                <InfoRow label="Owner ID" value={vendor.ownerId} mono />
                <InfoRow label="Logged in as" value={user?.uid ?? 'unauthenticated'} mono />

                <Divider />

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', width: 100 }}>
                    Is owner?
                  </Typography>
                  <Chip
                    size="small"
                    label={isOwner ? 'Yes' : 'No'}
                    color={isOwner ? 'success' : 'warning'}
                  />
                </Stack>

                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="caption" sx={{ color: 'text.disabled', width: 100 }}>
                    isActive
                  </Typography>
                  <Chip
                    size="small"
                    label={vendor.isActive ? 'true' : 'false'}
                    color={vendor.isActive ? 'success' : 'error'}
                  />
                </Stack>

                <Divider />

                <Stack spacing={0.5}>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Rule evidence
                  </Typography>
                  <Typography variant="caption">
                    ✅ Read allowed → <code>isActive == true</code>
                  </Typography>
                  <Typography variant="caption">
                    {isOwner ? '✅' : '🔒'} Update → owner match:{' '}
                    <strong>{isOwner ? 'pass' : 'blocked'}</strong>
                  </Typography>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
