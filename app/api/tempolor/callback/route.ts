import { NextRequest, NextResponse } from 'next/server';

/** Callback endpoint for TemPolor — receives generation results.
 *  We use polling instead, but TemPolor requires a valid callback_url. */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[TemPolor callback]', JSON.stringify(body).slice(0, 200));
  } catch { /* ignore */ }
  return NextResponse.json({ success: true });
}
