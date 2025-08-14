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
import { Filter, X, Target, Users, Trophy, Calendar } from 'lucide-react';

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
    <Card className="w-full bg-gradient-to-br from-background to-surface/50 border-2 border-border/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Filter className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Filters</h3>
              <p className="text-xs text-muted-foreground">Refine your search</p>
            </div>
            {hasActiveFilters && (
              <Badge variant="default" className="ml-2 bg-football-primary hover:bg-football-primary/90">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-sm hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
            >
              <X className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {filters.format?.map(format => (
                <Badge key={format} className="bg-football-primary/20 text-football-primary border-football-primary/30 hover:bg-football-primary hover:text-white transition-all duration-200 cursor-pointer group">
                  <Target className="w-3 h-3 mr-1" />
                  {format}
                  <button
                    onClick={() => removeFilter('format', format)}
                    className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.ageGroups?.map(age => (
                <Badge key={age} className="bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent hover:text-accent-foreground transition-all duration-200 cursor-pointer">
                  <Calendar className="w-3 h-3 mr-1" />
                  {age}
                  <button
                    onClick={() => removeFilter('ageGroups', age)}
                    className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.teamTypes?.map(type => (
                <Badge key={type} className="bg-secondary/20 text-secondary-foreground border-secondary/30 hover:bg-secondary hover:text-secondary-foreground transition-all duration-200 cursor-pointer">
                  <Users className="w-3 h-3 mr-1" />
                  {type}
                  <button
                    onClick={() => removeFilter('teamTypes', type)}
                    className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              {filters.type?.map(type => (
                <Badge key={type} className="bg-primary/20 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground transition-all duration-200 cursor-pointer">
                  <Trophy className="w-3 h-3 mr-1" />
                  {type}
                  <button
                    onClick={() => removeFilter('type', type)}
                    className="ml-2 hover:bg-white/30 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <Separator className="mt-6 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              {matchFormats.map(format => (
                <Button
                  key={format}
                  variant={filters.format?.includes(format) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleArrayFilterChange('format', format)}
                  className={`text-xs font-medium transition-all duration-200 hover-scale ${
                    filters.format?.includes(format) 
                      ? "bg-football-primary hover:bg-football-primary/90 text-white shadow-lg scale-105" 
                      : "hover:bg-football-primary/10 hover:text-football-primary hover:border-football-primary/50"
                  }`}
                >
                  {format}
                </Button>
              ))}
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
            <Select
              onValueChange={(value) => handleArrayFilterChange('ageGroups', value)}
            >
              <SelectTrigger className="bg-background/50 hover:bg-accent/5 transition-colors border-accent/20 hover:border-accent/40">
                <SelectValue placeholder="Choose age groups" />
              </SelectTrigger>
              <SelectContent className="bg-background border-accent/20">
                {ageGroups.map(age => (
                  <SelectItem 
                    key={age} 
                    value={age}
                    className="hover:bg-accent/10 focus:bg-accent/10"
                  >
                    {age}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filters.ageGroups && filters.ageGroups.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.ageGroups.map(age => (
                  <Badge key={age} variant="secondary" className="text-xs">
                    {age}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Team Types */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-secondary/10 rounded-md">
                <Users className="w-4 h-4 text-secondary-foreground" />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground">Team Type</label>
                <p className="text-xs text-muted-foreground">Gender categories</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {teamTypes.map(type => (
                <Button
                  key={type}
                  variant={filters.teamTypes?.includes(type) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleArrayFilterChange('teamTypes', type)}
                  className={`text-xs font-medium capitalize transition-all duration-200 hover-scale ${
                    filters.teamTypes?.includes(type) 
                      ? "bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-lg scale-105" 
                      : "hover:bg-secondary/10 hover:text-secondary-foreground hover:border-secondary/50"
                  }`}
                >
                  {type}
                </Button>
              ))}
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
              {tournamentTypes.map(type => (
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
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TournamentFilters;