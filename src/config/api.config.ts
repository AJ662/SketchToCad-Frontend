// API Configuration for SketchToCad Microservices
export const API_CONFIG = {
  imageProcessing: {
    baseUrl: process.env.NEXT_PUBLIC_IMAGE_PROCESSING_URL || 'http://localhost:8001',
    endpoints: {
      processImage: '/process-image',
      getSession: '/session',
      deleteSession: '/session',
      health: '/health'
    }
  },
  clustering: {
    baseUrl: process.env.NEXT_PUBLIC_CLUSTERING_URL || 'http://localhost:8002',
    endpoints: {
      createEnhancedColors: '/create-enhanced-colors',
      processClustering: '/process-clustering',
      health: '/health'
    }
  },
  dxfExport: {
    baseUrl: process.env.NEXT_PUBLIC_DXF_EXPORT_URL || 'http://localhost:8003',
    endpoints: {
      exportDxf: '/export-dxf',
      validateExport: '/validate-export',
      health: '/health',
      capabilities: '/capabilities'
    }
  }
};

export default API_CONFIG;