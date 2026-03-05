import Fab from '@mui/material/Fab';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Image } from 'src/components/image';
import { Iconify } from 'src/components/iconify';
import { ColorPreview } from 'src/components/color-utils';

import { useCheckoutContext } from '../checkout/context';
import { getProductStockCount, isProductAvailable } from 'src/utils/inventory';

// ----------------------------------------------------------------------

export function ProductItem({ product }) {
  const checkout = useCheckoutContext();

  const availableCount = getProductStockCount(product); // sum of variant stock
  const inStock = isProductAvailable(product);

  const {
    id,
    name,
    coverUrl,
    images = [],
    price,
    colors = [],
    sizes = [],
    priceSale,
    newLabel = { enabled: false, content: '' },
    saleLabel = { enabled: false, content: '' },
  } = product;

  const safeColors =
    Array.isArray(colors) && colors.length
      ? colors.filter((color) => {
          if (color == null) return false;
          const value = String(color).trim();
          return value !== '' && value !== '0';
        })
      : [];

  const priceValue = Number(price ?? 0);
  const priceSaleValue = Number(priceSale ?? 0);
  const hasSale = Number.isFinite(priceSaleValue) && priceSaleValue > 0;
  const taxes = Number.isFinite(Number(product?.taxes)) ? Number(product?.taxes) : 0;

  const linkTo = paths.product.details(id);

  console.log({
    id,
    name,
    coverUrl,
    price,
    colors,
    inStock,
    availableCount,
    sizes,
    priceSale,
    newLabel,
    saleLabel,
    ...product,
  });

  const handleAddCart = async () => {
    // Optional: pick first color/size only if they exist:
    const color = safeColors.length ? safeColors[0] : null;
    const size = Array.isArray(product.sizes) && product.sizes.length ? product.sizes[0] : null;
    const mainImage =
      product.coverUrl || (Array.isArray(product.images) && product.images.length ? product.images[0] : '');

    // Don’t add if nothing left
    if (!inStock) return;

    const newProduct = {
      id: product.id,
      name: product.name || product.title || '',
      coverUrl: mainImage,
      price: product.price,
      colors: color ? [color] : [],
      size,
      quantity: 1,
      taxes,
      // You can also pass availableCount if your cart wants to cap later
      available: availableCount,
    };

    try {
      checkout.onAddToCart(newProduct);
    } catch (error) {
      console.error(error);
    }
  };

  const renderLabels = (newLabel.enabled || saleLabel.enabled) && (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{
        position: 'absolute',
        zIndex: 9,
        top: 16,
        right: 16,
      }}
    >
      {newLabel.enabled && (
        <Label variant="filled" color="info">
          {newLabel.content}
        </Label>
      )}
      {saleLabel.enabled && (
        <Label variant="filled" color="error">
          {saleLabel.content}
        </Label>
      )}
    </Stack>
  );

  const renderImg = (
    <Box sx={{ position: 'relative', p: 1 }}>
      {!!inStock && (
        <Fab
          color="warning"
          size="medium"
          className="add-cart-btn"
          onClick={handleAddCart}
          sx={{
            right: 16,
            bottom: 16,
            zIndex: 9,
            opacity: 0,
            position: 'absolute',
            transition: (theme) =>
              theme.transitions.create('all', {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.shorter,
              }),
          }}
        >
          <Iconify icon="solar:cart-plus-bold" width={24} />
        </Fab>
      )}

      <Tooltip title={!inStock && 'Out of stock'} placement="bottom-end">
        <Image
          alt={name}
          src={coverUrl || images[0]}
          ratio="1/1"
          sx={{ borderRadius: 1.5, ...(!inStock && { opacity: 0.48, filter: 'grayscale(1)' }) }}
        />
      </Tooltip>
    </Box>
  );

  const renderContent = (
    <Stack spacing={2.5} sx={{ p: 3, pt: 2 }}>
      <Link component={RouterLink} href={linkTo} color="inherit" variant="subtitle2" noWrap>
        {name}
      </Link>

      <Stack direction="row" alignItems="center" justifyContent="space-between">
        {safeColors.length ? <ColorPreview colors={safeColors} /> : null}

        <Stack direction="row" spacing={0.5} sx={{ typography: 'subtitle1' }}>
          {hasSale && (
            <Box component="span" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>
              {fCurrency(priceSaleValue)}
            </Box>
          )}

          <Box component="span">{fCurrency(priceValue)}</Box>
        </Stack>
      </Stack>
    </Stack>
  );

  return (
    <Card sx={{ '&:hover .add-cart-btn': { opacity: 1 } }}>
      {renderLabels}

      {renderImg}

      {renderContent}
    </Card>
  );
}
