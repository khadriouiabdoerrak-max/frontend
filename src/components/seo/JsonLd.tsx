export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oxiprime.store';
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'تاجكِ',
        alternateName: 'OXIPRIME Morocco',
        url: siteUrl,
        logo: `${siteUrl}/images/oxiprime-logo.svg`,
        email: 'contact@oxiprime.store',
        areaServed: 'MA',
        sameAs: [
          process.env.NEXT_PUBLIC_INSTAGRAM_URL,
          process.env.NEXT_PUBLIC_TIKTOK_URL,
        ].filter(Boolean),
      }}
    />
  );
}
