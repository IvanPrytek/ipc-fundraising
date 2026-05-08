import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const logoFont = localFont({
  src: [
    { path: "../public/fonts/SharpGrotesk-Book20.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/SharpGrotesk-SemiBold20.ttf", weight: "600", style: "normal" },
  ],
  variable: "--font-logo",
  display: "swap",
});

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
    <html lang="en" className={logoFont.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
