'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get('session_id');

  const [state, setState] = useState({
    status: 'idle', // 'idle' | 'loading' | 'ok' | 'error'
    orderId: null,
    amount: null, // cents
    currency: 'CAD',
    message: null,
  });

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    (async () => {
      setState((s) => ({ ...s, status: 'loading' }));
      try {
        const res = await fetch('/api/checkout/finalize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || 'Finalize failed');

        if (!cancelled) {
          setState({
            status: 'ok',
            orderId: data.orderId,
            amount: data.amount,
            currency: (data.currency || 'CAD').toUpperCase(),
            message: null,
          });
        }
      } catch (e) {
        if (!cancelled) {
          setState({
            status: 'error',
            orderId: null,
            amount: null,
            currency: 'CAD',
            message: e?.message || 'Failed to confirm payment',
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
        <Typography variant="h5">Missing session ID</Typography>
        <Button variant="contained" onClick={() => router.push('/')}>
          Go home
        </Button>
      </Stack>
    );
  }

  if (state.status === 'idle' || state.status === 'loading') {
    return (
      <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
        <CircularProgress />
        <Typography variant="body1">Confirming your payment…</Typography>
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
      <Typography variant="body1" color="text.secondary">
        Order{' '}
        <Box component="span" sx={{ fontWeight: 600 }}>
          {state.orderId}
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
