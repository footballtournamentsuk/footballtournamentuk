import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tournament } from '@/types/tournament';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Trophy, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Set Mapbox access token immediately
mapboxgl.accessToken = 'pk.eyJ1IjoiY29hY2huZWFycHJvIiwiYSI6ImNtZWJhMXkxcjE3ZGwyeHM4NGJndnNlencifQ.OxMuFpP8dZEXRySYIp5Icg';

interface MapProps {
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onTournamentSelect: (tournament: Tournament | null) => void;
}

const Map: React.FC<MapProps> = ({ tournaments, selectedTournament, onTournamentSelect }) => {
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Callback ref to handle container mounting
  const mapContainerCallback = useCallback((node: HTMLDivElement | null) => {
    if (!node || map.current) return;

    console.log('✅ Map container mounted, initializing map...');
    console.log('Mapbox token:', mapboxgl.accessToken ? 'Set' : 'Missing');
    
    try {
      // Create map
      map.current = new mapboxgl.Map({
        container: node,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-3.0, 54.5], // UK center
        zoom: 5.5,
        projection: 'mercator',
        attributionControl: false
      });

      console.log('Map instance created successfully');

      // Add controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right');

      // Map load event
      map.current.on('load', () => {
        console.log('✅ Map loaded successfully');
        setIsLoading(false);
        setError(null);
        
        // Add markers after map loads
        if (tournaments.length > 0) {
          createTournamentMarkers();
        }
      });

      // Error handling
      map.current.on('error', (e) => {
        console.error('❌ Map error:', e);
        setError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      });

      // Style load event for additional debugging
      map.current.on('style.load', () => {
        console.log('Map style loaded');
      });

    } catch (error) {
      console.error('❌ Map initialization error:', error);
      setError(error instanceof Error ? error.message : 'Failed to initialize map');
      setIsLoading(false);
    }
  }, [tournaments]);

  // Update markers when tournaments change
  useEffect(() => {
    if (map.current && !isLoading && tournaments.length > 0) {
      console.log('Tournaments updated, creating markers...');
      createTournamentMarkers();
    }
  }, [tournaments, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map.current) {
        console.log('🧹 Cleaning up map');
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

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
          position: 'relative'
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