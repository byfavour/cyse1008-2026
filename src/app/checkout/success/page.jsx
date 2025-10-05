'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { fCurrency } from 'src/utils/format-number'; // or inline format

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const sessionId = params.get('session_id');

  const [state, setState] = useState<
    | { status: 'idle' | 'loading' }
    | { status: 'ok'; orderId: string; amount: number; currency: string }
    | { status: 'error'; message: string }
  >({ status: 'idle' });

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    (async () => {
      setState({ status: 'loading' });
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
            currency: (data.currency || 'cad').toUpperCase(),
          });
        }
      } catch (e: any) {
        if (!cancelled) setState({ status: 'error', message: e?.message || 'Failed to confirm' });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  // --- UI ---
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

  if (state.status === 'loading' || state.status === 'idle') {
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
        <Typography variant="body2" color="text.secondary">
          {state.message}
        </Typography>
        <Button variant="contained" onClick={() => router.push('/checkout')}>
          Try again
        </Button>
      </Stack>
    );
  }

  // OK
  const total = typeof state.amount === 'number' ? state.amount / 100 : 0;
  return (
    <Stack spacing={3} alignItems="center" sx={{ py: 8 }}>
      <Typography variant="h4">Thanks for your purchase! 🎉</Typography>
      <Typography variant="body1" color="text.secondary">
        Order <Box component="span" sx={{ fontWeight: 600 }}>{state.orderId}</Box> is paid.
      </Typography>
      <Typography variant="h6">
        {Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: state.currency || 'CAD',
        }).format(total)}
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
