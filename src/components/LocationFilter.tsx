import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { PostcodeAutocomplete } from '@/components/ui/postcode-autocomplete';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LocationFilterProps {
  postcode?: string;
  radius?: number;
  onPostcodeChange: (postcode: string) => void;
  onRadiusChange: (radius: number) => void;
  onLocationSelect?: (location: { postcode: string; coordinates: [number, number] }) => void;
  onClear: () => void;
}

export function LocationFilter({
  postcode = '',
  radius = 10,
  onPostcodeChange,
  onRadiusChange,
  onLocationSelect,
  onClear
}: LocationFilterProps) {
  const handleAddressSelect = (suggestion: any) => {
    onLocationSelect?.({
      postcode: suggestion.postcode,
      coordinates: suggestion.center
    });
  };

  const handleRadiusChange = (values: number[]) => {
    onRadiusChange(values[0]);
  };

  const radiusOptions = [
    { value: 5, label: '5 miles' },
    { value: 10, label: '10 miles' },
    { value: 25, label: '25 miles' },
    { value: 50, label: '50 miles' },
    { value: 100, label: '100 miles' }
  ];

  return (
    <div className="space-y-4">
      {/* Location Input */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-football-green/10 rounded-md">
            <MapPin className="w-4 h-4 text-football-green" />
          </div>
          <div>
            <label className="text-sm font-semibold text-foreground">Location</label>
            <p className="text-xs text-muted-foreground">Enter postcode to search nearby</p>
          </div>
        </div>
        
        <PostcodeAutocomplete
          value={postcode}
          onChange={onPostcodeChange}
          onAddressSelect={handleAddressSelect}
          placeholder="Enter postcode (e.g., SW1A 1AA)"
          className="w-full"
        />
      </div>

      {/* Radius Selector */}
      {postcode && (
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Search Radius</span>
            </div>
            <Badge variant="outline" className="text-xs">
              {radius} miles
            </Badge>
          </div>
          
          {/* Quick radius buttons */}
          <div className="flex flex-wrap gap-2">
            {radiusOptions.map(option => (
              <Button
                key={option.value}
                variant={radius === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => onRadiusChange(option.value)}
                className="text-xs font-medium"
              >
                {option.label}
              </Button>
            ))}
          </div>
          
          {/* Radius slider */}
          <div className="space-y-2">
            <Slider
              value={[radius]}
              onValueChange={handleRadiusChange}
              max={100}
              min={1}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 mile</span>
              <span>100 miles</span>
            </div>
          </div>

          {/* Clear location */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="w-full text-xs text-muted-foreground hover:text-foreground"
          >
            Clear Location Filter
          </Button>
        </div>
      )}
    </div>
  );
}