import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';
import { AlertSubscriptionModal } from './AlertSubscriptionModal';

interface TournamentFilters {
  search?: string;
  location?: string;
  radius?: number;
  format?: string[];
  ageGroups?: string[];
  teamTypes?: string[];
  type?: string[];
  regions?: string[];
  priceRange?: [number, number];
  dateRange?: { from?: Date; to?: Date };
}

interface AlertSubscriptionBannerProps {
  filters: TournamentFilters;
  source: 'list' | 'city' | 'filters' | 'empty';
  message: string;
  cityName?: string;
  resultCount?: number;
}

export function AlertSubscriptionBanner({ 
  filters, 
  source, 
  message, 
  cityName, 
  resultCount 
}: AlertSubscriptionBannerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <>
      <Card className="p-4 mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Stay Updated</h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsModalOpen(true)}
              size="sm"
              className="whitespace-nowrap"
            >
              <Bell className="h-4 w-4 mr-2" />
              Create Alert
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <AlertSubscriptionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        filters={filters}
        source={source}
        cityName={cityName}
      />
    </>
  );
}