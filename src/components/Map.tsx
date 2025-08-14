import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Tournament } from '@/types/tournament';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Calendar, Users, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapProps {
  tournaments: Tournament[];
  selectedTournament?: Tournament | null;
  onTournamentSelect: (tournament: Tournament | null) => void;
}

const Map: React.FC<MapProps> = ({ tournaments, selectedTournament, onTournamentSelect }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const fetchMapboxToken = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/get-mapbox-token');
      
      if (!response.ok) {
        throw new Error('Failed to fetch Mapbox token');
      }
      
      const data = await response.json();
      if (data.token) {
        setMapboxToken(data.token);
        setError(null);
      } else {
        throw new Error('No token found');
      }
    } catch (err) {
      console.error('Error fetching Mapbox token:', err);
      setError('Mapbox token not configured. Please set it up in the admin settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const initializeMap = (token: string) => {
    if (!mapContainer.current || map.current) return;

    mapboxgl.accessToken = token;
    
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
        addTournamentMarkers();
      });

    } catch (error) {
      console.error('Error initializing map:', error);
      setError('Failed to initialize map. Please check your Mapbox token.');
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
    fetchMapboxToken();
  }, []);

  useEffect(() => {
    if (mapboxToken) {
      initializeMap(mapboxToken);
    }
  }, [mapboxToken]);

  useEffect(() => {
    if (map.current && tournaments.length > 0) {
      addTournamentMarkers();
    }
  }, [tournaments, onTournamentSelect]);

  useEffect(() => {
    return () => {
      map.current?.remove();
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
                {error}
              </p>
            </div>
            <Button asChild className="w-full">
              <a href="/settings">
                Go to Admin Settings
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
      
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