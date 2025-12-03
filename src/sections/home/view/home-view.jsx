'use client';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// ----------------------------------------------------------------------

export function HomeView() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at 20% 20%, #0a2a2f 0, #051014 35%, #03080a 100%)',
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: 'center' }}>
        <Box
          component="img"
          src="/assets/images/home/black-river-market-logo-large.png"
          alt="Black River Market"
          sx={{
            width: '100%',
            maxWidth: 360,
            mx: 'auto',
            filter: 'drop-shadow(0 10px 25px rgba(0,0,0,0.35))',
          }}
        />
      </Container>
    </Box>
  );
}
