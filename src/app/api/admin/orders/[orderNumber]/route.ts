import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

type RouteContext = {
  params: Promise<{ orderNumber: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const token =
    request.headers.get('x-admin-token') ||
    new URL(request.url).searchParams.get('token') ||
    '';

  if (!token) {
    return NextResponse.json({ detail: 'رمز الدخول مطلوب' }, { status: 401 });
  }

  const { orderNumber } = await context.params;
  const body = await request.text();

  try {
    const response = await fetch(
      `${getBackendUrl()}/api/v1/admin/orders/${encodeURIComponent(orderNumber)}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token,
        },
        body,
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
