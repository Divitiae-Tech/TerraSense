'use client';

import React from 'react';
import { Cloud, Sun, CloudRain, Wind, Droplets } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface WeatherDay {
  day: string;
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  rain: number;
}

interface CurrentWeather {
  temp: number;
  condition: string;
  humidity: number;
  wind: number;
}

interface WeatherData {
  current: CurrentWeather;
  forecast: WeatherDay[];
}

interface WeatherWidgetProps {
  weather: WeatherData;
}

export const WeatherWidget = ({ weather }: WeatherWidgetProps) => {
  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="h-5 w-5 text-yellow-500" />;
      case 'cloudy':
        return <Cloud className="h-5 w-5 text-gray-500" />;
      case 'rainy':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
      default:
        return <Sun className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'sunny':
        return 'text-yellow-600 bg-yellow-50';
      case 'cloudy':
        return 'text-gray-600 bg-gray-50';
      case 'rainy':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          {getWeatherIcon(weather.current.condition)}
          <span>Weather Forecast</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {/* Current Weather */}
        <div className="mb-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-green-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Current</span>
            <Badge className={getConditionColor(weather.current.condition)}>
              {weather.current.condition}
            </Badge>
          </div>
          <div className="text-3xl font-bold mb-2">{weather.current.temp}°C</div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Droplets className="h-4 w-4" />
              <span>{weather.current.humidity}% Humidity</span>
            </div>
            <div className="flex items-center space-x-1">
              <Wind className="h-4 w-4" />
              <span>{weather.current.wind} km/h</span>
            </div>
          </div>
        </div>

        {/* Forecast */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            7-Day Forecast
          </h4>
          {weather.forecast.map((day, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                {getWeatherIcon(day.condition)}
                <span className="font-medium">{day.day}</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <span className="text-sm text-muted-foreground">
                  {day.rain}mm
                </span>
                <span className="font-semibold">{day.temp}°C</span>
              </div>
            </div>
          ))}
        </div>

        {/* Farming Alert */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-800">
            <strong>Farming Alert:</strong> Rain expected tomorrow. Consider adjusting irrigation schedule.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};