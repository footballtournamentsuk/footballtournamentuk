import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TournamentFilters as Filters, AgeGroup, TeamType } from '@/types/tournament';
import { ukLeagues } from '@/data/mockTournaments';
import { Filter, X, Target, Users, Trophy, Calendar, Search, MapPin, CalendarDays } from 'lucide-react';
import { SearchBar } from '@/components/SearchBar';
import { LocationFilter } from '@/components/LocationFilter';
import { DateRangePicker } from '@/components/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { Slider } from '@/components/ui/slider';
import { useTournamentTypes } from '@/hooks/useTournamentTypes';
interface TournamentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}
const matchFormats = ['3v3', '5v5', '7v7', '9v9', '11v11'];
const ageGroups: AgeGroup[] = ['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21'];
const teamTypes: TeamType[] = ['boys', 'girls', 'mixed'];
const regions = ['London', 'Kent', 'Surrey', 'Manchester', 'Birmingham', 'Liverpool', 'Yorkshire'];
const TournamentFilters: React.FC<TournamentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const { tournamentTypes, loading: typesLoading } = useTournamentTypes();
  
  // Sample search suggestions - in real app, these would come from API
  const searchSuggestions = [
    { id: '1', text: 'Manchester United Academy', type: 'tournament' as const },
    { id: '2', text: 'London Youth League', type: 'league' as const },
    { id: '3', text: 'Birmingham', type: 'location' as const },
    { id: '4', text: 'Liverpool Summer Camp', type: 'tournament' as const },
    { id: '5', text: 'Kent County League', type: 'league' as const },
  ];

  const handleArrayFilterChange = (key: keyof Filters, value: string) => {
    const currentArray = filters[key] as string[] || [];
    const newArray = currentArray.includes(value) ? currentArray.filter(item => item !== value) : [...currentArray, value];
    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined
    });
  };

  const handleLocationChange = (postcode: string) => {
    onFiltersChange({
      ...filters,
      location: {
        ...filters.location,
        postcode: postcode || undefined
      }
    });
  };

  const handleRadiusChange = (radius: number) => {
    onFiltersChange({
      ...filters,
      location: {
        ...filters.location,
        radius
      }
    });
  };

  const handleLocationSelect = (location: { postcode: string; coordinates: [number, number] }) => {
    onFiltersChange({
      ...filters,
      location: {
        postcode: location.postcode,
        coordinates: location.coordinates,
        radius: filters.location?.radius || 10
      }
    });
  };

  const handleLocationClear = () => {
    onFiltersChange({
      ...filters,
      location: undefined
    });
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: range ? {
        start: range.from,
        end: range.to
      } : undefined
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    const [min, max] = values;
    onFiltersChange({
      ...filters,
      priceRange: {
        min: min,
        max: max,
        includeFree: min === 0, // Include free tournaments if slider starts at 0
      },
    });
  };
  const removeFilter = (key: keyof Filters, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      const currentArray = filters[key] as string[] || [];
      const newArray = currentArray.filter(item => item !== value);
      onFiltersChange({
        ...filters,
        [key]: newArray.length > 0 ? newArray : undefined
      });
    } else {
      onFiltersChange({
        ...filters,
        [key]: undefined
      });
    }
  };
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.location?.postcode) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) count++;
    
    // Count array filters
    Object.values(filters).forEach(value => {
      if (Array.isArray(value) && value.length > 0) count++;
    });
    
    return count;
  };
  const hasActiveFilters = getActiveFiltersCount() > 0;
  return <Card className="w-full bg-gradient-to-br from-background to-surface/50 border-2 border-border/50 shadow-lg">
      <CardContent className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Filters</h3>
              <p className="text-xs text-muted-foreground">Refine your search</p>
            </div>
            {hasActiveFilters && <Badge variant="default" className="ml-2 bg-football-primary hover:bg-football-primary/90">
                {getActiveFiltersCount()} active
              </Badge>}
          </div>
          {hasActiveFilters && <Button variant="ghost" size="sm" onClick={onClearFilters} className="text-sm hover:bg-destructive/10 hover:text-destructive transition-all duration-200">
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>}
        </div>

        {/* Search Bar */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-md">
              <Search className="w-4 h-4 text-primary" />
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Search</label>
              <p className="text-xs text-muted-foreground">Find tournaments, leagues, or locations</p>
            </div>
          </div>
          <SearchBar
            value={filters.search || ''}
            onChange={handleSearchChange}
            suggestions={searchSuggestions}
            placeholder="Search tournaments, locations, leagues..."
          />
        </div>

        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

        {/* Location & Date Filters */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Location Filter */}
          <LocationFilter
            postcode={filters.location?.postcode || ''}
            radius={filters.location?.radius || 10}
            onPostcodeChange={handleLocationChange}
            onRadiusChange={handleRadiusChange}
            onLocationSelect={handleLocationSelect}
            onClear={handleLocationClear}
          />

          {/* Date Range Filter */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-accent/10 rounded-md">
                <CalendarDays className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Date Range</label>
                <p className="text-xs text-muted-foreground">Filter by tournament dates</p>
              </div>
            </div>
            <DateRangePicker
              value={{
                from: filters.dateRange?.start,
                to: filters.dateRange?.end
              }}
              onChange={handleDateRangeChange}
              placeholder="Pick dates"
              className="min-w-0"
            />
          </div>
        </div>

        {/* Price Range Filter */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-green-500/10 rounded-md">
              <Badge variant="outline" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs border-green-500/20 text-green-600">
                £
              </Badge>
            </div>
            <div>
              <label className="text-sm font-semibold text-foreground">Price Range</label>
              <p className="text-xs text-muted-foreground">Filter by tournament cost</p>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Price Range Slider */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>£{filters.priceRange?.min || 0}</span>
                <span>£{filters.priceRange?.max || 500}{filters.priceRange?.max === 500 || !filters.priceRange?.max ? '+' : ''}</span>
              </div>
              <Slider
                min={0}
                max={500}
                step={10}
                value={[
                  filters.priceRange?.min || 0,
                  filters.priceRange?.max || 500
                ]}
                onValueChange={handlePriceRangeChange}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>£0</span>
                <span>£50</span>
                <span>£100</span>
                <span>£200</span>
                <span>£500+</span>
              </div>
            </div>

            {/* Quick Price Range Buttons */}
            <div className="flex flex-wrap gap-2">
              {[
                { label: '£0-25', min: 0, max: 25 },
                { label: '£25-50', min: 25, max: 50 },
                { label: '£50-100', min: 50, max: 100 },
                { label: '£100-200', min: 100, max: 200 },
                { label: '£200+', min: 200, max: 500 },
              ].map((range) => (
                <Button
                  key={range.label}
                  type="button"
                  variant={
                    filters.priceRange?.min === range.min && 
                    filters.priceRange?.max === range.max
                      ? "default" 
                      : "outline"
                  }
                  size="sm"
                  onClick={() => handlePriceRangeChange([range.min, range.max])}
                  className="text-xs"
                >
                  {range.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {hasActiveFilters && <>
            <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />
            <div>
              <div className="flex flex-wrap gap-2">
                {filters.search && <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer">
                    <Search className="w-3 h-3 mr-1" />
                    Search: {filters.search}
                    <button onClick={() => handleSearchChange('')} className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>}
                {filters.location?.postcode && <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer">
                    <MapPin className="w-3 h-3 mr-1" />
                    {filters.location.postcode} ({filters.location.radius || 10} miles)
                    <button onClick={handleLocationClear} className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>}
                {(filters.dateRange?.start || filters.dateRange?.end) && <Badge className="bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer">
                    <CalendarDays className="w-3 h-3 mr-1" />
                    Date Filter
                    <button onClick={() => handleDateRangeChange(undefined)} className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors">
                     <X className="w-3 h-3" />
                   </button>
                 </Badge>}
                {(filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) && <Badge className="bg-green-500/20 text-green-600 border-green-500/30 hover:bg-green-500 hover:text-white transition-all duration-200 cursor-pointer">
                     <Badge variant="outline" className="h-3 w-3 rounded-full p-0 flex items-center justify-center text-xs mr-1 border-green-500/20">
                       £
                     </Badge>
                     Price: {filters.priceRange?.min && filters.priceRange?.max ? `£${filters.priceRange.min}-${filters.priceRange.max}` : 
                       filters.priceRange?.min ? `£${filters.priceRange.min}+` : 
                       filters.priceRange?.max ? `Up to £${filters.priceRange.max}` : 'Custom'}
                     <button onClick={() => removeFilter('priceRange')} className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors">
                       <X className="w-3 h-3" />
                     </button>
                   </Badge>}
                {filters.format?.map(format => <Badge key={format} className="bg-football-primary/20 text-football-primary border-football-primary/30 hover:bg-football-primary hover:text-white transition-all duration-200 cursor-pointer group">
                    <Target className="w-3 h-3 mr-1" />
                    {format}
                    <button onClick={() => removeFilter('format', format)} className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>)}
                {filters.ageGroups?.map(age => <Badge key={age} className="bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer">
                    <Calendar className="w-3 h-3 mr-1" />
                    {age}
                    <button onClick={() => removeFilter('ageGroups', age)} className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>)}
                {filters.teamTypes?.map(type => <Badge key={type} className="bg-secondary/20 text-secondary-foreground border-secondary/30 hover:bg-secondary hover:text-secondary-foreground transition-all duration-200 cursor-pointer">
                    <Users className="w-3 h-3 mr-1" />
                    {type}
                    <button onClick={() => removeFilter('teamTypes', type)} className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>)}
                {filters.type?.map(type => <Badge key={type} className="bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer">
                    <Trophy className="w-3 h-3 mr-1" />
                    {type}
                    <button onClick={() => removeFilter('type', type)} className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>)}
              </div>
            </div>
          </>}

        <Separator className="bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Match Format */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-football-primary/10 rounded-md">
                <Target className="w-4 h-4 text-football-primary" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Match Format</label>
                <p className="text-xs text-muted-foreground">Players per side</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {matchFormats.map(format => <Button key={format} variant={filters.format?.includes(format) ? "default" : "outline"} size="sm" onClick={() => handleArrayFilterChange('format', format)} className={`text-xs font-medium transition-all duration-200 hover-scale ${filters.format?.includes(format) ? "bg-football-primary hover:bg-football-primary/90 text-white shadow-lg scale-105" : "hover:bg-football-primary/10 hover:text-football-primary hover:border-football-primary/50"}`}>
                  {format}
                </Button>)}
            </div>
          </div>

          {/* Age Groups */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-accent/10 rounded-md">
                <Calendar className="w-4 h-4 text-accent-foreground" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Age Groups</label>
                <p className="text-xs text-muted-foreground">Select youth categories</p>
              </div>
            </div>
            <Select onValueChange={value => handleArrayFilterChange('ageGroups', value)}>
              <SelectTrigger className="bg-background/50 hover:bg-accent/5 transition-colors border-accent/20 hover:border-accent/40">
                <SelectValue placeholder="Choose age groups" />
              </SelectTrigger>
              <SelectContent className="bg-background border-accent/20">
                {ageGroups.map(age => <SelectItem key={age} value={age} className="hover:bg-accent/10 focus:bg-accent/10">
                    {age}
                  </SelectItem>)}
              </SelectContent>
            </Select>
            {filters.ageGroups && filters.ageGroups.length > 0 && <div className="flex flex-wrap gap-1 mt-2">
                {filters.ageGroups.map(age => <Badge key={age} variant="secondary" className="text-xs">
                    {age}
                  </Badge>)}
              </div>}
          </div>

          {/* Team Types */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-md bg-indigo-500">
                <Users className="w-4 h-4 text-secondary-foreground bg-indigo-500" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Team Type</label>
                <p className="text-xs text-muted-foreground">Gender categories</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamTypes.map(type => <Button key={type} variant={filters.teamTypes?.includes(type) ? "default" : "outline"} size="sm" onClick={() => handleArrayFilterChange('teamTypes', type)} className={`text-xs font-medium capitalize transition-all duration-200 hover-scale ${filters.teamTypes?.includes(type) ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg scale-105" : "hover:bg-secondary/10 hover:text-secondary-foreground hover:border-secondary/50"}`}>
                  {type}
                </Button>)}
            </div>
          </div>

          {/* Tournament Type */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-md">
                <Trophy className="w-4 h-4 text-primary" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Tournament Type</label>
                <p className="text-xs text-muted-foreground">Event format</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {typesLoading ? (
                <div className="text-xs text-muted-foreground">Loading types...</div>
              ) : (
                tournamentTypes.map(type => (
                  <Button
                    key={type}
                    variant={filters.type?.includes(type) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleArrayFilterChange('type', type)}
                    className={`text-xs font-medium capitalize transition-all duration-200 hover-scale ${
                      filters.type?.includes(type)
                        ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg scale-105"
                        : "hover:bg-primary/10 hover:text-primary hover:border-primary/50"
                    }`}
                  >
                    {type}
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default TournamentFilters;