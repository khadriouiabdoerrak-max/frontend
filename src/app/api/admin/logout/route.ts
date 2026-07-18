import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

export async function POST(request: Request) {
  const token =
    request.headers.get('x-admin-token') ||
    new URL(request.url).searchParams.get('token') ||
    '';
  try {
    const response = await fetch(`${getBackendUrl()}/api/v1/admin/logout`, {
      method: 'POST',
      headers: { 'X-Admin-Token': token },
      cache: 'no-store',
    });
    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
