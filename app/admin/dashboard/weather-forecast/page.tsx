'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface WeatherResponse {
  current: {
    temperature: number;
    feelsLike: number | null;
    humidity: number;
    pressure: number;
    cloudCover: number;
    wind: { speed: number; dir?: string };
    precipitation: { total: number; probability?: number };
    condition: { summary: string; icon: string };
    sunlight: { sunrise?: string; sunset?: string };
  };
  hourly: {
    timestamp: string;
    temperature: number;
    precipitation: { total: number; probability?: number };
    cloudCover: number;
    condition: { summary: string; icon: string };
  }[];
  daily: {
    date: string;
    temperature: { min: number; max: number };
    precipitation: { total: number; probability?: number };
    condition: { summary: string; icon: string };
  }[];
  derived: {
    temperatureRange: number;
    pressureTrend: { direction: string } | null;
    humidityTrend: { direction: string } | null;
    windConsistency: { averageSpeed: number } | null;
    weatherStability: { temperatureStability: string } | null;
    seasonalContext: { season: string } | null;
  };
}

export default function WeatherPage() {
  const [data, setData] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/weather');
        if (!res.ok) throw new Error('Failed to fetch weather data');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchWeather();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading weather...</div>;
  }

  if (error || !data) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  }

  const formatTime = (ts: string) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <div className="p-6 flex flex-col gap-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center text-green-600 hover:underline">
          <ArrowLeft className="w-5 h-5 mr-1" /> Back to Dashboard
        </Link>
        <h1 className="text-2xl font-semibold">Detailed Weather</h1>
      </div>

      {/* Current Conditions */}
      <div className="bg-white rounded-lg shadow p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-5xl font-bold">{Math.round(data.current.temperature)}°C</h2>
          <p className="text-gray-500">{data.current.condition.summary}</p>
          {data.current.feelsLike && (
            <p className="text-gray-400 text-sm">Feels like {Math.round(data.current.feelsLike)}°C</p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
          <p>💧 Humidity: {data.current.humidity}%</p>
          <p>🌬 Wind: {data.current.wind.speed} km/h {data.current.wind.dir || ''}</p>
          <p>📉 Pressure: {data.current.pressure} hPa</p>
          <p>☁ Cloud Cover: {data.current.cloudCover}%</p>
          {data.current.sunlight.sunrise && <p>🌅 Sunrise: {formatTime(data.current.sunlight.sunrise)}</p>}
          {data.current.sunlight.sunset && <p>🌇 Sunset: {formatTime(data.current.sunlight.sunset)}</p>}
        </div>
      </div>

      {/* Hourly Forecast */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Next 24 Hours</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {data.hourly.slice(0, 24).map((h, i) => (
            <div key={i} className="min-w-[80px] bg-white rounded-lg shadow p-3 text-center">
              <p className="text-xs text-gray-500">{formatTime(h.timestamp)}</p>
              <p className="text-lg font-bold">{Math.round(h.temperature)}°</p>
              <p className="text-xs text-gray-400">{h.condition.summary}</p>
              {h.precipitation.probability && (
                <p className="text-blue-500 text-xs">{h.precipitation.probability}% rain</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Daily Forecast */}
      <div>
        <h2 className="text-lg font-semibold mb-3">7-Day Forecast</h2>
        <div className="bg-white rounded-lg shadow divide-y">
          {data.daily.map((d, i) => (
            <div key={i} className="flex justify-between items-center p-3 text-sm">
              <span>{formatDate(d.date)}</span>
              <span>{d.condition.summary}</span>
              <span>{Math.round(d.temperature.min)}° / {Math.round(d.temperature.max)}°</span>
              <span className="text-blue-500">{d.precipitation.total ?? 0}mm</span>
            </div>
          ))}
        </div>
      </div>

      {/* Farmer Insights */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Farmer Insights</h2>
        <div className="bg-white rounded-lg shadow p-4 text-sm text-gray-600 grid grid-cols-2 gap-4">
          <p>🌡 Temp Range (week): {data.derived.temperatureRange}°C</p>
          <p>📉 Pressure Trend: {data.derived.pressureTrend?.direction || 'n/a'}</p>
          <p>💧 Humidity Trend: {data.derived.humidityTrend?.direction || 'n/a'}</p>
          <p>🌬 Avg Wind: {data.derived.windConsistency?.averageSpeed.toFixed(1)} km/h</p>
          <p>🔍 Stability: {data.derived.weatherStability?.temperatureStability}</p>
          <p>🗓 Season: {data.derived.seasonalContext?.season}</p>
        </div>
      </div>
    </div>
  );
}
