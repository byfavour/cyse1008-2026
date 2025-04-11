'use client';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
// import { useMemo } from 'react';
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  IconButton,
  TextField,
  Stack,
  Typography,
  Button,
  Card,
  CardHeader,
  Divider,
} from '@mui/material';
import { Iconify } from '../../components/iconify';
// import DeleteIcon from '@mui/icons-material/Delete';
// import AddIcon from '@mui/icons-material/Add';

// ----------------------------------------------------------------------

export default function RHFVariantTable({ name = 'variants', optionNames = ['Size', 'Color'] }) {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name });

  const handleAdd = () => {
    const defaultOptions = Object.fromEntries(optionNames.map((key) => [key, '']));
    append({
      id: Date.now().toString(),
      title: '',
      sku: '',
      price: '',
      quantity: '',
      options: defaultOptions,
    });
  };

  const handleOptionChange = (index, key, value) => {
    const current = [...watch(name)];
    current[index].options[key] = value;
    setValue(name, current, { shouldDirty: true });
  };

  return (
    <Card>
      <CardHeader title="Variants" subheader="Define multiple options for this product" />
      <Divider />
      <Stack spacing={2} sx={{ p: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
          onClick={handleAdd}
          sx={{ alignSelf: 'flex-start' }}
        >
          Add Variant
        </Button>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              {optionNames.map((key) => (
                <TableCell key={key}>{key}</TableCell>
              ))}
              <TableCell>SKU</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {fields.map((item, index) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Controller
                    name={`${name}.${index}.title`}
                    control={control}
                    render={({ field }) => <TextField fullWidth size="small" {...field} />}
                  />
                </TableCell>
                {optionNames.map((key) => (
                  <TableCell key={key}>
                    <TextField
                      fullWidth
                      size="small"
                      value={watch(`${name}.${index}.options.${key}`) || ''}
                      onChange={(e) => handleOptionChange(index, key, e.target.value)}
                    />
                  </TableCell>
                ))}
                <TableCell>
                  <Controller
                    name={`${name}.${index}.sku`}
                    control={control}
                    render={({ field }) => <TextField fullWidth size="small" {...field} />}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name={`${name}.${index}.price`}
                    control={control}
                    render={({ field }) => (
                      <TextField fullWidth size="small" type="number" {...field} />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name={`${name}.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <TextField fullWidth size="small" type="number" {...field} />
                    )}
                  />
                </TableCell>
                <TableCell>
                  <IconButton color="error" onClick={() => remove(index)}>
                    {/* <DeleteIcon /> */}
                    <Iconify icon="eva:arrow-ios-back-fill" width={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {fields.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography variant="body2" sx={{ py: 2, color: 'text.secondary' }}>
                    No variants added yet.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Stack>
    </Card>
  );
}
