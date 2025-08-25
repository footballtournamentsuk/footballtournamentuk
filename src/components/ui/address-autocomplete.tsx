import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AddressSuggestion {
  id: string;
  place_name: string;
  center: [number, number];
  properties?: {
    postcode?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (suggestion: AddressSuggestion) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  country?: string; // Add country parameter
}

export function AddressAutocomplete({ 
  value, 
  onChange, 
  onAddressSelect, 
  placeholder, 
  className,
  id,
  country = 'GB' // Default to GB for backward compatibility
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  const searchPlaces = async (query: string) => {
    if (!query.trim() || !mapboxToken) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&` +
        `country=${country}&` +
        `types=address,poi,place&` +
        `limit=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.features || []);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching places:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Debounce the search
    const timeoutId = setTimeout(() => {
      searchPlaces(newValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSuggestionSelect = (suggestion: AddressSuggestion) => {
    onChange(suggestion.place_name);
    setShowSuggestions(false);
    setSuggestions([]);
    onAddressSelect?.(suggestion);
  };

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          id={id}
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", className)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-[100] mt-1 w-full max-h-60 overflow-auto rounded-md border bg-popover p-1 shadow-lg"
        >
          {suggestions.map((suggestion) => (
            <Button
              key={suggestion.id}
              variant="ghost"
              className="w-full justify-start p-2 h-auto text-left"
              onClick={() => handleSuggestionSelect(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">
                    {suggestion.place_name}
                  </div>
                </div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}