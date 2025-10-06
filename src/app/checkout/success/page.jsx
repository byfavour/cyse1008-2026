'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from 'src/lib/firebase/firebase';
import { Button, CircularProgress, Stack, Typography, Box } from '@mui/material';

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const orderId = params.get('order');
  const sessionId = params.get('session_id');

  const [state, setState] = useState({
    status: 'loading', // loading | pending | paid | error
    amount: null,
    currency: 'CAD',
    message: null,
  });

  useEffect(() => {
    if (!orderId) {
      setState({ status: 'error', amount: null, currency: 'CAD', message: 'Missing order id' });
      return;
    }

    const ref = doc(db, 'orders', orderId);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        const d = snap.data();
        if (!d) {
          setState({ status: 'error', amount: null, currency: 'CAD', message: 'Order not found' });
          return;
        }
        if (d.status === 'paid') {
          setState({
            status: 'paid',
            amount: d?.stripe?.amountTotal ?? Math.round(Number(d.total ?? 0) * 100),
            currency: (d?.stripe?.currency || 'CAD').toUpperCase(),
            message: null,
          });
        } else {
          setState((s) => ({ ...s, status: 'pending' }));
        }
      },
      (err) => {
        setState({ status: 'error', amount: null, currency: 'CAD', message: err.message });
      }
    );
    return () => unsub();
  }, [orderId]);

  if (state.status === 'loading' || state.status === 'pending') {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
        <Typography>Confirming your payment…</Typography>
        {sessionId && (
          <Typography variant="caption" color="text.secondary">
            Session: {sessionId}
          </Typography>
        )}
      </Stack>
    );
  }

  if (state.status === 'error') {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
        <Typography variant="h5">We couldn’t confirm your payment</Typography>
        <Typography color="text.secondary">{state.message}</Typography>
        <Button variant="contained" onClick={() => router.push('/checkout')}>
          Try again
        </Button>
      </Stack>
    );
  }

  const total = typeof state.amount === 'number' ? state.amount / 100 : 0;

  return (
    <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
      <Typography variant="h4">Thanks for your purchase! 🎉</Typography>
      <Typography color="text.secondary">
        Order{' '}
        <Box component="span" sx={{ fontWeight: 600 }}>
          {orderId}
        </Box>{' '}
        is paid.
      </Typography>
      <Typography variant="h6">
        {Intl.NumberFormat(undefined, { style: 'currency', currency: state.currency }).format(
          total
        )}
      </Typography>
      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={() => router.push('/orders')}>
          View orders
        </Button>
        <Button variant="outlined" onClick={() => router.push('/')}>
          Continue shopping
        </Button>
      </Stack>
    </Stack>
  );
}
