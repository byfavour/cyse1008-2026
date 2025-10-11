'use client';

import { useEffect, useState } from 'react';

export default function CheckoutSuccessPage() {
  const [state, setState] = useState({ phase: 'loading', msg: '', result: null });

  useEffect(() => {
    const url = new URL(window.location.href);
    const sessionId = url.searchParams.get('session_id');

    if (!sessionId) {
      setState({ phase: 'error', msg: 'Missing session_id in URL', result: null });
      return;
    }

    let cancelled = false;
    const start = Date.now();

    async function poll() {
      try {
        const resp = await fetch(
          `/api/stripe/confirm-session?session_id=${encodeURIComponent(sessionId)}`,
          {
            method: 'GET',
            headers: { Accept: 'application/json' },
          }
        );

        if (!resp.ok) {
          const text = await resp.text();
          console.warn('confirm-session non-200:', resp.status, text);
          if (!cancelled)
            setState({ phase: 'error', msg: `Confirm failed: ${text}`, result: null });
          return;
        }

        const data = await resp.json();
        console.log('confirm-session data:', data);

        if (cancelled) return;

        if (data.paid) {
          setState({ phase: 'ok', msg: 'Payment confirmed!', result: data });
          return;
        }

        // Not paid yet – keep polling up to ~60s
        if (Date.now() - start < 60000) {
          setState({ phase: 'loading', msg: 'Waiting for confirmation…', result: data });
          setTimeout(poll, 1500);
        } else {
          setState({
            phase: 'error',
            msg: 'Timed out waiting for payment confirmation.',
            result: data,
          });
        }
      } catch (err) {
        console.error('confirm-session fetch error', err);
        if (!cancelled)
          setState({ phase: 'error', msg: err.message || 'Network error', result: null });
      }
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.phase === 'loading') {
    return (
      <div style={{ padding: 24 }}>
        <h2>Confirming your payment…</h2>
        <p>{state.msg || 'Please wait a moment.'}</p>
      </div>
    );
  }

  if (state.phase === 'ok') {
    return (
      <div style={{ padding: 24 }}>
        <h2>🎉 Payment confirmed!</h2>
        <pre style={{ background: '#111', color: '#0f0', padding: 12 }}>
          {JSON.stringify(state.result, null, 2)}
        </pre>
      </div>
    );
  }

  // error
  return (
    <div style={{ padding: 24 }}>
      <h2>We couldn’t confirm your payment</h2>
      <p style={{ color: 'crimson' }}>{state.msg}</p>
      {state.result && (
        <pre style={{ background: '#111', color: '#f88', padding: 12 }}>
          {JSON.stringify(state.result, null, 2)}
        </pre>
      )}
      <button onClick={() => window.location.assign('/product/checkout?step=2')}>Try again</button>
    </div>
  );
}
