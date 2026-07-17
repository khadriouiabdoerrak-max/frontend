import { NextResponse } from 'next/server';
import { getBackendUrl } from '@/lib/backend';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const order_number = searchParams.get('order_number') ?? '';
    const phone = searchParams.get('phone') ?? '';

    const qs = new URLSearchParams({ order_number, phone });
    const response = await fetch(
      `${getBackendUrl()}/api/v1/orders/track?${qs.toString()}`,
      { method: 'GET', headers: { Accept: 'application/json' }, cache: 'no-store' },
    );

    const data = await response.text();
    return new NextResponse(data, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch {
    return NextResponse.json(
      { detail: 'تعذر الاتصال بالخادم. حاولي مرة أخرى.' },
      { status: 502 },
    );
  }
}
