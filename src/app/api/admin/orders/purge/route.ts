import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const token =
    request.headers.get('x-admin-token') || url.searchParams.get('token') || '';
  const confirm = url.searchParams.get('confirm') || '';

  if (!token) {
    return NextResponse.json({ detail: 'رمز الدخول مطلوب' }, { status: 401 });
  }

  try {
    const qs = new URLSearchParams({ confirm });
    const response = await fetch(
      `${getBackendUrl()}/api/v1/admin/orders/purge?${qs}`,
      {
        method: 'DELETE',
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
