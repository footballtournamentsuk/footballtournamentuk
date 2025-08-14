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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const addTournamentMarkers = () => {
    if (!map.current) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    console.log('Adding markers for tournaments:', tournaments.length);

    tournaments.forEach(tournament => {
      // Create custom marker element
      const markerElement = document.createElement('div');
      markerElement.style.cssText = `
        width: 32px;
        height: 32px;
        background-color: #3b82f6;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: transform 0.2s ease;
      `;
      
      const innerDot = document.createElement('div');
      innerDot.style.cssText = `
        width: 12px;
        height: 12px;
        background-color: white;
        border-radius: 50%;
      `;
      markerElement.appendChild(innerDot);

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

      markerElement.addEventListener('mouseenter', () => {
        markerElement.style.transform = 'scale(1.15)';
      });

      markerElement.addEventListener('mouseleave', () => {
        markerElement.style.transform = 'scale(1)';
      });

      markers.current.push(marker);
    });

    console.log('✅ Added', markers.current.length, 'tournament markers');
  };

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    console.log('🗺️ Starting map initialization...');
    console.log('Container element:', mapContainer.current);
    
    // Set Mapbox access token
    mapboxgl.accessToken = 'pk.eyJ1IjoiY29hY2huZWFycHJvIiwiYSI6ImNtZWJhMXkxcjE3ZGwyeHM4NGJndnNlencifQ.OxMuFpP8dZEXRySYIp5Icg';
    
    try {
      // Create the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-2.5, 54.5], // Center on UK
        zoom: 5.5,
        projection: 'mercator'
      });

      console.log('✅ Map instance created');

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Set up event listeners
      map.current.on('load', () => {
        console.log('✅ Map fully loaded and ready');
        setIsLoading(false);
        setError(null);
        
        // Add tournament markers if we have tournaments
        if (tournaments.length > 0) {
          console.log('Adding tournament markers on map load...');
          addTournamentMarkers();
        }
      });

      map.current.on('error', (e) => {
        console.error('❌ Mapbox error:', e.error);
        setError(`Map error: ${e.error?.message || 'Unknown error'}`);
        setIsLoading(false);
      });

      map.current.on('sourcedata', (e) => {
        if (e.isSourceLoaded) {
          console.log('Map source loaded:', e.sourceId);
        }
      });

    } catch (error) {
      console.error('❌ Error creating map:', error);
      setError(`Failed to create map: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setIsLoading(false);
    }

    // Cleanup function
    return () => {
      console.log('🧹 Cleaning up map...');
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Update markers when tournaments change
  useEffect(() => {
    if (map.current && !isLoading && tournaments.length > 0) {
      console.log('Tournaments updated, refreshing markers...');
      addTournamentMarkers();
    }
  }, [tournaments, isLoading]);

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
            <div className="text-center">
              <MapPin className="w-12 h-12 text-destructive mx-auto mb-2" />
              <h3 className="text-lg font-semibold mb-2">Map Error</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {error}
              </p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline"
                size="sm"
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
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      <div 
        ref={mapContainer} 
        className="absolute inset-0 w-full h-full bg-gray-100" 
        style={{ 
          minHeight: '600px',
          width: '100%',
          height: '100%'
        }}
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