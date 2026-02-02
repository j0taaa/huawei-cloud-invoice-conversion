import Link from "next/link";
import type { ReactNode } from "react";

const variantClass = {
  primary: "button button--primary",
  secondary: "button button--secondary",
  success: "button button--success"
};

export default function LinkButton({
  href,
  variant = "primary",
  children
}: {
  href: string;
  variant?: keyof typeof variantClass;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={variantClass[variant]}>
      {children}
    </Link>
  );
}
