"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { NAV_LINKS } from "@/lib/constants";
import Logo from "@/components/ui/Logo";

const MAIN_LINKS = NAV_LINKS.filter((l) => l.href !== "/contact");

function Tab({
  children,
  href,
  setPosition,
  isHovered,
  onHover,
}: {
  children: React.ReactNode;
  href: string;
  setPosition: (p: { left: number; width: number; opacity: number }) => void;
  isHovered: boolean;
  onHover: () => void;
}) {
  const ref = useRef<HTMLLIElement>(null);
  return (
    <li
      ref={ref}
      onMouseEnter={() => {
        if (!ref.current) return;
        const { width } = ref.current.getBoundingClientRect();
        setPosition({ width, opacity: 1, left: ref.current.offsetLeft });
        onHover();
      }}
      className="relative z-10 block cursor-pointer"
    >
      <Link
        href={href}
        className={`block px-3 py-1.5 text-[13px] transition-colors duration-200 md:px-4 md:py-2 md:text-[14px] ${
          isHovered ? "text-[#0A0A0A]" : "text-white/70"
        }`}
      >
        {children}
      </Link>
    </li>
  );
}

function Cursor({ position }: { position: { left: number; width: number; opacity: number } }) {
  return (
    <motion.li
      animate={position}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="absolute z-0 h-[30px] rounded-full bg-white md:h-[36px]"
    />
  );
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, width: 0, opacity: 0 });
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <header className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-5xl">
      <nav
        className={`flex flex-col border border-white/[0.08] bg-[#141414]/80 px-5 py-2.5 backdrop-blur-xl transition-[border-radius] duration-300 ${
          isOpen ? "rounded-2xl" : "rounded-full"
        }`}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="flex shrink-0 items-center text-white">
            <Logo height={26} />
          </Link>

          <ul
            className="relative mx-auto hidden w-fit items-center md:flex"
            onMouseLeave={() => {
              setPosition((pv) => ({ ...pv, opacity: 0 }));
              setHoveredIndex(null);
            }}
          >
            {MAIN_LINKS.map((link, i) => (
              <Tab
                key={link.href}
                href={link.href}
                setPosition={setPosition}
                isHovered={hoveredIndex === i}
                onHover={() => setHoveredIndex(i)}
              >
                {link.label}
              </Tab>
            ))}
            <Cursor position={position} />
          </ul>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/login"
              className="hidden rounded-full border border-white/15 px-4 py-1.5 text-[13px] text-white/70 transition-all duration-300 hover:border-white/30 hover:text-white md:block"
            >
              Investor Portal
            </Link>
            <Link
              href="/contact"
              className="hidden rounded-full bg-white px-4 py-1.5 text-[13px] font-medium text-[#0A0A0A] transition-opacity duration-300 hover:opacity-80 md:block"
            >
              Contact Us
            </Link>

            <button
              className="flex h-8 w-8 items-center justify-center text-white/70 md:hidden"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
            >
              {isOpen ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div
          className={`flex flex-col items-center overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            isOpen ? "max-h-[400px] pt-5 opacity-100" : "pointer-events-none max-h-0 opacity-0 pt-0"
          }`}
        >
          <div className="flex w-full flex-col items-center gap-4 border-t border-white/[0.06] pt-5">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-[15px] text-white/50 transition-colors duration-300 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/portal/login"
              onClick={() => setIsOpen(false)}
              className="text-[15px] text-champagne transition-colors duration-300 hover:text-champagne-light"
            >
              Investor Portal
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
