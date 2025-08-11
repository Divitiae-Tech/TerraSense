// types/crops/cropHealth.ts

export interface IdentificationResult {
  access_token: string;
  result: {
    crop?: {
      suggestions: Suggestion[];
    };
    disease?: {
      suggestions: Suggestion[];
    };
  };
}

export interface Suggestion {
  id: number;
  name: string;
  scientific_name?: string;
  probability: number;
  similar_images?: SimilarImage[];
  details?: Details;
}

export interface SimilarImage {
  id: string;
  url: string;
  license_name?: string;
  license_url?: string;
  citation?: string;
}

export interface Details {
  gbif_id?: number;
  image?: string;
  images?: SimilarImage[];
  type?: string;
  common_names?: string[];
  taxonomy?: Record<string, any>;
  eppo_code?: string;
  eppo_regulation_status?: Record<string, any>;
  wiki_url?: string;
  wiki_description?: string;
  description?: string;
  treatment?: Record<string, any>;
  symptoms?: Record<string, any>;
  severity?: string;
  spreading?: string;
}

// Missing types that your API route needs
export interface PlantIdentificationRequest {
  images: string[];
  modifiers: string[];
  plant_language: string;
  plant_details: string[];
  disease_details?: string[];
}

export interface PlantIdentificationResponse {
  access_token: string;
  model_version: string;
  custom_id?: string;
  input: {
    latitude?: number;
    longitude?: number;
    similar_images: boolean;
    plant_details: string[];
    disease_details?: string[];
  };
  result: {
    is_plant: {
      binary: boolean;
      probability: number;
    };
    classification: {
      suggestions: PlantSuggestion[];
    };
    health_assessment?: {
      is_healthy: {
        binary: boolean;
        probability: number;
      };
      diseases?: DiseaseSuggestion[];
    };
  };
  status: string;
  sla_compliant_client: boolean;
  sla_compliant_system: boolean;
  created: number;
  completed: number;
}

export interface PlantSuggestion {
  id: number;
  name: string;
  probability: number;
  confirmed: boolean;
  similar_images?: SimilarImage[];
  details?: PlantDetails;
}

export interface DiseaseSuggestion {
  id: number;
  name: string;
  probability: number;
  similar_images?: SimilarImage[];
  details?: DiseaseDetails;
}

export interface PlantDetails {
  language: string;
  scientific_name: string;
  structured_name?: {
    genus?: string;
    species?: string;
  };
  common_names?: string[];
  url?: string;
  description?: {
    value: string;
    citation?: string;
    license_name?: string;
    license_url?: string;
  };
  taxonomy?: {
    class?: string;
    genus?: string;
    order?: string;
    family?: string;
    phylum?: string;
    kingdom?: string;
  };
  rank?: string;
  gbif_id?: number;
  inaturalist_id?: number;
  image?: {
    value: string;
    citation?: string;
    license_name?: string;
    license_url?: string;
  };
  images?: SimilarImage[];
  edible_parts?: {
    value: string[];
    citation?: string;
    license_name?: string;
    license_url?: string;
  };
  watering?: {
    max?: number;
    min?: number;
  };
  propagation_methods?: string[];
  synonyms?: string[];
  best_light_condition?: string;
  best_soil_type?: string;
  common_uses?: string[];
  cultural_significance?: string;
}

export interface DiseaseDetails {
  language: string;
  local_name?: string;
  description?: {
    value: string;
    citation?: string;
    license_name?: string;
    license_url?: string;
  };
  url?: string;
  treatment?: {
    biological?: string[];
    chemical?: string[];
    prevention?: string[];
  };
  classification?: {
    type?: string;
    organism?: string;
  };
  common_names?: string[];
  cause?: string;
}

export interface ApiError {
  error: {
    message: string;
    status: number;
  };
}