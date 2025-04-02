'use client';

export function fetchShopifyProducts() {
  console.log('👉 Calling /api/shopify/fetch');
  return fetch('/api/shopify/fetch', { cache: 'no-store', method: 'GET' })
    .then((res) => {
      console.log('Fetch resolved, status:', res.status);
      return res.text();
    })
    .then((text) => {
      console.log('✅ Got response object from API');
      console.log('🧾 Raw response text:', text);
      try {
        const json = JSON.parse(text);
        console.log('📦 Parsed JSON:', json);
        return json;
      } catch (e) {
        console.error('❌ Failed to parse JSON:', e);
      }
    })
    .catch((e) => {
      console.error('Fetch error:', e);
    });
}
