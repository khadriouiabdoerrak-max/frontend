type BrandLogoProps = {
  className?: string;
  variant?: 'nav' | 'footer';
};

/**
 * Inline packaging mark — always visible (no optimizer).
 * Leaf on warm cream, matches OXIPRIME bottles.
 */
export function BrandLogo({ className = '', variant = 'nav' }: BrandLogoProps) {
  const sizeClass =
    variant === 'footer'
      ? 'w-11 h-11'
      : 'w-11 h-11 sm:w-12 sm:h-12';

  const bg = variant === 'footer' ? '#C4A574' : '#C1967F';
  const ink = '#1A120E';

  return (
    <svg
      viewBox="0 0 96 96"
      className={`${sizeClass} shrink-0 rounded-[14px] ${className}`.trim()}
      role="img"
      aria-label="تاجكِ · OXIPRIME"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="96" height="96" rx="18" fill={bg} />
      <g fill={ink} transform="translate(48 52)">
        <path d="M0 16C1 4 2 -10 0 -30C-2 -10 -1 4 0 16Z" />
        <path d="M-3 12C-14 2 -28 -2 -34 4C-24 8 -12 12 -3 12Z" />
        <path d="M-2 8C-10 -6 -12 -20 -4 -24C-2 -12 -1 -2 -2 8Z" />
        <path d="M3 12C14 2 28 -2 34 4C24 8 12 12 3 12Z" />
        <path d="M2 8C10 -6 12 -20 4 -24C2 -12 1 -2 2 8Z" />
      </g>
    </svg>
  );
}
