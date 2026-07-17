import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token =
    request.headers.get('x-admin-token') || url.searchParams.get('token') || '';

  if (!token) {
    return NextResponse.json({ detail: 'رمز الدخول مطلوب' }, { status: 401 });
  }

  const template = url.searchParams.get('template') || 'generic';
  const status = url.searchParams.get('status') || 'CONFIRMED,READY_TO_SHIP';

  try {
    const qs = new URLSearchParams({
      token,
      template,
      status,
    });
    const response = await fetch(
      `${getBackendUrl()}/api/v1/admin/orders/export/courier?${qs}`,
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
          'attachment; filename="courier-export.csv"',
      },
    });
  } catch {
    return NextResponse.json(
      { detail: 'تعذر الاتصال بالخادم.' },
      { status: 502 },
    );
  }
}
