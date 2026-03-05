import { useEffect, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Rating from '@mui/material/Rating';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import TextField from '@mui/material/TextField';

import { formHelperTextClasses } from '@mui/material/FormHelperText';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fCurrency, fShortenNumber } from 'src/utils/format-number';
import { getProductStockCount } from 'src/utils/inventory';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';
import { ColorPicker } from 'src/components/color-utils';

import { IncrementerButton } from './components/incrementer-button';

// ----------------------------------------------------------------------

export function ProductDetailsSummary({
  items,
  product,
  onAddCart,
  onGotoStep,
  disableActions,
  ...other
}) {
  const router = useRouter();

  const {
    id,
    name,
    title,
    sizes = [],
    price,
    coverUrl,
    images = [],
    colors = [],
    newLabel = { enabled: false, content: '' },
    priceSale,
    saleLabel = { enabled: false, content: '' },
    totalRatings,
    totalReviews,
    inventoryType,
    subDescription,
  } = product;

  // Derive availability from stock (sum of variants or product stock_on_hand)
  const availableCount = getProductStockCount(product);

  const existProduct = Array.isArray(items) ? items.some((item) => item.id === id) : false;
  const cartLine = Array.isArray(items) ? items.find((item) => item.id === id) : null;
  const isMaxQuantity = cartLine ? cartLine.quantity >= availableCount : false;

  const hasColors = Array.isArray(colors) && colors.length > 0;
  const hasSizes = false; // temporarily hide sizes for MVP

  const mainImage = coverUrl || (Array.isArray(images) && images.length ? images[0] : '');

  const defaultValues = {
    id,
    name: name || title || '',
    coverUrl: mainImage,
    available: availableCount,
    price,
    taxes: product?.taxes ?? 0,
    colors: hasColors ? colors[0] : '',
    size: hasSizes ? sizes[0] : '',
    quantity: availableCount < 1 ? 0 : 1,
  };

  const methods = useForm({ defaultValues });

  const { reset, watch, control, setValue, handleSubmit, formState } = methods;
  const { isSubmitting } = formState;

  const values = watch();

  useEffect(() => {
    if (product) {
      reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      const clampedQty = Math.max(0, Math.min(data.quantity, availableCount));
      const payload = {
        ...data,
        quantity: clampedQty,
        colors: [values.colors],
        taxes: Number(product?.taxes ?? 0),
        subtotal: data.price * clampedQty,
      };
      if (!existProduct) {
        onAddCart?.(payload);
      }
      onGotoStep?.(0);
      router.push(paths.product.checkout);
    } catch (error) {
      console.error(error);
    }
  });

  const handleAddCart = useCallback(() => {
    try {
      const clampedQty = Math.max(0, Math.min(values.quantity, availableCount));
      onAddCart?.({
        ...values,
        quantity: clampedQty,
        coverUrl: mainImage,
        colors: [values.colors],
        taxes: Number(product?.taxes ?? 0),
        subtotal: values.price * clampedQty,
        // pass available so cart can cap increments later too
        available: availableCount,
      });
    } catch (error) {
      console.error(error);
    }
  }, [onAddCart, values, availableCount]);

  const renderPrice = (
    <Box sx={{ typography: 'h5' }}>
      {priceSale && (
        <Box
          component="span"
          sx={{ color: 'text.disabled', textDecoration: 'line-through', mr: 0.5 }}
        >
          {fCurrency(priceSale)}
        </Box>
      )}

      {fCurrency(price)}
    </Box>
  );

  const renderShare = (
    <Stack direction="row" spacing={3} justifyContent="center">
      <Link
        variant="subtitle2"
        sx={{ color: 'text.secondary', display: 'inline-flex', alignItems: 'center' }}
      >
        <Iconify icon="mingcute:add-line" width={16} sx={{ mr: 1 }} />
        Compare
      </Link>

      <Link
        variant="subtitle2"
        sx={{ color: 'text.secondary', display: 'inline-flex', alignItems: 'center' }}
      >
        <Iconify icon="solar:heart-bold" width={16} sx={{ mr: 1 }} />
        Favorite
      </Link>

      <Link
        variant="subtitle2"
        sx={{ color: 'text.secondary', display: 'inline-flex', alignItems: 'center' }}
      >
        <Iconify icon="solar:share-bold" width={16} sx={{ mr: 1 }} />
        Share
      </Link>
    </Stack>
  );

  const renderColorOptions = (
    <Stack direction="row">
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Color
      </Typography>

      {hasColors && (
        <Controller
          name="colors"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              fullWidth
              label="Color"
              value={field.value ?? ''} // keep it defined
              SelectProps={{ displayEmpty: true }}
            >
              {colors.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
      )}
    </Stack>
  );

  const renderSizeOptions = null;

  const renderQuantity = (
    <Stack direction="row">
      <Typography variant="subtitle2" sx={{ flexGrow: 1 }}>
        Quantity
      </Typography>

      <Stack spacing={1}>
        <IncrementerButton
          name="quantity"
          quantity={values.quantity}
          disabledDecrease={values.quantity <= 1}
          disabledIncrease={values.quantity >= availableCount}
          onIncrease={() => setValue('quantity', values.quantity + 1)}
          onDecrease={() => setValue('quantity', values.quantity - 1)}
        />

        <Typography variant="caption" component="div" sx={{ textAlign: 'right' }}>
          Available: {availableCount}
        </Typography>
      </Stack>
    </Stack>
  );

  const mustChooseColor = hasColors && !values.colors;
  const mustChooseSize = hasSizes && !values.size;
  const disablePurchase =
    mustChooseColor || mustChooseSize || values.quantity < 1 || availableCount < 1;

  const renderActions = (
    <Stack direction="row" spacing={2}>
      <Button
        fullWidth
        disabled={isMaxQuantity || disableActions}
        size="large"
        color="warning"
        variant="contained"
        startIcon={<Iconify icon="solar:cart-plus-bold" width={24} />}
        onClick={handleAddCart}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Add to cart
      </Button>

      <LoadingButton
        fullWidth
        size="large"
        type="submit"
        variant="contained"
        disabled={disablePurchase}
        loading={isSubmitting}
      >
        {disablePurchase ? 'Select options' : 'Buy now'}
      </LoadingButton>
    </Stack>
  );

  const renderSubDescription = (
    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
      {subDescription}
    </Typography>
  );

  const renderRating = (
    <Stack direction="row" alignItems="center" sx={{ color: 'text.disabled', typography: 'body2' }}>
      <Rating size="small" value={totalRatings} precision={0.1} readOnly sx={{ mr: 1 }} />
      {`(${fShortenNumber(totalReviews)} reviews)`}
    </Stack>
  );

  const renderLabels = (newLabel.enabled || saleLabel.enabled) && (
    <Stack direction="row" alignItems="center" spacing={1}>
      {newLabel.enabled && <Label color="info">{newLabel.content}</Label>}
      {saleLabel.enabled && <Label color="error">{saleLabel.content}</Label>}
    </Stack>
  );

  const renderInventoryType = (
    <Box
      component="span"
      sx={{
        typography: 'overline',
        color:
          (inventoryType === 'out of stock' && 'error.main') ||
          (inventoryType === 'low stock' && 'warning.main') ||
          'success.main',
      }}
    >
      {inventoryType}
    </Box>
  );

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Stack spacing={3} sx={{ pt: 3 }} {...other}>
        <Stack spacing={2} alignItems="flex-start">
          {renderLabels}

          {renderInventoryType}

          <Typography variant="h5">{name}</Typography>

          {renderRating}

          {renderPrice}

          {renderSubDescription}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderColorOptions}

        {renderQuantity}

        <Divider sx={{ borderStyle: 'dashed' }} />

        {renderActions}

        {renderShare}
      </Stack>
    </Form>
  );
}
