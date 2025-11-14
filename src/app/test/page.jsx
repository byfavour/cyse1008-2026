'use client';

import { useState } from 'react';

export default function TestPage() {
  const [responseText, setResponseText] = useState('');

  const handleFetch = async () => {
    console.log('👉 Starting fetch to /api/test');
    try {
      const res = await fetch('/api/test/', { cache: 'no-store' });
      console.log('🚀 Fetch resolved. Status:', res.status);

      const text = await res.text();
      console.log('✅ Got text from the response:', text);
      setResponseText(text);
    } catch (err) {
      console.error('❌ Fetch error:', err);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <button onClick={handleFetch}>Fetch /api/test</button>
      <p>Response: {responseText}</p>
    </div>
  );
}
