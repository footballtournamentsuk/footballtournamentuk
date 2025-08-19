import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Navigation, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useEngagementTracker } from '@/hooks/useEngagementTracker';

interface HeroSearchProps {
  onSearch: (searchTerm: string, postcode?: string, coordinates?: [number, number]) => void;
  className?: string;
}

interface PostcodeSuggestion {
  id: string;
  place_name: string;
  postcode: string;
  center: [number, number];
}

export function HeroSearch({ onSearch, className }: HeroSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [postcode, setPostcode] = useState('');
  const [suggestions, setSuggestions] = useState<PostcodeSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mapboxToken, setMapboxToken] = useState<string>('');
  const [selectedCoordinates, setSelectedCoordinates] = useState<[number, number] | undefined>();
  
  const postcodeInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const { trackMeaningfulAction } = useEngagementTracker();

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
        postcodeInputRef.current && 
        !postcodeInputRef.current.contains(event.target as Node) &&
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
    if (!query.trim() || !mapboxToken || query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${mapboxToken}&` +
        `country=GB&` +
        `types=postcode,address,place&` +
        `limit=5`
      );
      
      if (response.ok) {
        const data = await response.json();
        const formattedSuggestions = (data.features || []).map((feature: any) => ({
          id: feature.id,
          place_name: feature.place_name,
          postcode: feature.properties?.postcode || extractPostcode(feature.place_name),
          center: feature.center
        }));
        setSuggestions(formattedSuggestions);
        setShowSuggestions(formattedSuggestions.length > 0);
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

  const handlePostcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    setPostcode(newValue);
    
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
    setPostcode(suggestion.postcode);
    setSelectedCoordinates(suggestion.center);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported by this browser.');
      return;
    }

    trackMeaningfulAction('geolocation-requested');
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords: [number, number] = [position.coords.longitude, position.coords.latitude];
        setSelectedCoordinates(coords);
        
        // Reverse geocode to get postcode
        if (mapboxToken) {
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?` +
              `access_token=${mapboxToken}&` +
              `types=postcode`
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data.features && data.features[0]) {
                const postcodeFeature = data.features[0];
                const detectedPostcode = postcodeFeature.properties?.postcode || 
                  extractPostcode(postcodeFeature.place_name);
                if (detectedPostcode) {
                  setPostcode(detectedPostcode);
                }
              }
            }
          } catch (error) {
            console.error('Error reverse geocoding:', error);
          }
        }
        
        trackMeaningfulAction('geolocation-success');
      },
      (error) => {
        console.error('Error getting location:', error);
        trackMeaningfulAction('geolocation-denied');
      }
    );
  };

  const handleSearch = () => {
    if (searchTerm.trim() || postcode.trim()) {
      onSearch(searchTerm.trim(), postcode.trim(), selectedCoordinates);
      trackMeaningfulAction('hero-search-performed');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Search Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          Find Your Next Tournament
        </h3>
        <p className="text-white/80 text-sm">
          Search by tournament name, location, or enter your postcode
        </p>
      </div>

      {/* Search Form */}
      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
        <div className="space-y-3">
          {/* Tournament Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tournaments, locations..."
              className="pl-10 h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
              onKeyPress={handleKeyPress}
            />
          </div>

          {/* Postcode Search */}
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <Input
              ref={postcodeInputRef}
              value={postcode}
              onChange={handlePostcodeChange}
              placeholder="Postcode (e.g. SW1A 1AA)"
              className="pl-10 pr-12 h-12 bg-white border-gray-200 text-gray-900 placeholder:text-gray-500"
              onKeyPress={handleKeyPress}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
            />
            {loading ? (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-gray-500" />
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={requestGeolocation}
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0 hover:bg-gray-100"
                title="Use my location"
              >
                <Navigation className="h-4 w-4 text-gray-600" />
              </Button>
            )}

            {/* Postcode Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-[100] mt-1 w-full max-h-48 overflow-auto rounded-md border bg-white shadow-lg"
              >
                {suggestions.map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="ghost"
                    className="w-full justify-start p-3 h-auto text-left hover:bg-gray-50"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-gray-900">
                          {suggestion.place_name.split(', ')[0]}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {suggestion.place_name.split(', ').slice(1).join(', ')}
                        </div>
                      </div>
                      {suggestion.postcode && (
                        <div className="text-xs font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                          {suggestion.postcode}
                        </div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base"
            disabled={!searchTerm.trim() && !postcode.trim()}
          >
            <Search className="w-5 h-5 mr-2" />
            Search Tournaments
          </Button>
        </div>
      </div>
    </div>
  );
}