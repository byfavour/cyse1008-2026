import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🧪 Dummy API route hit');
  try {
    const data = await fetch('/');
  } catch (e) {
    console.error(e);
  }
  return NextResponse.json([]);
}
