const paths = {
  idCard: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="9" cy="11" r="2" />
      <path d="M6.5 16c.5-1.5 1.5-2 2.5-2s2 .5 2.5 2M14 10h4M14 14h3" />
    </>
  ),
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />,
  car: (
    <>
      <path d="M5 13l1.6-4.2A2 2 0 0 1 8.5 7.5h7a2 2 0 0 1 1.9 1.3L19 13" />
      <rect x="3" y="13" width="18" height="5" rx="1.5" />
      <path d="M6 18v2M18 18v2" />
    </>
  ),
  bank: <path d="M3 10h18M12 3l9 5H3l9-5ZM5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />,
  phone: (
    <>
      <rect x="7" y="3" width="10" height="18" rx="2" />
      <path d="M11 17.5h2" />
    </>
  ),
  bus: (
    <>
      <rect x="5" y="3" width="14" height="15" rx="3" />
      <path d="M5 11h14M9 15h.01M15 15h.01M8 18v3M16 18v3" />
    </>
  ),
  snowflake: <path d="M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9" />,
};

export type IconName = keyof typeof paths;

export function Icon({ name, className = "size-5" }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}

export function LogoMark() {
  return (
    <span className="grid size-9 place-items-center rounded-lg bg-ink" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-6" fill="none" strokeWidth="1.75" strokeLinecap="round">
        <path d="M5 14c3.5 2 10.5 2 14 0" stroke="#8fd3bf" />
        <path d="M12 6v6" stroke="#f0b03f" />
        <path d="M9 9.5l3 2.5 3-2.5" stroke="#f0b03f" />
      </svg>
    </span>
  );
}
