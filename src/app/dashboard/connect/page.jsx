'use client';
import { useState, useEffect } from 'react';
import { connectShopify } from 'src/lib/shopify/connect';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from 'src/lib/firebase/firebase';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';

export default function ShopifyConnectPage() {
  const [shop, setShop] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchExistingConfig = async () => {
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      const docRef = doc(db, 'users', userId, 'shopify_config', 'keys');
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setShop(data.shop || '');
        setClientId(data.clientId || '');
        setClientSecret(data.clientSecret || '');
      }
    };

    fetchExistingConfig();
  }, []);

  const handleSaveConfig = async () => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;
    if (!userId) return alert('Not signed in');

    setSaving(true);
    await setDoc(doc(db, 'users', userId, 'shopify_config', 'keys'), {
      shop,
      clientId,
      clientSecret,
      savedAt: Date.now(),
    });
    setSaving(false);
    alert('✅ Saved config');
  };

  return (
    <Card sx={{ p: 4, maxWidth: 480, mx: 'auto' }}>
      <Stack spacing={3}>
        <Typography variant="h5">Connect Your Shopify Store</Typography>

        <TextField
          label="Shop domain"
          placeholder="your-store.myshopify.com"
          value={shop}
          onChange={(e) => setShop(e.target.value)}
        />

        <TextField
          label="Client ID"
          placeholder="Your Shopify App Client ID"
          value={clientId}
          onChange={(e) => setClientId(e.target.value)}
        />

        <TextField
          label="Client Secret"
          placeholder="Your Shopify App Client Secret"
          value={clientSecret}
          onChange={(e) => setClientSecret(e.target.value)}
          type="password"
        />

        <Stack direction="row" spacing={2}>
          <LoadingButton variant="contained" onClick={handleSaveConfig} loading={saving}>
            💾 Save Config
          </LoadingButton>

          <Button variant="outlined" onClick={() => connectShopify(shop)}>
            Connect Shopify
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
}
