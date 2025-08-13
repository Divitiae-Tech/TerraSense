// app/api/weather/route.js
import { NextResponse } from 'next/server';

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

    const processedCurrent = {
      timestamp: meteosourceData.current?.date || new Date().toISOString(),
      temperature: meteosourceData.current?.temperature ?? openMeteoData.current?.temperature_2m ?? null,
      feelsLike: meteosourceData.current?.temperature_apparent ?? null,
      humidity: meteosourceData.current?.humidity ?? openMeteoData.current?.relative_humidity_2m ?? null,
      dewPoint: meteosourceData.current?.dew_point ?? openMeteoData.hourly?.dew_point_2m?.[0] ?? null,
      pressure: meteosourceData.current?.pressure ?? openMeteoData.hourly?.pressure_msl?.[0] ?? null,
      cloudCover: meteosourceData.current?.cloud_cover ?? openMeteoData.hourly?.cloud_cover?.[0] ?? null,
      uvIndex: meteosourceData.current?.uv_index ?? null,
      wind: meteosourceData.current?.wind || {
        speed: openMeteoData.hourly?.wind_speed_10m?.[0] ?? null,
        direction: openMeteoData.hourly?.wind_direction_10m?.[0] ?? null
      },
      precipitation: meteosourceData.current?.precipitation || {
        total: openMeteoData.hourly?.precipitation?.[0] ?? null
      },
      condition: {
        summary: meteosourceData.current?.summary ?? null,
        icon: mapConditionToIcon(meteosourceData.current?.summary),
        code: meteosourceData.current?.icon ?? null
      },
      sunlight: {
        sunrise: meteosourceData.current?.sunrise ?? null,
        sunset: meteosourceData.current?.sunset ?? null
      }
    };

    const processedHourly = (meteosourceData.hourly?.data || []).map((hour) => {
      const idx = openMeteoData.hourly?.time?.indexOf(hour.date) ?? -1;
      return {
        timestamp: hour.date,
        temperature: hour.temperature ?? (idx !== -1 ? openMeteoData.hourly.temperature_2m[idx] : null),
        feelsLike: hour.temperature_apparent ?? null,
        humidity: hour.humidity ?? (idx !== -1 ? openMeteoData.hourly.relative_humidity_2m[idx] : null),
        dewPoint: hour.dew_point ?? (idx !== -1 ? openMeteoData.hourly.dew_point_2m[idx] : null),
        pressure: hour.pressure ?? (idx !== -1 ? openMeteoData.hourly.pressure_msl[idx] : null),
        cloudCover: hour.cloud_cover ?? (idx !== -1 ? openMeteoData.hourly.cloud_cover[idx] : null),
        wind: hour.wind || {
          speed: idx !== -1 ? openMeteoData.hourly.wind_speed_10m[idx] : null,
          direction: idx !== -1 ? openMeteoData.hourly.wind_direction_10m[idx] : null
        },
        precipitation: {
          total: hour.precipitation?.total ?? (idx !== -1 ? openMeteoData.hourly.precipitation[idx] : null),
          probability: hour.precipitation_probability ?? (idx !== -1 ? openMeteoData.hourly.precipitation_probability[idx] : null)
        },
        condition: {
          summary: hour.summary ?? null,
          icon: mapConditionToIcon(hour.summary),
          code: hour.icon ?? null
        }
      };
    });

    const processedDaily = (meteosourceData.daily?.data || []).map(day => ({
      date: day.day,
      temperature: {
        min: day.all_day?.temperature_min ?? null,
        max: day.all_day?.temperature_max ?? null
      },
      humidity: {
        min: day.all_day?.humidity_min ?? null,
        max: day.all_day?.humidity_max ?? null
      },
      precipitation: {
        total: day.all_day?.precipitation?.total ?? null,
        probability: day.precipitation_probability ?? null
      },
      condition: {
        summary: day.summary ?? null,
        icon: mapConditionToIcon(day.summary),
        code: day.icon ?? null
      },
      sunlight: {
        sunrise: day.sunrise ?? null,
        sunset: day.sunset ?? null
      }
    }));

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

    return NextResponse.json(response);
  } catch (err) {
    return NextResponse.json({
      error: 'Internal server error',
      details: err instanceof Error ? err.message : String(err)
    }, { status: 500 });
  }
}

function calculateTrend(values) {
  if (values.length < 2) return null;
  const firstHalf = values.slice(0, values.length / 2);
  const secondHalf = values.slice(values.length / 2);
  const avg1 = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avg2 = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  return { direction: avg2 > avg1 ? 'increasing' : avg2 < avg1 ? 'decreasing' : 'stable' };
}

function calculateWindConsistency(winds) {
  if (!winds.length) return null;
  const speeds = winds.map(w => w.speed).filter(s => s !== null);
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
