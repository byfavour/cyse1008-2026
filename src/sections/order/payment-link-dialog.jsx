'use client';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function PaymentLinkDialog({ open, onClose, linkUrl, loading }) {
  const qrSrc = useMemo(() => {
    if (!linkUrl) return '';
    const url = encodeURIComponent(linkUrl);
    return `https://chart.googleapis.com/chart?chs=260x260&cht=qr&chl=${url}&choe=UTF-8`;
  }, [linkUrl]);

  const handleCopy = async () => {
    if (!linkUrl) return;
    try {
      await navigator.clipboard.writeText(linkUrl);
    } catch (error) {
      console.error('Copy failed', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Payment link</DialogTitle>

      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Link"
            value={linkUrl || ''}
            disabled={loading}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <Button size="small" onClick={handleCopy} disabled={!linkUrl}>
                    Copy
                  </Button>
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            color="inherit"
            href={linkUrl || '#'}
            target="_blank"
            rel="noopener"
            disabled={!linkUrl}
            startIcon={<Iconify icon="solar:external-link-square-outline" />}
          >
            Open payment page
          </Button>

          {qrSrc ? (
            <Box
              component="img"
              alt="Payment QR"
              src={qrSrc}
              sx={{ width: '100%', maxWidth: 260, mx: 'auto', borderRadius: 1 }}
            />
          ) : null}
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
