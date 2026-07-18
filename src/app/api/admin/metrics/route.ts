import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

export async function GET(request: Request) {
  const token =
    request.headers.get('x-admin-token') ||
    new URL(request.url).searchParams.get('token') ||
    '';
  if (!token) {
    return NextResponse.json({ detail: 'رمز الدخول مطلوب' }, { status: 401 });
  }

  const url = new URL(request.url);
  const qs = new URLSearchParams();
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  const q = qs.toString() ? `?${qs}` : '';

  try {
    const response = await fetch(
      `${getBackendUrl()}/api/v1/admin/metrics${q}`,
      {
        headers: { 'X-Admin-Token': token },
        cache: 'no-store',
      },
    );
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
