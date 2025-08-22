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
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-2xl mx-auto">
          {/* Alert Banner Header */}
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center justify-center gap-2">
              <Bell className="h-5 w-5 text-white" />
              Stay Updated
            </h3>
            <p className="text-white/80 text-sm">
              {message}
            </p>
          </div>

          {/* Alert Banner Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDismissed(true)}
              className="absolute top-2 right-2 h-8 w-8 p-0 text-white/70 hover:text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <div className="space-y-3">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-base"
              >
                <Bell className="h-4 w-4 mr-2" />
                Create Alert
              </Button>
            </div>
          </div>
        </div>
      </div>

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