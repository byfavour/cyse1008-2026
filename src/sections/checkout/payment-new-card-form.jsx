import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// Simple, local card form to replace the removed demo payment section.
export function PaymentNewCardForm() {
  return (
    <Stack spacing={2.5} sx={{ pt: 1 }}>
      <TextField fullWidth label="Name on card" placeholder="John Doe" />

      <TextField fullWidth label="Card number" placeholder="4242 4242 4242 4242" />

      <Stack direction="row" spacing={2}>
        <TextField fullWidth label="Expiry" placeholder="MM/YY" />
        <TextField
          fullWidth
          label="CVC"
          placeholder="123"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Iconify icon="mdi:credit-card-outline" width={18} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      <TextField fullWidth label="Billing ZIP / Postal code" placeholder="12345" />
    </Stack>
  );
}
