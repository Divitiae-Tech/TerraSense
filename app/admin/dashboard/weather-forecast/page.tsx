"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Wind, 
  Eye, 
  Gauge,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sprout,
  Wheat,
  Clock,
  ChevronDown
} from 'lucide-react';

/**
 * AGRICULTURE WEATHER DASHBOARD - MODULAR VERSION
 * 
 * DATABASE INTEGRATION NOTES:
 * - Weather data should be stored in 'weather_readings' table with timestamps
 * - Include fields: temperature, humidity, wind_speed, precipitation, uv_index, pressure
 * - Store forecast data in 'weather_forecasts' table for historical accuracy tracking
 * - Add date indexing for efficient date-specific queries
 * 
 * AI INTEGRATION NOTES:
 * - This weather data feeds into AI crop advisory system
 * - Date-specific weather enables targeted crop planning recommendations
 * - Historical comparison improves AI prediction accuracy
 * - Weather patterns over time inform seasonal crop strategies
 */

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Calculate date range (today to 7 days ahead)
  const today = new Date();
  const maxDate = new Date();
  maxDate.setDate(today.getDate() + 7);

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 30 * 60 * 1000);
    return () => clearInterval(interval);
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
      setError(err.message);
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
    const daysDifference = Math.ceil((selectedDate - today) / (1000 * 60 * 60 * 24));
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
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No weather data available for selected date</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="flex items-center gap-3">
            {getWeatherIcon(weather.condition)}
            <div>
              <span className="text-4xl font-bold">{weather.temp}°C</span>
              <p className="text-lg text-gray-700 capitalize">{weather.condition}</p>
            </div>
          </CardTitle>
          <Badge variant={isToday ? "default" : "secondary"}>
            {isToday ? "Live Data" : "Forecast"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Humidity</p>
              <p className="font-semibold">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Wind className="w-5 h-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Wind Speed</p>
              <p className="font-semibold">{weather.wind} km/h</p>
            </div>
          </div>
          {weather.rain > 0 && (
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-gray-600">Precipitation</p>
                <p className="font-semibold">{weather.rain}mm</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * AGRICULTURE INSIGHTS CARD COMPONENT
 * AI-powered recommendations based on weather conditions
 */
const AgricultureInsightsCard = ({ weather, selectedDate }: any) => {
  const getAgricultureInsights = (weather: any) => {
    if (!weather) return [];
    
    const insights = [];
    const isToday = selectedDate.toDateString() === new Date().toDateString();
    const actionPrefix = isToday ? "Consider" : "Plan to";
    
    if (weather.temp > 30) {
      insights.push({
        type: 'warning',
        message: `${actionPrefix} increase irrigation and provide crop shading`,
        icon: <AlertTriangle className="w-4 h-4" />
      });
    }
    
    if (weather.humidity > 80) {
      insights.push({
        type: 'info',
        message: `${actionPrefix} monitor for fungal diseases`,
        icon: <Droplets className="w-4 h-4" />
      });
    }
    
    if (weather.wind > 15) {
      insights.push({
        type: 'warning',
        message: `${actionPrefix} avoid pesticide application`,
        icon: <Wind className="w-4 h-4" />
      });
    }

    if (weather.rain > 10) {
      insights.push({
        type: 'info',
        message: `${actionPrefix} delay irrigation - natural rainfall expected`,
        icon: <CloudRain className="w-4 h-4" />
      });
    }

    if (weather.temp >= 18 && weather.temp <= 25 && weather.humidity >= 40 && weather.humidity <= 70) {
      insights.push({
        type: 'success',
        message: `Optimal growing conditions ${isToday ? 'detected' : 'forecasted'}`,
        icon: <Sprout className="w-4 h-4" />
      });
    }

    return insights;
  };

  const insights = getAgricultureInsights(weather);

  if (insights.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wheat className="w-5 h-5 text-green-600" />
          Agricultural Insights
        </CardTitle>
        <CardDescription>
          AI-powered recommendations for {selectedDate.toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <Alert 
              key={index} 
              variant={insight.type === 'warning' ? 'destructive' : 'default'}
              className={
                insight.type === 'success' ? 'border-green-200 bg-green-50' : 
                insight.type === 'info' ? 'border-blue-200 bg-blue-50' : ''
              }
            >
              {insight.icon}
              <AlertDescription>{insight.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * METRICS GRID COMPONENT
 * Displays individual weather metrics in a grid layout
 */
const MetricsGrid = ({ weather }: any) => {
  if (!weather) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="opacity-50">
            <CardContent className="p-4">
              <div className="text-center text-gray-400">No data</div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Temperature"
        value={`${weather.temp}°C`}
        description="Air temperature"
        icon={<Thermometer className="w-5 h-5 text-red-500" />}
        trend="stable"
      />
      <MetricCard
        title="Humidity"
        value={`${weather.humidity}%`}
        description="Relative humidity"
        icon={<Droplets className="w-5 h-5 text-blue-500" />}
        trend="stable"
      />
      <MetricCard
        title="Wind Speed"
        value={`${weather.wind} km/h`}
        description="Wind velocity"
        icon={<Wind className="w-5 h-5 text-gray-500" />}
        trend="stable"
      />
      <MetricCard
        title="Precipitation"
        value={`${weather.rain || 0}mm`}
        description="Expected rainfall"
        icon={<CloudRain className="w-5 h-5 text-blue-500" />}
        trend="stable"
      />
    </div>
  );
};

/**
 * INDIVIDUAL METRIC CARD COMPONENT
 * DATABASE: Store historical values for trend calculation
 * AI: Uses these metrics for crop-specific recommendations
 */
const MetricCard = ({ title, value, description, icon, trend }: any) => {
  const trendIcon = trend === 'rising' ? 
    <TrendingUp className="w-4 h-4 text-green-500" /> : 
    trend === 'falling' ? 
    <TrendingDown className="w-4 h-4 text-red-500" /> : 
    null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          {icon}
          {trendIcon}
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * FORECAST CARD COMPONENT
 * Displays 7-day forecast with date selection
 */
const ForecastCard = ({ forecast, selectedDate, onDateSelect }: any) => {
  const today = new Date();
  
  if (!forecast) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>7-Day Forecast</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Forecast data not available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
          7-Day Agricultural Forecast
        </CardTitle>
        <CardDescription>
          Click on any day to view detailed weather information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {forecast.map((day:any, index:any) => {
            const dayDate = new Date(today);
            dayDate.setDate(today.getDate() + index);
            const isSelected = dayDate.toDateString() === selectedDate.toDateString();
            
            return (
              <ForecastDayCard 
                key={index} 
                forecast={day} 
                date={dayDate}
                isSelected={isSelected}
                onClick={() => onDateSelect(dayDate)}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

/**
 * INDIVIDUAL FORECAST DAY COMPONENT
 */
const ForecastDayCard = ({ forecast, date, isSelected, onClick }: any) => {
  const getWeatherIcon = (condition: any) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-6 h-6 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="w-6 h-6 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="w-6 h-6 text-blue-500" />;
      default:
        return <Cloud className="w-6 h-6 text-gray-500" />;
    }
  };

  return (
    <div 
      className={`text-center p-3 border rounded-lg cursor-pointer transition-all ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'bg-white hover:bg-gray-50 hover:border-gray-300'
      }`}
      onClick={onClick}
    >
      <p className="text-sm font-medium text-gray-700 mb-2">{forecast.day}</p>
      <div className="flex justify-center mb-2">
        {getWeatherIcon(forecast.condition)}
      </div>
      <p className="text-lg font-bold">{forecast.temp}°C</p>
      {forecast.rain > 0 && (
        <div className="flex items-center justify-center gap-1 mt-1">
          <Droplets className="w-3 h-3 text-blue-400" />
          <span className="text-xs text-blue-600">{forecast.rain}mm</span>
        </div>
      )}
    </div>
  );
};

/**
 * LOADING COMPONENT
 */
const LoadingComponent = () => (
  <div className="p-6 space-y-6">
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  </div>
);

/**
 * ERROR COMPONENT
 */
const ErrorComponent = ({ error, onRetry }: any) => (
  <div className="p-6">
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex justify-between items-center">
        <span>Failed to load weather data: {error}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  </div>
);

export default WeatherDashboard;