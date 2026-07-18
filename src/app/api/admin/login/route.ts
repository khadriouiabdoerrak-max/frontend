import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const response = await fetch(`${getBackendUrl()}/api/v1/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body || '{}',
      cache: 'no-store',
    });
    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { detail: 'تعذر الاتصال بالخادم.' },
      { status: 502 },
    );
  }
}
