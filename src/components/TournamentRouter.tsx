import React from 'react';
import { useParams } from 'react-router-dom';
import { getCityBySlug } from '@/data/cities';
import CityTournaments from '@/pages/CityTournaments';
import TournamentDetails from '@/pages/TournamentDetails';

const TournamentRouter: React.FC = () => {
  const { param } = useParams<{ param: string }>();
  
  // Check if the parameter matches a city slug
  const city = getCityBySlug(param || '');
  
  if (city) {
    // It's a city page, render CityTournaments with city slug passed through URL context
    return <CityTournaments />;
  }
  
  // Otherwise, treat it as a tournament ID and render TournamentDetails
  return <TournamentDetails />;
};

export default TournamentRouter;
