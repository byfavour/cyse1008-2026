'use client';

import {
  Box,
  Stack,
  Button,
  TextField,
  IconButton,
  Typography,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  TableContainer,
  Paper,
  Divider,
  Chip,
} from '@mui/material';

import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { Autocomplete } from '@mui/material';
import { useEffect, useRef, useCallback, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { uploadImagesToLibrary } from 'src/lib/firebase/storage';
import { Field } from 'src/components/hook-form';

// ------------------------------
// Suggested option values
const OPTION_PRESETS = {
  Size: ['XS', 'Small', 'Medium', 'Large', 'XL', 'XXL'],
  Color: ['Red', 'Green', 'Blue', 'Black', 'White'],
  Material: ['Cotton', 'Polyester', 'Wool', 'Silk'],
};

// Utility: cartesian product of option values
function cartesianProduct(arrays) {
  return arrays.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]]);
}

export function RHFVariantTable({ user, defaultPrice = 0 }) {
  const { control, watch, setValue } = useFormContext();

  const {
    fields: optionFields,
    append: appendOption,
    remove: removeOption,
    update: updateOption,
  } = useFieldArray({ control, name: 'options' });

  const { fields: variantFields, replace: replaceVariants } = useFieldArray({
    control,
    name: 'variants',
  });

  const options = watch('options');

  const lastOptionsRef = useRef([]);

  // On option update, regenerate variants if structure changed
  useEffect(() => {
    const hasValidOptions = Array.isArray(options) && options.every((o) => o?.values?.length);

    if (!hasValidOptions) return;

    const optionValues = options?.map((o) => o.values.join(',')).join('|');
    const lastOptionValues = lastOptionsRef.current?.map((o) => o.values.join(',')).join('|');

    if (optionValues !== lastOptionValues) {
      lastOptionsRef.current = options.map((o) => ({
        ...o,
        values: [...o.values], // deep copy array
      }));

      const valueArrays = options.map((opt) => (Array.isArray(opt.values) ? opt.values : []));
      const permutations = cartesianProduct(valueArrays);

      const newVariants = permutations.map((combo) => {
        const optionsMap = {};
        combo.forEach((value, idx) => {
          const key = options[idx]?.name || `Option${idx + 1}`;
          optionsMap[key] = value;
        });

        return {
          title: Object.values(optionsMap).join(' / '),
          sku: '',
          price: defaultPrice,
          stock: 0,
          options: optionsMap,
        };
      });

      replaceVariants(newVariants);
    }
  }, [options, replaceVariants]);

  const handleVariantImageUpload = useCallback(
    (variantIndex) => async (event) => {
      let files = [];

      if (Array.isArray(event)) {
        files = event;
      } else if (event?.files) {
        files = Array.from(event.files);
      } else if (event?.target?.files) {
        files = Array.from(event.target.files);
      } else if (event?.dataTransfer?.files) {
        files = Array.from(event.dataTransfer.files);
      }

      if (!files.length) {
        console.warn('No files to upload');
        return;
      }

      try {
        const uploadedUrls = await uploadImagesToLibrary(user.uid, files);
        const firstUrl = uploadedUrls?.[0] ?? '';
        setValue(`variants.${variantIndex}.image`, firstUrl, {
          shouldValidate: true,
          shouldDirty: true,
        });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    },
    [user.uid, setValue]
  );

  const handleRemoveImage = useCallback(
    (i) => () => {
      +setValue(`variants.${i}.image`, '', { shouldValidate: true, shouldDirty: true });
      setValue(`variants.${i}.image`, '', { shouldValidate: true, shouldDirty: true });
    },
    [setValue]
  );

  return (
    <Stack spacing={3}>
      <Typography variant="h6">Variants</Typography>

      {/* Option UI */}
      <Stack spacing={2}>
        {optionFields.map((field, index) => (
          <Box key={field.id} sx={{ p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {/* Autocomplete for option name */}
              <Controller
                name={`options.${index}.name`}
                control={control}
                render={({ field: nameField }) => (
                  <Autocomplete
                    freeSolo
                    options={Object.keys(OPTION_PRESETS)}
                    value={nameField.value}
                    onChange={(_, newValue) => {
                      nameField.onChange(newValue);
                      const suggestedValues = OPTION_PRESETS[newValue] || [];
                      updateOption(index, {
                        ...optionFields[index],
                        name: newValue,
                        values: suggestedValues,
                      });
                    }}
                    onInputChange={(_, val) => nameField.onChange(val)}
                    renderInput={(params) => (
                      <TextField {...params} label="Option name" fullWidth />
                    )}
                    sx={{ width: '100%' }}
                  />
                )}
              />

              <IconButton onClick={() => removeOption(index)} color="error">
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Stack>

            {/* Autocomplete for option values */}
            <Controller
              name={`options.${index}.values`}
              control={control}
              defaultValue={[]}
              render={({ field: valuesField }) => (
                <Autocomplete
                  multiple
                  freeSolo
                  options={OPTION_PRESETS[optionFields[index]?.name] || []}
                  value={valuesField.value || []}
                  onChange={(_, newValues) => {
                    valuesField.onChange(newValues);
                    updateOption(index, {
                      ...optionFields[index],
                      values: newValues,
                    });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Option values"
                      placeholder="Add a value and press enter"
                      sx={{ mt: 2 }}
                    />
                  )}
                  renderTags={(selected, getTagProps) =>
                    selected.map((option, idx) => (
                      <Chip
                        {...getTagProps({ index: idx })}
                        key={option}
                        label={option}
                        size="small"
                        color="info"
                        variant="soft"
                      />
                    ))
                  }
                />
              )}
            />
          </Box>
        ))}

        <Button
          variant="outlined"
          startIcon={<Iconify icon="solar:add-circle-bold" />}
          onClick={() => appendOption({ name: '', values: [] })}
        >
          Add another option
        </Button>
      </Stack>

      {/* Variant table */}
      {variantFields.length > 0 && (
        <>
          <Divider />
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Variant</TableCell>
                  <TableCell>Image</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Stock</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {variantFields.map((variant, i) => (
                  <TableRow key={variant.id}>
                    <TableCell>{variant.title}</TableCell>
                    <TableCell sx={{ width: 64 }}>
                      <Field.Upload
                        thumbnail
                        name={`variants.${i}.image`}
                        onUpload={(e) => handleVariantImageUpload(i)}
                        onDelete={handleRemoveImage(i)}
                        uploadPlaceholderIcon="solar:image-add-bold"
                        uploadPlaceholderLabel=""
                      />
                    </TableCell>

                    <TableCell>
                      <Controller
                        name={`variants.${i}.price`}
                        control={control}
                        render={({ field }) => <TextField type="number" size="small" {...field} />}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name={`variants.${i}.stock`}
                        control={control}
                        render={({ field }) => <TextField type="number" size="small" {...field} />}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Stack>
  );
}
