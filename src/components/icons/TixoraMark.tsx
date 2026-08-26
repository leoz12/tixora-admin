interface TixoraMarkProps {
  className?: string;
  size?: number;
}

export default function TixoraMark({ className, size = 26 }: TixoraMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 26 26"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect width="26" height="26" rx="8" fill="currentColor" />
      <path
        d="M6.5 13a2 2 0 0 1 0-4V7a1 1 0 0 1 1-1h11a1 1 0 0 1 1 1v2a2 2 0 0 1 0 4v2a2 2 0 0 1 0 4v2a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-2a2 2 0 0 1 0-4Z"
        fill="var(--primary-foreground)"
        fillOpacity="0.95"
      />
      <path
        d="M15 6.5v13"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeDasharray="1.8 2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
