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
      strokeWidth="14"
    >
      {/* Outer horizontal ellipse */}
      <ellipse cx="100" cy="65" rx="92" ry="55" />
      {/* Vertical inner ellipse (T stem) */}
      <ellipse cx="100" cy="65" rx="18" ry="48" />
      {/* Horizontal inner ellipse (T crossbar) */}
      <ellipse cx="100" cy="50" rx="82" ry="16" />
    </svg>
  );
}
