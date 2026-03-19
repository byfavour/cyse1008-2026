'use client';

// ─────────────────────────────────────────────────────────────────────────────
// Assignment 5 — API Routes & Callbacks
//
// This page has five buttons.  Each one calls a different API route using
// fetch() and displays the JSON response on screen.
//
// Open DevTools (F12) → Console to see all the console.log() output too.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';

// ─── helper: call an API and return the parsed JSON ──────────────────────────
// This function is called by every button.  It is async because fetch() is
// asynchronous — we have to WAIT for the network response before we can read it.
async function callApi(url, options = {}) {
  console.log(`[fetch] → ${options.method || 'GET'} ${url}`);
  const response = await fetch(url, options);          // wait for the HTTP response
  const data     = await response.json();              // wait to read the body as JSON
  console.log(`[fetch] ← response from ${url}`, data);
  return data;
}

// ─── helper: pretty-print an object as formatted JSON ────────────────────────
function pretty(obj) {
  return JSON.stringify(obj, null, 2);
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Assignment5Page() {
  // Each result box holds the last response for that section.
  const [getResult,      setGetResult]      = useState(null);
  const [postResult,     setPostResult]     = useState(null);
  const [callbackResult, setCallbackResult] = useState(null);
  const [productsResult, setProductsResult] = useState(null);

  // ── Button 1: GET /api/assignment5 ────────────────────────────────────────
  // A GET request sends NO body.  We just call the URL.
  async function handleGet() {
    const data = await callApi('/api/assignment5');
    setGetResult(data);
  }

  // ── Button 2: POST /api/assignment5 ───────────────────────────────────────
  // A POST request sends a JSON body.  We set method, headers, and body.
  async function handlePost() {
    const data = await callApi('/api/assignment5', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name: 'Black River Market Student' }),
    });
    setPostResult(data);
  }

  // ── Button 3: POST /api/assignment5/callback ──────────────────────────────
  // We simulate being Stripe by sending a "payment.completed" event to our
  // callback route.  In the real app, Stripe does this automatically after a
  // customer pays — we never call it ourselves.
  async function handleCallback() {
    const data = await callApi('/api/assignment5/callback', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:    'payment.completed',
        orderId: 'ORDER-001',
        amount:  49.99,
      }),
    });
    setCallbackResult(data);
  }

  // ── Button 4: GET /api/assignment5/products ───────────────────────────────
  // Fetches all products from Firestore (server-side) and shows a summary.
  async function handleProducts() {
    const data = await callApi('/api/assignment5/products');
    setProductsResult(data);
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px', fontFamily: 'sans-serif' }}>
      <h1 style={{ borderBottom: '2px solid #8b1e41', paddingBottom: 8 }}>
        Assignment 5 — API Routes &amp; Callbacks
      </h1>
      <p style={{ color: '#555' }}>
        Click each button, then open <strong>DevTools → Console</strong> (F12) to see the logs.
        The JSON response also appears in the box below each button.
      </p>

      {/* ── Section 1: GET ──────────────────────────────────────────────── */}
      <Section title="Part B — Step 1: GET request" color="#1565c0">
        <p>
          A <code>GET</code> request asks the server for data. No body is sent.
          The route is at <code>src/app/api/assignment5/route.js</code>.
        </p>
        <Button label="Call GET /api/assignment5" onClick={handleGet} />
        <Result data={getResult} />
      </Section>

      {/* ── Section 2: POST ─────────────────────────────────────────────── */}
      <Section title="Part B — Step 2: POST request" color="#2e7d32">
        <p>
          A <code>POST</code> request sends data <em>to</em> the server inside a JSON body.
          The same route handles both GET and POST — notice the exported function names.
        </p>
        <Button label='Call POST /api/assignment5  (body: { name: "..." })' onClick={handlePost} />
        <Result data={postResult} />
      </Section>

      {/* ── Section 3: Callback ─────────────────────────────────────────── */}
      <Section title="Part B — Step 3: Callback route" color="#6a1b9a">
        <p>
          This simulates a <strong>webhook callback</strong> — as if Stripe were calling
          our API to say a payment completed. In the real app we never call this button;
          Stripe sends the POST automatically after a customer pays.
          Route: <code>src/app/api/assignment5/callback/route.js</code>
        </p>
        <Button label='Simulate callback POST  (type: "payment.completed")' onClick={handleCallback} />
        <Result data={callbackResult} />
      </Section>

      {/* ── Section 4: Products from DB ─────────────────────────────────── */}
      <Section title="Part B — Step 4: Fetch products from Firestore" color="#e65100">
        <p>
          This route connects to Firestore on the <em>server</em>, fetches the{' '}
          <code>products</code> collection, then loops through each document to count
          total stock and calculate total inventory value.
          Route: <code>src/app/api/assignment5/products/route.js</code>
        </p>
        <Button label="Call GET /api/assignment5/products" onClick={handleProducts} />
        {productsResult && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: '#fff3e0', borderRadius: 6, fontSize: 13 }}>
            <strong>Summary:</strong>{' '}
            {productsResult.count} products &nbsp;|&nbsp;
            Total stock: {productsResult.totalStock} units &nbsp;|&nbsp;
            Total value: ${productsResult.totalValue}
          </div>
        )}
        <Result data={productsResult} />
      </Section>
    </div>
  );
}

// ─── small reusable components ────────────────────────────────────────────────

function Section({ title, color, children }) {
  return (
    <div style={{ marginBottom: 36, padding: '16px 20px', border: `1px solid ${color}`, borderRadius: 8 }}>
      <h2 style={{ color, marginTop: 0, fontSize: 17 }}>{title}</h2>
      {children}
    </div>
  );
}

function Button({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 18px',
        background: '#8b1e41',
        color: '#fff',
        border: 'none',
        borderRadius: 5,
        cursor: 'pointer',
        fontSize: 13,
        marginBottom: 10,
      }}
    >
      {label}
    </button>
  );
}

function Result({ data }) {
  if (!data) return <p style={{ color: '#999', fontSize: 13 }}>No response yet — click the button above.</p>;
  return (
    <pre style={{
      background: '#1e1e1e',
      color: '#d4d4d4',
      padding: '12px 16px',
      borderRadius: 6,
      fontSize: 12,
      overflowX: 'auto',
      margin: 0,
    }}>
      {pretty(data)}
    </pre>
  );
}
