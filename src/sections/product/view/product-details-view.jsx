'use client';

import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tabs from '@mui/material/Tabs';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useTabs } from 'src/hooks/use-tabs';

import { varAlpha } from 'src/theme/styles';
import { PRODUCT_PUBLISH_OPTIONS } from 'src/constants/options';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { useAuthContext } from 'src/auth/hooks';

import { ProductDetailsReview } from '../product-details-review';
import { ProductDetailsSummary } from '../product-details-summary';
import { ProductDetailsToolbar } from '../product-details-toolbar';
import { ProductDetailsCarousel } from '../product-details-carousel';
import { ProductDetailsDescription } from '../product-details-description';

// ----------------------------------------------------------------------

const SUMMARY = [
  {
    title: '100% original',
    description: 'Chocolate bar candy canes ice cream toffee cookie halvah.',
    icon: 'solar:verified-check-bold',
  },
  {
    title: '10 days replacement',
    description: 'Marshmallow biscuit donut dragée fruitcake wafer.',
    icon: 'solar:clock-circle-bold',
  },
  {
    title: 'Year warranty',
    description: 'Cotton candy gingerbread cake I love sugar sweet.',
    icon: 'solar:shield-check-bold',
  },
];

// ----------------------------------------------------------------------

export function ProductDetailsView({ product }) {
  const tabs = useTabs('description');
  const { user } = useAuthContext();
  const role = user?.role || '';
  const isStaff = ['admin', 'owner'].includes(role);

  const [publish, setPublish] = useState('');

  useEffect(() => {
    if (product) {
      setPublish(product?.publish);
    }
  }, [product]);

  const handleChangePublish = useCallback((newValue) => {
    setPublish(newValue);
  }, []);

  return (
    <DashboardContent>
      <ProductDetailsToolbar
        backLink={paths.dashboard.product.root}
        editLink={paths.dashboard.product.edit(`${product?.id}`)}
        liveLink={paths.product.details(`${product?.id}`)}
        publish={publish}
        onChangePublish={handleChangePublish}
        publishOptions={PRODUCT_PUBLISH_OPTIONS}
      />

      <Grid container spacing={{ xs: 3, md: 5, lg: 8 }}>
        <Grid xs={12} md={6} lg={7}>
          <ProductDetailsCarousel images={product?.images ?? []} />
        </Grid>

        <Grid xs={12} md={6} lg={5}>
          {product && <ProductDetailsSummary disableActions product={product} />}
        </Grid>
      </Grid>

      <Box
        gap={5}
        display="grid"
        gridTemplateColumns={{ xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' }}
        sx={{ my: 10 }}
      >
        {SUMMARY.map((item) => (
          <Box key={item.title} sx={{ textAlign: 'center', px: 5 }}>
            <Iconify icon={item.icon} width={32} sx={{ color: 'primary.main' }} />

            <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>
              {item.title}
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {item.description}
            </Typography>
          </Box>
        ))}
      </Box>

      <Card>
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{
            px: 3,
            boxShadow: (theme) =>
              `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
          }}
        >
          {[
            { value: 'description', label: 'Description' },
            { value: 'reviews', label: `Reviews (${product?.reviews?.length})` },
          ].map((tab) => (
            <Tab key={tab.value} value={tab.value} label={tab.label} />
          ))}
        </Tabs>

        {tabs.value === 'description' && (
          <ProductDetailsDescription description={product?.description ?? ''} />
        )}

        {tabs.value === 'reviews' && (
          <ProductDetailsReview
            ratings={product?.ratings ?? []}
            reviews={product?.reviews ?? []}
            totalRatings={product?.totalRatings ?? 0}
            totalReviews={product?.totalReviews ?? 0}
          />
        )}
      </Card>

      {/* Security context — for classroom demo */}
      <Card variant="outlined" sx={{ p: 2, mt: 3, bgcolor: 'background.neutral' }}>
        <Stack spacing={1.5}>
          <Typography variant="overline" sx={{ color: 'text.disabled' }}>
            Security context
          </Typography>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ color: 'text.disabled', width: 120 }}>
              Logged in as
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
              {user?.uid ?? 'unauthenticated'}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="caption" sx={{ color: 'text.disabled', width: 120 }}>
              Role
            </Typography>
            <Chip size="small" label={role || 'none'} color={isStaff ? 'primary' : 'default'} />
          </Stack>

          <Divider />

          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              Rule evidence
            </Typography>
            <Typography variant="caption">
              ✅ Read → <code>allow read: if true</code> (public)
            </Typography>
            <Typography variant="caption">
              {isStaff ? '✅' : '🔒'} Create / Update / Delete →{' '}
              <code>isStaff()</code>: <strong>{isStaff ? 'pass' : 'blocked'}</strong>
              {!isStaff && (
                <> — set <code>role: &quot;admin&quot;</code> or <code>&quot;owner&quot;</code> in Auth emulator</>
              )}
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </DashboardContent>
  );
}
