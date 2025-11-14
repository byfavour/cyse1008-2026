// src/components/firebase/with-firestore-route.jsx
'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'src/lib/firebase/firebase';

export default function withFirestoreRoute({ collection, View }) {
  return function FirestoreRouteWrapper({ id }) {
    const [docData, setDocData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetch = async () => {
        try {
          console.log('📡 Fetching Firestore document for ID:', id);
          const ref = doc(db, collection, id);
          const snapshot = await getDoc(ref);

          if (snapshot.exists()) {
            const result = { id: snapshot.id, ...snapshot.data() };
            console.log('✅ Firestore document loaded:', result);
            setDocData(result);
          } else {
            console.warn('⚠️ Document not found for ID:', id);
            setDocData(null);
          }
        } catch (error) {
          console.error('🔥 Firestore fetch error:', error);
          setDocData(null);
        } finally {
          setLoading(false);
        }
      };

      fetch();
    }, [collection, id]);

    if (loading) return <div>Loading...</div>;
    if (!docData) return <div>Product not found!</div>;

    return <View product={docData} />;
  };
}
