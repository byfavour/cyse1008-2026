import { useState } from 'react';
import { m } from 'framer-motion';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { textGradient } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { ExtendedEuclideanAlgorithm } from './components/extended-euclidean-algorithm';
import { ModularExponentiation } from './components/modular-exponentiation';

const lgKey = 'lg';

export function HomeHeroCYSE1008() {
  const theme = useTheme();
  const [count, setCount] = useState(0);
  return (
  <>
  <Stack alignItems="center" spacing={2.5}>
    <Box
      component="h1"
      display="flex"
      flexWrap="wrap"
      justifyContent="center"
      sx={{
        ...theme.typography.h2,
        my: 0,
        mx: 'auto',
        maxWidth: 680,
        fontFamily: theme.typography.fontSecondaryFamily,
        [theme.breakpoints.up(lgKey)]: { fontSize: 72, lineHeight: '90px' },
      }}
    >
    <Box
      component={m.span}
      animate={{ backgroundPosition: '200% center' }}
      transition={{
        duration: 20,
        ease: 'linear',
        repeat: Infinity,
        repeatType: 'reverse',
      }}
      sx={{
        ...textGradient(
          `300deg, ${theme.vars.palette.primary.main} 0%, ${theme.vars.palette.warning.main} 25%, ${theme.vars.palette.primary.main} 50%, ${theme.vars.palette.warning.main} 75%, ${theme.vars.palette.primary.main} 100%`
        ),
        backgroundSize: '400%',
        ml: { xs: 0.75, md: 1, xl: 1.5 },
      }}
    >
      Welcome to Quilt
    </Box>
    </Box>
    <Button variant="contained" color="primary" onClick={() => setCount(count + 1)}>
      Click Me {count}
    </Button>
    <ExtendedEuclideanAlgorithm />
    <ModularExponentiation />
  </Stack>
  </>
  );
}