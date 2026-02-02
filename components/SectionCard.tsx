import type { ReactNode } from "react";

export default function SectionCard({
  title,
  subtitle,
  muted = false,
  children
}: {
  title: string;
  subtitle?: string;
  muted?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={`card${muted ? " card--muted" : ""}`}>
      <h2 className="section-title">{title}</h2>
      {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      {children}
    </section>
  );
}
