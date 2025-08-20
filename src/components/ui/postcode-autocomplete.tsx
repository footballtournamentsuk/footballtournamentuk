import React, { useState, useRef, useEffect } from 'react';
import { Input, GlassInput } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface PostcodeSuggestion {
  id: string;
  place_name: string;
  postcode: string;
  center: [number, number];
  context: Array<{
    id: string;
    text: string;
  }>;
}

interface PostcodeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (suggestion: PostcodeSuggestion) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  variant?: 'default' | 'glass';
}

export function PostcodeAutocomplete({ 
  value, 
  onChange, 
  onAddressSelect, 
  placeholder, 
  className,
  id,
  variant = 'default'
}: PostcodeAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<PostcodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Get Mapbox token on component mount
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        const response = await fetch('https://yknmcddrfkggphrktivd.supabase.co/functions/v1/mapbox-token', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error('Error fetching Mapbox token:', response.status);
          return;
        }
        
        const data = await response.json();
        if (data?.token) {
          setMapboxToken(data.token);
        }
      } catch (error) {
        console.error('Failed to fetch Mapbox token:', error);
      }
    };
    
    fetchMapboxToken();
  }, []);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchPostcode = async (query: string) => {
    if (!query.trim() || !mapboxToken || query.length < 3) {
      setSuggestions([]);
      return;
    }

    // Basic UK postcode pattern validation
    const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    const partialPostcodePattern = /^[A-Z]{1,2}[0-9]/i;
    
    if (!postcodePattern.test(query) && !partialPostcodePattern.test(query)) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&` +
        `country=GB&` +
        `types=postcode,address&` +
        `limit=8`
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions = (data.features || []).map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          postcode: feature.properties?.postcode || extractPostcode(feature.place_name),
          center: feature.center,
          context: feature.context || []
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching postcode:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const extractPostcode = (placeName: string): string => {
    const parts = placeName.split(', ');
    const postcodePattern = /^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$/i;
    return parts.find(part => postcodePattern.test(part.trim())) || '';
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase(); // Convert to uppercase for UK postcodes
    onChange(newValue);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the search
    debounceRef.current = setTimeout(() => {
      searchPostcode(newValue);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: PostcodeSuggestion) => {
    onChange(suggestion.postcode);
    setShowSuggestions(false);
    setSuggestions([]);
    onAddressSelect?.(suggestion);
  };

  const formatSuggestionText = (suggestion: PostcodeSuggestion) => {
    const parts = suggestion.place_name.split(', ');
    return {
      primary: parts[0] || suggestion.postcode,
      secondary: parts.slice(1).join(', ')
    };
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className={cn(
          "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
          variant === 'glass' ? "text-slate-600 dark:text-slate-400" : "text-muted-foreground"
        )} />
        {variant === 'glass' ? (
          <GlassInput
            ref={inputRef}
            id={id}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder || "Enter postcode (e.g., SW1A 1AA)"}
            className={cn("pl-10 pr-10", className)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
        ) : (
          <Input
            ref={inputRef}
            id={id}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder || "Enter postcode (e.g., SW1A 1AA)"}
            className={cn("pl-10 pr-10", className)}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
        )}
        {loading && (
          <Loader2 className={cn(
            "absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin",
            variant === 'glass' ? "text-slate-600 dark:text-slate-400" : "text-muted-foreground"
          )} />
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-[100] mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-lg"
        >
          {suggestions.map((suggestion) => {
            const formatted = formatSuggestionText(suggestion);
            return (
              <Button
                key={suggestion.id}
                variant="ghost"
                className="w-full justify-start p-3 h-auto text-left hover:bg-accent"
                onClick={() => handleSuggestionSelect(suggestion)}
              >
                <div className="flex items-start gap-2 w-full">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {formatted.primary}
                    </div>
                    {formatted.secondary && (
                      <div className="text-xs text-muted-foreground truncate">
                        {formatted.secondary}
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                    {suggestion.postcode}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}