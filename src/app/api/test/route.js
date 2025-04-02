import { NextResponse } from 'next/server';

export async function GET() {
  console.log('Dummy route hit');
  return NextResponse.json({ message: 'Hello from /api/test' });
}
