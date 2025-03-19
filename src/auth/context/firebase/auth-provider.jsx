'use client';

import { useMemo, useEffect, useCallback } from 'react';

import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

import { useSetState } from 'src/hooks/use-set-state';

import axios from 'src/utils/axios';

import { db, AUTH } from 'src/lib/firebase/firebase';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({
    user: null,
    loading: true,
  });

  console.log('AuthProvider, ');
  const checkUserSession = useCallback(async () => {
    try {
      onAuthStateChanged(AUTH, async (user) => {
        if (user) {
          console.log({ user });

          /*
           * (1) If skip emailVerified
           * Remove the condition (if/else) : user.emailVerified
           */
          const userProfile = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userProfile);
          const profileData = docSnap.exists() ? docSnap.data() : {};
          console.log({ docSnap });

          // Get custom claims (role) from Firebase Authentication
          const tokenResult = await user.getIdTokenResult(true);
          const roleFromAuth = tokenResult.claims.role || ''; // Extract role from token

          // Final role priority: Firestore role > Auth Claim role > Default empty string
          const role = profileData?.role ?? roleFromAuth ?? '';

          console.log({ role });

          const { accessToken } = user;
          console.log('Setting Axios Auth Header:', accessToken);

          setState({ user: { ...user, ...profileData, role }, loading: false });
          axios.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
        } else {
          setState({ user: null, loading: false });
          delete axios.defaults.headers.common.Authorization;
        }
      });
    } catch (error) {
      console.error(error);
      setState({ user: null, loading: false });
    }
  }, [setState]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(AUTH, checkUserSession);
    return () => unsubscribe(); // Cleanup
  }, [checkUserSession]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  console.log({ state });

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            id: state.user?.uid,
            accessToken: state.user?.accessToken,
            displayName: state.user?.displayName,
            photoURL: state.user?.photoURL,
            role: state.user?.role ?? '', // Ensures role is set
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}
