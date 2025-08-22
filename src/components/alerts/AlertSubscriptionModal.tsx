import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Bell, Mail, Shield, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/hooks/useAnalyticsEvents';
import { TournamentFilters } from '@/types/tournament';

interface AlertSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: TournamentFilters;
  source: 'list' | 'city' | 'filters' | 'empty';
  cityName?: string;
}

export function AlertSubscriptionModal({ 
  isOpen, 
  onClose, 
  filters, 
  source,
  cityName 
}: AlertSubscriptionModalProps) {
  const [email, setEmail] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly'>('daily');
  const [hasConsented, setHasConsented] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !hasConsented) {
      toast({
        title: "Please complete all fields",
        description: "Email and consent are required to create your alert.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      trackEvent('alert_subscription_started', { source });
      
      const { error } = await supabase.functions.invoke('alerts', {
        body: {
          email,
          filters,
          frequency,
          source
        }
      });

      if (error) throw error;

      trackEvent('alert_subscription_completed', { 
        frequency, 
        channels: ['email'], 
        filters_summary: {
          hasSearch: !!filters.search,
          city: filters.location?.postcode || cityName,
          hasLocation: !!(filters.location?.postcode || cityName),
          radius: filters.location?.radius,
          format: filters.format?.length || 0,
          ageGroups: filters.ageGroups?.length || 0,
          teamTypes: filters.teamTypes?.length || 0,
          type: filters.type?.length || 0,
          regions: filters.regions?.length || 0,
          status: filters.status?.length || 0,
          hasDateRange: !!(filters.dateRange?.start || filters.dateRange?.end),
          hasPriceRange: !!(filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined || filters.priceRange?.includeFree)
        }
      });

      toast({
        title: "Alert created successfully!",
        description: "Please check your email and click the verification link to activate your tournament alerts."
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating alert:', error);
      toast({
        title: "Failed to create alert",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilterSummary = () => {
    const summary = [];
    
    // Search query
    if (filters.search) {
      summary.push(`🔍 "${filters.search}"`);
    }
    
    // Location with radius
    if (filters.location?.postcode || cityName) {
      const locationText = filters.location?.postcode || cityName;
      const radius = filters.location?.radius;
      summary.push(`📍 ${locationText}${radius ? ` (${radius} miles)` : ''}`);
    }
    
    // Date range
    if (filters.dateRange?.start || filters.dateRange?.end) {
      const start = filters.dateRange.start?.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
      const end = filters.dateRange.end?.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      });
      
      if (start && end && start !== end) {
        summary.push(`📅 ${start} - ${end}`);
      } else if (start) {
        summary.push(`📅 From ${start}`);
      } else if (end) {
        summary.push(`📅 Until ${end}`);
      }
    }
    
    // Price range
    if (filters.priceRange) {
      const { min, max, includeFree } = filters.priceRange;
      let priceText = '💰 ';
      
      if (includeFree && min === undefined && max === undefined) {
        priceText += 'Free tournaments';
      } else if (min !== undefined && max !== undefined) {
        priceText += `£${min} - £${max}`;
        if (includeFree) priceText += ' (inc. free)';
      } else if (min !== undefined) {
        priceText += `From £${min}`;
        if (includeFree) priceText += ' (inc. free)';
      } else if (max !== undefined) {
        priceText += `Up to £${max}`;
        if (includeFree) priceText += ' (inc. free)';
      } else if (includeFree) {
        priceText += 'Free tournaments';
      }
      
      summary.push(priceText);
    }
    
    // Format
    if (filters.format?.length) {
      summary.push(`⚽ ${filters.format.join(', ')}`);
    }
    
    // Age groups
    if (filters.ageGroups?.length) {
      summary.push(`👥 ${filters.ageGroups.join(', ')}`);
    }
    
    // Team types
    if (filters.teamTypes?.length) {
      const teamTypeLabels = filters.teamTypes.map(type => {
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
    if (filters.type?.length) {
      summary.push(`🏆 ${filters.type.join(', ')}`);
    }
    
    // Regions
    if (filters.regions?.length) {
      summary.push(`🗺️ ${filters.regions.join(', ')}`);
    }
    
    // Status
    if (filters.status?.length) {
      const statusLabels = filters.status.map(status => {
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
    
    return summary;
  };

  const filterSummary = getFilterSummary();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Create Tournament Alert
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Filter Summary */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              You'll receive alerts for tournaments matching:
            </Label>
            <div className="flex flex-wrap gap-2">
              {filterSummary.length > 0 ? (
                filterSummary.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {filter}
                  </Badge>
                ))
              ) : (
                <Badge variant="secondary" className="text-xs">
                  🔍 All tournaments
                </Badge>
              )}
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Frequency Selection */}
          <div className="space-y-3">
            <Label>How often would you like to receive alerts?</Label>
            <RadioGroup value={frequency} onValueChange={(value: 'daily' | 'weekly') => setFrequency(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="daily" id="daily" />
                <Label htmlFor="daily" className="font-normal">
                  Daily (8:00 AM UK time)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="weekly" id="weekly" />
                <Label htmlFor="weekly" className="font-normal">
                  Weekly (Sundays at 6:00 PM UK time)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* GDPR Consent */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg">
            <Checkbox
              id="consent"
              checked={hasConsented}
              onCheckedChange={(checked) => setHasConsented(checked === true)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="text-sm font-normal leading-relaxed cursor-pointer"
              >
                <Shield className="inline h-4 w-4 mr-1 text-primary" />
                I consent to receive tournament alerts via email. I understand I can unsubscribe at any time via the links in emails or by managing my alerts.
              </Label>
              <p className="text-xs text-muted-foreground">
                By subscribing, you agree to our{' '}
                <a href="/policies" className="text-primary hover:underline" target="_blank">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="/policies" className="text-primary hover:underline" target="_blank">
                  Terms of Service
                </a>
                .
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!email || !hasConsented || isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Alert'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}