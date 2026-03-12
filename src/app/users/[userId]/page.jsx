'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

import { doc, getDoc } from 'firebase/firestore';

import { db } from 'src/lib/firebase/firebase';
import { useAuthContext } from 'src/auth/hooks';
import { SignOutButton } from 'src/layouts/components/sign-out-button';

// ----------------------------------------------------------------------

function InfoRow({ label, value, mono = false }) {
  return (
    <Stack direction="row" alignItems="flex-start" spacing={2}>
      <Typography
        variant="caption"
        sx={{ color: 'text.disabled', width: 96, flexShrink: 0, pt: 0.25 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ wordBreak: 'break-all', ...(mono && { fontFamily: 'monospace', fontSize: 12 }) }}
      >
        {value ?? '—'}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export default function UserProfilePage() {
  const { userId } = useParams();
  const { user } = useAuthContext();

  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user?.uid === userId;

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);
      try {
        const snap = await getDoc(doc(db, 'users', userId));
        setProfile(snap.exists() ? snap.data() : {});
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (userId) fetchProfile();
  }, [userId]);

  const initials = profile?.displayName
    ? profile.displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', mt: 8, px: 3 }}>
      <Stack spacing={3}>

        {/* Debug IDs — kept for classroom demo */}
        <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <Stack spacing={0.5}>
            <Typography variant="overline" sx={{ color: 'text.disabled' }}>
              Security context
            </Typography>
            <InfoRow label="Viewing UID" value={userId} mono />
            <InfoRow label="Logged in as" value={user?.uid ?? 'unauthenticated'} mono />
            <Stack direction="row" alignItems="center" spacing={1} sx={{ pt: 0.5 }}>
              <Typography variant="caption" sx={{ color: 'text.disabled', width: 96 }}>
                Own profile?
              </Typography>
              <Chip
                size="small"
                label={isOwnProfile ? 'Yes' : 'No'}
                color={isOwnProfile ? 'success' : 'warning'}
              />
            </Stack>
          </Stack>
        </Card>

        {/* Permission denied */}
        {error && (
          <Alert severity="error">
            <Typography variant="subtitle2">Permission denied</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
              Firestore rejected the read — the security rule{' '}
              <code>request.auth.uid == userId</code> evaluated to <strong>false</strong>.
            </Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 0.5, opacity: 0.7 }}>
              {error}
            </Typography>
          </Alert>
        )}

        {loading && !error && (
          <Typography variant="body2" color="text.secondary">
            Loading profile…
          </Typography>
        )}

        {/* Profile card */}
        {!loading && !error && profile && (
          <Card sx={{ p: 3 }}>
            <Stack spacing={3}>
              {/* Avatar + name */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Tooltip title={profile.photoURL ? '' : 'No photo set'}>
                  <Avatar
                    src={profile.photoURL}
                    alt={profile.displayName}
                    sx={{ width: 72, height: 72, fontSize: 24 }}
                  >
                    {initials}
                  </Avatar>
                </Tooltip>

                <Stack spacing={0.5}>
                  <Typography variant="h5">
                    {profile.displayName || 'Unknown User'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile.email}
                  </Typography>
                  {profile.role && (
                    <Chip size="small" label={profile.role} color="primary" sx={{ width: 'fit-content' }} />
                  )}
                </Stack>
              </Stack>

              <Divider />

              {/* Fields */}
              <Stack spacing={1.5}>
                <InfoRow label="Display name" value={profile.displayName} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="UID" value={profile.uid} mono />
                {profile.role && <InfoRow label="Role" value={profile.role} />}
                {/* Any extra fields stored on the document */}
                {Object.entries(profile)
                  .filter(([k]) => !['displayName', 'email', 'uid', 'role', 'photoURL'].includes(k))
                  .map(([key, value]) => (
                    <InfoRow key={key} label={key} value={String(value)} />
                  ))}
              </Stack>
            </Stack>
          </Card>
        )}

        {isOwnProfile && <SignOutButton />}
      </Stack>
    </Box>
  );
}
