import { ClusteringStatistics } from "./ClusteringStatistics";
import { ClusterStats } from "./ClusterStats";

export interface ClusteringResult {
  clustered_image: string;
  statistics: ClusteringStatistics;
  cluster_details: ClusterStats[];
}