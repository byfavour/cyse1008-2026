'use client';

import { useState, useEffect, useCallback } from 'react';
import dayjs from 'dayjs';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import {
  DataGrid,
  gridClasses,
  GridToolbarExport,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarQuickFilter,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSetState } from 'src/hooks/use-set-state';

import { PRODUCT_STOCK_OPTIONS } from 'src/constants/options';
import { useGetProducts } from 'src/actions/product';
import { DashboardContent } from 'src/layouts/dashboard';
import { deleteProduct } from 'src/lib/firebase/products';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { ProductTableToolbar } from '../product-table-toolbar';
import { ProductTableFiltersResult } from '../product-table-filters-result';
import {
  RenderCellStock,
  RenderCellPrice,
  RenderCellPublish,
  RenderCellProduct,
  RenderCellCreatedAt,
} from '../product-table-row';

import { fetchShopifyProducts } from 'src/lib/shopify/fetch-products';
import { toDate } from 'src/utils/dates';

// ----------------------------------------------------------------------

const PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];

const HIDE_COLUMNS = { category: false };

const HIDE_COLUMNS_TOGGLABLE = ['category', 'actions'];

// ----------------------------------------------------------------------

function normalizeProduct(p) {
  // Prefer your field, fall back to Shopify’s created_at
  const raw = p.createdAt ?? p.created_at ?? p.createdAtMs ?? null;
  const d = toDate(raw);
  console.log({ d });
  return {
    ...p,
    createdAtMs: d ? d.getTime() : null,
  };
}

