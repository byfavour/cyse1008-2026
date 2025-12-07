'use client';

import { useState } from 'react';
import { m } from 'framer-motion';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// MUI Icons
// Icons → using Iconify per project convention
import { Iconify } from 'src/components/iconify';

/**
 * Retro‑futurist landing page mock rewritten for **Material UI**.
 *
 * Drop-in compatible with your current MUI setup (no Tailwind).
 * Animations use framer-motion's `m` wrapped components.
 */
function HomeHeroCYSE1008() {
  const theme = useTheme();
  const [brand, setBrand] = useState('Black River Market');

  return (
    <Box sx={{ minHeight: '100vh', color: '#e5e7eb', bgcolor: '#070b16', position: 'relative' }}>
      {/* Starfield background layers */}
      <StarfieldBox />

      {/* Top bar */}
      <AppBar
        position="sticky"
        color="transparent"
        elevation={0}
        sx={{ backdropFilter: 'blur(6px)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexGrow: 1 }}>
            <LogoMarkBox />
            <m.div
              key={brand}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Typography variant="h6" sx={{ letterSpacing: 0.3 }}>
                {brand}
              </Typography>
            </m.div>
          </Stack>

          <ButtonGroup
            variant="outlined"
            size="small"
            sx={{
              '& .MuiButton-root': { borderColor: 'rgba(255,255,255,0.15)', color: '#d1d5db' },
            }}
          >
            <Button
              onClick={() => setBrand('Black River Market')}
              sx={
                brand === 'Black River Market'
                  ? activePillSx(theme.palette.success.light)
                  : undefined
              }
            >
              Black River Market
            </Button>
            <Button
              onClick={() => setBrand('Patchwork')}
              sx={brand === 'Patchwork' ? activePillSx(theme.palette.info.light) : undefined}
            >
              Patchwork
            </Button>
          </ButtonGroup>
        </Toolbar>
      </AppBar>

      {/* Hero */}
      <Box component="section" sx={{ position: 'relative' }}>
        <Container sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 6, md: 10 } }} maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid xs={12} md={6}>
              <m.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Typography
                  variant="h2"
                  sx={{ fontSize: { xs: 36, sm: 44 }, fontWeight: 600, lineHeight: 1.1 }}
                >
                  <Box component="span" sx={{ display: 'block', opacity: 0.8 }}>
                    The Future of Local,
                  </Box>
                  <Box
                    component="span"
                    sx={{
                      mt: 1,
                      display: 'inline-block',
                      backgroundImage: 'linear-gradient(90deg, #86efac, #5eead4, #67e8f9)',
                      WebkitBackgroundClip: 'text',
                      color: 'transparent',
                      textShadow: '0 0 18px rgba(45,255,196,0.15)',
                    }}
                  >
                    Woven Together
                  </Box>
                </Typography>
              </m.div>

              <Typography sx={{ mt: 2.5, color: 'rgba(229,231,235,0.82)', maxWidth: 560 }}>
                Decentralized commerce, grown from the ground up. We connect buyers, makers, and
                community couriers through a network that feels inevitable—like constellations
                finding their pattern.
              </Typography>

              <Stack direction="row" spacing={1.5} sx={{ mt: 4, flexWrap: 'wrap' }}>
                <Button
                  endIcon={<Iconify icon="mdi:arrow-right" width={18} />}
                  variant="outlined"
                  sx={{
                    borderColor: 'rgba(16,185,129,0.5)',
                    color: '#c7f9e8',
                    backdropFilter: 'blur(4px)',
                    '&:hover': {
                      borderColor: 'rgba(16,185,129,0.8)',
                      backgroundColor: 'rgba(16,185,129,0.12)',
                      boxShadow: '0 0 28px rgba(16,185,129,0.25)',
                    },
                  }}
                  href="/signup"
                >
                  Join the Network
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  href="#learn"
                  sx={{
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: '#e5e7eb',
                    '&:hover': { borderColor: 'rgba(255,255,255,0.35)' },
                  }}
                >
                  Learn more
                </Button>
              </Stack>

              <Box
                component="pre"
                sx={{
                  mt: 3,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  fontSize: 10,
                  lineHeight: '14px',
                  color: 'rgba(110,231,183,0.9)',
                  p: 1.25,
                  borderRadius: 1,
                  bgcolor: 'rgba(0,0,0,0.35)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  maxWidth: 360,
                }}
              >
                {`> common ground :: ${brand.toLowerCase()} // grow • connect • thrive`}
              </Box>
            </Grid>

            <Grid xs={12} md={6}>
              <m.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <OrbitalDome brand={brand} />
              </m.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Three pillars */}
      <Box id="learn" sx={{ pb: { xs: 10, md: 14 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={2.5}>
            <Grid xs={12} md={4}>
              <PillarCard
                title="Grow"
                icon="mdi:sprout"
                copy="Simple tools for producers to list, update, and fulfill—without leaving the field."
                glow="emerald"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <PillarCard
                title="Connect"
                icon="mdi:link-variant"
                copy="A mesh of local buyers, vendors, and couriers mapped like a living black river market."
                glow="cyan"
              />
            </Grid>
            <Grid xs={12} md={4}>
              <PillarCard
                title="Thrive"
                icon="mdi:rocket-launch"
                copy="Right‑sized economics: keep value circulating in the communities that create it."
                glow="fuchsia"
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Container sx={{ py: 6 }} maxWidth="lg">
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={8}>
            <Typography variant="body2" sx={{ color: 'rgba(156,163,175,1)' }}>
              © {new Date().getFullYear()} {brand}. All rights reserved.
            </Typography>
            <Typography
              variant="caption"
              sx={{ display: 'block', mt: 0.75, color: 'rgba(148,163,184,1)' }}
            >
              Built with optimism. Minimal learning curve. ANSI‑friendly when you need to go
              bare‑bones.
            </Typography>
          </Grid>
          <Grid xs={12} md={4} sx={{ display: 'flex', justifyContent: { xs: 'start', md: 'end' } }}>
            <AsciiBlackRiverMarketBox />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

// --- Helpers & subcomponents (MUI versions) ---

function withAlpha(hex, alpha = 0.33) {
  if (typeof hex !== 'string') return hex;
  let h = hex.trim();
  if (h[0] === '#') h = h.slice(1);
  if (h.length === 3)
    h = h
      .split('')
      .map((c) => c + c)
      .join('');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function activePillSx(glowColor) {
  return {
    borderColor: glowColor,
    color: '#e0f2f1',
    boxShadow: `0 0 20px ${withAlpha(glowColor, 0.33)}`,
  };
}

function StarfieldBox() {
  return (
    <Box
      sx={{
        pointerEvents: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        '&:before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.35) 0, transparent 2px),\
                     radial-gradient(1px 1px at 25% 80%, rgba(255,255,255,0.35) 0, transparent 2px),\
                     radial-gradient(1px 1px at 70% 30%, rgba(255,255,255,0.4) 0, transparent 2px),\
                     radial-gradient(1px 1px at 90% 60%, rgba(255,255,255,0.35) 0, transparent 2px)',
        },
        '&:after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(60% 60% at 50% 0%, rgba(16,185,129,0.07), transparent 60%),\
                     radial-gradient(40% 40% at 80% 100%, rgba(59,130,246,0.05), transparent 60%)',
        },
      }}
    />
  );
}

function LogoMarkBox() {
  return (
    <Box sx={{ position: 'relative', width: 24, height: 24 }}>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          borderRadius: 1,
          filter: 'blur(6px)',
          background:
            'linear-gradient(135deg, rgba(52,211,153,0.7), rgba(94,234,212,0.7), rgba(103,232,249,0.7))',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          width: 1,
          height: 1,
          borderRadius: 1,
          background: 'linear-gradient(135deg, #10b981, #22d3ee)',
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ border: '1px solid rgba(255,255,255,0.2)' }} />
        <Box sx={{ border: '1px solid rgba(255,255,255,0.2)' }} />
        <Box sx={{ border: '1px solid rgba(255,255,255,0.2)' }} />
        <Box sx={{ border: '1px solid rgba(255,255,255,0.2)' }} />
      </Box>
    </Box>
  );
}

