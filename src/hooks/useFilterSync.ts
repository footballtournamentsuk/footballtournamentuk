import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TournamentFilters } from '@/types/tournament';

export const useFilterSync = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFiltersState] = useState<TournamentFilters>({});

  // Parse URL params into filters
  const parseFiltersFromUrl = useCallback((): TournamentFilters => {
    const urlFilters: TournamentFilters = {};
    
    // Parse search
    const search = searchParams.get('search');
    if (search) {
      urlFilters.search = search;
    }
    
    // Parse location
    const postcode = searchParams.get('location');
    const radius = searchParams.get('radius');
    if (postcode) {
      urlFilters.location = {
        postcode,
        radius: radius ? parseInt(radius) : 10
      };
    }
    
    // Parse date range
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    if (startDate || endDate) {
      urlFilters.dateRange = {
        start: startDate ? new Date(startDate) : undefined,
        end: endDate ? new Date(endDate) : undefined
      };
    }
    
    // Parse price range
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const includeFree = searchParams.get('includeFree');
    if (minPrice || maxPrice || includeFree) {
      urlFilters.priceRange = {
        min: minPrice ? parseInt(minPrice) : undefined,
        max: maxPrice ? parseInt(maxPrice) : undefined,
        includeFree: includeFree === 'true'
      };
    }
    
    // Parse array filters
    const format = searchParams.get('format');
    if (format) {
      urlFilters.format = format.split(',');
    }
    
    const ageGroups = searchParams.get('ageGroups');
    if (ageGroups) {
      urlFilters.ageGroups = ageGroups.split(',') as any;
    }
    
    const teamTypes = searchParams.get('teamTypes');
    if (teamTypes) {
      urlFilters.teamTypes = teamTypes.split(',') as any;
    }
    
    const type = searchParams.get('type');
    if (type) {
      urlFilters.type = type.split(',');
    }
    
    const regions = searchParams.get('regions');
    if (regions) {
      urlFilters.regions = regions.split(',');
    }
    
    const status = searchParams.get('status');
    if (status) {
      urlFilters.status = status.split(',');
    }
    
    return urlFilters;
  }, [searchParams]);

  // Convert filters to URL params
  const updateUrlFromFilters = useCallback((newFilters: TournamentFilters) => {
    const params = new URLSearchParams();
    
    // Add search
    if (newFilters.search) {
      params.set('search', newFilters.search);
    }
    
    // Add location
    if (newFilters.location?.postcode) {
      params.set('location', newFilters.location.postcode);
      if (newFilters.location.radius) {
        params.set('radius', newFilters.location.radius.toString());
      }
    }
    
    // Add date range
    if (newFilters.dateRange?.start) {
      params.set('startDate', newFilters.dateRange.start.toISOString().split('T')[0]);
    }
    if (newFilters.dateRange?.end) {
      params.set('endDate', newFilters.dateRange.end.toISOString().split('T')[0]);
    }
    
    // Add price range
    if (newFilters.priceRange) {
      if (newFilters.priceRange.min !== undefined) {
        params.set('minPrice', newFilters.priceRange.min.toString());
      }
      if (newFilters.priceRange.max !== undefined) {
        params.set('maxPrice', newFilters.priceRange.max.toString());
      }
      if (newFilters.priceRange.includeFree) {
        params.set('includeFree', 'true');
      }
    }
    
    // Add array filters
    if (newFilters.format?.length) {
      params.set('format', newFilters.format.join(','));
    }
    if (newFilters.ageGroups?.length) {
      params.set('ageGroups', newFilters.ageGroups.join(','));
    }
    if (newFilters.teamTypes?.length) {
      params.set('teamTypes', newFilters.teamTypes.join(','));
    }
    if (newFilters.type?.length) {
      params.set('type', newFilters.type.join(','));
    }
    if (newFilters.regions?.length) {
      params.set('regions', newFilters.regions.join(','));
    }
    if (newFilters.status?.length) {
      params.set('status', newFilters.status.join(','));
    }
    
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Initialize filters from URL on mount
  useEffect(() => {
    const urlFilters = parseFiltersFromUrl();
    setFiltersState(urlFilters);
  }, [parseFiltersFromUrl]);

  // Custom setFilters that syncs with URL
  const setFilters = useCallback((newFilters: TournamentFilters) => {
    setFiltersState(newFilters);
    updateUrlFromFilters(newFilters);
  }, [updateUrlFromFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFiltersState({});
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  return {
    filters,
    setFilters,
    clearFilters
  };
};