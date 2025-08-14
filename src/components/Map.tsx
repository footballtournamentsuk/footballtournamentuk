import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tournament } from '@/types/tournament';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Replace this with your actual Mapbox public token
const MAPBOX_TOKEN = 'pk.eyJ1IjoiY29hY2huZWFycHJvIiwiYSI6ImNtZWJhMXkxcjE3ZGwyeHM4NGJndnNlencifQ.OxMuFpP8dZEXRySYIp5Icg';

interface MapProps {
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onTournamentSelect: (tournament: Tournament | null) => void;
}

const Map: React.FC<MapProps> = ({ tournaments, selectedTournament, onTournamentSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
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

  const initializeMap = () => {
    console.log('=== initializeMap called ===');
    console.log('mapContainer.current:', mapContainer.current);
    console.log('map.current:', map.current);
    console.log('MAPBOX_TOKEN:', MAPBOX_TOKEN);
    
    if (!mapContainer.current) {
      console.log('ERROR: No map container found');
      setError('Map container element not found');
      setIsLoading(false);
      return;
    }
    
    if (map.current) {
      console.log('Map already exists, skipping initialization');
      return;
    }

    console.log('Setting mapbox access token...');
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-2.5, 54.5], // Center on UK
        zoom: 5.5,
        pitch: 0,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({
          visualizePitch: false,
        }),
        'top-right'
      );

      map.current.on('load', () => {
        console.log('Map loaded successfully');
        setIsLoading(false);
        addTournamentMarkers();
      });

      map.current.on('error', (e) => {
        console.error('Map error:', e);
        setError('Failed to load map. Please check your Mapbox token.');
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map. Please check your Mapbox token.');
      setIsLoading(false);
    }
  };

  const addTournamentMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    tournaments.forEach(tournament => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.className = 'tournament-marker';
      markerElement.innerHTML = `
        <div class="w-8 h-8 bg-primary rounded-full border-2 border-white shadow-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
          <div class="w-3 h-3 bg-white rounded-full"></div>
        </div>
      `;

      const marker = new mapboxgl.Marker(markerElement)
        .setLngLat(tournament.location.coordinates)
        .addTo(map.current!);

      // Add click event to marker
      markerElement.addEventListener('click', () => {
        onTournamentSelect(tournament);
        // Fly to tournament location
        map.current?.flyTo({
          center: tournament.location.coordinates,
          zoom: 12,
          duration: 1000
        });
      });

      markers.current.push(marker);
    });
  };

  useEffect(() => {
    console.log('=== Map Component Mounted ===');
    console.log('mapContainer ref available:', !!mapContainer.current);
    
    // Use requestAnimationFrame to ensure DOM is fully ready
    const initMap = () => {
      console.log('=== Initializing Map ===');
      console.log('Container at init time:', mapContainer.current);
      
      if (mapContainer.current) {
        console.log('Container found, proceeding with map creation');
        initializeMap();
      } else {
        console.error('Container element not found after DOM ready');
        setError('Map container element not available');
        setIsLoading(false);
      }
    };

    requestAnimationFrame(() => {
      setTimeout(initMap, 100);
    });
  }, []);

  useEffect(() => {
    console.log('=== Tournament data changed ===');
    console.log('Map exists:', !!map.current);
    console.log('Tournament count:', tournaments.length);
    
    if (map.current && tournaments.length > 0) {
      console.log('Adding tournament markers');
      addTournamentMarkers();
    }
  }, [tournaments]);

  useEffect(() => {
    return () => {
      console.log('=== Map component unmounting ===');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="relative w-full h-[600px] bg-surface rounded-lg shadow-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative w-full h-[600px] bg-surface rounded-lg shadow-lg flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <MapPin className="w-12 h-12 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">Map Configuration Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                To display the interactive map, please replace the placeholder token in the Map component with your Mapbox public access token.
              </p>
              <div className="bg-muted p-3 rounded text-xs font-mono mb-4">
                MAPBOX_TOKEN = 'pk.your-actual-token-here'
              </div>
              <p className="text-xs text-muted-foreground">
                Get your free token at{' '}
                <a 
                  href="https://mapbox.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg bg-surface">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full" 
        style={{ minHeight: '600px' }}
      />
      
      {selectedTournament && (
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-lg">
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
    </div>
  );
};

export default Map;