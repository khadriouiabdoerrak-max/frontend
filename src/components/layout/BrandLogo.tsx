import Image from 'next/image';

type BrandLogoProps = {
  className?: string;
  variant?: 'nav' | 'footer';
};

/** Real OXIPRIME mark — matches packaging, clear next to the brand link. */
export function BrandLogo({ className = '', variant = 'nav' }: BrandLogoProps) {
  const sizeClass =
    variant === 'footer'
      ? 'w-11 h-11'
      : 'w-11 h-11 sm:w-12 sm:h-12';

  return (
    <Image
      src="/images/oxiprime-logo.webp"
      alt="تاجكِ · OXIPRIME"
      width={96}
      height={96}
      priority={variant === 'nav'}
      className={`${sizeClass} rounded-[14px] object-cover shrink-0 ${className}`.trim()}
    />
  );
}
