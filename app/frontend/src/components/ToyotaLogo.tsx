interface ToyotaLogoProps {
  className?: string;
  color?: string;
}

export function ToyotaLogo({ className, color = '#FFFFFF' }: ToyotaLogoProps) {
  return (
    <svg
      viewBox="0 0 200 130"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      stroke={color}
      strokeWidth="8"
    >
      {/* Outer ellipse */}
      <ellipse cx="100" cy="65" rx="92" ry="58" />
      {/* Vertical inner ellipse (T stem) */}
      <ellipse cx="100" cy="65" rx="22" ry="54" />
      {/* Horizontal inner ellipse (T crossbar) */}
      <ellipse cx="100" cy="65" rx="78" ry="22" />
    </svg>
  );
}
