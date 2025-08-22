import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Bell, X } from 'lucide-react';
import { AlertSubscriptionModal } from './AlertSubscriptionModal';

import { TournamentFilters } from '@/types/tournament';

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
      <Card className="p-6 mb-6 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Stay Updated</h3>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <Button
            onClick={() => setIsModalOpen(true)}
            size="default"
            className="w-full"
          >
            <Bell className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
          
          <p className="text-sm text-muted-foreground text-center">{message}</p>
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