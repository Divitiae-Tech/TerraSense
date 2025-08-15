'use client';

import React, { useEffect, useState } from 'react';
import { ArrowLeft, Cloud, Droplets, Wind, Gauge, Sun, Moon, Eye, Thermometer, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Calculate date range (today to 7 days ahead)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);

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

  const fetchWeatherData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/weather');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWeatherData(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching weather data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get weather data for selected date
  const getSelectedDateWeather = () => {
    if (!weatherData?.forecast) return null;
    
    const selectedDateStr = selectedDate.toDateString();
    const todayStr = today.toDateString();
    
    // If today is selected, return current weather
    if (selectedDateStr === todayStr) {
      return {
        ...weatherData.current,
        isToday: true,
        date: selectedDate
      };
    }
    
    // Find forecast for selected date
    const daysDifference = Math.ceil((selectedDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const forecastDay = weatherData.forecast[daysDifference];
    
    if (forecastDay) {
      return {
        temp: forecastDay.temp,
        condition: forecastDay.condition,
        humidity: 65, // Default values for forecast
        wind: 12,
        rain: forecastDay.rain || 0,
        isToday: false,
        date: selectedDate
      };
    }
    
    return null;
  };

  const selectedWeather = getSelectedDateWeather();

  if (loading && !weatherData) {
    return <LoadingComponent />;
  }

  if (error) {
    return <ErrorComponent error={error} onRetry={fetchWeatherData} />;
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header with Date Selector */}
      <HeaderComponent 
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        calendarOpen={calendarOpen}
        onCalendarToggle={setCalendarOpen}
        lastUpdated={lastUpdated}
        onRefresh={fetchWeatherData}
        loading={loading}
        today={today}
        maxDate={maxDate}
      />

      {/* Current/Selected Date Weather Overview */}
      <CurrentWeatherCard 
        weather={selectedWeather}
        isToday={selectedWeather?.isToday}
        selectedDate={selectedDate}
      />

      {/* Agriculture Insights for Selected Date */}
      <AgricultureInsightsCard 
        weather={selectedWeather}
        selectedDate={selectedDate}
      />

      {/* Detailed Metrics Grid */}
      <MetricsGrid weather={selectedWeather} />

      {/* 7-Day Forecast */}
      <ForecastCard 
        forecast={weatherData?.forecast}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />
    </div>
  );
};

/**
 * HEADER COMPONENT
 * Handles title, date selection, and refresh functionality
 */
