'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { VendorNewEditForm } from './vendor-new-edit-form';
import { useGetVendor } from 'src/actions/vendor';

// ----------------------------------------------------------------------

export function VendorEditView({ vendorId }) {
  const { vendor, vendorLoading } = useGetVendor(vendorId);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit vendor"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendor', href: paths.dashboard.vendor.root },
          { name: vendor?.name || 'Edit' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VendorNewEditForm currentVendor={vendor} loading={vendorLoading} />
    </DashboardContent>
  );
}
