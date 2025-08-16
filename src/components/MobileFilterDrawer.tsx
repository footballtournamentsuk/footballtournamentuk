import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { TournamentFilters as Filters, AgeGroup, TeamType } from '@/types/tournament';
import { Filter, X, ChevronDown, Search, MapPin, CalendarDays, Target, Calendar, Users, Trophy } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { LocationFilter } from './LocationFilter';
import { DateRangePicker } from './DateRangePicker';
import { DateRange } from 'react-day-picker';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useTournamentTypes } from '@/hooks/useTournamentTypes';
interface MobileFilterDrawerProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
  activeCount: number;
}
const matchFormats = ['3v3', '5v5', '7v7', '9v9', '11v11'];
const ageGroups: AgeGroup[] = ['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21'];
const teamTypes: TeamType[] = ['boys', 'girls', 'mixed'];
export const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeCount
}) => {
  const { tournamentTypes, loading: typesLoading } = useTournamentTypes();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    search: true,
    location: false,
    dateRange: false,
    priceRange: false,
    format: false,
    ageGroups: false,
    teamTypes: false,
    type: false
  });

  // Sample search suggestions
  const searchSuggestions = [{
    id: '1',
    text: 'Manchester United Academy',
    type: 'tournament' as const
  }, {
    id: '2',
    text: 'London Youth League',
    type: 'league' as const
  }, {
    id: '3',
    text: 'Birmingham',
    type: 'location' as const
  }, {
    id: '4',
    text: 'Liverpool Summer Camp',
    type: 'tournament' as const
  }, {
    id: '5',
    text: 'Kent County League',
    type: 'league' as const
  }];
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
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
  const handleLocationSelect = (location: {
    postcode: string;
    coordinates: [number, number];
  }) => {
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
        min: min > 0 ? min : undefined,
        max: max < 500 ? max : undefined,
        includeFree: min === 0
      }
    });
  };
  const applyFilters = () => {
    setIsOpen(false);
  };
  const clearAllFilters = () => {
    onClearFilters();
    // Keep drawer open after clearing so user can set new filters
  };
  return <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {activeCount > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-football-primary">
              {activeCount}
            </Badge>}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[85vh] flex flex-col">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Tournaments
            </div>
            {activeCount > 0 && <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive">
                Clear All
              </Button>}
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 pb-20">
          {/* Search Section */}
          <Collapsible open={expandedSections.search} onOpenChange={() => toggleSection('search')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Search className="w-5 h-5 text-primary" />
                <span className="font-medium">Search</span>
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.search ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <SearchBar value={filters.search || ''} onChange={handleSearchChange} suggestions={searchSuggestions} placeholder="Search tournaments, locations..." />
            </CollapsibleContent>
          </Collapsible>

          {/* Location Section */}
          <Collapsible open={expandedSections.location} onOpenChange={() => toggleSection('location')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="font-medium">Location</span>
                {filters.location?.postcode && <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.location.postcode}
                  </Badge>}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.location ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <LocationFilter postcode={filters.location?.postcode || ''} radius={filters.location?.radius || 10} onPostcodeChange={handleLocationChange} onRadiusChange={handleRadiusChange} onLocationSelect={handleLocationSelect} onClear={handleLocationClear} />
            </CollapsibleContent>
          </Collapsible>

          {/* Date Range Section */}
          <Collapsible open={expandedSections.dateRange} onOpenChange={() => toggleSection('dateRange')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-5 h-5 text-accent-foreground" />
                <span className="font-medium">Date Range</span>
                {(filters.dateRange?.start || filters.dateRange?.end) && <Badge variant="secondary" className="ml-2 text-xs">
                    Set
                  </Badge>}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.dateRange ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <DateRangePicker value={{
              from: filters.dateRange?.start,
              to: filters.dateRange?.end
            }} onChange={handleDateRangeChange} placeholder="Select date range" />
            </CollapsibleContent>
          </Collapsible>

          {/* Price Range Section */}
          <Collapsible open={expandedSections.priceRange} onOpenChange={() => toggleSection('priceRange')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs border-green-500/20 text-green-600">
                  £
                </Badge>
                <span className="font-medium">Price Range</span>
                {(filters.priceRange?.min || filters.priceRange?.max) && <Badge variant="secondary" className="ml-2 text-xs">
                    £{filters.priceRange?.min || 0}-{filters.priceRange?.max || '500+'}
                  </Badge>}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.priceRange ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>£{filters.priceRange?.min || 0}</span>
                  <span>£{filters.priceRange?.max || 500}{filters.priceRange?.max === 500 || !filters.priceRange?.max ? '+' : ''}</span>
                </div>
                <Slider min={0} max={500} step={10} value={[filters.priceRange?.min || 0, filters.priceRange?.max || 500]} onValueChange={handlePriceRangeChange} className="w-full" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[{
                label: '£0-25',
                min: 0,
                max: 25
              }, {
                label: '£25-50',
                min: 25,
                max: 50
              }, {
                label: '£50-100',
                min: 50,
                max: 100
              }, {
                label: '£100-200',
                min: 100,
                max: 200
              }, {
                label: '£200+',
                min: 200,
                max: 500
              }].map(range => <Button key={range.label} type="button" variant={filters.priceRange?.min === range.min && filters.priceRange?.max === range.max ? "default" : "outline"} size="sm" onClick={() => handlePriceRangeChange([range.min, range.max])} className="text-xs">
                    {range.label}
                  </Button>)}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Match Format Section */}
          <Collapsible open={expandedSections.format} onOpenChange={() => toggleSection('format')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-football-primary" />
                <span className="font-medium">Match Format</span>
                {filters.format && filters.format.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.format.length}
                  </Badge>}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.format ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="flex flex-wrap gap-2">
                {matchFormats.map(format => <Button key={format} variant={filters.format?.includes(format) ? "default" : "outline"} size="sm" onClick={() => handleArrayFilterChange('format', format)} className="text-xs">
                    {format}
                  </Button>)}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Age Groups Section */}
          <Collapsible open={expandedSections.ageGroups} onOpenChange={() => toggleSection('ageGroups')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-accent-foreground" />
                <span className="font-medium">Age Groups</span>
                {filters.ageGroups && filters.ageGroups.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.ageGroups.length}
                  </Badge>}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.ageGroups ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <Select onValueChange={value => handleArrayFilterChange('ageGroups', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose age groups" />
                </SelectTrigger>
                <SelectContent>
                  {ageGroups.map(age => <SelectItem key={age} value={age}>
                      {age}
                    </SelectItem>)}
                </SelectContent>
              </Select>
              {filters.ageGroups && filters.ageGroups.length > 0 && <div className="flex flex-wrap gap-1">
                  {filters.ageGroups.map(age => <Badge key={age} variant="secondary" className="text-xs">
                      {age}
                    </Badge>)}
                </div>}
            </CollapsibleContent>
          </Collapsible>

          {/* Team Types Section */}
          <Collapsible open={expandedSections.teamTypes} onOpenChange={() => toggleSection('teamTypes')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-secondary-foreground bg-violet-100" />
                <span className="font-medium">Team Types</span>
                {filters.teamTypes && filters.teamTypes.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.teamTypes.length}
                  </Badge>}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.teamTypes ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="flex flex-wrap gap-2">
                {teamTypes.map(type => <Button key={type} variant={filters.teamTypes?.includes(type) ? "default" : "outline"} size="sm" onClick={() => handleArrayFilterChange('teamTypes', type)} className="text-xs capitalize">
                    {type}
                  </Button>)}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Tournament Type Section */}
          <Collapsible open={expandedSections.type} onOpenChange={() => toggleSection('type')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-primary" />
                <span className="font-medium">Tournament Type</span>
                {filters.type && filters.type.length > 0 && <Badge variant="secondary" className="ml-2 text-xs">
                    {filters.type.length}
                  </Badge>}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.type ? 'rotate-180' : ''}`} />
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="flex flex-wrap gap-2">
                {typesLoading ? (
                  <div className="text-xs text-muted-foreground">Loading...</div>
                ) : tournamentTypes.length > 0 ? (
                  tournamentTypes.map(type => <Button key={type} variant={filters.type?.includes(type) ? "default" : "outline"} size="sm" onClick={() => handleArrayFilterChange('type', type)} className="text-xs capitalize">
                      {type}
                    </Button>)
                ) : (
                  <div className="text-xs text-muted-foreground">No types found</div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>

        {/* Sticky Bottom Buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
          <div className="flex gap-3">
            <Button variant="outline" onClick={clearAllFilters} className="flex-1">
              Clear All
            </Button>
            <Button onClick={applyFilters} className="flex-1 bg-football-primary hover:bg-football-primary/90 text-gray-950 bg-emerald-500 hover:bg-emerald-400">
              Apply Filters
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>;
};