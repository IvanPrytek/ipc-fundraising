import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ownera Capital — Management Buyouts & Succession Partners",
  description:
    "The trusted PE partner for management-led ownership transitions. MBO and MBI solutions for business owners, management teams, and operators across the US, Europe, Israel, and Latin America.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
