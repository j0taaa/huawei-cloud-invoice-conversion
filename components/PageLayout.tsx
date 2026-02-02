import type { ReactNode } from "react";

const maxWidthMap = {
  sm: "640px",
  md: "900px",
  lg: "1100px"
};

export default function PageLayout({
  title,
  subtitle,
  maxWidth = "md",
  children
}: {
  title: string;
  subtitle?: string;
  maxWidth?: keyof typeof maxWidthMap;
  children: ReactNode;
}) {
  return (
    <div className="page" style={{ maxWidth: maxWidthMap[maxWidth] }}>
      <div>
        <h1 className="section-title">{title}</h1>
        {subtitle ? <p className="section-subtitle">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
