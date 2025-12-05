import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';

import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';
import { fTime, fDate } from 'src/utils/format-time';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export function RenderCellPrice({ params }) {
  return fCurrency(params.row.price);
}

// ----------------------------------------------------------------------

export function RenderCellPublish({ params }) {
  return (
    <Label variant="soft" color={(params.row.publish === 'published' && 'info') || 'default'}>
      {params.row.publish}
    </Label>
  );
}

// ----------------------------------------------------------------------

export function RenderCellCreatedAt({ params }) {
  return (
    <Stack spacing={0.5}>
      <Box component="span">{fDate(params.row.createdAt)}</Box>
      <Box component="span" sx={{ typography: 'caption', color: 'text.secondary' }}>
        {fTime(params.row.createdAt)}
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function RenderCellStock({ params }) {
  return (
    <Stack justifyContent="center" sx={{ typography: 'caption', color: 'text.secondary' }}>
      <LinearProgress
        value={(params.row.available * 100) / params.row.quantity}
        variant="determinate"
        color={
          (params.row.inventoryType === 'out of stock' && 'error') ||
          (params.row.inventoryType === 'low stock' && 'warning') ||
          'success'
        }
        sx={{ mb: 1, width: 1, height: 6, maxWidth: 80 }}
      />
      {!!params.row.available && params.row.available} {params.row.inventoryType}
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function RenderCellProduct({ params, onEditRow, editHref }) {
  const linkProps = {
    component: RouterLink,
    href: editHref || '#',
    onClick: (event) => {
      event.preventDefault();
      onEditRow?.();
    },
  };

  return (
    <Stack direction="row" alignItems="center" sx={{ py: 2, width: 1 }}>
      <Link {...linkProps} sx={{ display: 'inline-flex' }}>
        <Avatar
          alt={params.row.name}
          src={params.row.images && params.row.images.length > 0 ? params.row.images[0] : ''}
          variant="rounded"
          sx={{ width: 64, height: 64, mr: 2 }}
        />
      </Link>

      <ListItemText
        disableTypography
        primary={
          <Link
            noWrap
            color="inherit"
            variant="subtitle2"
            sx={{ cursor: 'pointer' }}
            {...linkProps}
          >
            {params.row.name}
          </Link>
        }
        secondary={
          <Box component="div" sx={{ typography: 'body2', color: 'text.disabled' }}>
            {params.row.category}
          </Box>
        }
        sx={{ display: 'flex', flexDirection: 'column' }}
      />
    </Stack>
  );
}
