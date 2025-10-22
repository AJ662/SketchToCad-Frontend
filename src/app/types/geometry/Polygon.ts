import { Point } from "./Point";

export interface Polygon {
  id: string;
  points: Point[];
  cluster_id: number;
  color: string;
}