import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_CONFIG } from '../config/api.config';

// Type imports (adjust paths based on your structure)
interface BedData {
  bed_id: number;
  area: number;
  rgb_median: number[];
  rgb_mean: number[];
  clean_pixel_count: number;
}

interface ProcessingStatistics {
  raw_border_pixels: number;
  clean_border_pixels: number;
  final_border_pixels: number;
  total_beds_found: number;
  total_areas_detected: number;
  average_bed_size: number;
  largest_bed_size: number;
  smallest_bed_size: number;
}

interface ProcessingResult {
  session_id: string;
  bed_count: number;
  bed_data: BedData[];
  statistics: ProcessingStatistics;
  image_shape: number[];
  processing_time_ms: number;
}

interface EnhancedColorsResponse {
  enhanced_colors: Record<string, number[][]>;
  enhancement_methods: string[];
}

interface ClusterStatistics {
  total_beds: number;
  clustered_beds: number;
  unclustered_beds: number;
  coverage_percent: number;
  num_clusters: number;
  cluster_details: Array<{
    cluster_id: number;
    cluster_name: string;
    bed_count: number;
    total_area: number;
    average_area: number;
  }>;
}

interface ClusteringResult {
  final_labels: number[];
  processed_clusters: Record<string, number[]>;
  statistics: ClusterStatistics;
}

interface SessionInfo {
  session_id: string;
  bed_count: number;
  image_width: number;
  image_height: number;
  status: string;
  created_at: string;
  processing_time_ms: number;
}

interface HealthStatus {
  status: string;
  service: string;
  version: string;
  ezdxf_available?: boolean;
}

interface ValidateExportResponse {
  can_export: boolean;
  gdal_available: boolean;
  bed_data_valid: boolean;
  cluster_count: number;
  messages: string[];
}

interface ExportCapabilities {
  dxf_available: boolean;
  export_types: string[];
  supported_formats: string[];
}

class ApiService {
  private imageProcessingApi: AxiosInstance;
  private clusteringApi: AxiosInstance;
  private dxfExportApi: AxiosInstance;

