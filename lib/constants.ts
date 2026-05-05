import { Sector, Step, DealSpotlight, Region } from "./types";

export const SITE_NAME = "Ownera Capital";

export const HERO = {
  headline: "Exit on your terms.",
  subheadline: "Own what you've built.",
  ctaPrimary: { label: "Learn More", href: "#two-paths" },
  ctaSecondary: { label: "Get in Touch", href: "/contact" },
};

export const TWO_PATHS = {
  mbo: {
    title: "Management Buyout",
    headline: "Looking to acquire a majority stake in the business you manage?",
    body: "If you're part of the management team and ready to take ownership — we provide the capital, deal structuring, and governance to make it happen. You know the business. We give you the means to own it.",
    cta: { label: "How this works →", href: "/for-teams" },
  },
  mbi: {
    title: "Management Buy-In",
    headline: "Built something great? Stay involved while we find your successor.",
    body: "You've spent decades building your business. You're ready for partial liquidity — but not ready to walk away. We find and install a proven operator to lead the next chapter, while you stay involved, retain equity, and protect the legacy you've built.",
    cta: { label: "How this works →", href: "/for-owners" },
  },
};

export const SECTORS: Sector[] = [
  {
    name: "Business Services",
    icon: "briefcase",
    thesis: "Recurring revenue, fragmented markets, founder-led firms with deep client relationships.",
    multiples: "7-10x EV/EBITDA",
    dealLane: "MBO + MBI",
  },
  {
    name: "Healthcare Services",
    icon: "heart",
    thesis: "Defensive demand, regulatory moats, sub-specialty fragmentation ideal for consolidation.",
    multiples: "8-14x EV/EBITDA",
    dealLane: "MBO + MBI",
  },
  {
    name: "Niche Manufacturing",
    icon: "cog",
    thesis: "Proprietary processes, tangible assets. Founder technical IP often requires continued involvement - ideal for MBI with founder advisory retention.",
    multiples: "5-8x EV/EBITDA",
    dealLane: "MBO + MBI",
  },
  {
    name: "Industrial Services",
    icon: "wrench",
    thesis: "Essential maintenance and inspection services with long-term contracts and regional fragmentation.",
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
  body: "Whether you're a business owner, a management team, or an advisor — we'd like to hear from you.",
  cta: { label: "Get in Touch", href: "/contact" },
};

export const NAV_LINKS = [
  { label: "Sectors", href: "/sectors" },
  { label: "For Owners", href: "/for-owners" },
  { label: "For Teams", href: "/for-teams" },
  { label: "Track Record", href: "/track-record" },
  { label: "Team", href: "/team" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];
