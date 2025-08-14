import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings, MapPin, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const SettingsPage = () => {
  const [mapboxToken, setMapboxToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSaveMapboxToken = async () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox token",
        variant: "destructive",
      });
      return;
    }

    if (!mapboxToken.startsWith('pk.')) {
      toast({
        title: "Invalid Token",
        description: "Mapbox public tokens should start with 'pk.'",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('save-mapbox-token', {
        body: { token: mapboxToken }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Mapbox token saved successfully! The map will now display correctly.",
      });
      
      setMapboxToken('');
      
      // Reload the page to refresh the map with the new token
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Error saving token:', error);
      toast({
        title: "Error",
        description: "Failed to save Mapbox token. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Settings className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Admin Settings</h1>
              <p className="text-muted-foreground">Manage your platform configuration</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Mapbox Configuration */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <CardTitle>Map Configuration</CardTitle>
                </div>
                <CardDescription>
                  Configure your Mapbox settings to display the interactive tournament map.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mapbox-token">Mapbox Public Access Token</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="mapbox-token"
                        type={showToken ? "text" : "password"}
                        placeholder="pk.your-mapbox-token-here"
                        value={mapboxToken}
                        onChange={(e) => setMapboxToken(e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <Button 
                      onClick={handleSaveMapboxToken}
                      disabled={isLoading || !mapboxToken.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {isLoading ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get your free Mapbox token at{' '}
                    <a 
                      href="https://mapbox.com/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      mapbox.com
                    </a>
                    {' '}after creating an account.
                  </p>
                </div>

                <div className="bg-surface p-4 rounded-lg border-l-4 border-primary">
                  <h4 className="font-semibold mb-2">How to get your Mapbox token:</h4>
                  <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                    <li>Go to <a href="https://mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mapbox.com</a> and create a free account</li>
                    <li>Navigate to your Account Dashboard</li>
                    <li>Find the "Access tokens" section</li>
                    <li>Copy your "Default public token" (starts with pk.)</li>
                    <li>Paste it in the field above and click Save</li>
                  </ol>
                </div>
              </CardContent>
            </Card>

            {/* Back to Home */}
            <div className="flex justify-center">
              <Button variant="outline" asChild>
                <a href="/">
                  ← Back to Homepage
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;