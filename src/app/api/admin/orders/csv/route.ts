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

  try {
    const response = await fetch(
      `${getBackendUrl()}/api/v1/admin/orders.csv?token=${encodeURIComponent(token)}`,
      { cache: 'no-store' },
    );
    const buf = await response.arrayBuffer();
    return new NextResponse(buf, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'text/csv; charset=utf-8',
        'Content-Disposition':
          response.headers.get('Content-Disposition') ||
          'attachment; filename="oxiprime-orders.csv"',
      },
    });
  } catch {
    return NextResponse.json(
      { detail: 'تعذر الاتصال بالخادم.' },
      { status: 502 },
    );
  }
}
