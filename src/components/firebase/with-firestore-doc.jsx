'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from 'src/lib/firebase/firebase';

export default function WithFirestoreDoc({ path, children }) {
  const [docData, setDocData] = useState(null);
  const [docId, setDocId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const ref = doc(db, ...path.split('/'));
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setDocData(snapshot.data());
          setDocId(snapshot.id);
        } else {
          setDocData(null);
        }
      } catch (error) {
        console.error('Error fetching document:', error);
        setDocData(null);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [path]);

  if (loading) return <div>Loading...</div>;
  if (!docData) return <div>Document not found.</div>;

  return typeof children === 'function' ? children({ data: docData, id: docId }) : null;
}
