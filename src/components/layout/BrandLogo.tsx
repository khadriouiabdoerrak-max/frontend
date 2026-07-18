type BrandLogoProps = {
  className?: string;
  variant?: 'nav' | 'footer';
};

/** Crown Jade leaf mark — sharp at any size. */
export function BrandLogo({ className = '', variant = 'nav' }: BrandLogoProps) {
  const bg = variant === 'footer' ? '#2A8F76' : '#1A6B58';
  const ink = '#FAF9F7';

  return (
    <svg
      viewBox="0 0 96 96"
      className={className}
      role="img"
      aria-label="تاجكِ"
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
