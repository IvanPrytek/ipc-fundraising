"use client";

import { useRef, useMemo } from "react";
import { motion } from "framer-motion";
import DottedMap from "dotted-map";
import Image from "next/image";

interface MapDot {
  start: { lat: number; lng: number; label: string };
  end: { lat: number; lng: number; label: string };
}

const LOCATIONS = [
  { lat: 40.7128, lng: -74.006, label: "United States" },
  { lat: 51.5074, lng: -0.1278, label: "Europe & UK" },
  { lat: 31.7683, lng: 35.2137, label: "Israel" },
];

const MAP_CONNECTIONS: MapDot[] = [
  {
    start: { lat: 40.7128, lng: -74.006, label: "United States" },
    end: { lat: 51.5074, lng: -0.1278, label: "Europe" },
  },
  {
    start: { lat: 51.5074, lng: -0.1278, label: "Europe" },
    end: { lat: 31.7683, lng: 35.2137, label: "Israel" },
  },
  {
    start: { lat: 40.7128, lng: -74.006, label: "United States" },
    end: { lat: 31.7683, lng: 35.2137, label: "Israel" },
  },
];

function projectPoint(lat: number, lng: number) {
  const x = (lng + 180) * (800 / 360);
  const y = (90 - lat) * (400 / 180);
  return { x, y };
}

function createCurvedPath(
  start: { x: number; y: number },
  end: { x: number; y: number }
) {
  const midX = (start.x + end.x) / 2;
  const midY = Math.min(start.y, end.y) - 50;
  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`;
}

const LABEL_OFFSETS: Record<string, { dx: number; dy: number; anchor: "start" | "middle" | "end" }> = {
  "United States": { dx: -12, dy: -16, anchor: "end" },
  "Europe & UK": { dx: 0, dy: -20, anchor: "middle" },
  "Israel": { dx: 14, dy: 6, anchor: "start" },
};

export default function GeographicReach() {
  const svgRef = useRef<SVGSVGElement>(null);

  const map = useMemo(
    () => new DottedMap({ height: 100, grid: "diagonal" }),
    []
  );

  const svgMap = useMemo(
    () =>
      map.getSVG({
        radius: 0.22,
        color: "rgba(255,255,255,0.25)",
        shape: "circle",
        backgroundColor: "transparent",
      }),
    [map]
  );

  return (
    <section className="px-6 py-28 text-white">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-section text-white">
          Three markets. One approach.
        </h2>

        <div className="relative mx-auto mt-16 aspect-[2/1] w-full max-w-4xl overflow-hidden">
            <Image
              src={`data:image/svg+xml;utf8,${encodeURIComponent(svgMap)}`}
              className="h-full w-full object-cover opacity-70"
              alt="World map"
              height={400}
              width={800}
              draggable={false}
              priority
            />
            <svg
              ref={svgRef}
              viewBox="0 0 800 400"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient
                  id="line-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#C4B089" stopOpacity="0" />
                  <stop offset="5%" stopColor="#C4B089" stopOpacity="1" />
                  <stop offset="95%" stopColor="#C4B089" stopOpacity="1" />
                  <stop offset="100%" stopColor="#C4B089" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Connection lines */}
              {MAP_CONNECTIONS.map((dot, i) => {
                const startPoint = projectPoint(dot.start.lat, dot.start.lng);
                const endPoint = projectPoint(dot.end.lat, dot.end.lng);
                return (
                  <motion.path
                    key={`path-${i}`}
                    d={createCurvedPath(startPoint, endPoint)}
                    fill="none"
                    stroke="url(#line-gradient)"
                    strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 1.5,
                      delay: 0.3 * i,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}

              {/* Location dots + labels */}
              {LOCATIONS.map((loc, i) => {
                const pt = projectPoint(loc.lat, loc.lng);
                const offset = LABEL_OFFSETS[loc.label] || { dx: 0, dy: -16, anchor: "middle" };
                return (
                  <g key={loc.label}>
                    {/* Pulse */}
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#C4B089" opacity="0.4">
                      <animate
                        attributeName="r"
                        from="4"
                        to="16"
                        dur="2.5s"
                        begin={`${0.4 * i}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        from="0.4"
                        to="0"
                        dur="2.5s"
                        begin={`${0.4 * i}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                    {/* Dot */}
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#C4B089" />
                    {/* Label */}
                    <text
                      x={pt.x + offset.dx}
                      y={pt.y + offset.dy}
                      fill="white"
                      opacity="0.6"
                      textAnchor={offset.anchor}
                      style={{
                        fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
                        fontSize: "11px",
                        fontWeight: 400,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {loc.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
      </div>
    </section>
  );
}
