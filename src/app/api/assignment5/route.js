import { NextResponse } from 'next/server';

// ─── GET /api/assignment5 ────────────────────────────────────────────────────
// Called when the browser (or fetch) makes a GET request.
// Returns a simple JSON object — no body needed.
export async function GET() {
  try {
    console.log('[GET /api/assignment5] handler called');

    return NextResponse.json({
      message: 'Hello from the Black River Market API',
      method: 'GET',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[GET /api/assignment5] error =', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── POST /api/assignment5 ───────────────────────────────────────────────────
// Called when fetch() sends method: 'POST' with a JSON body.
// We read the body with req.json(), then use the data in the response.
export async function POST(req) {
  try {
    const body = await req.json();           // wait for the request body to arrive
    const name = body.name || 'stranger';    // pull out the 'name' field

    console.log('[POST /api/assignment5] body received =', body);

    return NextResponse.json({
      message: `Hello, ${name}! Your POST request was received.`,
      method: 'POST',
      received: body,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[POST /api/assignment5] error =', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
