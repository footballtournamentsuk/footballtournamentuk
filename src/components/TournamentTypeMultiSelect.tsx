import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Trophy, Check, ChevronDown, X } from 'lucide-react';
import { useTournamentTypes } from '@/hooks/useTournamentTypes';
import { cn } from '@/lib/utils';

interface TournamentTypeMultiSelectProps {
  selectedTypes: string[];
  onSelectionChange: (types: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const TournamentTypeMultiSelect: React.FC<TournamentTypeMultiSelectProps> = ({
  selectedTypes = [],
  onSelectionChange,
  placeholder = "Select event types...",
  className
}) => {
  const { tournamentTypes, loading } = useTournamentTypes();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const handleSelect = (type: string) => {
    const isSelected = selectedTypes.includes(type);
    if (isSelected) {
      onSelectionChange(selectedTypes.filter(t => t !== type));
    } else {
      onSelectionChange([...selectedTypes, type]);
    }
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectionChange([]);
  };

  const filteredTypes = tournamentTypes.filter(type =>
    type.toLowerCase().includes(search.toLowerCase())
  );

  const getTriggerText = () => {
    if (selectedTypes.length === 0) return placeholder;
    if (selectedTypes.length === 1) return selectedTypes[0];
    return `${selectedTypes.length} types selected`;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select tournament types"
            className={cn(
              "w-full justify-between text-left font-normal",
              selectedTypes.length === 0 && "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="truncate">{getTriggerText()}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {selectedTypes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 hover:bg-transparent"
                  onClick={handleClearAll}
                  aria-label="Clear all selections"
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </Button>
              )}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search event types..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                {loading ? "Loading types..." : "No event types found."}
              </CommandEmpty>
              {filteredTypes.length > 0 && (
                <div className="p-1">
                  {filteredTypes.map((type) => {
                    const isSelected = selectedTypes.includes(type);
                    return (
                      <CommandItem
                        key={type}
                        value={type}
                        onSelect={() => handleSelect(type)}
                        className="flex items-center gap-3 px-3 py-2 cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleSelect(type)}
                          aria-label={`Toggle ${type} selection`}
                        />
                        <div className="flex-1 capitalize">
                          {type}
                        </div>
                        {isSelected && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </CommandItem>
                    );
                  })}
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected types as badges */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTypes.map((type) => (
            <Badge
              key={type}
              variant="secondary"
              className="text-xs capitalize cursor-pointer hover:bg-secondary/80 transition-colors"
              onClick={() => handleSelect(type)}
            >
              {type}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(type);
                }}
                className="ml-1 hover:bg-background/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove ${type} filter`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};