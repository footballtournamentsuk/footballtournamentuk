import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TournamentFilters as Filters, AgeGroup, TeamType } from '@/types/tournament';
import { ukLeagues } from '@/data/mockTournaments';
import { Filter, X } from 'lucide-react';

interface TournamentFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  onClearFilters: () => void;
}

const matchFormats = ['3v3', '5v5', '7v7', '9v9', '11v11'];
const ageGroups: AgeGroup[] = ['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21'];
const teamTypes: TeamType[] = ['boys', 'girls', 'mixed'];
const tournamentTypes = ['league', 'tournament', 'camp', 'holiday'];
const regions = ['London', 'Kent', 'Surrey', 'Manchester', 'Birmingham', 'Liverpool', 'Yorkshire'];

const TournamentFilters: React.FC<TournamentFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  const handleArrayFilterChange = (key: keyof Filters, value: string) => {
    const currentArray = (filters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    onFiltersChange({
      ...filters,
      [key]: newArray.length > 0 ? newArray : undefined
    });
  };

  const removeFilter = (key: keyof Filters, value?: string) => {
    if (value && Array.isArray(filters[key])) {
      const currentArray = (filters[key] as string[]) || [];
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
    return Object.values(filters).filter(value => 
      value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  const hasActiveFilters = getActiveFiltersCount() > 0;

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Filters</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-sm"
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {filters.format?.map(format => (
                <Badge key={format} variant="default" className="cursor-pointer">
                  {format}
                  <button
                    onClick={() => removeFilter('format', format)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.ageGroups?.map(age => (
                <Badge key={age} variant="default" className="cursor-pointer">
                  {age}
                  <button
                    onClick={() => removeFilter('ageGroups', age)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.teamTypes?.map(type => (
                <Badge key={type} variant="default" className="cursor-pointer">
                  {type}
                  <button
                    onClick={() => removeFilter('teamTypes', type)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.type?.map(type => (
                <Badge key={type} variant="default" className="cursor-pointer">
                  {type}
                  <button
                    onClick={() => removeFilter('type', type)}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Separator className="mt-4" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Match Format */}
          <div>
            <label className="text-sm font-medium mb-2 block">Match Format</label>
            <div className="flex flex-wrap gap-2">
              {matchFormats.map(format => (
                <Button
                  key={format}
                  variant={filters.format?.includes(format) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleArrayFilterChange('format', format)}
                  className="text-xs"
                >
                  {format}
                </Button>
              ))}
            </div>
          </div>

          {/* Age Groups */}
          <div>
            <label className="text-sm font-medium mb-2 block">Age Groups</label>
            <Select
              onValueChange={(value) => handleArrayFilterChange('ageGroups', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select age groups" />
              </SelectTrigger>
              <SelectContent>
                {ageGroups.map(age => (
                  <SelectItem key={age} value={age}>
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Team Types */}
          <div>
            <label className="text-sm font-medium mb-2 block">Team Type</label>
            <div className="flex flex-wrap gap-2">
              {teamTypes.map(type => (
                <Button
                  key={type}
                  variant={filters.teamTypes?.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleArrayFilterChange('teamTypes', type)}
                  className="text-xs capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          {/* Tournament Type */}
          <div>
            <label className="text-sm font-medium mb-2 block">Type</label>
            <div className="flex flex-wrap gap-2">
              {tournamentTypes.map(type => (
                <Button
                  key={type}
                  variant={filters.type?.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleArrayFilterChange('type', type)}
                  className="text-xs capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentFilters;