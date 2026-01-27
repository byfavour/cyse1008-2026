'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';

const currencyFormatter = new Intl.NumberFormat('en-CA', {
  style: 'currency',
  currency: 'CAD',
});

export default function CheckoutSuccessPage() {
  const [state, setState] = useState({ phase: 'loading', msg: '', result: null });
  const router = useRouter();

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      setState({ phase: 'error', msg: 'Missing session id in the URL.', result: null });
      return;
    }

    let cancelled = false;
    const start = Date.now();

    async function poll() {
      try {
        const resp = await fetch(
          `/api/stripe/confirm-session?session_id=${encodeURIComponent(sessionId)}`,
          { method: 'GET', headers: { Accept: 'application/json' } }
        );

        if (!resp.ok) {
          const text = await resp.text();
          if (!cancelled)
            setState({ phase: 'error', msg: `Could not confirm payment: ${text}`, result: null });
          return;
        }

        const data = await resp.json();
        if (cancelled) return;
        if (data.paid) {
          setState({ phase: 'ok', msg: 'Payment confirmed!', result: data });
          return;
        }

        if (Date.now() - start < 60000) {
          setTimeout(poll, 1500);
        } else {
          setState({
            phase: 'error',
            msg: 'Timed out while waiting for confirmation. Please try again.',
            result: data,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setState({ phase: 'error', msg: err.message || 'Network error', result: null });
        }
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  const orderSummary = useMemo(() => {
    const result = state.result || {};
    const amount = typeof result.amount_total === 'number' ? result.amount_total / 100 : null;
    return [
      { label: 'Order ID', value: result.orderId || '—' },
      { label: 'Stripe status', value: result.status || 'pending' },
      { label: 'Payment status', value: result.payment_status || 'processing' },
      {
        label: 'Amount',
        value: amount !== null ? currencyFormatter.format(amount) : '—',
      },
      { label: 'Currency', value: (result.currency || 'cad').toUpperCase() },
    ];
  }, [state.result]);

  const goToStore = () => router.push(paths.product.root);
  const goToOrders = () => router.push(paths.dashboard.order.root);
  const retryCheckout = () => router.push(`${paths.product.checkout}?step=2`);

  if (state.phase === 'loading') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack spacing={3} alignItems="center">
          <CircularProgress />
          <Typography variant="h5">Confirming your payment…</Typography>
          <Typography color="text.secondary">Hold tight while we verify things with Stripe.</Typography>
        </Stack>
      </Container>
    );
  }

  if (state.phase === 'ok') {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Stack spacing={3} textAlign="center">
          <Typography variant="h3">🎉 Payment confirmed!</Typography>
          <Typography color="text.secondary">
            Your order is ready. We’ll email you a confirmation and shipping updates.
          </Typography>
          <Card variant="outlined">
            <CardContent>
              <Stack spacing={1.5}>
                {orderSummary.map((item) => (
                  <Stack
                    key={item.label}
                    direction="row"
                    justifyContent="space-between"
                    sx={{ textAlign: 'left' }}
                  >
                    <Typography color="text.secondary">{item.label}</Typography>
                    <Typography fontWeight={600}>{item.value}</Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
            <Divider />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ p: 2 }}>
              <Button fullWidth variant="contained" onClick={goToStore}>
                Continue shopping
              </Button>
              <Button fullWidth variant="outlined" onClick={goToOrders}>
                View orders
              </Button>
            </Stack>
          </Card>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Alert severity="error" variant="filled">
          {state.msg || 'We could not confirm your payment.'}
        </Alert>
        <Typography color="text.secondary">
          If this keeps happening, refresh the page or return to checkout to try again.
        </Typography>
        <Button variant="contained" onClick={retryCheckout}>
          Return to checkout
        </Button>
      </Stack>
    </Container>
  );
}
