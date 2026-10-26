import { ReactNode } from "react";

// A section label: small caps beside the accent dot.
export default function Label({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`type-label flex items-center gap-2 text-zinc-100 ${className}`}
    >
      <span className="block w-[7px] h-[7px] rounded-full bg-accent" />
      {children}
    </p>
  );
}
