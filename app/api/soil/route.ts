import { NextResponse } from 'next/server';

/**
 * Comprehensive Next.js API Route Handler for soil data analysis
 * This enhanced route fetches extensive soil property data from the iSDAsoil API
 * and performs additional calculations and analysis for AI training purposes.
 * 
 * Features:
 * - Fetches all available soil properties across multiple depth layers
 * - Calculates soil quality indices and derived metrics
 * - Provides soil classification and agricultural suitability analysis
 * - Includes spatial context and environmental factors
 * - Offers both raw and processed data for different use cases
 */
export async function GET(request: Request) {
  const username = process.env.ISDASOIL_USERNAME;
  const password = process.env.ISDASOIL_PASSWORD;
  const baseUrl = 'https://api.isda-africa.com';

  if (!username || !password) {
    return NextResponse.json({
      error: 'API configuration error: iSDAsoil credentials not configured.'
    }, { status: 500 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const defaultLat = '-26.2041';
    const defaultLon = '28.0473';

    const lat = searchParams.get('lat') || defaultLat;
    const lon = searchParams.get('lon') || defaultLon;
    const includeRaw = searchParams.get('includeRaw') === 'true';
    const depthLayers = searchParams.get('depths')?.split(',') || ['0-5', '5-15', '15-30', '30-60', '60-100', '100-200'];

    console.log(`Fetching comprehensive soil data for coordinates: ${lat}, ${lon}`);

    // Step 1: Authenticate
    const loginResponse = await fetch(`${baseUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ username, password }),
    });

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('iSDAsoil authentication failed:', errorText);
      return NextResponse.json({
        error: `Authentication failed: ${loginResponse.statusText}`
      }, { status: loginResponse.status });
    }

    const { access_token: accessToken } = await loginResponse.json();

    // Step 2: Fetch available layers and metadata
    const layersResponse = await fetch(`${baseUrl}/isdasoil/v2/layers`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!layersResponse.ok) {
      throw new Error(`Failed to fetch soil layers: ${layersResponse.statusText}`);
    }

    const layersData = await layersResponse.json();
    const properties = Object.keys(layersData?.property || {});
    const propertyMetadata = layersData?.property || {};

    console.log(`Found ${properties.length} soil properties across ${depthLayers.length} depth layers`);

    // Step 3: Fetch data for all properties and all depth layers
    const allFetchPromises: Promise<any>[] = [];

    for (const propName of properties) {
      for (const depth of depthLayers) {
        const promise = fetchSoilProperty(baseUrl, accessToken, lat, lon, propName, depth, propertyMetadata[propName]);
        allFetchPromises.push(promise);
      }
    }

    const allResults = await Promise.all(allFetchPromises);
    
    // Step 4: Organize data by property and depth
    const organizedData: { [key: string]: { [key: string]: any } } = {};
    const rawData: any[] = [];

    allResults.forEach(result => {
      if (result.success) {
        if (!organizedData[result.property]) {
          organizedData[result.property] = {};
        }
        organizedData[result.property][result.depth] = result.data;
        rawData.push(result);
      }
    });

    // Step 5: Calculate comprehensive derived metrics
    const derivedAnalysis = await calculateComprehensiveAnalysis(organizedData, propertyMetadata, lat, lon);

    // Step 6: Perform soil classification
    const soilClassification = performSoilClassification(organizedData);

    // Step 7: Calculate agricultural suitability
    const agriculturalSuitability = calculateAgriculturalSuitability(organizedData);

    // Step 8: Environmental and spatial context
    const environmentalContext = await getEnvironmentalContext(lat, lon);

    // Step 9: Quality assessment and data completeness
    const dataQuality = assessDataQuality(organizedData, properties, depthLayers);

    // Step 10: Time series context (if historical data becomes available)
    const temporalContext = {
      samplingDate: new Date().toISOString(),
      season: getSeasonalContext(new Date()),
      dataVintage: 'current', // iSDAsoil provides current estimates
      historicalComparison: null // Placeholder for future historical analysis
    };

    const comprehensiveResponse = {
      metadata: {
        timestamp: new Date().toISOString(),
        location: { 
          latitude: parseFloat(lat), 
          longitude: parseFloat(lon),
          coordinateSystem: 'WGS84'
        },
        dataSource: 'iSDAsoil API v2',
        propertiesFetched: properties.length,
        depthLayers: depthLayers,
        totalDataPoints: allResults.filter(r => r.success).length,
        dataCompleteness: dataQuality.completeness,
        processingVersion: '2.0'
      },
      
      // Organized soil property data
      soilProperties: organizedData,
      
      // Comprehensive analysis and derived metrics
      analysis: {
        physical: derivedAnalysis.physical,
        chemical: derivedAnalysis.chemical,
        biological: derivedAnalysis.biological,
        hydrological: derivedAnalysis.hydrological,
        structural: derivedAnalysis.structural
      },
      
      // Soil classification and taxonomy
      classification: soilClassification,
      
      // Agricultural and land use suitability
      suitability: agriculturalSuitability,
      
      // Environmental and spatial context
      environmental: environmentalContext,
      
      // Data quality and reliability metrics
      dataQuality: dataQuality,
      
      // Temporal context
      temporal: temporalContext,
      
      // Property metadata and units
      propertyMetadata: Object.fromEntries(
        Object.entries(propertyMetadata).map(([key, value]: [string, any]) => [
          key, 
          {
            description: value.description || 'No description available',
            units: value.unit || 'Unknown',
            conversionFactor: value.conversion_factor || 1,
            dataType: value.data_type || 'numeric',
            methodology: value.methodology || 'Unknown'
          }
        ])
      ),
      
      // Include raw data if requested (for development/debugging)
      raw: includeRaw ? {
        layersMetadata: layersData,
        individualMeasurements: rawData
      } : undefined
    };

    return NextResponse.json(comprehensiveResponse);

  } catch (error: unknown) {
    console.error('Error in comprehensive soil data API:', error);
    let errorMessage = 'An internal server error occurred while fetching soil data.';
    if (error instanceof Error) {
      errorMessage = `Soil data API error: ${error.message}`;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// Helper function to fetch individual soil property data
async function fetchSoilProperty(
  baseUrl: string, 
  accessToken: string, 
  lat: string, 
  lon: string, 
  propName: string, 
  depth: string,
  metadata: any
): Promise<any> {
  try {
    const propertyApiUrl = `${baseUrl}/isdasoil/v2/soilproperty?lon=${lon}&lat=${lat}&property=${propName}&depth=${depth}`;
    
    const response = await fetch(propertyApiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return {
        success: false,
        property: propName,
        depth: depth,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }

    const data = await response.json();
    const propertyDataArray = data?.property?.[propName];
    const valueObject = propertyDataArray?.[0];
    
    if (!valueObject || valueObject.value?.value === null || valueObject.value?.value === undefined) {
      return {
        success: false,
        property: propName,
        depth: depth,
        error: 'No valid data returned'
      };
    }

    return {
      success: true,
      property: propName,
      depth: depth,
      data: {
        value: valueObject.value.value,
        unit: valueObject.value.unit,
        confidence: valueObject.confidence || null,
        method: valueObject.method || 'unknown',
        conversionFactor: metadata?.conversion_factor || 1,
        scaledValue: (valueObject.value.value || 0) * (metadata?.conversion_factor || 1)
      }
    };
  } catch (error) {
    return {
      success: false,
      property: propName,
      depth: depth,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Comprehensive soil analysis function
async function calculateComprehensiveAnalysis(
  soilData: { [key: string]: { [key: string]: any } },
  metadata: any,
  lat: string,
  lon: string
) {
  const analysis = {
    physical: calculatePhysicalProperties(soilData),
    chemical: calculateChemicalProperties(soilData),
    biological: calculateBiologicalProperties(soilData),
    hydrological: calculateHydrologicalProperties(soilData),
    structural: calculateStructuralProperties(soilData)
  };

  return analysis;
}

// Physical properties analysis
function calculatePhysicalProperties(soilData: any) {
  const physical: any = {
    texture: {},
    density: {},
    porosity: {},
    thermalProperties: {}
  };

  // Soil texture analysis
  if (soilData.clay && soilData.sand && soilData.silt) {
    const topsoil = '0-5';
    const clay = soilData.clay[topsoil]?.scaledValue || 0;
    const sand = soilData.sand[topsoil]?.scaledValue || 0;
    const silt = soilData.silt[topsoil]?.scaledValue || 0;
    
    physical.texture = {
      clay: clay,
      sand: sand,
      silt: silt,
      textureClass: determineTextureClass(clay, sand, silt),
      textureIndex: (clay + silt) / (sand + 1), // Fineness index
      structureStability: calculateStructureStability(clay, silt, sand)
    };
  }

  // Bulk density analysis
  if (soilData.bdod) {
    const depthProfile = Object.entries(soilData.bdod).map(([depth, data]: [string, any]) => ({
      depth,
      bulkDensity: data.scaledValue,
      compaction: data.scaledValue > 1.6 ? 'high' : data.scaledValue > 1.4 ? 'moderate' : 'low'
    }));
    
    physical.density = {
      profile: depthProfile,
      averageDensity: depthProfile.reduce((sum, layer) => sum + layer.bulkDensity, 0) / depthProfile.length,
      compactionRisk: depthProfile.some(layer => layer.bulkDensity > 1.6) ? 'high' : 'low'
    };
  }

  return physical;
}

// Chemical properties analysis
function calculateChemicalProperties(soilData: any) {
  const chemical: any = {
    acidity: {},
    nutrients: {},
    carbonContent: {},
    salinity: {}
  };

  // pH and acidity
  if (soilData.phh2o) {
    const phProfile = Object.entries(soilData.phh2o).map(([depth, data]: [string, any]) => ({
      depth,
      pH: data.scaledValue,
      acidityClass: classifyAcidity(data.scaledValue)
    }));
    
    chemical.acidity = {
      profile: phProfile,
      averagePH: phProfile.reduce((sum, layer) => sum + layer.pH, 0) / phProfile.length,
      pHVariation: Math.max(...phProfile.map(l => l.pH)) - Math.min(...phProfile.map(l => l.pH)),
      limitingFactor: phProfile.some(l => l.pH < 5.5 || l.pH > 8.5)
    };
  }

  // Nutrient analysis
  const nutrients = ['nitrogen', 'phosphorus', 'potassium', 'calcium', 'magnesium', 'sulfur'];
  chemical.nutrients = {};
  
  nutrients.forEach(nutrient => {
    if (soilData[nutrient]) {
      const nutrientProfile = Object.entries(soilData[nutrient]).map(([depth, data]: [string, any]) => ({
        depth,
        concentration: data.scaledValue,
        adequacyLevel: classifyNutrientLevel(nutrient, data.scaledValue)
      }));
      
      chemical.nutrients[nutrient] = {
        profile: nutrientProfile,
        averageLevel: nutrientProfile.reduce((sum, layer) => sum + layer.concentration, 0) / nutrientProfile.length,
        deficiencyRisk: nutrientProfile.some(l => l.adequacyLevel === 'deficient'),
        distribution: calculateNutrientDistribution(nutrientProfile)
      };
    }
  });

  // Carbon content and organic matter
  if (soilData.soc) {
    const carbonProfile = Object.entries(soilData.soc).map(([depth, data]: [string, any]) => ({
      depth,
      carbonContent: data.scaledValue,
      organicMatter: data.scaledValue * 1.72, // Standard conversion factor
      carbonClass: classifyCarbon(data.scaledValue)
    }));
    
    chemical.carbonContent = {
      profile: carbonProfile,
      totalCarbon: carbonProfile.reduce((sum, layer) => sum + layer.carbonContent, 0),
      averageOM: carbonProfile.reduce((sum, layer) => sum + layer.organicMatter, 0) / carbonProfile.length,
      carbonSequestrationPotential: calculateCarbonPotential(carbonProfile),
      soilHealth: carbonProfile[0]?.carbonContent > 2 ? 'good' : carbonProfile[0]?.carbonContent > 1 ? 'moderate' : 'poor'
    };
  }

  return chemical;
}

// Biological properties analysis
function calculateBiologicalProperties(soilData: any) {
  const biological: any = {
    organicMatter: {},
    biologicalActivity: {},
    microbialHabitat: {}
  };

  // Organic matter and biological activity indicators
  if (soilData.soc && soilData.nitrogen) {
    const topsoilCarbon = soilData.soc['0-5']?.scaledValue || 0;
    const topsoilNitrogen = soilData.nitrogen['0-5']?.scaledValue || 0;
    
    biological.organicMatter = {
      carbonNitrogenRatio: topsoilNitrogen > 0 ? topsoilCarbon / topsoilNitrogen : null,
      organicMatterQuality: classifyOrganicMatterQuality(topsoilCarbon, topsoilNitrogen),
      decompositionRate: estimateDecompositionRate(topsoilCarbon, topsoilNitrogen),
      biologicalActivityIndex: calculateBiologicalActivityIndex(soilData)
    };
  }

  return biological;
}

// Hydrological properties analysis
function calculateHydrologicalProperties(soilData: any) {
  const hydrological: any = {
    waterRetention: {},
    infiltration: {},
    drainage: {}
  };

  // Water retention based on texture and organic matter
  if (soilData.clay && soilData.sand && soilData.soc) {
    const clay = soilData.clay['0-5']?.scaledValue || 0;
    const sand = soilData.sand['0-5']?.scaledValue || 0;
    const organicMatter = (soilData.soc['0-5']?.scaledValue || 0) * 1.72;
    
    hydrological.waterRetention = {
      fieldCapacity: estimateFieldCapacity(clay, sand, organicMatter),
      wiltingPoint: estimateWiltingPoint(clay, sand),
      availableWater: estimateAvailableWater(clay, sand, organicMatter),
      waterHoldingClass: classifyWaterHolding(clay, sand, organicMatter)
    };
    
    hydrological.infiltration = {
      rate: estimateInfiltrationRate(clay, sand, organicMatter),
      surfaceRunoffRisk: assessRunoffRisk(clay, sand, organicMatter),
      permeabilityClass: classifyPermeability(sand, clay)
    };
  }

  return hydrological;
}

// Structural properties analysis
function calculateStructuralProperties(soilData: any) {
  const structural: any = {
    aggregation: {},
    compaction: {},
    rootZone: {}
  };

  // Soil structure and aggregation
  if (soilData.clay && soilData.silt && soilData.soc) {
    const clay = soilData.clay['0-5']?.scaledValue || 0;
    const silt = soilData.silt['0-5']?.scaledValue || 0;
    const organicMatter = (soilData.soc['0-5']?.scaledValue || 0) * 1.72;
    
    structural.aggregation = {
      stabilityIndex: calculateAggregateStability(clay, silt, organicMatter),
      structuralQuality: assessStructuralQuality(clay, silt, organicMatter),
      erosionResistance: calculateErosionResistance(clay, silt, organicMatter)
    };
  }

  // Compaction analysis across depth profile
  if (soilData.bdod) {
    const densityProfile = Object.entries(soilData.bdod);
    structural.compaction = {
      compactionLayers: identifyCompactionLayers(densityProfile),
      rootPenetrationBarriers: assessRootBarriers(densityProfile),
      overallCompactionRisk: calculateCompactionRisk(densityProfile)
    };
  }

  return structural;
}

// Soil classification function
function performSoilClassification(soilData: any): any {
  const classification: any = {
    textural: {},
    fertility: {},
    agricultural: {},
    environmental: {}
  };

  // Textural classification
  if (soilData.clay && soilData.sand && soilData.silt) {
    const topsoil = '0-5';
    const clay = soilData.clay[topsoil]?.scaledValue || 0;
    const sand = soilData.sand[topsoil]?.scaledValue || 0;
    const silt = soilData.silt[topsoil]?.scaledValue || 0;
    
    classification.textural = {
      primaryClass: determineTextureClass(clay, sand, silt),
      secondaryCharacteristics: getTextureCharacteristics(clay, sand, silt),
      workability: assessWorkability(clay, sand, silt),
      droughtSusceptibility: assessDroughtSusceptibility(clay, sand, silt)
    };
  }

  // Fertility classification
  if (soilData.phh2o && soilData.soc) {
    const pH = soilData.phh2o['0-5']?.scaledValue || 7;
    const organicCarbon = soilData.soc['0-5']?.scaledValue || 0;
    
    classification.fertility = {
      overallRating: calculateFertilityRating(soilData),
      limitingFactors: identifyLimitingFactors(soilData),
      managementNeeds: assessManagementNeeds(soilData),
      productivityPotential: assessProductivityPotential(soilData)
    };
  }

  return classification;
}

// Agricultural suitability function
function calculateAgriculturalSuitability(soilData: any): any {
  const suitability: any = {
    cropSuitability: {},
    landUseCapability: {},
    managementRequirements: {},
    sustainabilityFactors: {}
  };

  // Crop-specific suitability
  const crops = ['maize', 'wheat', 'soybeans', 'vegetables', 'pasture', 'forestry'];
  
  crops.forEach(crop => {
    suitability.cropSuitability[crop] = assessCropSuitability(crop, soilData);
  });

  // Land use capability classification
  suitability.landUseCapability = {
    class: determineLandUseClass(soilData),
    limitations: identifyLandUseLimitations(soilData),
    conservationNeeds: assessConservationNeeds(soilData),
    intensificationPotential: assessIntensificationPotential(soilData)
  };

  return suitability;
}

// Environmental context function
async function getEnvironmentalContext(lat: string, lon: string): Promise<any> {
  const context = {
    climate: getClimateContext(lat, lon),
    topography: getTopographicContext(lat, lon),
    hydrology: getHydrologicContext(lat, lon),
    ecology: getEcologicalContext(lat, lon)
  };

  return context;
}

// Data quality assessment
function assessDataQuality(soilData: any, properties: string[], depthLayers: string[]): any {
  const totalExpected = properties.length * depthLayers.length;
  const actualData = Object.keys(soilData).length;
  
  const completeness = Object.keys(soilData).map(prop => {
    const availableDepths = Object.keys(soilData[prop]).length;
    return availableDepths / depthLayers.length;
  });

  const averageCompleteness = completeness.reduce((a, b) => a + b, 0) / completeness.length;

  return {
    completeness: averageCompleteness,
    totalDataPoints: actualData,
    expectedDataPoints: totalExpected,
    missingProperties: properties.filter(prop => !soilData[prop]),
    dataReliability: averageCompleteness > 0.8 ? 'high' : averageCompleteness > 0.6 ? 'moderate' : 'low',
    recommendations: generateDataQualityRecommendations(averageCompleteness, soilData)
  };
}

// Helper functions for soil analysis
function determineTextureClass(clay: number, sand: number, silt: number): string {
  if (clay > 40) return 'Clay';
  if (clay > 27 && clay <= 40 && sand > 45) return 'Sandy Clay';
  if (clay > 27 && clay <= 40 && sand <= 45) return 'Silty Clay';
  if (clay > 20 && clay <= 27 && sand > 45) return 'Sandy Clay Loam';
  if (clay > 20 && clay <= 27 && sand <= 45) return 'Silty Clay Loam';
  if (clay <= 20 && silt >= 50 && sand <= 52) return 'Silt';
  if (clay <= 20 && silt >= 50 && sand > 52) return 'Silt Loam';
  if (clay <= 20 && silt < 50 && sand >= 70) return 'Sandy Loam';
  if (clay <= 20 && silt < 50 && sand < 70) return 'Loam';
  return 'Unknown';
}

function classifyAcidity(pH: number): string {
  if (pH < 4.5) return 'extremely acidic';
  if (pH < 5.5) return 'strongly acidic';
  if (pH < 6.5) return 'moderately acidic';
  if (pH < 7.3) return 'neutral';
  if (pH < 8.5) return 'moderately alkaline';
  return 'strongly alkaline';
}

function classifyNutrientLevel(nutrient: string, value: number): string {
  // Simplified nutrient classification - would need crop-specific thresholds
  const thresholds: { [key: string]: { low: number, adequate: number } } = {
    nitrogen: { low: 20, adequate: 40 },
    phosphorus: { low: 10, adequate: 25 },
    potassium: { low: 100, adequate: 200 }
  };
  
  const threshold = thresholds[nutrient];
  if (!threshold) return 'unknown';
  
  if (value < threshold.low) return 'deficient';
  if (value < threshold.adequate) return 'marginal';
  return 'adequate';
}

function classifyCarbon(carbonContent: number): string {
  if (carbonContent < 0.6) return 'very low';
  if (carbonContent < 1.2) return 'low';
  if (carbonContent < 1.8) return 'moderate';
  if (carbonContent < 3.0) return 'high';
  return 'very high';
}

function calculateStructureStability(clay: number, silt: number, sand: number): number {
  // Higher clay and silt content generally means better structure stability
  return (clay * 0.6 + silt * 0.3) / 100;
}

function calculateNutrientDistribution(profile: any[]): string {
  if (profile.length < 2) return 'insufficient data';
  
  const topsoilLevel = profile[0].concentration;
  const subsoilLevel = profile[profile.length - 1].concentration;
  
  if (topsoilLevel > subsoilLevel * 1.5) return 'surface concentrated';
  if (subsoilLevel > topsoilLevel * 1.5) return 'subsurface concentrated';
  return 'uniform distribution';
}

function calculateCarbonPotential(profile: any[]): string {
  const surfaceCarbon = profile[0]?.carbonContent || 0;
  if (surfaceCarbon > 3) return 'high sequestration potential';
  if (surfaceCarbon > 1.5) return 'moderate sequestration potential';
  return 'low sequestration potential';
}

function classifyOrganicMatterQuality(carbon: number, nitrogen: number): string {
  if (nitrogen === 0) return 'insufficient data';
  const cnRatio = carbon / nitrogen;
  
  if (cnRatio < 15) return 'high quality - rapid decomposition';
  if (cnRatio < 25) return 'moderate quality';
  return 'low quality - slow decomposition';
}

function estimateDecompositionRate(carbon: number, nitrogen: number): string {
  if (nitrogen === 0) return 'unknown';
  const cnRatio = carbon / nitrogen;
  
  if (cnRatio < 20) return 'rapid';
  if (cnRatio < 30) return 'moderate';
  return 'slow';
}

function calculateBiologicalActivityIndex(soilData: any): number {
  // Simplified biological activity index based on organic matter and pH
  const organicMatter = (soilData.soc?.['0-5']?.scaledValue || 0) * 1.72;
  const pH = soilData.phh2o?.['0-5']?.scaledValue || 7;
  
  let index = organicMatter * 10; // Base score from organic matter
  
  // pH factor (optimal around 6.5-7.5)
  if (pH >= 6 && pH <= 8) index *= 1.2;
  else if (pH < 5.5 || pH > 8.5) index *= 0.8;
  
  return Math.min(index, 100);
}

function estimateFieldCapacity(clay: number, sand: number, organicMatter: number): number {
  // Simplified estimation of field capacity (% by volume)
  return (clay * 0.4 + organicMatter * 0.8 + (100 - sand) * 0.2) / 100;
}

function estimateWiltingPoint(clay: number, sand: number): number {
  // Simplified estimation of wilting point
  return (clay * 0.25 + (100 - sand) * 0.1) / 100;
}

function estimateAvailableWater(clay: number, sand: number, organicMatter: number): number {
  const fieldCapacity = estimateFieldCapacity(clay, sand, organicMatter);
  const wiltingPoint = estimateWiltingPoint(clay, sand);
  return fieldCapacity - wiltingPoint;
}

function classifyWaterHolding(clay: number, sand: number, organicMatter: number): string {
  const availableWater = estimateAvailableWater(clay, sand, organicMatter);
  
  if (availableWater > 0.25) return 'high water holding capacity';
  if (availableWater > 0.15) return 'moderate water holding capacity';
  return 'low water holding capacity';
}

function estimateInfiltrationRate(clay: number, sand: number, organicMatter: number): string {
  if (sand > 70) return 'rapid infiltration';
  if (sand > 50) return 'moderate to rapid infiltration';
  if (clay < 30) return 'moderate infiltration';
  return 'slow infiltration';
}

function assessRunoffRisk(clay: number, sand: number, organicMatter: number): string {
  if (clay > 40 && organicMatter < 2) return 'high runoff risk';
  if (sand > 70) return 'low runoff risk';
  return 'moderate runoff risk';
}

function classifyPermeability(sand: number, clay: number): string {
  if (sand > 70) return 'high permeability';
  if (clay > 40) return 'low permeability';
  return 'moderate permeability';
}

function calculateAggregateStability(clay: number, silt: number, organicMatter: number): number {
  // Higher organic matter and moderate clay content improve stability
  return (organicMatter * 20 + clay * 0.5 + silt * 0.3) / 100;
}

function assessStructuralQuality(clay: number, silt: number, organicMatter: number): string {
  const stability = calculateAggregateStability(clay, silt, organicMatter);
  
  if (stability > 0.7) return 'excellent structure';
  if (stability > 0.5) return 'good structure';
  if (stability > 0.3) return 'moderate structure';
  return 'poor structure';
}

function calculateErosionResistance(clay: number, silt: number, organicMatter: number): string {
  if (organicMatter > 3 && clay > 20) return 'high erosion resistance';
  if (silt > 60) return 'low erosion resistance';
  return 'moderate erosion resistance';
}

function identifyCompactionLayers(densityProfile: any[]): any[] {
  return densityProfile
    .map(([depth, data]) => ({ depth, density: data.scaledValue }))
    .filter(layer => layer.density > 1.6);
}

function assessRootBarriers(densityProfile: any[]): string {
  const barriers = identifyCompactionLayers(densityProfile);
  
  if (barriers.some(b => b.depth.includes('0-') || b.depth.includes('5-'))) {
    return 'surface compaction - severe root restriction';
  }
  if (barriers.length > 0) return 'subsurface compaction - moderate root restriction';
  return 'no significant root barriers';
}

function calculateCompactionRisk(densityProfile: any[]): string {
  const averageDensity = densityProfile.reduce((sum, [_, data]) => sum + data.scaledValue, 0) / densityProfile.length;
  
  if (averageDensity > 1.6) return 'high compaction risk';
  if (averageDensity > 1.4) return 'moderate compaction risk';
  return 'low compaction risk';
}

function getTextureCharacteristics(clay: number, sand: number, silt: number): string[] {
  const characteristics = [];
  
  if (clay > 35) characteristics.push('plastic when wet');
  if (sand > 60) characteristics.push('gritty texture');
  if (silt > 50) characteristics.push('smooth, silky texture');
  if (clay < 15 && sand > 70) characteristics.push('loose, well-draining');
  
  return characteristics;
}

function assessWorkability(clay: number, sand: number, silt: number): string {
  if (clay > 40) return 'difficult to work when wet, hard when dry';
  if (sand > 70) return 'easy to work, may be too loose';
  if (clay > 20 && clay < 35) return 'good workability';
  return 'moderate workability';
}

function assessDroughtSusceptibility(clay: number, sand: number, silt: number): string {
  if (sand > 70) return 'high drought susceptibility';
  if (clay > 30) return 'low drought susceptibility';
  return 'moderate drought susceptibility';
}

function calculateFertilityRating(soilData: any): string {
  let score = 0;
  
  // pH score
  const pH = soilData.phh2o?.['0-5']?.scaledValue || 7;
  if (pH >= 6 && pH <= 7.5) score += 25;
  else if (pH >= 5.5 && pH < 8) score += 15;
  else score += 5;
  
  // Organic matter score
  const organicMatter = (soilData.soc?.['0-5']?.scaledValue || 0) * 1.72;
  if (organicMatter > 3) score += 25;
  else if (organicMatter > 1.5) score += 15;
  else score += 5;
  
  // Add other nutrient scores...
  
  if (score > 70) return 'high fertility';
  if (score > 50) return 'moderate fertility';
  return 'low fertility';
}

function identifyLimitingFactors(soilData: any): string[] {
  const factors = [];
  
  const pH = soilData.phh2o?.['0-5']?.scaledValue || 7;
  if (pH < 5.5) factors.push('soil acidity');
  if (pH > 8.5) factors.push('soil alkalinity');
  
  const organicMatter = (soilData.soc?.['0-5']?.scaledValue || 0) * 1.72;
  if (organicMatter < 1) factors.push('low organic matter');
  
  return factors;
}

function assessManagementNeeds(soilData: any): string[] {
  const needs = [];
  
  const pH = soilData.phh2o?.['0-5']?.scaledValue || 7;
  if (pH < 5.5) needs.push('lime application needed');
  if (pH > 8.5) needs.push('acidifying amendments needed');
  
  const organicMatter = (soilData.soc?.['0-5']?.scaledValue || 0) * 1.72;
  if (organicMatter < 2) needs.push('organic matter improvement needed');
  
  return needs;
}

function assessProductivityPotential(soilData: any): string {
  const fertility = calculateFertilityRating(soilData);
  const texture = soilData.clay && soilData.sand && soilData.silt ? 
    determineTextureClass(
      soilData.clay['0-5']?.scaledValue || 0,
      soilData.sand['0-5']?.scaledValue || 0, 
      soilData.silt['0-5']?.scaledValue || 0
    ) : 'Unknown';
  
  if (fertility === 'high fertility' && ['Loam', 'Clay Loam', 'Silt Loam'].includes(texture)) {
    return 'high productivity potential';
  }
  if (fertility === 'moderate fertility') return 'moderate productivity potential';
  return 'limited productivity potential';
}

function assessCropSuitability(crop: string, soilData: any): any {
  // Simplified crop suitability assessment
  const suitability: any = { overall: 'unknown', limitations: [], recommendations: [] };
  
  const pH = soilData.phh2o?.['0-5']?.scaledValue || 7;
  const organicMatter = (soilData.soc?.['0-5']?.scaledValue || 0) * 1.72;
  
  // Crop-specific requirements (simplified)
  const cropRequirements: { [key: string]: { minPH: number, maxPH: number, minOM: number } } = {
    maize: { minPH: 5.8, maxPH: 7.8, minOM: 1.5 },
    wheat: { minPH: 6.0, maxPH: 8.0, minOM: 1.0 },
    soybeans: { minPH: 6.0, maxPH: 7.5, minOM: 2.0 },
    vegetables: { minPH: 6.0, maxPH: 7.5, minOM: 2.5 },
    pasture: { minPH: 5.5, maxPH: 8.0, minOM: 1.0 },
    forestry: { minPH: 5.0, maxPH: 8.5, minOM: 1.0 }
  };
  
  const req = cropRequirements[crop];
  if (!req) return suitability;
  
  let score = 0;
  
  if (pH >= req.minPH && pH <= req.maxPH) score += 40;
  else {
    suitability.limitations.push(`pH ${pH < req.minPH ? 'too low' : 'too high'} for optimal ${crop} growth`);
    score += 20;
  }
  
  if (organicMatter >= req.minOM) score += 30;
  else {
    suitability.limitations.push(`organic matter too low for optimal ${crop} growth`);
    score += 15;
  }
  
  if (score > 60) suitability.overall = 'suitable';
  else if (score > 40) suitability.overall = 'moderately suitable';
  else suitability.overall = 'marginally suitable';
  
  return suitability;
}

function determineLandUseClass(soilData: any): string {
  // Simplified land use capability classification
  const fertility = calculateFertilityRating(soilData);
  const clay = soilData.clay?.['0-5']?.scaledValue || 0;
  
  if (fertility === 'high fertility' && clay > 15 && clay < 45) return 'Class I - Prime agricultural land';
  if (fertility === 'moderate fertility') return 'Class II - Good agricultural land';
  return 'Class III - Fair agricultural land';
}

function identifyLandUseLimitations(soilData: any): string[] {
  const limitations = [];
  
  const clay = soilData.clay?.['0-5']?.scaledValue || 0;
  if (clay > 50) limitations.push('heavy clay texture');
  if (clay < 10) limitations.push('very sandy texture');
  
  return limitations;
}

function assessConservationNeeds(soilData: any): string[] {
  const needs = [];
  
  const organicMatter = (soilData.soc?.['0-5']?.scaledValue || 0) * 1.72;
  if (organicMatter < 2) needs.push('erosion control measures needed');
  
  return needs;
}

function assessIntensificationPotential(soilData: any): string {
  const fertility = calculateFertilityRating(soilData);
  
  if (fertility === 'high fertility') return 'high intensification potential';
  if (fertility === 'moderate fertility') return 'moderate intensification potential';
  return 'limited intensification potential';
}

function getClimateContext(lat: string, lon: string): any {
  // Climate context for Johannesburg region (simplified)
  return {
    zone: 'subtropical highland',
    averageRainfall: 713, // mm per year
    rainySeasonMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    temperatureRange: { min: 4, max: 26 }, // Celsius
    frostRisk: 'moderate winter frost risk'
  };
}

function getTopographicContext(lat: string, lon: string): any {
  // Topographic context (would need DEM data for accuracy)
  return {
    elevation: 1753, // meters above sea level for Johannesburg
    slope: 'unknown - requires DEM data',
    aspect: 'unknown - requires DEM data',
    drainageClass: 'unknown - requires detailed survey'
  };
}

function getHydrologicContext(lat: string, lon: string): any {
  return {
    watershedPosition: 'unknown - requires watershed analysis',
    floodingRisk: 'unknown - requires flood mapping',
    groundwaterDepth: 'unknown - requires well data'
  };
}

function getEcologicalContext(lat: string, lon: string): any {
  return {
    biome: 'Grassland',
    ecoregion: 'Highveld Grasslands',
    naturalVegetation: 'Temperate grassland',
    biodiversityImportance: 'moderate - transformed landscape'
  };
}

function getSeasonalContext(date: Date): any {
  const month = date.getMonth() + 1;
  
  // Southern hemisphere seasons
  let season;
  if ((month >= 12) || month <= 2) season = 'summer';
  else if (month >= 3 && month <= 5) season = 'autumn';
  else if (month >= 6 && month <= 8) season = 'winter';
  else season = 'spring';
  
  return {
    season,
    hemisphere: 'southern',
    agriculturalSeason: getAgriculturalSeason(month),
    growingDegreeDays: 'requires temperature data',
    plantingWindow: getPlatinWindow(season)
  };
}

function getAgriculturalSeason(month: number): string {
  if (month >= 10 || month <= 3) return 'growing season';
  return 'dormant season';
}

function getPlatinWindow(season: string): string {
  if (season === 'spring') return 'optimal planting window for summer crops';
  if (season === 'autumn') return 'planting window for winter crops';
  return 'outside primary planting windows';
}

function generateDataQualityRecommendations(completeness: number, soilData: any): string[] {
  const recommendations = [];
  
  if (completeness < 0.7) {
    recommendations.push('Consider additional soil sampling to improve data completeness');
  }
  
  if (!soilData.phh2o) {
    recommendations.push('pH testing is critical for soil management decisions');
  }
  
  if (!soilData.soc) {
    recommendations.push('Organic carbon analysis recommended for soil health assessment');
  }
  
  if (!soilData.clay || !soilData.sand || !soilData.silt) {
    recommendations.push('Complete texture analysis needed for proper soil classification');
  }
  
  recommendations.push('Validate API data with local soil testing when making management decisions');
  
  return recommendations;
}