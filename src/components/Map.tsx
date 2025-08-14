import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tournament } from '@/types/tournament';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mapbox token will be fetched from edge function
console.log('🔧 Map component initializing...');
console.log('📦 Mapbox GL version:', mapboxgl.version);
console.log('🌐 Mapbox supported:', mapboxgl.supported());

interface MapProps {
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onTournamentSelect: (tournament: Tournament | null) => void;
}

const Map: React.FC<MapProps> = ({ tournaments, selectedTournament, onTournamentSelect }) => {
  console.log('🗺️ Map component rendering with', tournaments.length, 'tournaments');
  
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [containerMounted, setContainerMounted] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const createTournamentMarkers = () => {
    if (!map.current) return;

    console.log('Creating markers for', tournaments.length, 'tournaments');
    
    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    tournaments.forEach((tournament, index) => {
      console.log(`Creating marker ${index + 1}:`, tournament.name, tournament.location.coordinates);
      
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'tournament-marker';
      markerElement.style.cssText = `
        width: 24px;
        height: 24px;
        background-color: #3b82f6;
        border-radius: 50%;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      `;
      
      const innerDot = document.createElement('div');
      innerDot.style.cssText = `
        width: 8px;
        height: 8px;
        background-color: white;
        border-radius: 50%;
      `;
      markerElement.appendChild(innerDot);

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(tournament.location.coordinates)
        .addTo(map.current!);

      // Add click event
      markerElement.addEventListener('click', () => {
        console.log('Marker clicked:', tournament.name);
        onTournamentSelect(tournament);
      });

      markers.current.push(marker);
    });

    console.log('✅ Created', markers.current.length, 'markers');
  };

  // Fetch Mapbox token from edge function with fallback
  useEffect(() => {
    const fetchMapboxToken = async () => {
      try {
        console.log('🔑 Fetching Mapbox token from edge function...');
        
        // First try the edge function
        try {
          const response = await fetch(`https://yknmcddrfkggphrktivd.supabase.co/functions/v1/mapbox-token`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          console.log('📡 Token response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('📦 Token response data:', { success: data.success, hasToken: !!data.token });
            
            if (data.token && !data.error) {
              console.log('✅ Mapbox token fetched successfully from edge function:', data.token.substring(0, 20) + '...');
              setMapboxToken(data.token);
              mapboxgl.accessToken = data.token;
              console.log('✅ Mapbox global token set');
              return;
            }
          }
        } catch (edgeFunctionError) {
          console.warn('⚠️ Edge function failed, trying fallback...', edgeFunctionError);
        }
        
        // Fallback: Use the direct token
        console.log('🔄 Using fallback token...');
        const fallbackToken = 'pk.eyJ1IjoidG91cm5hbWVudCIsImEiOiJjbWViZTYwaXYxM3d0MnFzaG5xdzRzc3YxIn0.PhoACBcRkMmbG6TNv6WP5Q';
        setMapboxToken(fallbackToken);
        mapboxgl.accessToken = fallbackToken;
        console.log('✅ Fallback token set successfully');
        
      } catch (error) {
        console.error('❌ All token fetch methods failed:', error);
        setError(`Failed to load map token: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    fetchMapboxToken();
  }, []);

  // Callback ref to detect when container is mounted
  const mapContainerCallback = useCallback((node: HTMLDivElement | null) => {
    console.log('📍 Map container callback triggered with node:', !!node);
    if (node) {
      console.log('📍 Map container mounted, dimensions:', node.offsetWidth, 'x', node.offsetHeight);
      mapContainer.current = node;
      setContainerMounted(true);
    } else {
      mapContainer.current = null;
      setContainerMounted(false);
    }
  }, []);

  // Initialize map when both container and token are ready
  useEffect(() => {
    const container = mapContainer.current;
    console.log('🎯 Map initialization check - Container:', !!container, 'ContainerMounted:', containerMounted, 'Token:', !!mapboxToken, 'Map exists:', !!map.current);
    
    if (!container || !containerMounted || !mapboxToken || map.current) {
      console.log('⏳ Map initialization waiting...');
      return;
    }

    // Ensure container has proper dimensions
    if (container.offsetWidth === 0 || container.offsetHeight === 0) {
      console.log('⏳ Container not ready (no dimensions)', container.offsetWidth, 'x', container.offsetHeight);
      return;
    }

    console.log('🚀 Starting map initialization...');
    console.log('🔑 Mapbox token check:', mapboxgl.accessToken);
    console.log('🎯 Container dimensions:', container.offsetWidth, 'x', container.offsetHeight);
    console.log('🌍 Mapbox supported check:', mapboxgl.supported());
    
    if (!mapboxgl.supported()) {
      console.error('❌ Mapbox GL is not supported in this browser');
      setError('Your browser does not support Mapbox GL. Please try a different browser.');
      setIsLoading(false);
      return;
    }

    try {
      console.log('🎨 Creating Mapbox map instance...');
      
      // Create map with extensive logging
      map.current = new mapboxgl.Map({
        container: container,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-3.0, 54.5], // UK center
        zoom: 5.5,
        projection: 'mercator',
        attributionControl: false,
        trackResize: true
      });

      console.log('✅ Map instance created:', map.current);
      console.log('📍 Map container:', map.current.getContainer());
    
      // Add controls with logging
      console.log('🎮 Adding map controls...');
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
      console.log('✅ Controls added');

      // Set up all event listeners with detailed logging
      console.log('📡 Setting up event listeners...');
      
      map.current.on('load', () => {
        console.log('🎉 MAP LOAD EVENT FIRED - Map fully loaded!');
        console.log('📊 Map loaded state:', map.current?.loaded());
        setIsLoading(false);
        setError(null);
        
        // Add markers after map loads
        if (tournaments.length > 0) {
          console.log('🎯 Adding markers after map load...');
          createTournamentMarkers();
        } else {
          console.log('📍 No tournaments to add markers for');
        }
      });

      // Comprehensive error handling
      map.current.on('error', (e) => {
        console.error('❌❌ MAP ERROR EVENT:', e);
        console.error('Error details:', e.error);
        console.error('Error message:', e.error?.message);
        console.error('Error stack:', e.error?.stack);
        setError(`Map error: ${e.error?.message || 'Failed to load map tiles'}`);
        setIsLoading(false);
      });

      // Additional debugging events
      map.current.on('style.load', () => {
        console.log('🎨 Map style loaded successfully');
      });
      
      map.current.on('sourcedata', (e) => {
        console.log('📡 Source data event:', e.sourceId, 'loaded:', e.isSourceLoaded);
      });
      
      map.current.on('data', (e) => {
        console.log('📊 Data event:', e.type);
      });
      
      map.current.on('idle', () => {
        console.log('😴 Map is idle');
      });

    } catch (error) {
      console.error('💥💥 CRITICAL MAP INITIALIZATION ERROR:');
      console.error('Error type:', typeof error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('Full error object:', error);
      
      setError(`Critical map error: ${error instanceof Error ? error.message : 'Unknown initialization error'}`);
      setIsLoading(false);
    }
  }, [mapboxToken, containerMounted, tournaments]);

  // Update markers when tournaments change with logging
  useEffect(() => {
    console.log('🔄 Tournament effect triggered. Loading:', isLoading, 'Tournament count:', tournaments.length);
    
    if (map.current && !isLoading && tournaments.length > 0) {
      console.log('🎯 Conditions met, creating markers...');
      createTournamentMarkers();
    } else {
      console.log('⏸️ Skipping marker creation. Map exists:', !!map.current, 'Not loading:', !isLoading, 'Has tournaments:', tournaments.length > 0);
    }
  }, [tournaments, isLoading]);

  // Cleanup on unmount with logging
  useEffect(() => {
    console.log('🧹 Map cleanup effect registered');
    
    return () => {
      console.log('🧹 Cleaning up map component...');
      if (map.current) {
        console.log('🗑️ Removing map instance');
        map.current.remove();
        map.current = null;
        console.log('✅ Map cleanup complete');
      } else {
        console.log('ℹ️ No map to clean up');
      }
    };
  }, []);

  console.log('🎭 Map component render state - Loading:', isLoading, 'Error:', error);

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] bg-background border rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
          <p className="text-xs text-muted-foreground mt-2">
            Connecting to Mapbox servers...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[600px] bg-background border rounded-lg shadow-lg flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">Map Error</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error}
              </p>
              <div className="space-y-2">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="default"
                  size="sm"
                  className="w-full"
                >
                  Reload Page
                </Button>
                <p className="text-xs text-muted-foreground">
                  If the problem persists, please check your internet connection.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg border">
      <div 
        ref={mapContainerCallback}
        className="w-full h-full"
        style={{ 
          width: '100%',
          height: '600px',
          position: 'relative',
          minHeight: '600px'
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