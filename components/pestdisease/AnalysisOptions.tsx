'use client';

import { MapPin, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

// Common countries for farming
const countries = [
  { code: 'US', name: 'United States', coords: { lat: 39.8283, lng: -98.5795 } },
  { code: 'CA', name: 'Canada', coords: { lat: 56.1304, lng: -106.3468 } },
  { code: 'MX', name: 'Mexico', coords: { lat: 23.6345, lng: -102.5528 } },
  { code: 'BR', name: 'Brazil', coords: { lat: -14.2350, lng: -51.9253 } },
  { code: 'AR', name: 'Argentina', coords: { lat: -38.4161, lng: -63.6167 } },
  { code: 'AU', name: 'Australia', coords: { lat: -25.2744, lng: 133.7751 } },
  { code: 'IN', name: 'India', coords: { lat: 20.5937, lng: 78.9629 } },
  { code: 'CN', name: 'China', coords: { lat: 35.8617, lng: 104.1954 } },
  { code: 'RU', name: 'Russia', coords: { lat: 61.5240, lng: 105.3188 } },
  { code: 'DE', name: 'Germany', coords: { lat: 51.1657, lng: 10.4515 } },
  { code: 'FR', name: 'France', coords: { lat: 46.2276, lng: 2.2137 } },
  { code: 'UK', name: 'United Kingdom', coords: { lat: 55.3781, lng: -3.4360 } },
  { code: 'IT', name: 'Italy', coords: { lat: 41.8719, lng: 12.5674 } },
  { code: 'ES', name: 'Spain', coords: { lat: 40.4637, lng: -3.7492 } },
  { code: 'ZA', name: 'South Africa', coords: { lat: -30.5595, lng: 22.9375 } },
  { code: 'KE', name: 'Kenya', coords: { lat: -0.0236, lng: 37.9062 } },
  { code: 'NG', name: 'Nigeria', coords: { lat: 9.0820, lng: 8.6753 } },
  { code: 'EG', name: 'Egypt', coords: { lat: 26.0975, lng: 31.2357 } },
  { code: 'JP', name: 'Japan', coords: { lat: 36.2048, lng: 138.2529 } },
  { code: 'KR', name: 'South Korea', coords: { lat: 35.9078, lng: 127.7669 } },
  { code: 'TH', name: 'Thailand', coords: { lat: 15.8700, lng: 100.9925 } },
  { code: 'VN', name: 'Vietnam', coords: { lat: 14.0583, lng: 108.2772 } },
  { code: 'ID', name: 'Indonesia', coords: { lat: -0.7893, lng: 113.9213 } },
  { code: 'PH', name: 'Philippines', coords: { lat: 12.8797, lng: 121.7740 } },
  { code: 'MY', name: 'Malaysia', coords: { lat: 4.2105, lng: 101.9758 } }
];

interface AnalysisOptionsProps {
  selectedCountry: string;
  datetime: string;
  similarImages: boolean;
  onCountryChange: (countryCode: string) => void;
  onDatetimeChange: (value: string) => void;
  onSimilarImagesChange: (checked: boolean) => void;
  loading: boolean;
}

export default function AnalysisOptions({
  selectedCountry,
  datetime,
  similarImages,
  onCountryChange,
  onDatetimeChange,
  onSimilarImagesChange,
  loading,
}: AnalysisOptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location & Options
        </CardTitle>
        <CardDescription>
          Help us provide region-specific pest and disease information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6">
        <div>
          <Label htmlFor="country" className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" />
            Your Country
          </Label>
          <Select 
            value={selectedCountry} 
            onValueChange={onCountryChange}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            This helps identify region-specific pests and diseases
          </p>
        </div>

        <div>
          <Label htmlFor="datetime" className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4" />
            When was this photo taken?
          </Label>
          <Input
            id="datetime"
            type="datetime-local"
            value={datetime}
            onChange={(e) => onDatetimeChange(e.target.value)}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            Season information helps with accurate identification
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="similar-images"
            checked={similarImages}
            onCheckedChange={(checked) => onSimilarImagesChange(checked as boolean)}
            disabled={loading}
          />
          <Label htmlFor="similar-images" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Show reference images for comparison
          </Label>
        </div>
      </CardContent>
    </Card>
  );
}