import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tournament } from '@/types/tournament';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapProps {
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onTournamentSelect: (tournament: Tournament | null) => void;
}

const Map: React.FC<MapProps> = ({ tournaments, selectedTournament, onTournamentSelect }) => {
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [containerReady, setContainerReady] = useState(false);

  // Callback ref to detect when container is mounted
  const mapContainerCallback = useCallback((node: HTMLDivElement | null) => {
    console.log('📍 Container callback triggered:', !!node);
    
    if (node) {
      mapContainer.current = node;
      
      // Use requestAnimationFrame to ensure the element is fully rendered
      requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        console.log('📐 Container dimensions after RAF:', rect.width, 'x', rect.height);
        
        if (rect.width > 0 && rect.height > 0) {
          console.log('✅ Container is ready with dimensions');
          setContainerReady(true);
        } else {
          console.log('⏳ Container has no dimensions yet');
          // Try again after a short delay
          setTimeout(() => {
            const newRect = node.getBoundingClientRect();
            console.log('📐 Container dimensions after delay:', newRect.width, 'x', newRect.height);
            if (newRect.width > 0 && newRect.height > 0) {
              setContainerReady(true);
            }
          }, 100);
        }
      });
    } else {
      mapContainer.current = null;
      setContainerReady(false);
    }
  }, []);

  // Fetch Mapbox token
  useEffect(() => {
    const fetchToken = async () => {
      try {
        console.log('🔑 Fetching Mapbox token...');
        const response = await fetch('https://yknmcddrfkggphrktivd.supabase.co/functions/v1/mapbox-token', {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Token fetch failed: ${response.status}`);
        }

        const data = await response.json();
        if (data.token) {
          console.log('✅ Token fetched successfully');
          setMapboxToken(data.token);
          mapboxgl.accessToken = data.token;
        } else {
          throw new Error('No token in response');
        }
      } catch (err) {
        console.error('❌ Token fetch error:', err);
        setError('Failed to load map token');
        setIsLoading(false);
      }
    };

    fetchToken();
  }, []);

  // Initialize map when both container and token are ready
  useEffect(() => {
    // Skip if running on server side
    if (typeof window === 'undefined') return;
    
    const container = mapContainer.current;
    console.log('🎯 Map init check - Container:', !!container, 'ContainerReady:', containerReady, 'Token:', !!mapboxToken, 'Map exists:', !!mapInstance.current);

    if (!container || !containerReady || !mapboxToken || mapInstance.current) {
      console.log('⏳ Waiting for prerequisites...');
      return;
    }

    // Double-check container dimensions
    const rect = container.getBoundingClientRect();
    console.log('📐 Final dimension check:', rect.width, 'x', rect.height);
    
    if (rect.width === 0 || rect.height === 0) {
      console.log('⏳ Container still has no dimensions');
      return;
    }

    console.log('🚀 Initializing map with all prerequisites met...');

    try {
      // Create map instance
      mapInstance.current = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-3.4, 55.3], // UK center
        zoom: 4.5,
        attributionControl: false,
      });

      console.log('✅ Map instance created');

      // Add controls
      mapInstance.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      mapInstance.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

      // Handle map load - THIS IS WHERE WE HIDE SPINNER AND ADD MARKERS
      mapInstance.current.on('load', () => {
        console.log('🎉 Map loaded successfully!');
        setIsLoading(false);  // Hide spinner
        setError(null);
        
        // Add markers for tournaments
        addTournamentMarkers();
      });

      // Handle map errors
      mapInstance.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setError(`Map error: ${e.error?.message || 'Unknown error'}`);
        setIsLoading(false);
      });

    } catch (err) {
      console.error('💥 Map initialization error:', err);
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setIsLoading(false);
    }
  }, [mapboxToken, containerReady]);

  // Add tournament markers
  const addTournamentMarkers = () => {
    if (!mapInstance.current) {
      console.log('No map instance for markers');
      return;
    }

    console.log('📍 Adding markers for', tournaments.length, 'tournaments');

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    if (tournaments.length === 0) {
      console.log('No tournaments to display');
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();

    tournaments.forEach((tournament) => {
      if (!tournament.location?.coordinates) {
        console.log('Tournament missing coordinates:', tournament.name);
        return;
      }

      const [lng, lat] = tournament.location.coordinates;
      console.log('Creating marker for:', tournament.name, 'at', lng, lat);
      
      // Create marker element
      const markerEl = document.createElement('div');
      markerEl.className = 'tournament-marker';
      markerEl.innerHTML = `
        <div style="
          width: 24px;
          height: 24px;
          background: hsl(var(--primary));
          border: 2px solid white;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
        </div>
      `;

      // Add click handler
      markerEl.addEventListener('click', () => {
        console.log('Marker clicked:', tournament.name);
        onTournamentSelect(tournament);
      });

      // Create and add marker
      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .addTo(mapInstance.current!);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    // Fit map to show all markers
    if (markersRef.current.length > 0) {
      mapInstance.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10
      });
      console.log('✅ Map fitted to', markersRef.current.length, 'markers');
    }
  };

  // Update markers when tournaments change (but only after map is loaded)
  useEffect(() => {
    if (mapInstance.current && !isLoading) {
      console.log('🔄 Updating markers for tournament change');
      addTournamentMarkers();
    }
  }, [tournaments, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance.current) {
        console.log('🧹 Cleaning up map');
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

  if (isLoading) {
    return (
      <div 
        className="relative w-full bg-surface border rounded-lg shadow-lg flex items-center justify-center"
        style={{ height: '520px', width: '100%' }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="relative w-full bg-surface border rounded-lg shadow-lg flex items-center justify-center"
        style={{ height: '520px', width: '100%' }}
      >
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">Map Error</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="default"
                size="sm"
                className="w-full"
              >
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="relative w-full rounded-lg overflow-hidden shadow-lg border"
      style={{ height: '520px', width: '100%' }}
    >
      <div 
        ref={mapContainerCallback}
        className="w-full h-full"
        style={{ 
          width: '100%',
          height: '520px'
        }}
      />
      
      {selectedTournament && (
        <div className="absolute top-4 left-4 right-4 z-10">
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
      
      {!isLoading && tournaments.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-background/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm font-medium shadow-lg">
            {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} found
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;