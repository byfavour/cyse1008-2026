'use client';
import { Button, Stack, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function CheckoutCancelPage() {
  const router = useRouter();
  return (
    <Stack spacing={2} alignItems="center" sx={{ py: 8 }}>
      <Typography variant="h5">Payment canceled</Typography>
      <Typography color="text.secondary">Your card hasn’t been charged.</Typography>
      <Button variant="contained" onClick={() => router.push('/checkout')}>
        Back to checkout
      </Button>
    </Stack>
  );
}
