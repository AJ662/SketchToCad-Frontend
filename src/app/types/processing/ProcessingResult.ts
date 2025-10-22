import {BedData} from '../bed/BedData';
import {EnhancedColors} from '../bed/EnhancedColors'
import {ProcessingStatistics} from './ProcessingStatistics'


export interface ProcessingResult {
  session_id: string;
  original_image: string; 
  processed_borders: string;
  statistics: ProcessingStatistics;
  bed_data: BedData[];
  enhanced_colors: EnhancedColors;
  enhancement_previews?: {
    [key: string]: {
      image: string;
      title: string;
      xlabel: string;
      ylabel: string;
    };
  };
}