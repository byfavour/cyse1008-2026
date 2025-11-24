'use client';

import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const initialPlayers = [
  { id: 'dm', name: 'DM (you)', role: 'dm', ready: true, focus: 'Narration' },
  { id: 'sera', name: 'Sera', role: 'player', ready: true, focus: 'Scout' },
  { id: 'brann', name: 'Brann', role: 'player', ready: false, focus: 'Frontline' },
];

const starterLog = [
  {
    id: 'intro',
    speaker: 'DM',
    role: 'dm',
    text: 'Welcome to Oddventure. We are playing lightweight 5e-style rulings with rulings > rules.',
  },
  {
    id: 'prompt',
    speaker: 'DM',
    role: 'dm',
    text: 'You wake at a dim camp outside Gloamroot. A faint hex-grid map flickers into view — only the nearby tiles are clear.',
  },
  {
    id: 'sera',
    speaker: 'Sera',
    role: 'player',
    text: 'I listen for movement and mark where the stream runs.',
  },
  {
    id: 'brann',
    speaker: 'Brann',
    role: 'player',
    text: 'I ready a torch and move toward the ruined pillar.',
  },
];

const quickPrompts = [
  'Describe terrain obstacles for the approach.',
  'Offer 2 hooks: negotiate, or trigger combat.',
  'Ask for a group check vs DC 13 (Perception).',
  'Drop a lore seed tied to the global map.',
];

const localMapRows = [
  {
    id: 'row-1',
    offset: false,
    cells: [
      { id: 'camp', label: 'Campfire', type: 'camp', detail: 'Short rest' },
      { id: 'trail', label: 'Old trail', type: 'trail', detail: 'Clear footing' },
      { id: 'glade', label: 'Mossy glade', type: 'forest', detail: '+1 stealth' },
    ],
  },
  {
    id: 'row-2',
    offset: true,
    cells: [
      { id: 'stream', label: 'Stream', type: 'water', detail: 'Half speed' },
      { id: 'pillar', label: 'Broken pillar', type: 'ruin', detail: 'Half cover' },
      { id: 'fog', label: 'Fog bank', type: 'fog', detail: 'Heavily obscured' },
    ],
  },
  {
    id: 'row-3',
    offset: false,
    cells: [
      { id: 'brambles', label: 'Brambles', type: 'hazard', detail: '2 slashing' },
      { id: 'den', label: 'Beast den', type: 'threat', detail: 'Tracks here' },
      { id: 'ridge', label: 'Low ridge', type: 'high', detail: 'Adv vantage' },
    ],
  },
];

const globalSites = [
  { id: 'outpost', name: 'Gloamroot Outpost', status: 'active', detail: 'Home base' },
  { id: 'veil', name: 'Veil Mire', status: 'scouted', detail: 'Toxic pools' },
  { id: 'spire', name: 'Glass Spire', status: 'unknown', detail: 'Seen at sunset' },
];

// ----------------------------------------------------------------------