const HeaderComponent = ({ 
  selectedDate, 
  onDateSelect, 
  calendarOpen, 
  onCalendarToggle, 
  lastUpdated, 
  onRefresh, 
  loading,
  today,
  maxDate 
}: any) => {
  const formatSelectedDate = () => {
    const dateStr = selectedDate.toDateString();
    const todayStr = today.toDateString();
    
    if (dateStr === todayStr) return "Today";
    
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    if (dateStr === tomorrow.toDateString()) return "Tomorrow";
    
    return selectedDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Weather Dashboard</h1>
        <p className="text-gray-600 mt-1">Johannesburg, South Africa - Agricultural Conditions</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Date Selector */}
        <Popover open={calendarOpen} onOpenChange={onCalendarToggle}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatSelectedDate()}
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  onDateSelect(date);
                  onCalendarToggle(false);
                }
              }}
              disabled={(date) => date < today || date > maxDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {/* Last Updated and Refresh */}
        <div className="text-right">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            Last updated: {lastUpdated?.toLocaleTimeString()}
          </div>
          <Button 
            onClick={onRefresh}
            variant="outline"
            size="sm"
            className="mt-2"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Refresh'}
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * CURRENT WEATHER CARD COMPONENT
 * Displays current or selected date weather overview
 */
const CurrentWeatherCard = ({ weather, isToday, selectedDate }: any) => {
  const getWeatherIcon = (condition:any) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'cloudy':
      case 'partly cloudy':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy':
      case 'stormy':
        return <CloudRain className="w-8 h-8 text-blue-500" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-500" />;
    }
  };

  if (!weather) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-20 w-32 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-red-600 font-medium">Weather data unavailable</p>
            <p className="text-gray-500 text-sm mt-1">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Weather Overview</h1>
            <p className="text-gray-600">Detailed forecast and insights</p>
          </div>
        </div>

        {/* Current Conditions */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Main Temperature */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <WeatherIcon condition={data.current.condition.summary} size={48} />
                  <div>
                    <div className="text-6xl font-bold">{Math.round(data.current.temperature)}°C</div>
                    <p className="text-blue-100 text-lg">{data.current.condition.summary}</p>
                    {data.current.feelsLike && (
                      <p className="text-blue-200 text-sm">Feels like {Math.round(data.current.feelsLike)}°C</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Weather Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Droplets size={20} className="text-blue-200" />
                    <span className="text-sm text-blue-100">Humidity</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">{data.current.humidity}%</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Wind size={20} className="text-blue-200" />
                    <span className="text-sm text-blue-100">Wind</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">{data.current.wind.speed} km/h</p>
                  {data.current.wind.dir && <p className="text-xs text-blue-200">{data.current.wind.dir}</p>}
                </div>

                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Gauge size={20} className="text-blue-200" />
                    <span className="text-sm text-blue-100">Pressure</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">{data.current.pressure}</p>
                  <p className="text-xs text-blue-200">hPa</p>
                </div>

                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Cloud size={20} className="text-blue-200" />
                    <span className="text-sm text-blue-100">Cloud Cover</span>
                  </div>
                  <p className="text-2xl font-semibold mt-1">{data.current.cloudCover}%</p>
                </div>
              </div>
            </div>

            {/* Sunrise/Sunset */}
            {(data.current.sunlight.sunrise || data.current.sunlight.sunset) && (
              <div className="mt-6 pt-6 border-t border-white/20">
                <div className="flex justify-center gap-8">
                  {data.current.sunlight.sunrise && (
                    <div className="flex items-center gap-2 text-yellow-200">
                      <Sun size={18} />
                      <span className="text-sm">Sunrise: {formatTime(data.current.sunlight.sunrise)}</span>
                    </div>
                  )}
                  {data.current.sunlight.sunset && (
                    <div className="flex items-center gap-2 text-orange-200">
                      <Moon size={18} />
                      <span className="text-sm">Sunset: {formatTime(data.current.sunlight.sunset)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Hourly Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={20} />
              Next 24 Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {data.hourly.slice(0, 24).map((hour, i) => (
                <div key={i} className="min-w-[100px] bg-gray-50 rounded-lg p-4 text-center border hover:shadow-md transition-shadow">
                  <p className="text-xs text-gray-500 font-medium">{formatTime(hour.timestamp)}</p>
                  <div className="my-3 flex justify-center">
                    <WeatherIcon condition={hour.condition.summary} size={24} />
                  </div>
                  <p className="text-xl font-bold text-gray-900">{Math.round(hour.temperature)}°</p>
                  <p className="text-xs text-gray-600 mt-1">{hour.condition.summary}</p>
                  {hour.precipitation.probability && (
                    <Badge variant="secondary" className="mt-2 text-xs bg-blue-100 text-blue-700">
                      {hour.precipitation.probability}%
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Daily Forecast */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              7-Day Forecast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.daily.map((day, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <span className="font-medium text-gray-900 min-w-[100px]">{formatDate(day.date)}</span>
                    <div className="flex items-center gap-2">
                      <WeatherIcon condition={day.condition.summary} size={20} />
                      <span className="text-gray-700">{day.condition.summary}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-right">
                    <div className="font-semibold">
                      <span className="text-gray-600">{Math.round(day.temperature.min)}°</span>
                      <span className="mx-1 text-gray-400">/</span>
                      <span className="text-gray-900">{Math.round(day.temperature.max)}°</span>
                    </div>
                    <div className="text-blue-600 min-w-[60px]">
                      <div className="flex items-center gap-1">
                        <Droplets size={14} />
                        <span className="text-sm">{day.precipitation.total ?? 0}mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Farmer Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer size={20} />
              Agricultural Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Temperature Range</span>
                  <Thermometer size={16} className="text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">{data.derived.temperatureRange}°C</p>
                <p className="text-xs text-gray-500">This week</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Pressure Trend</span>
                  <div className="flex items-center gap-1">
                    <Gauge size={16} className="text-blue-500" />
                    <TrendIcon direction={data.derived.pressureTrend?.direction} />
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                  {data.derived.pressureTrend?.direction || 'Stable'}
                </p>
              </div>

              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Humidity Trend</span>
                  <div className="flex items-center gap-1">
                    <Droplets size={16} className="text-cyan-500" />
                    <TrendIcon direction={data.derived.humidityTrend?.direction} />
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                  {data.derived.humidityTrend?.direction || 'Stable'}
                </p>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Average Wind</span>
                  <Wind size={16} className="text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {data.derived.windConsistency?.averageSpeed.toFixed(1) || '0'} km/h
                </p>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Stability</span>
                  <Eye size={16} className="text-purple-500" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                  {data.derived.weatherStability?.temperatureStability || 'Unknown'}
                </p>
              </div>

              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Season</span>
                  <Calendar size={16} className="text-yellow-500" />
                </div>
                <p className="text-lg font-semibold text-gray-900 mt-1 capitalize">
                  {data.derived.seasonalContext?.season || 'Unknown'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}