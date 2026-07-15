export function StarRating({
  rating,
  className = '',
}: {
  rating: number;
  className?: string;
}) {
  const full = Math.floor(rating);
  const stars = `${'★'.repeat(full)}${'☆'.repeat(5 - full)}`;

  return (
    <span className={`text-gold text-xs tracking-wide ${className}`}>
      <span aria-hidden>{stars}</span>
      <span className="text-muted-brown mr-1">{rating}</span>
    </span>
  );
}
