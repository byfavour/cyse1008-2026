import { useEffect, useState } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'src/lib/firebase/firebase';

export function useIntegrationToken(provider) {
  const [tokenData, setTokenData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const tokenRef = doc(db, 'users', userId, 'tokens', provider);
      const tokenSnap = await getDoc(tokenRef);
      if (tokenSnap.exists()) {
        setTokenData(tokenSnap.data());
      }
      setLoading(false);
    };

    fetchToken();
  }, [provider]);

  return { tokenData, loading };
}