function HexCell({ cell }) {
  const theme = useTheme();

  const paletteMap = {
    camp: { bg: 'primary.main', fg: 'primary.contrastText' },
    trail: { bg: alpha(theme.palette.info.main, 0.12), fg: theme.palette.text.primary },
    forest: { bg: alpha(theme.palette.success.main, 0.18), fg: theme.palette.text.primary },
    ruin: { bg: alpha(theme.palette.warning.main, 0.22), fg: theme.palette.text.primary },
    fog: { bg: alpha(theme.palette.grey[500], 0.2), fg: theme.palette.text.secondary },
    hazard: { bg: alpha(theme.palette.error.main, 0.18), fg: theme.palette.text.primary },
    water: { bg: alpha(theme.palette.info.main, 0.24), fg: theme.palette.text.primary },
    threat: { bg: alpha(theme.palette.error.main, 0.28), fg: theme.palette.text.primary },
    high: { bg: alpha(theme.palette.secondary.main, 0.18), fg: theme.palette.text.primary },
  };

  const colors = paletteMap[cell.type] ?? paletteMap.trail;

  return (
    <Tooltip title={cell.detail} arrow>
      <Box
        sx={{
          width: 120,
          aspectRatio: '1 / 1',
          position: 'relative',
          clipPath: 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0 50%)',
          bgcolor: colors.bg,
          color: colors.fg,
          border: `1px solid ${alpha(theme.palette.common.black, 0.12)}`,
          boxShadow: `0 12px 40px ${alpha(theme.palette.common.black, 0.18)}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          px: 1,
        }}
      >
        <Stack spacing={0.5} alignItems="center">
          <Iconify
            width={24}
            icon={
              {
                camp: 'solar:campfire-bold-duotone',
                ruin: 'solar:castle-bold-duotone',
                fog: 'solar:cloud-fog-bold-duotone',
                hazard: 'solar:danger-square-bold-duotone',
                water: 'solar:waterdrops-bold-duotone',
                threat: 'solar:sword-bold-duotone',
                forest: 'solar:leaf-bold-duotone',
                high: 'solar:radar-2-bold-duotone',
              }[cell.type] || 'solar:compass-bold-duotone'
            }
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {cell.label}
          </Typography>
        </Stack>
      </Box>
    </Tooltip>
  );
}

// ----------------------------------------------------------------------

function LogItem({ entry }) {
  const theme = useTheme();
  const isDM = entry.role === 'dm';

  return (
    <ListItem
      alignItems="flex-start"
      sx={{
        px: 0,
        '&:not(:last-of-type)': { mb: 1.5, pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` },
      }}
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: isDM ? theme.palette.primary.main : theme.palette.grey[800],
            color: theme.palette.common.white,
            fontWeight: 700,
          }}
        >
          {entry.speaker[0]}
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">{entry.speaker}</Typography>
            <Chip
              size="small"
              label={isDM ? 'DM' : 'Player'}
              color={isDM ? 'primary' : 'default'}
              variant={isDM ? 'filled' : 'outlined'}
            />
          </Stack>
        }
        secondary={
          <Typography component="span" variant="body2" sx={{ color: 'text.primary' }}>
            {entry.text}
          </Typography>
        }
      />
    </ListItem>
  );
}

// ----------------------------------------------------------------------

