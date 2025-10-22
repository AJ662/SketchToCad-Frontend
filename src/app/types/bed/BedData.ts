export interface BedData {
  bed_id: number;
  area: number;
  rgb_median: number[];
  rgb_mean: number[];
  clean_pixel_count: number;
  position?: {
    x: number;
    y: number;
  };
}