import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const stolzl = localFont({
  src: [
    { path: "../public/fonts/Stolzl-Light.otf", weight: "300", style: "normal" },
    { path: "../public/fonts/Stolzl-Book.otf", weight: "400", style: "normal" },
    { path: "../public/fonts/Stolzl-Medium.otf", weight: "500", style: "normal" },
    { path: "../public/fonts/Stolzl-Bold.otf", weight: "700", style: "normal" },
  ],
  variable: "--font-stolzl",
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
    <html lang="en" className={stolzl.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
