import { useState } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

export function EulerTotientFunction() {
  const [p, setP] = useState(0);
  const [q, setQ] = useState(0);
  const [totient, setTotient] = useState(null);

  const calculateTotient = () => {
    const pInt = parseInt(p, 10);
    const qInt = parseInt(q, 10);

    if (Number.isNaN(pInt) || Number.isNaN(qInt) || pInt <= 1 || qInt <= 1) {
      alert('Please enter valid prime numbers greater than 1 for p and q.');
      return;
    }

    const totientValue = (pInt - 1) * (qInt - 1);
    setTotient(totientValue);
  };

  return (
    <Box
      component="form"
      sx={{ '& > :not(style)': { m: 1, width: '25ch' } }}
      noValidate
      autoComplete="off"
    >
      <Typography variant="h2">Euler&apos;s Totient Function</Typography>
      <Typography variant="subtitle1">ϕ(N)=(p−1)×(q−1)</Typography>
      <TextField
        id="p"
        label="Prime p"
        placeholder="Enter prime p"
        type="number"
        value={p}
        onChange={(e) => setP(e.target.value)}
      />
      <TextField
        id="q"
        label="Prime q"
        type="number"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <Button variant="contained" color="primary" onClick={calculateTotient}>
        Compute
      </Button>
      {totient !== null && <Box>Result: {totient}</Box>}
    </Box>
  );
}