export function ProductListView() {
  const confirmRows = useBoolean();

  const router = useRouter();

  const filters = useSetState({ publish: [], stock: [] });

  const { products, productsLoading } = useGetProducts();
  const [tableData, setTableData] = useState([]);

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const [columnVisibilityModel, setColumnVisibilityModel] = useState(HIDE_COLUMNS);

  useEffect(() => {
    if (products.length) {
      setTableData(products.map(normalizeProduct));
    }
  }, [products]);

  const canReset = filters.state.publish.length > 0 || filters.state.stock.length > 0;

  const dataFiltered = applyFilter({ inputData: tableData, filters: filters.state });

  const handleDeleteRow = useCallback(async (id) => {
    try {
      await deleteProduct(id); // Delete from Firestore
      toast.success('Delete success!');
      setTableData((prevData) => prevData.filter((row) => row.id !== id)); // Update state
    } catch (error) {
      toast.error('Failed to delete product. Please try again.');
      console.error('Error deleting product:', error);
    }
  }, []);

  const handleDeleteRows = useCallback(async () => {
    try {
      await Promise.all(selectedRowIds.map((id) => deleteProduct(id))); // Delete from Firestore
      toast.success('Delete success!');
      setTableData((prevData) => prevData.filter((row) => !selectedRowIds.includes(row.id))); // Update state
    } catch (error) {
      toast.error('Failed to delete selected products. Please try again.');
      console.error('Error deleting products:', error);
    }
  }, [selectedRowIds]);

  const handleEditRow = useCallback(
    (id) => {
      router.push(paths.dashboard.product.edit(id));
    },
    [router]
  );

  const getMs = (raw) => {
    if (!raw) return null;
    if (typeof raw?.toDate === 'function') return raw.toDate().getTime(); // Firestore Timestamp
    if (typeof raw?.seconds === 'number')
      return raw.seconds * 1000 + Math.floor((raw.nanoseconds || 0) / 1e6); // POJO
    if (typeof raw?._seconds === 'number')
      return raw._seconds * 1000 + Math.floor((raw._nanoseconds || 0) / 1e6);
    const d = new Date(raw); // Date | ISO | epoch
    return Number.isNaN(d.getTime()) ? null : d.getTime();
  };

  const handleViewRow = useCallback(
    (id) => {
      router.push(paths.dashboard.product.details(id));
    },
    [router]
  );

  const handleSyncShopify = useCallback(async () => {
    const productsFromShopify = await fetchShopifyProducts();
    if (!Array.isArray(productsFromShopify)) {
      toast.error(productsFromShopify?.error || 'Failed to fetch from Shopify');
      return;
    }
    setTableData((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const unique = productsFromShopify
        .filter((p) => !existingIds.has(p.id))
        .map(normalizeProduct);
      return [...prev, ...unique];
    });
    toast.success(`Imported ${productsFromShopify.length} products from Shopify`);
  }, []);

  const CustomToolbarCallback = useCallback(
    () => (
      <CustomToolbar
        filters={filters}
        canReset={canReset}
        selectedRowIds={selectedRowIds}
        setFilterButtonEl={setFilterButtonEl}
        filteredResults={dataFiltered.length}
        onOpenConfirmDeleteRows={confirmRows.onTrue}
        onSyncShopify={handleSyncShopify} // ✅ add this
      />
    ),
    [filters.state, selectedRowIds, handleSyncShopify]
  );

  const columns = [
    { field: 'category', headerName: 'Category', filterable: false },
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      minWidth: 360,
      hideable: false,
      renderCell: (params) => (
        <RenderCellProduct
          params={params}
          editHref={paths.dashboard.product.edit(params.row.id)}
          onEditRow={() => handleEditRow(params.row.id)}
        />
      ),
    },
    {
      field: 'createdAtMs',
      headerName: 'Created at',
      width: 180,

      // let sorting work even if the field is missing on some rows
      valueGetter: (params) => {
        const v = params?.row?.createdAtMs;
        if (v != null) return Number(v);
        const raw = params?.row?.createdAt ?? params?.row?.created_at;
        const ms = getMs(raw);
        return ms ?? null;
      },

      sortComparator: (a, b) => (Number(a) || 0) - (Number(b) || 0),

      // force what’s displayed (don’t rely on value/formatter)
      renderCell: (params) => {
        const ms =
          params?.row?.createdAtMs ?? getMs(params?.row?.createdAt ?? params?.row?.created_at);
        return ms ? dayjs(Number(ms)).format('YYYY-MM-DD HH:mm') : '';
      },
    },
    {
      field: 'inventoryType',
      headerName: 'Stock',
      width: 160,
      type: 'singleSelect',
      valueOptions: PRODUCT_STOCK_OPTIONS,
      renderCell: (params) => <RenderCellStock params={params} />,
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 140,
      editable: true,
      renderCell: (params) => <RenderCellPrice params={params} />,
    },
    {
      field: 'publish',
      headerName: 'Publish',
      width: 110,
      type: 'singleSelect',
      editable: true,
      valueOptions: PUBLISH_OPTIONS,
      renderCell: (params) => <RenderCellPublish params={params} />,
    },
    {
      field: 'vendorName',
      headerName: 'Vendor',
      width: 180,
      valueGetter: (params) => params?.row?.vendorName || '—',
    },
    {
      type: 'actions',
      field: 'actions',
      headerName: ' ',
      align: 'right',
      headerAlign: 'right',
      width: 80,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      getActions: (params) => [
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:eye-bold" />}
          label="View"
          onClick={() => handleViewRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:pen-bold" />}
          label="Edit"
          onClick={() => handleEditRow(params.row.id)}
        />,
        <GridActionsCellItem
          showInMenu
          icon={<Iconify icon="solar:trash-bin-trash-bold" />}
          label="Delete"
          onClick={() => {
            handleDeleteRow(params.row.id);
          }}
          sx={{ color: 'error.main' }}
        />,
      ],
    },
  ];

  const getTogglableColumns = () =>
    columns
      .filter((column) => !HIDE_COLUMNS_TOGGLABLE.includes(column.field))
      .map((column) => column.field);

  console.log('sample row', dataFiltered[0]);
  console.log('createdAtMs sample:', dataFiltered[0]?.createdAtMs, dataFiltered[0]?.createdAt);

  return (
    <>
      <DashboardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <CustomBreadcrumbs
          heading="List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Product', href: paths.dashboard.product.root },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.product.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New product
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card
          sx={{
            flexGrow: { md: 1 },
            display: { md: 'flex' },
            height: { xs: 800, md: 2 },
            flexDirection: { md: 'column' },
          }}
        >
          <DataGrid
            checkboxSelection
            disableRowSelectionOnClick
            rows={dataFiltered}
            columns={columns}
            loading={productsLoading} // This now comes from useGetProducts
            getRowHeight={() => 'auto'}
            pageSizeOptions={[5, 10, 25]}
            initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
            onRowSelectionModelChange={(newSelectionModel) => setSelectedRowIds(newSelectionModel)}
            columnVisibilityModel={columnVisibilityModel}
            onColumnVisibilityModelChange={(newModel) => setColumnVisibilityModel(newModel)}
            slots={{
              toolbar: CustomToolbarCallback,
              noRowsOverlay: () => <EmptyContent />,
              noResultsOverlay: () => <EmptyContent title="No results found" />,
            }}
            slotProps={{
              panel: { anchorEl: filterButtonEl },
              toolbar: { setFilterButtonEl },
              columnsManagement: { getTogglableColumns },
            }}
            sx={{ [`& .${gridClasses.cell}`]: { alignItems: 'center', display: 'inline-flex' } }}
          />
        </Card>
      </DashboardContent>

      <ConfirmDialog
        open={confirmRows.value}
        onClose={confirmRows.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selectedRowIds.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirmRows.onFalse();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

function CustomToolbar({
  filters,
  canReset,
  selectedRowIds,
  filteredResults,
  setFilterButtonEl,
  onOpenConfirmDeleteRows,
  onSyncShopify,
}) {
  return (
    <>
      <GridToolbarContainer>
        <ProductTableToolbar
          filters={filters}
          options={{ stocks: PRODUCT_STOCK_OPTIONS, publishs: PUBLISH_OPTIONS }}
        />

        <GridToolbarQuickFilter />

        <Stack
          spacing={1}
          flexGrow={1}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button
            size="small"
            color="primary"
            startIcon={<Iconify icon="solar:cart-plus-bold" />}
            onClick={onSyncShopify}
          >
            Sync Shopify
          </Button>

          {!!selectedRowIds.length && (
            <Button
              size="small"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={onOpenConfirmDeleteRows}
            >
              Delete ({selectedRowIds.length})
            </Button>
          )}

          <GridToolbarColumnsButton />
          <GridToolbarFilterButton ref={setFilterButtonEl} />
          <GridToolbarExport />
        </Stack>
      </GridToolbarContainer>

      {canReset && (
        <ProductTableFiltersResult
          filters={filters}
          totalResults={filteredResults}
          sx={{ p: 2.5, pt: 0 }}
        />
      )}
    </>
  );
}

function applyFilter({ inputData, filters }) {
  const { stock, publish } = filters;

  if (stock.length) {
    inputData = inputData.filter((product) => stock.includes(product.inventoryType));
  }

  if (publish.length) {
    inputData = inputData.filter((product) => publish.includes(product.publish));
  }

  return inputData;
}
