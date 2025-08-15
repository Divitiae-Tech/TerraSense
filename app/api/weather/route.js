// app/api/weather/route.js
import { NextResponse } from 'next/server';
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET() {
  try {
    const lat = '-26.2041'; // Johannesburg
    const lon = '28.0473';
    const timezone = 'Africa/Johannesburg';
    const units = 'metric';

    if (!process.env.METEOSOURCE_API_KEY) {
      return NextResponse.json({
        error: 'API configuration error',
        details: 'Meteosource API key not configured'
      }, { status: 500 });
    }

    const meteosourceApiUrl =
      `https://www.meteosource.com/api/v1/free/point` +
      `?lat=${lat}&lon=${lon}` +
      `&sections=current,daily,hourly,minutely,alerts` +
      `&timezone=${timezone}` +
      `&language=en&units=${units}` +
      `&key=${process.env.METEOSOURCE_API_KEY}`;

    const openMeteoApiUrl =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,relative_humidity_2m` +
      `&hourly=temperature_2m,relative_humidity_2m,dew_point_2m,pressure_msl,cloud_cover,wind_speed_10m,wind_direction_10m,precipitation,precipitation_probability` +
      `&timezone=${timezone}&forecast_days=7`;

    const [meteosourceResponse, openMeteoResponse] = await Promise.all([
      fetch(meteosourceApiUrl),
      fetch(openMeteoApiUrl)
    ]);

    const meteosourceData = meteosourceResponse.ok ? await meteosourceResponse.json() : {};
    const openMeteoData = openMeteoResponse.ok ? await openMeteoResponse.json() : {};

    // Helper function to normalize wind data
    const normalizeWind = (windData) => {
      if (!windData) {
        return {
          speed: null,
          direction: null
        };
      }
      
      // Handle Meteosource wind format: {speed, angle, dir}
      if (typeof windData === 'object' && windData !== null) {
        return {
          speed: safeNumber(windData.speed),
          direction: safeNumber(windData.angle ?? windData.direction)
        };
      }
      
      return {
        speed: null,
        direction: null
      };
    };

    // Helper function to normalize condition data
    const normalizeCondition = (conditionData, summary, icon) => {
      const condition = {};
      
      if (summary) condition.summary = String(summary);
      if (summary) condition.icon = mapConditionToIcon(summary);
      if (icon) condition.code = String(icon);
      
      return Object.keys(condition).length > 0 ? condition : undefined;
    };

    // Helper function to ensure values match schema types
    const safeNumber = (value, defaultValue = null) => {
      if (value === null || value === undefined) return defaultValue;
      const num = Number(value);
      return isNaN(num) ? defaultValue : num;
    };

    const safeString = (value) => {
      if (value === null || value === undefined) return null;
      return String(value);
    };

    // Helper to handle optional number fields that might be required
    const safeOptionalNumber = (value) => {
      if (value === null || value === undefined) return undefined;
      const num = Number(value);
      return isNaN(num) ? undefined : num;
    };

    const processedCurrent = {
      timestamp: meteosourceData.current?.date || new Date().toISOString(),
      temperature: safeNumber(meteosourceData.current?.temperature ?? openMeteoData.current?.temperature_2m ?? 0),
      wind: {
        speed: safeOptionalNumber(meteosourceData.current?.wind?.speed ?? openMeteoData.hourly?.wind_speed_10m?.[0]),
        direction: safeOptionalNumber(meteosourceData.current?.wind?.angle ?? meteosourceData.current?.wind?.direction ?? openMeteoData.hourly?.wind_direction_10m?.[0])
      },
      precipitation: {
        total: safeOptionalNumber(meteosourceData.current?.precipitation?.total ?? openMeteoData.hourly?.precipitation?.[0]),
        probability: safeOptionalNumber(meteosourceData.current?.precipitation?.probability),
        type: safeString(meteosourceData.current?.precipitation?.type)
      },
      condition: {
        summary: safeString(meteosourceData.current?.summary),
        icon: meteosourceData.current?.summary ? mapConditionToIcon(meteosourceData.current.summary) : null,
        code: meteosourceData.current?.icon ? String(meteosourceData.current.icon) : null
      },
      sunlight: {
        sunrise: safeString(meteosourceData.current?.sunrise),
        sunset: safeString(meteosourceData.current?.sunset)
      }
    };

    // Add optional fields only if they have values
    if (meteosourceData.current?.temperature_apparent !== null && meteosourceData.current?.temperature_apparent !== undefined) {
      processedCurrent.feelsLike = safeOptionalNumber(meteosourceData.current.temperature_apparent);
    }
    
    if (meteosourceData.current?.humidity !== null && meteosourceData.current?.humidity !== undefined) {
      processedCurrent.humidity = safeOptionalNumber(meteosourceData.current.humidity ?? openMeteoData.current?.relative_humidity_2m);
    }
    
    if (meteosourceData.current?.dew_point !== null && meteosourceData.current?.dew_point !== undefined) {
      processedCurrent.dewPoint = safeOptionalNumber(meteosourceData.current.dew_point ?? openMeteoData.hourly?.dew_point_2m?.[0]);
    }
    
    if (meteosourceData.current?.pressure !== null && meteosourceData.current?.pressure !== undefined) {
      processedCurrent.pressure = safeOptionalNumber(meteosourceData.current.pressure ?? openMeteoData.hourly?.pressure_msl?.[0]);
    }
    
    if (meteosourceData.current?.cloud_cover !== null && meteosourceData.current?.cloud_cover !== undefined) {
      processedCurrent.cloudCover = safeOptionalNumber(meteosourceData.current.cloud_cover ?? openMeteoData.hourly?.cloud_cover?.[0]);
    }
    
    if (meteosourceData.current?.uv_index !== null && meteosourceData.current?.uv_index !== undefined) {
      processedCurrent.uvIndex = safeOptionalNumber(meteosourceData.current.uv_index);
    }

    const processedHourly = (meteosourceData.hourly?.data || []).map((hour) => {
      const idx = openMeteoData.hourly?.time?.indexOf(hour.date) ?? -1;
      
      const hourData = {
        timestamp: hour.date,
        temperature: safeOptionalNumber(hour.temperature ?? (idx !== -1 ? openMeteoData.hourly.temperature_2m[idx] : null)),
        feelsLike: safeOptionalNumber(hour.temperature_apparent),
        humidity: safeOptionalNumber(hour.humidity ?? (idx !== -1 ? openMeteoData.hourly.relative_humidity_2m[idx] : null)),
        dewPoint: safeOptionalNumber(hour.dew_point ?? (idx !== -1 ? openMeteoData.hourly.dew_point_2m[idx] : null)),
        pressure: safeOptionalNumber(hour.pressure ?? (idx !== -1 ? openMeteoData.hourly.pressure_msl[idx] : null)),
        cloudCover: safeOptionalNumber(hour.cloud_cover ?? (idx !== -1 ? openMeteoData.hourly.cloud_cover[idx] : null)),
        condition: normalizeCondition(hour, hour.summary, hour.icon)
      };

      // Only add wind if we have data
      if (hour.wind || (idx !== -1 && openMeteoData.hourly.wind_speed_10m[idx] !== null)) {
        hourData.wind = hour.wind 
          ? normalizeWind(hour.wind)
          : {
              speed: safeOptionalNumber(idx !== -1 ? openMeteoData.hourly.wind_speed_10m[idx] : null),
              direction: safeOptionalNumber(idx !== -1 ? openMeteoData.hourly.wind_direction_10m[idx] : null)
            };
      }

      // Only add precipitation if we have data
      const precipTotal = hour.precipitation?.total ?? (idx !== -1 ? openMeteoData.hourly.precipitation[idx] : null);
      const precipProb = hour.precipitation_probability ?? (idx !== -1 ? openMeteoData.hourly.precipitation_probability[idx] : null);
      
      if (precipTotal !== null || precipProb !== null) {
        hourData.precipitation = {
          total: safeOptionalNumber(precipTotal),
          probability: safeOptionalNumber(precipProb)
        };
      }

      return hourData;
    });

    const processedDaily = (meteosourceData.daily?.data || []).map(day => {
      const dayData = {
        date: day.day,
        temperature: {
          min: safeOptionalNumber(day.all_day?.temperature_min),
          max: safeOptionalNumber(day.all_day?.temperature_max)
        },
        precipitation: {
          total: safeOptionalNumber(day.all_day?.precipitation?.total),
          probability: safeOptionalNumber(day.precipitation_probability)
        },
        condition: normalizeCondition(day, day.summary, day.icon)
      };

      // Only add humidity if we have actual values
      if (day.all_day?.humidity_min !== null && day.all_day?.humidity_min !== undefined) {
        dayData.humidity = {
          min: safeOptionalNumber(day.all_day.humidity_min),
          max: safeOptionalNumber(day.all_day.humidity_max)
        };
      }

      // Only add sunlight if we have actual values
      if (day.sunrise || day.sunset) {
        dayData.sunlight = {};
        if (day.sunrise) dayData.sunlight.sunrise = safeString(day.sunrise);
        if (day.sunset) dayData.sunlight.sunset = safeString(day.sunset);
      }

      return dayData;
    });

    const derived = {
      temperatureRange: processedDaily.length
        ? Math.max(...processedDaily.map(d => d.temperature.max ?? -Infinity)) -
          Math.min(...processedDaily.map(d => d.temperature.min ?? Infinity))
        : null,
      pressureTrend: calculateTrend(processedHourly.map(h => h.pressure).filter(v => v !== null)),
      humidityTrend: calculateTrend(processedHourly.map(h => h.humidity).filter(v => v !== null)),
      windConsistency: calculateWindConsistency(processedHourly.map(h => h.wind).filter(w => w?.speed !== null)),
      precipitationPattern: analyzePrecipitationPattern(processedHourly.map(h => h.precipitation)),
      weatherStability: calculateWeatherStability(processedHourly),
      seasonalContext: getSeasonalContext(new Date())
    };

    const response = {
      metadata: {
        timestamp: new Date().toISOString(),
        location: { lat: parseFloat(lat), lon: parseFloat(lon) },
        timezone,
        source: 'Meteosource + Open-Meteo (gap-fill)',
        dataPoints: {
          current: Object.keys(processedCurrent).length,
          hourly: processedHourly.length,
          daily: processedDaily.length
        }
      },
      current: processedCurrent,
      hourly: processedHourly,
      daily: processedDaily,
      minutely: meteosourceData.minutely?.data || [],
      alerts: meteosourceData.alerts || [],
      derived,
      raw: process.env.NODE_ENV === 'development' ? { meteosource: meteosourceData, openMeteo: openMeteoData } : undefined
    };

    // Prepare data that exactly matches the schema
    const weatherDataForDB = {
      userId: "k570wqbpgfmgtah21jyn7aa0p97nbt42", // your user id
      location: {
        lat: response.metadata.location.lat,
        lon: response.metadata.location.lon,
        timezone: response.metadata.timezone
      },
      units: "metric",
      current: response.current,
      createdAt: Date.now(),
      source: response.metadata.source
    };

    // Only add optional fields if they have data
    if (response.daily && response.daily.length > 0) {
      weatherDataForDB.daily = { data: response.daily };
    }

    if (response.hourly && response.hourly.length > 0) {
      weatherDataForDB.hourly = response.hourly;
    }

    if (response.minutely && response.minutely.length > 0) {
      weatherDataForDB.minutely = response.minutely;
    }

    if (response.alerts && response.alerts.length > 0) {
      weatherDataForDB.alerts = response.alerts;
    }

    if (response.derived) {
      weatherDataForDB.derived = response.derived;
    }

    await convex.mutation(api.weatherData.upsertWeatherData, weatherDataForDB);

    return NextResponse.json(response);
  } 
  catch (err) {
    console.error('Weather API Error:', err);
    return NextResponse.json({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}

function calculateTrend(values) {
  if (values.length < 2) return null;
  const firstHalf = values.slice(0, Math.floor(values.length / 2));
  const secondHalf = values.slice(Math.floor(values.length / 2));
  const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  return { direction: avg2 > avg1 ? 'increasing' : avg2 < avg1 ? 'decreasing' : 'stable' };
}

function calculateWindConsistency(winds) {
  if (!winds.length) return null;
  const speeds = winds.map(w => w.speed).filter(s => s !== null);
  if (speeds.length === 0) return null;
  return { averageSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length };
}

function analyzePrecipitationPattern(precipData) {
  if (!precipData.length) return null;
  const hoursWithRain = precipData.filter(p => (p.total || 0) > 0).length;
  return { hoursWithRain };
}

function calculateWeatherStability(hourlyData) {
  if (!hourlyData.length) return null;
  const tempChanges = [];
  for (let i = 1; i < hourlyData.length; i++) {
    if (hourlyData[i].temperature != null && hourlyData[i - 1].temperature != null) {
      tempChanges.push(Math.abs(hourlyData[i].temperature - hourlyData[i - 1].temperature));
    }
  }
  if (tempChanges.length === 0) return null;
  const avgTempChange = tempChanges.reduce((a, b) => a + b, 0) / tempChanges.length;
  return { temperatureStability: avgTempChange < 2 ? 'stable' : 'variable' };
}

function getSeasonalContext(date) {
  const month = date.getMonth() + 1;
  if ((month >= 12) || month <= 2) return { season: 'summer' };
  if (month >= 3 && month <= 5) return { season: 'autumn' };
  if (month >= 6 && month <= 8) return { season: 'winter' };
  return { season: 'spring' };
}

function mapConditionToIcon(summary) {
  if (!summary) return 'cloudy';
  const s = summary.toLowerCase();
  if (s.includes('sun') || s.includes('clear')) return 'sunny';
  if (s.includes('rain') || s.includes('shower') || s.includes('storm')) return 'rainy';
  return 'cloudy';
}
