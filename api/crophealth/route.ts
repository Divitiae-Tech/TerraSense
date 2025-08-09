// api/crophealth/route.ts

import axios from 'axios';
import { PlantIdentificationRequest, PlantIdentificationResponse, ApiError } from '@/types/crops/cropHealth';

const API_KEY = process.env.NEXT_PUBLIC_KINDWISE_API_KEY;
const API_BASE_URL = process.env.KINDWISE_API_BASE_URL || 'https://plant.id/api/v3';

if (!API_KEY) {
  console.warn('NEXT_PUBLIC_KINDWISE_API_KEY is not set. The API will not work without it.');
}

export const convertImageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data:image/jpeg;base64, prefix
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const identifyPlant = async (
  images: string[],
  includeHealthAssessment: boolean = true
): Promise<PlantIdentificationResponse> => {
  if (!API_KEY) {
    throw new Error('API key is not configured. Please add NEXT_PUBLIC_KINDWISE_API_KEY to your .env.local file');
  }

  const requestData: PlantIdentificationRequest = {
    images,
    modifiers: includeHealthAssessment ? ['crops_fast', 'similar_images', 'health_all'] : ['crops_fast', 'similar_images'],
    plant_language: 'en',
    plant_details: ['common_names', 'url', 'description', 'edible_parts', 'watering'],
    disease_details: includeHealthAssessment ? ['local_name', 'description', 'url', 'treatment', 'classification'] : undefined,
  };

  console.log('Making API request to:', `${API_BASE_URL}/identification`);
  console.log('Request data:', { ...requestData, images: ['[base64 data hidden]'] });

  try {
    const response = await axios.post(
      `${API_BASE_URL}/identification`,
      requestData,
      {
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': API_KEY,
          'Accept': 'application/json',
        },
        timeout: 30000, // 30 second timeout
      }
    );

    console.log('API response received:', response.status);
    return response.data;
  } catch (error) {
    console.error('API Error Details:', error);
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const responseData = error.response?.data;
      
      console.error('Response status:', status);
      console.error('Response data:', responseData);
      console.error('Request headers:', error.config?.headers);
      
      let errorMessage = 'Unknown API error';
      
      if (status === 401) {
        errorMessage = 'Invalid or missing API key. Please check your NEXT_PUBLIC_KINDWISE_API_KEY in .env.local';
      } else if (status === 429) {
        errorMessage = 'API rate limit exceeded. Please try again later.';
      } else if (status === 400) {
        errorMessage = responseData?.message || 'Invalid request format';
      } else if (status === 403) {
        errorMessage = 'Access forbidden. Check your API key permissions.';
      } else if (responseData?.message) {
        errorMessage = responseData.message;
      } else if (error.message) {
        errorMessage = error.message;
      }

      const apiError: ApiError = {
        error: {
          message: errorMessage,
          status: status || 500,
        },
      };
      throw apiError;
    }
    throw error;
  }
};

export const formatProbability = (probability: number): string => {
  return `${(probability * 100).toFixed(1)}%`;
};

export const getHealthStatus = (healthAssessment?: { is_healthy: { binary: boolean; probability: number } }): {
  status: 'healthy' | 'unhealthy' | 'unknown';
  confidence: string;
  color: string;
} => {
  if (!healthAssessment) {
    return {
      status: 'unknown',
      confidence: 'N/A',
      color: 'text-gray-500',
    };
  }

  const { binary, probability } = healthAssessment.is_healthy;
  
  return {
    status: binary ? 'healthy' : 'unhealthy',
    confidence: formatProbability(probability),
    color: binary ? 'text-green-600' : 'text-red-600',
  };
};