'use client';

import { useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

import { paths } from 'src/routes/paths';

import { ORDER_STATUS_OPTIONS } from 'src/constants/options';
import { DashboardContent } from 'src/layouts/dashboard';
import { toast } from 'src/components/snackbar';

import { OrderDetailsInfo } from '../order-details-info';
import { OrderDetailsItems } from '../order-details-item';
import { OrderDetailsToolbar } from '../order-details-toolbar';
import { OrderDetailsHistory } from '../order-details-history';
import { PaymentLinkDialog } from '../payment-link-dialog';

// ----------------------------------------------------------------------

export function OrderDetailsView({ order }) {
  const [status, setStatus] = useState(order?.status);
  const [paymentLink, setPaymentLink] = useState('');
  const [openPaymentLink, setOpenPaymentLink] = useState(false);
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false);

  const handleChangeStatus = useCallback((newValue) => {
    setStatus(newValue);
  }, []);

  const handleCreatePaymentLink = useCallback(async () => {
    if (!order?.id) return;
    setPaymentLinkLoading(true);
    try {
      const res = await fetch('/api/payment-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });
      if (!res.ok) throw new Error('Failed to create payment link');
      const data = await res.json();
      setPaymentLink(data.url);
      setOpenPaymentLink(true);
    } catch (error) {
      console.error(error);
      toast.error('Unable to create payment link');
    } finally {
      setPaymentLinkLoading(false);
    }
  }, [order?.id]);

  return (
    <DashboardContent>
      <OrderDetailsToolbar
        backLink={paths.dashboard.order.root}
        orderNumber={order?.orderNumber}
        createdAt={order?.createdAt}
        status={status}
        onChangeStatus={handleChangeStatus}
        statusOptions={ORDER_STATUS_OPTIONS}
        onCreatePaymentLink={handleCreatePaymentLink}
        paymentLinkLoading={paymentLinkLoading}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            <OrderDetailsItems
              items={order?.items}
              taxes={order?.taxes}
              shipping={order?.shipping}
              discount={order?.discount}
              subtotal={order?.subtotal}
              totalAmount={order?.totalAmount}
            />

            <OrderDetailsHistory history={order?.history} />
          </Stack>
        </Grid>

        <Grid xs={12} md={4}>
          <OrderDetailsInfo
            customer={order?.customer}
            delivery={order?.delivery}
            payment={order?.payment}
            shippingAddress={order?.shippingAddress}
          />
        </Grid>
      </Grid>

      <PaymentLinkDialog
        open={openPaymentLink}
        onClose={() => setOpenPaymentLink(false)}
        linkUrl={paymentLink}
        loading={paymentLinkLoading}
      />
    </DashboardContent>
  );
}
