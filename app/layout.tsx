import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Huawei Cloud Invoice Converter",
  description:
    "Convert AWS invoice details into Huawei Cloud equivalents with guided workflows and export helpers."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header__content">
            <Link className="brand" href="/">
              Huawei Cloud Invoice Converter
            </Link>
            <nav className="nav">
              <Link href="/file-receive">Upload PDF</Link>
              <Link href="/manual-specs">Manual Specs</Link>
              <Link href="/select-region">Region</Link>
              <Link href="/table">Table</Link>
              <Link href="/excel-maker">Excel Maker</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          Built with Next.js, React, and TypeScript for faster workflows.
        </footer>
      </body>
    </html>
  );
}