function OrbitalDome({ brand }) {
  return (
    <Box sx={{ position: 'relative', aspectRatio: '1 / 1' }}>
      {/* Glow base */}
      <Box
        sx={{
          position: 'absolute',
          inset: -16,
          borderRadius: '50%',
          bgcolor: 'rgba(16,185,129,0.12)',
          filter: 'blur(40px)',
        }}
      />

      <m.div
        initial={{ rotate: -6 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 8, ease: 'easeInOut' }}
      >
        <Box
          sx={{
            position: 'relative',
            height: '100%',
            width: '100%',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.1), transparent)',
          }}
        >
          {/* Grid lines */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: `radial-gradient(circle at center, rgba(255,255,255,0.20) 0%, transparent 60%),
              repeating-radial-gradient(circle at center, transparent 0, transparent 24px, rgba(255,255,255,0.05) 25px),
              repeating-conic-gradient(from 0deg, transparent 0, transparent 20deg, rgba(255,255,255,0.05) 21deg)`,
            }}
          />

          {/* Floating modules */}
          <FloatyBox sx={{ left: 10, top: 10, width: 40, height: 40 }} delay={0} />
          <FloatyBox sx={{ right: 12, top: 24, width: 32, height: 32 }} delay={1.2} />
          <FloatyBox sx={{ left: 40, bottom: 16, width: 28, height: 28 }} delay={2.1} />

          <Typography
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: -24,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(203,213,225,0.85)',
            }}
          >
            {brand} Network Hub
          </Typography>
        </Box>
      </m.div>
    </Box>
  );
}

