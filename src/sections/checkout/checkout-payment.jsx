'use client';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@mui/material/Button';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';

import { useCheckoutContext } from './context';
import { CheckoutSummary } from './checkout-summary';
import { CheckoutDelivery } from './checkout-delivery';
import { CheckoutBillingInfo } from './checkout-billing-info';
import { CheckoutPaymentMethods } from './checkout-payment-methods';

import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { AUTH, db } from 'src/lib/firebase/firebase';
import { getAuth } from 'firebase/auth';

/* ------------------------------------------------------------------ */

const DELIVERY_OPTIONS = [
  { value: 0, label: 'Free', description: '5-7 days delivery' },
  { value: 10, label: 'Standard', description: '3-5 days delivery' },
  { value: 20, label: 'Express', description: '2-3 days delivery' },
];

const PAYMENT_OPTIONS = [
  {
    value: 'creditcard',
    label: 'Card (Stripe)',
    description: 'Pay securely with your credit or debit card via Stripe.',
  },
  {
    value: 'paymentlink',
    label: 'Payment link / QR',
    description: 'Generate a Stripe payment link to share or scan.',
  },
];

const CARD_OPTIONS = [];

export const PaymentSchema = zod.object({
  payment: zod.string().min(1, { message: 'Payment is required!' }),
  delivery: zod.number().optional(),
});

/* ------------------------------------------------------------------ */

export function CheckoutPayment() {
  const checkout = useCheckoutContext();

  const defaultValues = {
    delivery: checkout.shipping,
    payment: 'creditcard',
  };

  const methods = useForm({
    resolver: zodResolver(PaymentSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    watch,
    formState: { isSubmitting },
  } = methods;

  const [submitting, setSubmitting] = useState(false);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSubmitting(true);

      // 1) Build items array from checkout context (supporting a few possible keys)
      const products = checkout?.cart ?? checkout?.items ?? checkout?.products ?? [];

      // in CheckoutPayment onSubmit when building items[]
      const items = products.map((p) => ({
        id: p.id,
        name: p.name ?? p.title ?? 'Item',
        price: Number(p.price ?? 0),
        quantity: Number(p.quantity ?? 1),
        // optional, helps variant match:
        variantId: p.variantId ?? null,
        variantSku: p.variantSku ?? null,
        variantTitle:
          p.variantTitle ?? (p.size && p.colors?.[0] ? `${p.size} / ${p.colors[0]}` : null),
        options: p.options ?? null, // { Size: "M", Color: "Red" }
      }));

      // 2) Resolve email (billing first, then auth)
      const auth = getAuth();
      const email = checkout?.billing?.email ?? auth.currentUser?.email ?? 'test@example.com';

      // 3) Create a pending order in Firestore
      const orderRef = await addDoc(collection(db, 'orders'), {
        items,
        email,
        currency: 'CAD',
        subtotal: Number(checkout.subtotal ?? 0),
        discount: Number(checkout.discount ?? 0),
        shipping: Number(checkout.shipping ?? 0),
        total: Number(checkout.total ?? 0),
        status: 'pending',
        createdAt: serverTimestamp(),
        userId: auth.currentUser?.uid ?? null,
      });

      if (data.payment === 'paymentlink') {
        // Create a Stripe Checkout session URL (payment link) and open it
        const res = await fetch('/api/payment-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: orderRef.id }),
        });

        if (!res.ok) {
          const t = await res.text();
          throw new Error(`Payment link failed: ${t}`);
        }

        const { url } = await res.json();
        window.location.href = url;
        return;
      }

      // Default: Stripe card Checkout Session
      const res = await fetch('/api/stripe/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          orderId: orderRef.id,
          email,
        }),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Create session failed: ${t}`);
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      alert('Payment init failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  });

  const paying = isSubmitting || submitting;

  return (
    <Form methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <CheckoutDelivery
            name="delivery"
            onApplyShipping={checkout.onApplyShipping}
            options={DELIVERY_OPTIONS}
          />

          <CheckoutPaymentMethods
            name="payment"
            options={{
              cards: CARD_OPTIONS,
              payments: PAYMENT_OPTIONS,
            }}
            sx={{ my: 3 }}
          />

          <Button
            size="small"
            color="inherit"
            onClick={checkout.onBackStep}
            startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          >
            Back
          </Button>
        </Grid>

        <Grid xs={12} md={4}>
          <CheckoutBillingInfo billing={checkout.billing} onBackStep={checkout.onBackStep} />

          <CheckoutSummary
            total={checkout.total}
            subtotal={checkout.subtotal}
            discount={checkout.discount}
            shipping={checkout.shipping}
            tax={checkout.tax}
            onEdit={() => checkout.onGotoStep(0)}
          />

          <LoadingButton fullWidth size="large" type="submit" variant="contained" loading={paying}>
            {watch('payment') === 'creditcard' ? 'Pay with Stripe' : 'Complete order'}
          </LoadingButton>
        </Grid>
      </Grid>
    </Form>
  );
}
