import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Globe, Loader2, CheckCircle, XCircle, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ParserResult {
  success: boolean;
  message: string;
  saved?: number;
  extracted?: number;
  upcoming?: number;
  errors?: Array<{ tournament: string; error: string }>;
}

export const TournamentParser: React.FC = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ParserResult | null>(null);
  const { toast } = useToast();

  const exampleUrls = [
    'https://www.thefa.com/competitions',
    'https://www.londonfootball.com/fixtures-results',
    'https://www.yorkshirefa.com/competitions'
  ];

  const handleParse = async () => {
    if (!url.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a URL',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🚀 Starting tournament parsing for:', url);

      const { data, error } = await supabase.functions.invoke('parse-tournaments', {
        body: { url: url.trim() }
      });

      if (error) {
        throw error;
      }

      console.log('✅ Parsing complete:', data);
      setResult(data);

      if (data.success && data.saved > 0) {
        toast({
          title: 'Success',
          description: `${data.saved} tournament${data.saved !== 1 ? 's' : ''} added to moderation queue`,
        });
      } else if (!data.success) {
        toast({
          title: 'No Tournaments Found',
          description: data.message || 'Could not find any upcoming tournaments on this page',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('❌ Error parsing tournaments:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to parse tournaments',
        variant: 'destructive',
      });
      setResult({
        success: false,
        message: error.message || 'Failed to parse tournaments'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Auto-Parse Tournaments from County FA Websites
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This tool uses AI to automatically extract upcoming tournament information from County FA websites. 
              All parsed tournaments will be added to the moderation queue for your review before publication.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://www.countyfootball.com/tournaments"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Enter the URL of a County FA tournaments or fixtures page
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Example URLs to try:</Label>
            <div className="flex flex-wrap gap-2">
              {exampleUrls.map((exampleUrl) => (
                <Button
                  key={exampleUrl}
                  variant="outline"
                  size="sm"
                  onClick={() => setUrl(exampleUrl)}
                  disabled={loading}
                  className="text-xs"
                >
                  {new URL(exampleUrl).hostname}
                </Button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleParse}
            disabled={loading || !url.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Parsing Website...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Parse Tournaments
              </>
            )}
          </Button>

          {result && (
            <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-start gap-2">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                      {result.message}
                    </p>
                    
                    {result.extracted !== undefined && result.upcoming !== undefined && (
                      <div className="mt-2 space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Found {result.extracted} tournament{result.extracted !== 1 ? 's' : ''} total, 
                          {result.upcoming} upcoming
                        </p>
                      </div>
                    )}

                    {result.saved && result.saved > 0 && (
                      <div className="mt-2 flex gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          {result.saved} Added to Moderation
                        </Badge>
                      </div>
                    )}

                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-3 p-3 bg-red-100 rounded-md">
                        <p className="text-sm font-medium text-red-900 mb-2">
                          Errors ({result.errors.length}):
                        </p>
                        <ul className="text-xs text-red-800 space-y-1">
                          {result.errors.map((err, idx) => (
                            <li key={idx}>
                              <span className="font-medium">{err.tournament}:</span> {err.error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">How it works:</h4>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li>AI fetches and analyzes the website content</li>
              <li>Extracts tournament details (dates, location, age groups, etc.)</li>
              <li>Geocodes addresses to map coordinates</li>
              <li>Saves tournaments as unpublished (pending your approval)</li>
              <li>You review and approve tournaments in the "Pending" tab</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
