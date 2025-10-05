import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo, useState, useEffect, useContext, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import ProductContext from 'src/lib/contexts/ProductContext';
import { uploadImagesToLibrary } from 'src/lib/firebase/storage';
import {
  _tags,
  PRODUCT_SIZE_OPTIONS,
  PRODUCT_GENDER_OPTIONS,
  PRODUCT_COLOR_NAME_OPTIONS,
  PRODUCT_CATEGORY_GROUP_OPTIONS,
} from 'src/_mock';

import { toast } from 'src/components/snackbar';
import { Form, Field, schemaHelper } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------
export const NewProductSchema = zod.object({
  name: zod.string().min(1, { message: 'Name is required!' }),
  description: schemaHelper.editor({ message: { required_error: 'Description is required!' } }),
  images: schemaHelper.files({ minFiles: 1, message: { required_error: 'Images is required!' } }),
  code: zod.string().min(1, { message: 'Product code is required!' }),
  stock: zod.coerce.number().min(0).default(0),
  variants: zod
    .array(
      zod
        .object({
          title: zod.string().min(1),
          sku: zod.string().min(1),
          price: zod.coerce.number().min(0),
          stock: zod.coerce.number().min(0).optional(),
          quantity: zod.coerce.number().min(0).optional(), // legacy allowance
          options: zod.record(zod.string(), zod.string()).optional(),
          image: zod.union([zod.string(), zod.any()]).optional(),
        })
        .transform((v) => ({ ...v, stock: Number(v.stock ?? v.quantity ?? 0) }))
    )
    .optional()
    .default([]),

  options: zod
    .array(
      zod.object({
        name: zod.string().min(1),
        values: zod.array(zod.string().min(1)).min(1),
      })
    )
    .optional()
    .default([]),

  gender: zod.array(zod.string()).nonempty({ message: 'Choose at least one option!' }),
  price: zod.coerce.number().min(1, { message: 'Price should not be $0.00' }),
  category: zod.string(),
  priceSale: zod.coerce.number().optional().default(0),
  subDescription: zod.string().optional().default(''),
  taxes: zod.coerce.number().optional().default(0),
  saleLabel: zod.object({ enabled: zod.boolean(), content: zod.string().optional().default('') }),
  newLabel: zod.object({ enabled: zod.boolean(), content: zod.string().optional().default('') }),
});

// ----------------------------------------------------------------------

