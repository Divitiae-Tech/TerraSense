//lib/cropHealthAPI.ts

import type { IdentificationResult } from "@/types/crops/cropHealth";

const API_KEY = process.env.NEXT_PUBLIC_CROP_HEALTH_API_KEY;
const API_URL = process.env.NEXT_PUBLIC_CROP_HEALTH_API_URL;

if (!API_KEY || !API_URL) {
  throw new Error('Missing required environment variables for Crop Health API');
}

export async function identifyCrop(
  file: File,
  options: {
    latitude?: number;
    longitude?: number;
    datetime?: string;
    similarImages?: boolean;
    customId?: number;
  } = {}
): Promise<IdentificationResult> {
  try {
    // Validate file
    if (!file) {
      throw new Error('No file provided');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size must be less than 10MB');
    }

    // Convert file to base64
    console.log('Converting file to base64...');
    const base64Image = await fileToBase64(file);
    
    // Prepare the request body
    const requestBody: any = {
      images: [base64Image],
    };

    // Add optional parameters
    if (options.latitude !== undefined && options.latitude !== null && !isNaN(options.latitude)) {
      requestBody.latitude = options.latitude;
    }
    if (options.longitude !== undefined && options.longitude !== null && !isNaN(options.longitude)) {
      requestBody.longitude = options.longitude;
    }
    if (options.datetime && options.datetime.trim() !== '') {
      requestBody.datetime = options.datetime;
    }
    if (options.similarImages) {
      requestBody.similar_images = options.similarImages;
    }
    if (options.customId) {
      requestBody.custom_id = options.customId;
    }

    console.log('Making API request...');
    
    // Make the API request
    const response = await fetch(`${API_URL}/identification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Api-Key': API_KEY as string,
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      let errorMessage = `API request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch {
        const errorText = await response.text();
        if (errorText) {
          errorMessage = errorText;
        }
      }
      throw new Error(errorMessage);
    }

    const result: IdentificationResult = await response.json();
    console.log('API response received successfully');
    return result;
  } catch (error) {
    console.error('Error identifying crop:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred during identification');
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (data:image/jpeg;base64,)
        const base64 = reader.result.split(',')[1];
        if (!base64) {
          reject(new Error('Failed to extract base64 data from file'));
          return;
        }
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = () => reject(new Error('FileReader error occurred'));
  });
}