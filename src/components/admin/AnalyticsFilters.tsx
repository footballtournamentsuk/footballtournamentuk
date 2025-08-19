import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Filter, Download, RefreshCw } from 'lucide-react';
import { DateRangePicker } from '@/components/DateRangePicker';

interface AnalyticsFiltersProps {
  onDateRangeChange: (range: { start: Date; end: Date }) => void;
  onCityFilter: (city: string | null) => void;
  onTypeFilter: (type: string | null) => void;
  onRefresh: () => void;
  loading?: boolean;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  onDateRangeChange,
  onCityFilter,
  onTypeFilter,
  onRefresh,
  loading = false
}) => {
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const presetRanges = [
    {
      label: 'Last 7 days',
      start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'Last 30 days',
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'Last 90 days',
      start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      end: new Date()
    },
    {
      label: 'This year',
      start: new Date(new Date().getFullYear(), 0, 1),
      end: new Date()
    }
  ];

  const cities = [
    'London', 'Manchester', 'Birmingham', 'Leeds', 'Liverpool',
    'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Glasgow'
  ];

  const tournamentTypes = [
    'Tournament', 'League', 'Cup', 'Festival', 'Camp', 'Showcase', 'Friendly'
  ];

  const handleDateRangeChange = (newRange: { start: Date; end: Date }) => {
    setDateRange(newRange);
    onDateRangeChange(newRange);
  };

  const handleCityChange = (city: string) => {
    const newCity = city === 'all' ? null : city;
    setSelectedCity(newCity);
    onCityFilter(newCity);
  };

  const handleTypeChange = (type: string) => {
    const newType = type === 'all' ? null : type;
    setSelectedType(newType);
    onTypeFilter(newType);
  };

  const clearFilters = () => {
    setSelectedCity(null);
    setSelectedType(null);
    onCityFilter(null);
    onTypeFilter(null);
  };

  const activeFiltersCount = [selectedCity, selectedType].filter(Boolean).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Analytics Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount} active</Badge>
            )}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 items-end">
          {/* Date Range Picker */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <DateRangePicker
                value={{ from: dateRange.start, to: dateRange.end }}
                onChange={(range) => {
                  if (range?.from && range?.to) {
                    handleDateRangeChange({ start: range.from, end: range.to });
                  }
                }}
              />
            </div>
          </div>

          {/* Quick Date Presets */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Quick Select</label>
            <div className="flex gap-2">
              {presetRanges.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => handleDateRangeChange(preset)}
                  className="text-xs"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">City</label>
            <Select value={selectedCity || 'all'} onValueChange={handleCityChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tournament Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Type</label>
            <Select value={selectedType || 'all'} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {tournamentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground"
            >
              Clear filters
            </Button>
          )}
        </div>

        {/* Applied Filters Summary */}
        {activeFiltersCount > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Applied filters:</span>
              {selectedCity && (
                <Badge variant="outline">City: {selectedCity}</Badge>
              )}
              {selectedType && (
                <Badge variant="outline">Type: {selectedType}</Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};