export function OddventureView() {
  const theme = useTheme();

  const [players, setPlayers] = useState(initialPlayers);
  const [log, setLog] = useState(starterLog);
  const [nextPlayerName, setNextPlayerName] = useState('');
  const [actingAs, setActingAs] = useState('dm');
  const [message, setMessage] = useState('');
  const [sessionOpen, setSessionOpen] = useState(true);

  const playerOptions = useMemo(
    () => [{ id: 'dm', name: 'DM' }, ...players.filter((p) => p.role === 'player')],
    [players]
  );

  const addPlayer = () => {
    const trimmed = nextPlayerName.trim();
    if (!trimmed) return;
    const newPlayer = {
      id: trimmed.toLowerCase().replace(/\s+/g, '-'),
      name: trimmed,
      role: 'player',
      ready: true,
      focus: 'Generalist',
    };
    setPlayers((prev) => [...prev, newPlayer]);
    setNextPlayerName('');
  };

  const pushLog = (text, roleId = actingAs) => {
    const who = roleId === 'dm' ? { name: 'DM', role: 'dm' } : players.find((p) => p.id === roleId);
    if (!who || !text.trim()) return;
    setLog((prev) => [
      ...prev,
      { id: `${roleId}-${prev.length + 1}`, speaker: who.name, role: who.role, text: text.trim() },
    ]);
    setMessage('');
  };

  const rollDie = (faces) => Math.ceil(Math.random() * faces);

  const sendRoll = (faces) => {
    const result = rollDie(faces);
    pushLog(`rolls a d${faces}: ${result}`);
  };

  return (
    <Container component="section" sx={{ py: { xs: 6, md: 10 } }}>
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          mb: { xs: 4, md: 6 },
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)}, ${alpha(theme.palette.info.main, 0.24)})`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.24)}`,
          boxShadow: `0 32px 80px ${alpha(theme.palette.common.black, 0.25)}`,
        }}
      >
        <Stack spacing={2.5}>
          <Chip
            color="primary"
            variant="soft"
            icon={<Iconify icon="solar:joystick-bold-duotone" />}
            label="Oddventure: DM-led text RPG (DnD-inspired)"
            sx={{ alignSelf: 'flex-start' }}
          />
          <Typography variant="h3">Spin up a table, narrate, and track the field.</Typography>
          <Typography variant="body1" sx={{ maxWidth: 760, color: 'text.secondary' }}>
            Run a fast text-first session with hex-crawl awareness. This view tracks seats, delivers
            prompts, and sketches what nearby tiles look like. Upgrade hooks are ready—swap the DM
            brain for your own API when you want a Pro bridge.
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:swords-bold-duotone" />}
            >
              Start session
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon="solar:share-bold-duotone" />}
              onClick={() => pushLog('shares the table invite link.')}
            >
              Invite players
            </Button>
            <Tooltip title="Bring your own model or rules brain with a Pro seat.">
              <Chip
                color="secondary"
                variant="outlined"
                icon={<Iconify icon="solar:plug-circle-bold-duotone" />}
                label="Pro: Connect external API"
              />
            </Tooltip>
          </Stack>
        </Stack>
      </Card>

      <Stack spacing={{ xs: 4, md: 6 }}>
        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={3}
          alignItems="stretch"
          sx={{ width: '100%' }}
        >
          <Card sx={{ p: 3, flex: 1, minWidth: 320 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h5">Session lobby</Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="body2">Open seat</Typography>
                <Switch checked={sessionOpen} onChange={(e) => setSessionOpen(e.target.checked)} />
              </Stack>
            </Stack>
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
              1-to-many players. Ready checks keep the pace; toggle an open seat to let others hop
              in mid-session.
            </Typography>

            <List sx={{ my: 3 }}>
              {players.map((player) => (
                <ListItem key={player.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: player.role === 'dm' ? 'primary.main' : 'grey.800' }}>
                      {player.name[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2">{player.name}</Typography>
                        <Chip
                          size="small"
                          label={player.role === 'dm' ? 'DM' : 'Player'}
                          color={player.role === 'dm' ? 'primary' : 'default'}
                          variant={player.role === 'dm' ? 'filled' : 'outlined'}
                        />
                        <Chip
                          size="small"
                          label={player.ready ? 'Ready' : 'Away'}
                          color={player.ready ? 'success' : 'warning'}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {player.focus}
                      </Typography>
                    }
                  />
                  {player.role !== 'dm' && (
                    <Switch
                      edge="end"
                      checked={player.ready}
                      onChange={(e) =>
                        setPlayers((prev) =>
                          prev.map((p) => (p.id === player.id ? { ...p, ready: e.target.checked } : p))
                        )
                      }
                    />
                  )}
                </ListItem>
              ))}
            </List>

            <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
              <TextField
                label="Add player"
                value={nextPlayerName}
                onChange={(e) => setNextPlayerName(e.target.value)}
                fullWidth
                placeholder="Name or handle"
              />
              <Button
                variant="contained"
                color="primary"
                onClick={addPlayer}
                startIcon={<Iconify icon="solar:add-circle-bold-duotone" />}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Join table
              </Button>
            </Stack>
          </Card>

          <Card sx={{ p: 3, flex: 1.2, minWidth: 360 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
              <Typography variant="h5">DM console</Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  size="small"
                  variant="soft"
                  color="primary"
                  onClick={() => sendRoll(20)}
                  startIcon={<Iconify icon="solar:dice-6-bold-duotone" />}
                >
                  Roll d20
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="inherit"
                  onClick={() => pushLog('marks initiative order and clears conditions.')}
                  startIcon={<Iconify icon="solar:checklist-bold-duotone" />}
                >
                  Next turn
                </Button>
              </Stack>
            </Stack>

            <List sx={{ mt: 2, maxHeight: 320, overflow: 'auto', pr: 1 }}>
              {log.map((entry) => (
                <LogItem key={entry.id} entry={entry} />
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Stack spacing={1.5}>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {quickPrompts.map((prompt) => (
                  <Chip
                    key={prompt}
                    size="small"
                    variant="outlined"
                    label={prompt}
                    onClick={() => pushLog(prompt)}
                  />
                ))}
              </Stack>

              <TextField
                label="Speak as"
                value={actingAs}
                onChange={(e) => setActingAs(e.target.value)}
                select
                SelectProps={{ native: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify icon="solar:user-circle-bold-duotone" />
                    </InputAdornment>
                  ),
                }}
              >
                {playerOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </TextField>

              <TextField
                multiline
                minRows={3}
                placeholder="Narrate the scene, ask for a check, or respond as a character."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end" sx={{ alignItems: 'flex-start' }}>
                      <IconButton edge="end" onClick={() => sendRoll(6)}>
                        <Iconify icon="solar:dice-3-bold-duotone" />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Stack direction="row" spacing={1.5} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={() => pushLog('sets a DC 12 check for the group.')}
                >
                  Quick DC
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => pushLog(message)}
                  startIcon={<Iconify icon="solar:arrow-up-bold-duotone" />}
                >
                  Send to log
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Stack>

        <Card sx={{ p: { xs: 3, md: 4 } }}>
          <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={{ xs: 3, md: 4 }}
            alignItems="stretch"
          >
            <Box sx={{ flex: 1.4 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="h5">Local hex view</Typography>
                <Chip size="small" color="primary" label="Live" />
              </Stack>
              <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', maxWidth: 520 }}>
                Low-friction hex crawl: 2-hex visibility from camp. Tap a tile to remind players of
                terrain effects. Tokens drift as you narrate movement.
              </Typography>

              <Stack spacing={2.5}>
                {localMapRows.map((row, idx) => (
                  <Stack
                    key={row.id}
                    direction="row"
                    spacing={2}
                    sx={{ ml: row.offset ? 7 : 0, position: 'relative' }}
                  >
                    {row.cells.map((cell) => (
                      <HexCell key={cell.id} cell={cell} />
                    ))}
                    {idx === 0 && (
                      <Chip
                        size="small"
                        color="secondary"
                        variant="filled"
                        icon={<Iconify icon="solar:location-arrow-square-bold-duotone" />}
                        label="Party here"
                        sx={{
                          position: 'absolute',
                          right: -12,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                      />
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>

            <Divider flexItem orientation="vertical" sx={{ display: { xs: 'none', lg: 'block' } }} />

            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Typography variant="h5">Global map thumb</Typography>
                <Tooltip title="Swap this for your own source-of-truth via API (Pro)">
                  <Iconify icon="solar:plug-circle-bold-duotone" width={22} />
                </Tooltip>
              </Stack>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                Snapshot of the wider region. Mark sites, link travel time, and pin rumors players
                uncover.
              </Typography>

              <Box
                sx={{
                  position: 'relative',
                  minHeight: 280,
                  borderRadius: 3,
                  p: 2,
                  overflow: 'hidden',
                  background: `radial-gradient(circle at 20% 20%, ${alpha(
                    theme.palette.info.main,
                    0.2
                  )}, transparent 40%), radial-gradient(circle at 80% 70%, ${alpha(
                    theme.palette.primary.main,
                    0.28
                  )}, transparent 45%), ${theme.palette.grey[900]}`,
                  border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                }}
              >
                <Box
                  sx={{
                    inset: 0,
                    opacity: 0.4,
                    position: 'absolute',
                    backgroundImage:
                      'repeating-linear-gradient(60deg, transparent, transparent 18px, rgba(255,255,255,0.05) 18px, rgba(255,255,255,0.05) 22px)',
                  }}
                />
                <Stack spacing={1.5} sx={{ position: 'relative' }}>
                  {globalSites.map((site, idx) => (
                    <Chip
                      key={site.id}
                      variant="filled"
                      color={site.status === 'active' ? 'primary' : site.status === 'scouted' ? 'info' : 'default'}
                      icon={
                        <Iconify
                          icon={
                            site.status === 'active'
                              ? 'solar:map-point-wave-bold-duotone'
                              : 'solar:map-point-bold-duotone'
                          }
                        />
                      }
                      label={`${site.name} — ${site.detail}`}
                      sx={{
                        alignSelf: idx % 2 ? 'flex-end' : 'flex-start',
                        boxShadow: `0 12px 32px ${alpha(theme.palette.common.black, 0.35)}`,
                      }}
                    />
                  ))}
                </Stack>
                <Card
                  variant="outlined"
                  sx={{
                    position: 'absolute',
                    bottom: 16,
                    right: 16,
                    p: 2,
                    backdropFilter: 'blur(10px)',
                    backgroundColor: alpha(theme.palette.background.paper, 0.9),
                    minWidth: 180,
                  }}
                >
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Travel clock
                  </Typography>
                  <Stack spacing={1} sx={{ color: 'text.secondary' }}>
                    <Stack direction="row" justifyContent="space-between">
                      <span>Camp → Veil Mire</span>
                      <strong>1 day</strong>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <span>Veil → Spire</span>
                      <strong>3 days</strong>
                    </Stack>
                  </Stack>
                </Card>
              </Box>
            </Box>
          </Stack>
        </Card>
      </Stack>
    </Container>
  );
}
