'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';

import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarQuickFilter,
} from '@mui/x-data-grid';

import { toast } from 'src/components/snackbar';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { useAuthContext } from 'src/auth/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetVendors } from 'src/actions/vendor';
import { deleteVendor } from 'src/lib/firebase/vendors';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function ToolbarActions({ onCreate }) {
  return (
    <GridToolbarContainer>
      <GridToolbarColumnsButton />
      <GridToolbarFilterButton />
      <GridToolbarQuickFilter />
      <Button variant="contained" size="small" onClick={onCreate} sx={{ ml: 'auto' }}>
        New vendor
      </Button>
    </GridToolbarContainer>
  );
}

export function VendorListView() {
  const router = useRouter();
  const confirmDelete = useBoolean();
  const [pendingDelete, setPendingDelete] = useState(null);

  const { user } = useAuthContext();
  const ownerId = user?.uid || null;

  const { vendors, vendorsLoading } = useGetVendors(ownerId);

  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(vendors || []);
  }, [vendors]);

  const rows = useMemo(() => tableData, [tableData]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await deleteVendor(id);
        setTableData((prev) => prev.filter((row) => row.id !== id));
        toast.success('Vendor deleted');
      } catch (err) {
        toast.error('Could not delete vendor');
        console.error(err);
      } finally {
        confirmDelete.onFalse();
        setPendingDelete(null);
      }
    },
    [confirmDelete]
  );

  const columns = [
    { field: 'name', headerName: 'Vendor', flex: 1, minWidth: 220 },
    { field: 'contactEmail', headerName: 'Email', flex: 1, minWidth: 220 },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      valueGetter: (params) => (params?.row?.isActive ? 'Active' : 'Inactive'),
    },
    {
      field: 'actions',
      type: 'actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="view"
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => router.push(paths.dashboard.vendor.details(params.row.id))}
        />,
        <GridActionsCellItem
          key="edit"
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => router.push(paths.dashboard.vendor.edit(params.row.id))}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Delete"
          onClick={() => {
            setPendingDelete(params.row.id);
            confirmDelete.onTrue();
          }}
          showInMenu
        />,
      ],
    },
  ];

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Vendors"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Vendor', href: paths.dashboard.vendor.root },
        ]}
        action={
          <Button variant="contained" onClick={() => router.push(paths.dashboard.vendor.new)}>
            New vendor
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card>
        <DataGrid
          autoHeight
          rows={rows}
          loading={vendorsLoading}
          columns={columns}
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: () => <EmptyContent title="No vendors" />,
            toolbar: ToolbarActions,
          }}
          slotProps={{
            toolbar: { onCreate: () => router.push(paths.dashboard.vendor.new) },
          }}
        />
      </Card>

      <ConfirmDialog
        open={confirmDelete.value}
        onClose={confirmDelete.onFalse}
        title="Delete vendor?"
        content="This action cannot be undone."
        action={
          <Button color="error" variant="contained" onClick={() => handleDelete(pendingDelete)}>
            Delete
          </Button>
        }
      />
    </DashboardContent>
  );
}
