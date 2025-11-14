import { NextResponse } from 'next/server';

export function middleware(req) {
  const u = process.env.BASIC_AUTH_USER;
  const p = process.env.BASIC_AUTH_PASS;
  if (!u || !p) return NextResponse.next();

  const auth = req.headers.get('authorization') || '';
  if (!auth.startsWith('Basic ')) {
    return new NextResponse('Auth required', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="private"' },
    });
  }
  const [user, pass] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  if (user === u && pass === p) return NextResponse.next();
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="private"' },
  });
}

export const config = { matcher: ['/(.*)'] };
