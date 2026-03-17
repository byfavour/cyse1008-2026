'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuthContext } from 'src/auth/hooks';

import { AccountButton } from './account-button';
import { SignInButton } from './sign-in-button';
import { SignOutButton } from './sign-out-button';

// ----------------------------------------------------------------------

export function AuthUserControls({
  layout = 'row',
  showName = true,
  sx,
  signInProps,
  ...other
}) {
  const { user, loading, authenticated } = useAuthContext();
  const router = useRouter();

  if (loading) {
    return <CircularProgress size={20} sx={{ color: 'text.secondary', ...sx }} {...other} />;
  }

  const isColumn = layout === 'column';
  const displayName = user?.displayName || user?.email || 'User';

  if (!authenticated) {
    return (
      <SignInButton
        fullWidth={isColumn}
        sx={{
          whiteSpace: 'nowrap',
          ...(isColumn && { width: 1 }),
          ...sx,
        }}
        {...signInProps}
        {...other}
      />
    );
  }

  return (
    <Stack
      direction={isColumn ? 'column' : 'row'}
      alignItems={isColumn ? 'flex-start' : 'center'}
      spacing={1}
      sx={{ minWidth: 0, ...sx }}
      {...other}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
        <AccountButton
          photoURL={user?.photoURL}
          displayName={displayName}
          onClick={() => router.push(`/users/${user?.uid}`)}
        />

        {showName && (
          <Typography
            variant="body2"
            noWrap
            onClick={() => router.push(`/users/${user?.uid}`)}
            sx={{
              display: isColumn ? 'block' : { xs: 'none', sm: 'block' },
              maxWidth: 200,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {displayName}
          </Typography>
        )}
      </Stack>

      <SignOutButton
        fullWidth={isColumn}
        variant={isColumn ? 'contained' : 'outlined'}
        size={isColumn ? 'medium' : 'small'}
        color={isColumn ? 'error' : 'inherit'}
        sx={{ whiteSpace: 'nowrap' }}
      >
        Sign out
      </SignOutButton>
    </Stack>
  );
}
