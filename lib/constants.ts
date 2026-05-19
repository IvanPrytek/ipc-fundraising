import { Sector, Step, DealSpotlight, Region } from "./types";

export const SITE_NAME = "Ownera Capital";

export const HERO = {
  headline: "Exit on your terms",
  subheadline: "Own what you've built",
  ctaPrimary: { label: "Learn More", href: "#two-paths" },
  ctaSecondary: { label: "Get in Touch", href: "/contact" },
};

export const TWO_PATHS = {
  mbo: {
    title: "Management Buyout",
    headline: "Looking to acquire a majority stake in the business you manage?",
    body: "You know the operations, the clients, the team. We bring the capital, the structure, and the path to ownership.",
    cta: { label: "How this works →", href: "/for-teams" },
  },
  mbi: {
    title: "Management Buy-In",
    headline: "Not ready to walk away? You don't have to",
    body: "You built this over decades. We source and install a proven operator to lead the next chapter, while you stay involved, retain equity, and ensure the business thrives.",
    cta: { label: "How this works →", href: "/for-owners" },
  },
};

export const SECTORS: Sector[] = [
  {
    name: "Business Services",
    icon: "briefcase",
    thesis: "Recurring client relationships and predictable cash flows in fragmented, founder-led markets",
    multiples: "7-10x EV/EBITDA",
    dealLane: "MBO + MBI",
  },
  {
    name: "Healthcare Services",
    icon: "heart",
    thesis: "Defensive demand and regulatory advantages across fragmented sub-specialties",
    multiples: "8-14x EV/EBITDA",
    dealLane: "MBO + MBI",
  },
  {
    name: "Niche Manufacturing",
    icon: "cog",
    thesis: "Proprietary processes and tangible assets where founder expertise must be retained through transition",
    multiples: "5-8x EV/EBITDA",
    dealLane: "MBO + MBI",
  },
  {
    name: "Industrial Services",
    icon: "wrench",
    thesis: "Mission-critical maintenance and inspection services with long-term contracts and regional density",
    multiples: "6-9x EV/EBITDA",
    dealLane: "MBO + MBI",
  },
];


export const REGIONS: Region[] = [
  { name: "United States", description: "Lower-mid-market buyouts across all major sectors. The deepest deal flow globally." },
  { name: "Europe & UK", description: "The most mature MBO market. Strong in business services, manufacturing, and healthcare." },
  { name: "Israel", description: "Control buyouts in technology, industrial, and defence sectors." },
];

export const DEAL_SPOTLIGHTS: DealSpotlight[] = [
  {
    headline: "Manufacturing. $40M revenue. Founder retiring.",
    body: "The management team had run the business for 15 years. They needed capital to buy it. We provided the structure. Today: expanded into three new markets.",
    metric: "3x revenue growth",
  },
  {
    headline: "Healthcare services. $25M revenue. No successor.",
    body: "A family-owned practice with no internal heir. We sourced an experienced operator, structured the buy-in, and preserved the founder's legacy.",
    metric: "Zero employee turnover post-transition",
  },
];

export const FINAL_CTA = {
  headline: "Ready to talk?",
  body: "Whether you're a business owner, a management team, or an advisor, we'd like to hear from you.",
  cta: { label: "Get in Touch", href: "/contact" },
};

export const NAV_LINKS = [
  { label: "Sectors", href: "/sectors" },
  { label: "For Owners", href: "/for-owners" },
  { label: "For Teams", href: "/for-teams" },
  { label: "Track Record", href: "/track-record" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];
