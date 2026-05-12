interface ToyotaLogoProps {
  className?: string;
  color?: string;
}

/**
 * Toyota emblem — three concentric/overlapping filled ellipse "donuts"
 * forming the outer ring and the inner "T". Rendered as a single path
 * with fill-rule="evenodd" so each outer ellipse minus its inner cutout
 * draws as a ring, and overlapping rings combine cleanly.
 *
 * viewBox kept at 200x130 to match the previous stroke-based logo so
 * existing sizing (`w-12 h-8`) on the consumer still fits.
 */
export function ToyotaLogo({ className, color = '#FFFFFF' }: ToyotaLogoProps) {
  return (
    <svg
      viewBox="0 0 200 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill={color}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="
          M 8,65   a 92,55 0 1,0 184,0  a 92,55 0 1,0 -184,0 Z
          M 22,65  a 78,41 0 1,0 156,0  a 78,41 0 1,0 -156,0 Z
          M 82,65  a 18,48 0 1,0 36,0   a 18,48 0 1,0 -36,0  Z
          M 91,65  a 9,39  0 1,0 18,0   a 9,39  0 1,0 -18,0  Z
          M 18,65  a 82,15 0 1,0 164,0  a 82,15 0 1,0 -164,0 Z
          M 28,65  a 72,7  0 1,0 144,0  a 72,7  0 1,0 -144,0 Z
        "
      />
    </svg>
  );
}