function FloatyBox({ sx, delay = 0 }) {
  return (
    <m.div
      initial={{ y: 6, opacity: 0 }}
      animate={{ y: [6, -6, 6], opacity: 1 }}
      transition={{ repeat: Infinity, duration: 6, delay, ease: 'easeInOut' }}
    >
      <Box
        sx={{
          position: 'absolute',
          borderRadius: 2,
          border: '1px solid rgba(255,255,255,0.15)',
          bgcolor: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(6px)',
          ...sx,
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: 2,
            background: 'linear-gradient(135deg, rgba(110,231,183,0.3), rgba(103,232,249,0.2))',
          }}
        />
      </Box>
    </m.div>
  );
}

function PillarCard({ title, copy, Icon, glow, icon }) {
  const glowMap = {
    emerald: '0 0 60px rgba(16,185,129,0.18)',
    cyan: '0 0 60px rgba(34,211,238,0.20)',
    fuchsia: '0 0 60px rgba(232,121,249,0.18)',
  };
  const borderMap = {
    emerald: '1px solid rgba(52,211,153,0.35)',
    cyan: '1px solid rgba(103,232,249,0.35)',
    fuchsia: '1px solid rgba(232,121,249,0.35)',
  };

  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        p: 2.5,
        borderRadius: 3,
        bgcolor: 'rgba(255,255,255,0.06)',
        backdropFilter: 'blur(6px)',
        border: borderMap[glow],
        boxShadow: glowMap[glow],
        transition: 'background 200ms',
        '&:hover': { bgcolor: 'rgba(255,255,255,0.09)' },
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: 'rgba(0,0,0,0.4)',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {Icon ? <Icon fontSize="small" /> : <Iconify icon={icon} width={18} />}
        </Box>
        <Typography variant="subtitle1" sx={{ letterSpacing: 0.2 }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ mt: 1.5, color: 'rgba(229,231,235,0.9)' }}>
        {copy}
      </Typography>
    </Paper>
  );
}

function AsciiBlackRiverMarketBox() {
  return (
    <Box
      component="pre"
      sx={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: 10,
        lineHeight: '12px',
        color: 'rgba(110,231,183,0.9)',
        p: 1.25,
        borderRadius: 1,
        bgcolor: 'rgba(0,0,0,0.35)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {`+--+--+--+--+
|\|//|\|//|
+--+--+--+--+
|//|\|//|\|
+--+--+--+--+`}
    </Box>
  );
}

// Export both default and named for flexible imports
export default HomeHeroCYSE1008;
export { HomeHeroCYSE1008 };
