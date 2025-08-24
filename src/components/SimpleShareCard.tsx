import React from 'react';
import { Tournament } from '@/types/tournament';

interface SimpleShareCardProps {
  tournament: Tournament;
}

export const SimpleShareCard: React.FC<SimpleShareCardProps> = ({ tournament }) => {
  // Determine the share cover image and variant
  const shareCoverUrl = tournament.share_cover_url || tournament.banner_url;
  const shareVariant = tournament.share_cover_variant || 'FB_1200x630';
  
  // Get container dimensions and constraints based on variant
  const getContainerStyle = () => {
    let ratio: number;
    let maxWidth: number;
    
    switch (shareVariant) {
      case 'IG_1080x1350':
        ratio = 1080 / 1350;
        maxWidth = 1080;
        break;
      case 'IG_1080x1080':
        ratio = 1;
        maxWidth = 1080;
        break;
      case 'FB_1200x630':
      default:
        ratio = 1200 / 630;
        maxWidth = 1200;
        break;
    }

    return {
      '--ratio': ratio.toString(),
      width: `min(100%, ${maxWidth}px, calc((100vh - 200px) * ${ratio}))`,
      aspectRatio: ratio.toString(),
    } as React.CSSProperties;
  };

  const altText = tournament.share_cover_alt || 
    `${tournament.name} - ${tournament.format} ${tournament.type} tournament in ${tournament.location.name}`;

  return (
    <div className="w-full py-8 flex justify-center items-center bg-background">
      <div 
        className="relative mx-auto rounded-lg overflow-hidden shadow-lg bg-muted"
        style={getContainerStyle()}
      >
        {shareCoverUrl ? (
          <img
            src={shareCoverUrl}
            alt={altText}
            className="absolute inset-0 w-full h-full object-contain bg-muted"
            loading="eager"
            decoding="async"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
          />
        ) : (
          // Fallback with basic tournament info
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-glow flex flex-col justify-center items-center p-6 text-white text-center">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">
              {tournament.name}
            </h2>
            <div className="text-lg">
              {tournament.format} • {tournament.location.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};