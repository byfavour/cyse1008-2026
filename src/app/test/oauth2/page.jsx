'use client';

export default function OAuth2TestPage() {
  const handleConnectDemo = async () => {
    // We'll just open the authorize endpoint in a new tab
    // or you can do window.location.href
    // This calls /api/oauth2/demo/authorize
    window.open('/api/oauth2/shopify/authorize', '_blank');
  };

  return (
    <div style={{ padding: 16 }}>
      <h1>OAuth2 Demo Test</h1>
      <p>Click the button to start the OAuth2 flow for "demo" provider.</p>
      <button onClick={handleConnectDemo}>Connect Demo Provider</button>
    </div>
  );
}
