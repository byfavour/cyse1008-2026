'use client';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { VendorNewEditForm } from './vendor-new-edit-form';

// ----------------------------------------------------------------------

export function VendorCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create vendor profile"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendor', href: paths.dashboard.vendor.root },
          { name: 'New vendor' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <VendorNewEditForm />
    </DashboardContent>
  );
}
