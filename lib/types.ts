export interface Sector {
  name: string;
  icon: string;
  thesis: string;
  multiples: string;
  dealLane: string;
}

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface DealSpotlight {
  headline: string;
  body: string;
  metric: string;
}

export interface Region {
  name: string;
  description: string;
}

export type ContactRole = "business-owner" | "management-team" | "advisor";
