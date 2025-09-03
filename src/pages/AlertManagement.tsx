import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Mail, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/hooks/useAnalyticsEvents';
import { SEO } from '@/components/SEO';

interface TournamentAlert {
  id: string;
  email: string;
  filters: any;
  frequency: 'daily' | 'weekly' | 'instant';
  is_active: boolean;
  verified_at: string | null;
  created_at: string;
  last_sent_at: string | null;
}

export default function AlertManagement() {
  const { managementToken } = useParams<{ managementToken: string }>();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<TournamentAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!managementToken) {
      navigate('/');
      return;
    }
    
    fetchAlerts();
  }, [managementToken, navigate]);

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('alerts-manage', {
        body: { action: 'list', managementToken }
      });

      if (error) throw error;
      
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Unable to load alerts. Please check your link and try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateAlert = async (alertId: string, updates: Partial<TournamentAlert>) => {
    try {
      const { error } = await supabase.functions.invoke('alerts-manage', {
        body: { 
          action: 'update', 
          managementToken, 
          alertId, 
          updates 
        }
      });

      if (error) throw error;

      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, ...updates } : alert
      ));

      toast({
        title: "Alert updated",
        description: "Your alert preferences have been saved."
      });
    } catch (error) {
      console.error('Error updating alert:', error);
      toast({
        title: "Update failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const deleteAlert = async (alertId: string) => {
    try {
      const { error } = await supabase.functions.invoke('alerts-manage', {
        body: { 
          action: 'delete', 
          managementToken, 
          alertId 
        }
      });

      if (error) throw error;

      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
      
      trackEvent('alert_unsubscribed', { reason: 'user' });
      
      toast({
        title: "Alert deleted",
        description: "You will no longer receive this alert."
      });
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast({
        title: "Delete failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const unsubscribeAll = async () => {
    try {
      const { error } = await supabase.functions.invoke('alerts-manage', {
        body: { 
          action: 'unsubscribe_all', 
          managementToken 
        }
      });

      if (error) throw error;

      trackEvent('alert_unsubscribed', { reason: 'global' });
      
      toast({
        title: "Unsubscribed from all alerts",
        description: "You will no longer receive any tournament alerts."
      });
      
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Unsubscribe failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const getFilterSummary = (filters: any) => {
    const summary = [];
    
    // Parse filters if they're stored as strings (common when saved to DB)
    let parsedFilters = filters;
    if (typeof filters === 'string') {
      try {
        parsedFilters = JSON.parse(filters);
      } catch (e) {
        console.warn('Failed to parse filters:', e);
        parsedFilters = {};
      }
    }
    
    // Search query
    if (parsedFilters.search) {
      summary.push(`🔍 "${parsedFilters.search}"`);
    }
    
    // Location handling - improved to match modal format
    if (parsedFilters.location) {
      let locationText = '';
      const location = parsedFilters.location;
      
      if (typeof location === 'string') {
        // Handle legacy string format
        locationText = location;
      } else if (location.postcode) {
        // Postcode with radius format: "M1 1WR (50 miles)"
        const radius = location.radius;
        locationText = `${location.postcode}${radius ? ` (${radius} miles)` : ''}`;
      } else if (location.city) {
        // City with optional region: "Manchester" or "Manchester • Greater Manchester"  
        locationText = location.region && location.region !== location.city 
          ? `${location.city} • ${location.region}`
          : location.city;
      } else if (location.coordinates && Array.isArray(location.coordinates) && location.coordinates.length >= 2) {
        // Fallback for coordinates
        locationText = `${location.coordinates[1]?.toFixed(4)}, ${location.coordinates[0]?.toFixed(4)}`;
      }
      
      if (locationText) {
        summary.push(`📍 ${locationText}`);
      }
    }
    
    // Handle city-based alerts (from Hero/city pages) - improved format
    if (parsedFilters.city && !parsedFilters.location) {
      let cityText = parsedFilters.city;
      if (parsedFilters.region && parsedFilters.region !== parsedFilters.city) {
        cityText = `${parsedFilters.city} • ${parsedFilters.region}`;
      }
      summary.push(`📍 ${cityText}`);
    }
    
    // Date range
    if (parsedFilters.dateRange?.start || parsedFilters.dateRange?.end) {
      const start = parsedFilters.dateRange.start ? new Date(parsedFilters.dateRange.start).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }) : null;
      const end = parsedFilters.dateRange.end ? new Date(parsedFilters.dateRange.end).toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }) : null;
      
      if (start && end && start !== end) {
        summary.push(`📅 ${start} - ${end}`);
      } else if (start) {
        summary.push(`📅 From ${start}`);
      } else if (end) {
        summary.push(`📅 Until ${end}`);
      }
    }
    
    // Price range - improved to match modal format
    if (parsedFilters.priceRange || (parsedFilters.minPrice !== undefined || parsedFilters.maxPrice !== undefined)) {
      let priceText = '💰 ';
      
      // Check both priceRange object and direct min/maxPrice fields
      const priceRange = parsedFilters.priceRange || {};
      const min = priceRange.min ?? parsedFilters.minPrice;
      const max = priceRange.max ?? parsedFilters.maxPrice;
      const includeFree = priceRange.includeFree;
      
      // Check if min/max are valid numbers (not null, undefined, or NaN)
      const validMin = typeof min === 'number' && !isNaN(min) && min >= 0;
      const validMax = typeof max === 'number' && !isNaN(max) && max >= 0;
      
      if (min === 0 && max === 0) {
        priceText += 'Free';
      } else if (includeFree && !validMin && !validMax) {
        priceText += 'Free tournaments';
      } else if (validMin && validMax && min === max) {
        priceText += `£${min}`;
      } else if (validMin && validMax) {
        priceText += `£${min} - £${max}`;
        if (includeFree) priceText += ' (inc. free)';
      } else if (validMin) {
        priceText += `From £${min}`;
        if (includeFree) priceText += ' (inc. free)';
      } else if (validMax) {
        priceText += `Up to £${max}`;
        if (includeFree) priceText += ' (inc. free)';
      } else if (includeFree) {
        priceText += 'Free tournaments';
      }
      
      if (priceText !== '💰 ') {
        summary.push(priceText);
      }
    }
    
    // Format
    if (parsedFilters.format?.length) {
      summary.push(`⚽ ${parsedFilters.format.join(', ')}`);
    }
    
    // Age groups
    if (parsedFilters.ageGroups?.length) {
      summary.push(`👥 ${parsedFilters.ageGroups.join(', ')}`);
    }
    
    // Team types
    if (parsedFilters.teamTypes?.length) {
      const teamTypeLabels = parsedFilters.teamTypes.map((type: string) => {
        switch (type) {
          case 'boys': return 'Boys';
          case 'girls': return 'Girls';
          case 'mixed': return 'Mixed';
          default: return type;
        }
      });
      summary.push(`👨‍👩‍👧‍👦 ${teamTypeLabels.join(', ')}`);
    }
    
    // Tournament type
    if (parsedFilters.type?.length) {
      summary.push(`🏆 ${parsedFilters.type.join(', ')}`);
    }
    
    // Regions
    if (parsedFilters.regions?.length) {
      summary.push(`🗺️ ${parsedFilters.regions.join(', ')}`);
    }
    
    // Status
    if (parsedFilters.status?.length) {
      const statusLabels = parsedFilters.status.map((status: string) => {
        switch (status) {
          case 'registration_open': return 'Registration Open';
          case 'registration_closes_soon': return 'Registration Closing Soon';
          case 'registration_closed': return 'Registration Closed';
          case 'upcoming': return 'Upcoming';
          case 'ongoing': return 'Ongoing';
          case 'today': return 'Today';
          case 'tomorrow': return 'Tomorrow';
          case 'completed': return 'Completed';
          default: return status;
        }
      });
      summary.push(`🎯 ${statusLabels.join(', ')}`);
    }
    
    return summary.length > 0 ? summary : ['🔍 All tournaments'];
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <SEO 
          title="Alert Management - Error"
          description="Unable to access alert management"
        />
        <div className="max-w-2xl mx-auto text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Unable to Load Alerts</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>
            Return to Homepage
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SEO 
        title="Manage Tournament Alerts"
        description="Manage your tournament alert preferences"
      />
      
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Bell className="h-8 w-8 text-primary" />
            Manage Your Alerts
          </h1>
          <p className="text-muted-foreground">
            Control your tournament notification preferences
          </p>
        </div>

        {alerts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Mail className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No alerts found</h3>
              <p className="text-muted-foreground">
                You don't have any active tournament alerts.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        {alert.email}
                      </CardTitle>
                      <CardDescription>
                        Created {new Date(alert.created_at).toLocaleDateString()}
                        {alert.last_sent_at && (
                          <> • Last sent {new Date(alert.last_sent_at).toLocaleDateString()}</>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.verified_at ? (
                        <Badge variant="default" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Pending Verification</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filter Summary */}
                  <div>
                    <h4 className="font-medium mb-2">Alert Criteria:</h4>
                    <div className="flex flex-wrap gap-2">
                      {getFilterSummary(alert.filters).map((filter, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {filter}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={alert.is_active}
                          onCheckedChange={(checked) => 
                            updateAlert(alert.id, { is_active: checked })
                          }
                          disabled={!alert.verified_at}
                        />
                        <span className="text-sm">
                          {alert.is_active ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      
                      <Select
                        value={alert.frequency}
                        onValueChange={(value: 'daily' | 'weekly' | 'instant') => 
                          updateAlert(alert.id, { frequency: value })
                        }
                        disabled={!alert.verified_at}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="instant">Instant</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Alert</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this alert? You will no longer receive notifications for matching tournaments.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => deleteAlert(alert.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Global Unsubscribe */}
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Unsubscribe from All
                </CardTitle>
                <CardDescription>
                  Remove all alerts and stop receiving any tournament notifications.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive border-destructive/50">
                      Unsubscribe from All Alerts
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Unsubscribe from All Alerts</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete all your tournament alerts. You will stop receiving all email notifications.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={unsubscribeAll}
                        className="bg-destructive hover:bg-destructive/90"
                      >
                        Unsubscribe All
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}