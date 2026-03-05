'use client';

import { useState } from 'react';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from '../../hooks';
import { FormHead } from '../../components/form-head';
import { signInWithGoogle } from '../../context/firebase';

// ----------------------------------------------------------------------

export function FirebaseSignInView() {
  const router = useRouter();

  const { checkUserSession } = useAuthContext();

  const [errorMsg, setErrorMsg] = useState('');

  const handleSignInWithGoogle = async () => {
    try {
      await signInWithGoogle();
      await checkUserSession?.();
      router.replace(paths.dashboard.root);
      router.refresh();
    } catch (error) {
      console.error(error);
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  };

  return (
    <>
      <FormHead
        title="Sign in to your account"
        description={null}
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Button
        fullWidth
        size="large"
        variant="contained"
        color="inherit"
        startIcon={<Iconify icon="logos:google-icon" width={20} />}
        onClick={handleSignInWithGoogle}
      >
        Continue with Google
      </Button>
    </>
  );
}
