import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const xff = request.headers.get('x-forwarded-for');
    const real = request.headers.get('x-real-ip');
    const ua = request.headers.get('user-agent');
    if (xff) headers['X-Forwarded-For'] = xff;
    if (real) headers['X-Real-IP'] = real;
    if (ua) headers['User-Agent'] = ua;

    const response = await fetch(`${getBackendUrl()}/api/v1/analytics/event`, {
      method: 'POST',
      headers,
      body: body || '{}',
      cache: 'no-store',
    });
    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 204 });
  }
}
