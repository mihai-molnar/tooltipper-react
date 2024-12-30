export interface Tooltip {
  id: string;
  x: number;
  y: number;
  text: string;
}

export interface Photo {
  id: string;
  image_url: string;
  short_id: string;
  created_at: string;
}

export interface PhotoWithTooltips extends Photo {
  tooltips: Tooltip[];
}