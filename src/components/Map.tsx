import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tournament } from '@/types/tournament';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface MapProps {
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onTournamentSelect: (tournament: Tournament | null) => void;
  centerCoordinates?: [number, number];
  defaultZoom?: number;
}

const Map: React.FC<MapProps> = ({ 
  tournaments, 
  selectedTournament, 
  onTournamentSelect,
  centerCoordinates,
  defaultZoom = 6
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('🔑 Fetching Mapbox token...');
        console.log('🌍 Current environment check...');
        
        const { data, error } = await supabase.functions.invoke('mapbox-token');

        console.log('📡 Response received:', { data, error });

        if (error) {
          console.error('❌ Supabase function error:', error);
          throw new Error(`Token fetch failed: ${error.message || 'Unknown error'}`);
        }

        if (data?.token) {
          console.log('✅ Token fetched successfully, length:', data.token.length);
          setMapboxToken(data.token);
          mapboxgl.accessToken = data.token;
          setIsLoading(true); // Keep loading until map initializes
        } else {
          console.error('❌ No token in response:', data);
          throw new Error('No token received from server');
        }
      } catch (err) {
        console.error('❌ Token fetch error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        console.error('🚨 Setting error state:', errorMessage);
        setError(`Unable to load map: ${errorMessage}`);
        setIsLoading(false);
      }
    };

    console.log('🚀 Starting token fetch...');
    fetchToken();
  }, []);

  // Initialize map when token is ready and container exists
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const container = mapRef.current;
    
    console.log('🎯 Map init check:');
    console.log('  - Container exists:', !!container);
    console.log('  - Token available:', !!mapboxToken);
    console.log('  - Map instance exists:', !!mapInstance.current);
    
    if (!container) {
      console.log('❌ Container ref is null');
      return;
    }
    
    if (!mapboxToken) {
      console.log('⏳ Token not ready yet');
      return;
    }
    
    if (mapInstance.current) {
      console.log('ℹ️ Map already exists');
      return;
    }

    // Check if container has dimensions
    const rect = container.getBoundingClientRect();
    console.log('📐 Container dimensions:', rect.width, 'x', rect.height);
    
    if (rect.width === 0 || rect.height === 0) {
      console.log('⏳ Container has no dimensions, retrying...');
      // Retry after a short delay
      const timer = setTimeout(() => {
        const newRect = container.getBoundingClientRect();
        console.log('📐 Retry - Container dimensions:', newRect.width, 'x', newRect.height);
        if (newRect.width > 0 && newRect.height > 0) {
          initializeMap();
        }
      }, 100);
      return () => clearTimeout(timer);
    }

    initializeMap();

    function initializeMap() {
      if (!container || !mapboxToken || mapInstance.current) return;

      console.log('🚀 Initializing Mapbox map...');

      try {
        // Create map instance
        mapInstance.current = new mapboxgl.Map({
          container: container,
          style: 'mapbox://styles/mapbox/streets-v12',
          center: centerCoordinates || [-3.4, 55.3], // Custom center or UK center
          zoom: defaultZoom,
          attributionControl: false,
        });

        console.log('✅ Map instance created successfully');

        // Add controls
        mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
        mapInstance.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

        // Handle map load event
        mapInstance.current.on('load', () => {
          console.log('🎉 Map loaded! Hiding spinner and adding markers...');
          setIsLoading(false);
          setError(null);
          addTournamentMarkers();
        });

        // Handle map errors
        mapInstance.current.on('error', (e) => {
          console.error('❌ Map error:', e);
          setError(`Map error: ${e.error?.message || 'Unknown error'}`);
          setIsLoading(false);
        });

      } catch (err) {
        console.error('💥 Map initialization failed:', err);
        setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    }
  }, [mapboxToken]);

  // Add tournament markers
  const addTournamentMarkers = () => {
    if (!mapInstance.current) {
      console.log('❌ No map instance for adding markers');
      return;
    }

    console.log('📍 Adding markers for', tournaments.length, 'tournaments');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (tournaments.length === 0) {
      console.log('ℹ️ No tournaments to display');
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    let markersAdded = 0;

    tournaments.forEach((tournament) => {
      if (!tournament.location?.coordinates) {
        console.log('⚠️ Tournament missing coordinates:', tournament.name);
        return;
      }

      const [lng, lat] = tournament.location.coordinates;
      console.log('📍 Creating marker for:', tournament.name, 'at', lng, lat);
      
      // Create marker element with color based on tournament type
      const getMarkerColor = (type: string) => {
        const typeColors: Record<string, string> = {
          'league': '#3b82f6', // blue
          'tournament': 'hsl(var(--primary))', // default primary
          'camp': '#10b981', // green
          'cup': '#f59e0b', // yellow/amber
          'festival': '#8b5cf6', // purple
          'showcase': '#f97316', // orange
          'friendly': '#059669', // emerald
          'holiday': '#ec4899', // pink
        };
        return typeColors[type.toLowerCase()] || 'hsl(var(--primary))';
      };

      const markerEl = document.createElement('div');
      markerEl.className = 'tournament-marker';
      markerEl.innerHTML = `
        <div style="
          width: 28px;
          height: 28px;
          background: ${getMarkerColor(tournament.type)};
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        " 
        onmouseover="this.style.transform='scale(1.1)'; this.style.boxShadow='0 4px 8px rgba(0,0,0,0.5)'"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 3px 6px rgba(0,0,0,0.4)'"
        title="${tournament.name} - ${tournament.type}"
        >
          <div style="
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `;

      // Add click handler
      markerEl.addEventListener('click', () => {
        console.log('🖱️ Marker clicked:', tournament.name);
        onTournamentSelect(tournament);
      });

      // Create and add marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .addTo(mapInstance.current!);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
      markersAdded++;
    });

    // Fit map to show all markers
    if (markersAdded > 0) {
      mapInstance.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10
      });
      console.log('✅ Map fitted to', markersAdded, 'markers');
    }
  };

  // Update markers when tournaments change (but only after map is loaded)
  useEffect(() => {
    if (mapInstance.current && !isLoading) {
      console.log('🔄 Updating markers due to tournament change');
      addTournamentMarkers();
    }
  }, [tournaments, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        console.log('🧹 Cleaning up map instance');
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  // Always render the container, regardless of loading/error state
  return (
    <div 
      className="relative w-full rounded-lg overflow-hidden shadow-lg border bg-muted"
      style={{ height: '520px', width: '100%', minHeight: '520px' }}
    >
      {/* Map container - ALWAYS rendered with guaranteed dimensions */}
      <div 
        ref={mapRef}
        id="map"
        className="w-full h-full absolute inset-0"
        style={{ 
          width: '100%',
          height: '100%',
          minHeight: '520px',
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 1
        }}
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground font-medium">Loading map...</p>
            <p className="text-xs text-muted-foreground/70 mt-2">Fetching location data</p>
          </div>
        </div>
      )}

      {/* Error overlay with better UX */}
      {error && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-20">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="p-6">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-2">Map Unavailable</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  The map service is temporarily unavailable. You can still browse tournaments in the list view.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={() => {
                      setError(null);
                      setIsLoading(true);
                      window.location.reload();
                    }} 
                    variant="default"
                    size="sm"
                    className="w-full"
                  >
                    Try Again
                  </Button>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Tournament selection popup */}
      {selectedTournament && !isLoading && !error && (
        <div className="absolute top-4 left-4 right-4 z-30">
          <Card className="bg-background/95 backdrop-blur-sm shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{selectedTournament.name}</h3>
                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span>{selectedTournament.location.name}, {selectedTournament.location.postcode}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{formatDate(selectedTournament.dates.start)} - {formatDate(selectedTournament.dates.end)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{selectedTournament.format} • {selectedTournament.ageGroups.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      <span>{selectedTournament.teamTypes.join(', ')} teams</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onTournamentSelect(null)}
                  className="ml-2"
                >
                  ✕
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Tournament counter */}
      {!isLoading && !error && tournaments.length > 0 && (
        <div className="absolute bottom-4 left-4 z-30">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium shadow-lg">
            {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} found
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;