  constructor() {
    // Create axios instances for each microservice
    this.imageProcessingApi = axios.create({
      baseURL: API_CONFIG.imageProcessing.baseUrl,
      headers: { 
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 second timeout
    });

    this.clusteringApi = axios.create({
      baseURL: API_CONFIG.clustering.baseUrl,
      headers: { 
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    this.dxfExportApi = axios.create({
      baseURL: API_CONFIG.dxfExport.baseUrl,
      headers: { 
        'Content-Type': 'application/json'
      },
      timeout: 60000 // 60 seconds for file export
    });

    // Add response interceptors for error handling
    this.setupInterceptors();
  }

  private setupInterceptors() {
    const errorHandler = (error: AxiosError) => {
      if (error.response) {
        // Server responded with error status
        console.error('API Error:', {
          status: error.response.status,
          data: error.response.data,
          service: error.config?.baseURL
        });
      } else if (error.request) {
        // Request made but no response
        console.error('Network Error:', {
          message: 'No response from server',
          service: error.config?.baseURL
        });
      } else {
        // Error in request setup
        console.error('Request Error:', error.message);
      }
      return Promise.reject(error);
    };

    this.imageProcessingApi.interceptors.response.use(
      response => response,
      errorHandler
    );
    this.clusteringApi.interceptors.response.use(
      response => response,
      errorHandler
    );
    this.dxfExportApi.interceptors.response.use(
      response => response,
      errorHandler
    );
  }

  // ==================== IMAGE PROCESSING SERVICE ====================

  /**
   * Upload and process an image to detect plant beds
   */
  async processImage(file: File): Promise<ProcessingResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.imageProcessingApi.post<ProcessingResult>(
      API_CONFIG.imageProcessing.endpoints.processImage,
      formData,
      {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      }
    );
    
    return response.data;
  }

  /**
   * Get session metadata by session ID
   */
  async getSession(sessionId: string): Promise<SessionInfo> {
    const response = await this.imageProcessingApi.get<SessionInfo>(
      `${API_CONFIG.imageProcessing.endpoints.getSession}/${sessionId}`
    );
    return response.data;
  }

  /**
   * Delete a session and all associated data
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.imageProcessingApi.delete(
      `${API_CONFIG.imageProcessing.endpoints.deleteSession}/${sessionId}`
    );
  }

  /**
   * Check health of image processing service
   */
  async getImageProcessingHealth(): Promise<HealthStatus> {
    const response = await this.imageProcessingApi.get<HealthStatus>(
      API_CONFIG.imageProcessing.endpoints.health
    );
    return response.data;
  }

  // ==================== CLUSTERING SERVICE ====================

  /**
   * Create enhanced color representations for clustering
   */
  async createEnhancedColors(bedData: BedData[]): Promise<EnhancedColorsResponse> {
    const response = await this.clusteringApi.post<EnhancedColorsResponse>(
      API_CONFIG.clustering.endpoints.createEnhancedColors,
      { bed_data: bedData }
    );
    return response.data;
  }

  /**
   * Process manual clustering based on user-defined clusters
   */
  async processClustering(
    bedData: BedData[],
    enhancedColors: Record<string, number[][]>,
    clustersData: Record<string, number[]>
  ): Promise<ClusteringResult> {
    const response = await this.clusteringApi.post<ClusteringResult>(
      API_CONFIG.clustering.endpoints.processClustering,
      {
        bed_data: bedData,
        enhanced_colors: enhancedColors,
        clusters_data: clustersData
      }
    );
    return response.data;
  }

  /**
   * Check health of clustering service
   */
  async getClusteringHealth(): Promise<HealthStatus> {
    const response = await this.clusteringApi.get<HealthStatus>(
      API_CONFIG.clustering.endpoints.health
    );
    return response.data;
  }

  // ==================== DXF EXPORT SERVICE ====================

  /**
   * Export clustered plant beds to DXF format
   * @returns Blob containing the DXF file
   */
  async exportDxf(
    bedData: BedData[],
    clusterDict: Record<string, string>,
    exportType: 'summary' | 'detailed' = 'detailed'
  ): Promise<Blob> {
    const response = await this.dxfExportApi.post(
      API_CONFIG.dxfExport.endpoints.exportDxf,
      {
        bed_data: bedData,
        cluster_dict: clusterDict,
        export_type: exportType
      },
      {
        responseType: 'blob'
      }
    );
    return response.data;
  }

  /**
   * Validate that export requirements are met
   */
  async validateExport(
    bedData: BedData[],
    clusterDict: Record<string, string>
  ): Promise<ValidateExportResponse> {
    const response = await this.dxfExportApi.post<ValidateExportResponse>(
      API_CONFIG.dxfExport.endpoints.validateExport,
      {
        bed_data: bedData,
        cluster_dict: clusterDict
      }
    );
    return response.data;
  }

  /**
   * Get export capabilities of the DXF service
   */
  async getExportCapabilities(): Promise<ExportCapabilities> {
    const response = await this.dxfExportApi.get<ExportCapabilities>(
      API_CONFIG.dxfExport.endpoints.capabilities
    );
    return response.data;
  }

  /**
   * Check health of DXF export service
   */
  async getDxfExportHealth(): Promise<HealthStatus> {
    const response = await this.dxfExportApi.get<HealthStatus>(
      API_CONFIG.dxfExport.endpoints.health
    );
    return response.data;
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Check health of all services
   */
  async checkAllServicesHealth(): Promise<{
    imageProcessing: boolean;
    clustering: boolean;
    dxfExport: boolean;
    details?: {
      imageProcessing?: HealthStatus;
      clustering?: HealthStatus;
      dxfExport?: HealthStatus;
    };
  }> {
    const results = await Promise.allSettled([
      this.getImageProcessingHealth(),
      this.getClusteringHealth(),
      this.getDxfExportHealth()
    ]);

    return {
      imageProcessing: results[0].status === 'fulfilled',
      clustering: results[1].status === 'fulfilled',
      dxfExport: results[2].status === 'fulfilled',
      details: {
        imageProcessing: results[0].status === 'fulfilled' ? results[0].value : undefined,
        clustering: results[1].status === 'fulfilled' ? results[1].value : undefined,
        dxfExport: results[2].status === 'fulfilled' ? results[2].value : undefined
      }
    };
  }

  /**
   * Download a blob as a file
   * Utility function for handling DXF file downloads
   */
  downloadFile(blob: Blob, filename: string) {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Complete workflow: Process image → Enhance colors → Cluster → Export
   * This is a convenience method that orchestrates the entire pipeline
   */
  async completeWorkflow(
    imageFile: File,
    selectedEnhancementMethod: string,
    clusters: Record<string, number[]>,
    exportType: 'summary' | 'detailed' = 'detailed'
  ): Promise<{
    processing: ProcessingResult;
    enhancement: EnhancedColorsResponse;
    clustering: ClusteringResult;
    dxfFile: Blob;
  }> {
    // Step 1: Process image
    const processing = await this.processImage(imageFile);

    // Step 2: Create enhanced colors
    const enhancement = await this.createEnhancedColors(processing.bed_data);

    // Step 3: Process clustering
    const clustering = await this.processClustering(
      processing.bed_data,
      enhancement.enhanced_colors,
      clusters
    );

    // Step 4: Create cluster dictionary for export
    const clusterDict: Record<string, string> = {};
    Object.entries(clusters).forEach(([name, bedIds], index) => {
      clusterDict[index.toString()] = name;
    });

    // Step 5: Export to DXF
    const dxfFile = await this.exportDxf(
      processing.bed_data,
      clusterDict,
      exportType
    );

    return {
      processing,
      enhancement,
      clustering,
      dxfFile
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export types for use in components
export type {
  BedData,
  ProcessingResult,
  ProcessingStatistics,
  EnhancedColorsResponse,
  ClusteringResult,
  ClusterStatistics,
  SessionInfo,
  HealthStatus,
  ValidateExportResponse,
  ExportCapabilities
};