export function ProductNewEditForm({ currentProduct }) {
  const router = useRouter();
  const { user } = useAuthContext();

  const { createProduct, updateProduct } = useContext(ProductContext);

  const [includeTaxes, setIncludeTaxes] = useState(false);

  const defaultValues = useMemo(
    () => ({
      name: currentProduct?.name || '',
      description: currentProduct?.description || '',
      subDescription: currentProduct?.subDescription || '',
      images: currentProduct?.images || [],
      code: currentProduct?.code || '',
      sku: currentProduct?.sku || '',
      price: currentProduct?.price ?? 0,
      stock: currentProduct?.stock ?? 0,
      priceSale: currentProduct?.priceSale ?? 0,
      tags: currentProduct?.tags || [],
      taxes: currentProduct?.taxes ?? 0,
      gender: currentProduct?.gender || [],
      category: currentProduct?.category || PRODUCT_CATEGORY_GROUP_OPTIONS[0].classify[1],
      colors: currentProduct?.colors || [],
      sizes: currentProduct?.sizes || [],
      options: currentProduct?.options || [], // <-- add this
      variants: currentProduct?.variants || [], // <-- often useful to include
      newLabel: currentProduct?.newLabel || { enabled: false, content: '' },
      saleLabel: currentProduct?.saleLabel || { enabled: false, content: '' },
    }),
    [currentProduct]
  );

  const methods = useForm({
    resolver: zodResolver(NewProductSchema),
    defaultValues,
    shouldFocusError: true,
    criteriaMode: 'firstError',
  });

  const onInvalid = (errors) => {
    console.log('❌ Validation errors:', errors);
    toast.error('Please fix the highlighted fields.');
  };

  const {
    reset,
    watch,
    setValue,
    getValues,
    trigger,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  // const values = watch();
  // const values = watch(); // ❌ causes re-render on every keystroke for ALL fields
  const options = watch('options'); // ✅ just what VariantTable needs
  const price = watch('price'); // ✅ if VariantTable needs default price
  const images = watch('images') || [];
  const saleLabelEnabled = watch('saleLabel.enabled');
  const newLabelEnabled = watch('newLabel.enabled');

  useEffect(() => {
    if (currentProduct) {
      reset(defaultValues);
    }
  }, [currentProduct, defaultValues, reset]);

  useEffect(() => {
    setValue('taxes', includeTaxes ? 0 : (currentProduct?.taxes ?? 0));
  }, [includeTaxes, setValue]);

  useEffect(() => {
    if (methods.formState.isSubmitted) {
      console.log('RHF errors:', methods.formState.errors);
    }
  }, [methods.formState.errors, methods.formState.isSubmitted]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      await trigger('images');
      const images = getValues('images') || [];
      const saleLabelEnabled = watch('saleLabel.enabled') || false;
      const newLabelEnabled = watch('newLabel.enabled') || false;

      if (!Array.isArray(images) || images.length === 0) {
        toast.error('Please upload at least one image.');
        return;
      }

      const hasVariants = data.variants && data.variants.length > 0;

      const normalizedVariants = hasVariants
        ? data.variants.map((v) => ({
            ...v,
            stock: Number(v.stock ?? 0), // already normalized by schema
          }))
        : [
            {
              title: data.name,
              sku: data.sku || data.code || 'SKU-DEFAULT',
              price: data.price,
              stock: Number(data.stock ?? 0), // use top-level stock for single-variant
              options: {},
              image: images,
            },
          ];

      const productLevelStock = normalizedVariants.reduce((s, v) => s + Number(v.stock ?? 0), 0);

      delete productData.quantity;
      productData.variants = productData.variants.map(({ quantity, ...rest }) => rest);

      const productData = {
        ...data,
        images,
        ownerId: user.id || user.uid,
        variants: normalizedVariants,
      };

      if (currentProduct) {
        await updateProduct(currentProduct.id, productData);
        toast.success('Update successful!');
      } else {
        await createProduct(productData);
        toast.success('Product created!');
      }

      reset();
      router.push(paths.dashboard.product.root);
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error('Something went wrong, please try again!');
    }
  });

  const handleOnUpload = useCallback(
    async (event) => {
      console.log('Event:', event); // Debugging: check what exactly is received

      let files = [];

      if (Array.isArray(event)) {
        files = event;
      } else if (event.files) {
        files = Array.from(event.files);
      } else if (event.target?.files) {
        files = Array.from(event.target.files);
      } else if (event.dataTransfer?.files) {
        files = Array.from(event.dataTransfer.files);
      }

      if (!files.length) {
        console.error('❌ No files found in event!');
        return;
      }

      console.log('✅ Files selected:', files);

      try {
        const uploadedUrls = await uploadImagesToLibrary(user.id, files);
        console.log('✅ Uploaded image URLs:', uploadedUrls);

        setValue('images', uploadedUrls, { shouldValidate: true, shouldDirty: true });
      } catch (error) {
        console.error('❌ Error uploading images:', error);
      }
    },
    [user.id, setValue]
  );

  const handleRemoveFile = useCallback(
    (fileUrl) => {
      const filtered = images.filter((url) => url !== fileUrl);
      setValue('images', filtered, { shouldValidate: true, shouldDirty: true });
    },
    [images, setValue]
  );

  const handleRemoveAllFiles = useCallback(() => {
    setValue('images', [], { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleChangeIncludeTaxes = useCallback((event) => {
    setIncludeTaxes(event.target.checked);
  }, []);

  const renderDetails = (
    <Card>
      <CardHeader title="Details" subheader="Title, short description, image..." sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text name="name" label="Product name" />

        <Field.Text name="subDescription" label="Sub description" multiline rows={4} />

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Content</Typography>
          <Field.Editor name="description" sx={{ maxHeight: 480 }} />
        </Stack>

        <Stack spacing={1.5}>
          <Typography variant="subtitle2">Images</Typography>
          <Field.Upload
            multiple
            thumbnail
            name="images"
            // maxSize={3145728}
            onRemove={handleRemoveFile}
            onRemoveAll={handleRemoveAllFiles}
            onUpload={handleOnUpload}
          />
        </Stack>
      </Stack>
    </Card>
  );

  const renderProperties = (
    <Card>
      <CardHeader
        title="Properties"
        subheader="Additional functions and attributes..."
        sx={{ mb: 3 }}
      />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Box
          columnGap={2}
          rowGap={3}
          display="grid"
          gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }}
        >
          <Field.Text name="code" label="Product code" />

          <Field.Text name="sku" label="Product SKU" />

          <Field.Text
            name="stock"
            label="Stock on hand"
            placeholder="0"
            type="number"
            InputLabelProps={{ shrink: true }}
          />

          <Field.Select native name="category" label="Category" InputLabelProps={{ shrink: true }}>
            {PRODUCT_CATEGORY_GROUP_OPTIONS.map((category) => (
              <optgroup key={category.group} label={category.group}>
                {category.classify.map((classify) => (
                  <option key={classify} value={classify}>
                    {classify}
                  </option>
                ))}
              </optgroup>
            ))}
          </Field.Select>

          <Field.MultiSelect
            checkbox
            name="colors"
            label="Colors"
            options={PRODUCT_COLOR_NAME_OPTIONS}
          />

          <Field.MultiSelect checkbox name="sizes" label="Sizes" options={PRODUCT_SIZE_OPTIONS} />
        </Box>

        <Field.Autocomplete
          name="tags"
          label="Tags"
          placeholder="+ Tags"
          multiple
          freeSolo
          disableCloseOnSelect
          options={_tags.map((option) => option)}
          getOptionLabel={(option) => option}
          renderOption={(props, option) => (
            <li {...props} key={option}>
              {option}
            </li>
          )}
          renderTags={(selected, getTagProps) =>
            selected.map((option, index) => (
              <Chip
                {...getTagProps({ index })}
                key={option}
                label={option}
                size="small"
                color="info"
                variant="soft"
              />
            ))
          }
        />

        <Stack spacing={1}>
          <Typography variant="subtitle2">Gender</Typography>
          <Field.MultiCheckbox row name="gender" options={PRODUCT_GENDER_OPTIONS} sx={{ gap: 2 }} />
        </Stack>

        <Stack spacing={3}>
          <Field.VariantTable
            name="variants"
            optionNames={options}
            defaultPrice={price}
            user={user}
          />
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" alignItems="center" spacing={3}>
          <Field.Switch name="saleLabel.enabled" label={null} sx={{ m: 0 }} />
          <Field.Text
            name="saleLabel.content"
            label="Sale label"
            fullWidth
            disabled={!saleLabelEnabled}
          />
        </Stack>

        <Stack direction="row" alignItems="center" spacing={3}>
          <Field.Switch name="newLabel.enabled" label={null} sx={{ m: 0 }} />
          <Field.Text
            name="newLabel.content"
            label="New label"
            fullWidth
            disabled={!newLabelEnabled}
          />
        </Stack>
      </Stack>
    </Card>
  );

  const renderPricing = (
    <Card>
      <CardHeader title="Pricing" subheader="Price related inputs" sx={{ mb: 3 }} />

      <Divider />

      <Stack spacing={3} sx={{ p: 3 }}>
        <Field.Text
          name="price"
          label="Regular price"
          placeholder="0.00"
          type="number"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box component="span" sx={{ color: 'text.disabled' }}>
                  $
                </Box>
              </InputAdornment>
            ),
          }}
        />

        <Field.Text
          name="priceSale"
          label="Sale price"
          placeholder="0.00"
          type="number"
          InputLabelProps={{ shrink: true }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box component="span" sx={{ color: 'text.disabled' }}>
                  $
                </Box>
              </InputAdornment>
            ),
          }}
        />

        <FormControlLabel
          control={
            <Switch id="toggle-taxes" checked={includeTaxes} onChange={handleChangeIncludeTaxes} />
          }
          label="Price includes taxes"
        />

        {!includeTaxes && (
          <Field.Text
            name="taxes"
            label="Tax (%)"
            placeholder="0.00"
            type="number"
            InputLabelProps={{ shrink: true }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Box component="span" sx={{ color: 'text.disabled' }}>
                    %
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        )}
      </Stack>
    </Card>
  );

  const renderActions = (
    <Stack spacing={3} direction="row" alignItems="center" flexWrap="wrap">
      <FormControlLabel
        control={<Switch defaultChecked inputProps={{ id: 'publish-switch' }} />}
        label="Publish"
        sx={{ pl: 3, flexGrow: 1 }}
      />

      <LoadingButton type="submit" variant="contained" size="large" loading={isSubmitting}>
        {!currentProduct ? 'Create product!' : 'Save changes'}
      </LoadingButton>
    </Stack>
  );

  return (
    <Form methods={methods} noValidate onSubmit={methods.handleSubmit(onSubmit, onInvalid)}>
      <Stack spacing={{ xs: 3, md: 5 }} sx={{ mx: 'auto', maxWidth: { xs: 720, xl: 880 } }}>
        {renderDetails}

        {renderPricing}

        {renderProperties}

        {renderActions}
      </Stack>
    </Form>
  );
}
