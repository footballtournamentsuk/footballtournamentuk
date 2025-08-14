import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PublishedTeam } from '@/hooks/useTeams';
import { MapPin, Globe, Instagram, Twitter, Facebook } from 'lucide-react';

interface TeamCardProps {
  team: PublishedTeam;
}

const TeamCard = ({ team }: TeamCardProps) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      {team.banner_url && (
        <div className="h-32 overflow-hidden rounded-t-lg">
          <img
            src={team.banner_url}
            alt={`${team.name} banner`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {team.logo_url && (
            <img
              src={team.logo_url}
              alt={`${team.name} logo`}
              className="w-12 h-12 rounded-lg object-cover border"
            />
          )}
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{team.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{team.city}, {team.country}</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Age Groups */}
        {team.age_groups.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Age Groups</p>
            <div className="flex flex-wrap gap-1">
              {team.age_groups.slice(0, 4).map((age) => (
                <Badge key={age} variant="secondary" className="text-xs">
                  {age}
                </Badge>
              ))}
              {team.age_groups.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{team.age_groups.length - 4} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Formats */}
        {team.formats.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Formats</p>
            <div className="flex flex-wrap gap-1">
              {team.formats.map((format) => (
                <Badge key={format} variant="outline" className="text-xs">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Genders */}
        {team.genders.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">Teams</p>
            <div className="flex flex-wrap gap-1">
              {team.genders.map((gender) => (
                <Badge key={gender} variant="default" className="text-xs">
                  {gender}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex space-x-2">
            {team.website && (
              <Button size="sm" variant="ghost" className="p-2" asChild>
                <a href={team.website} target="_blank" rel="noopener noreferrer">
                  <Globe className="w-4 h-4" />
                </a>
              </Button>
            )}
            {team.instagram && (
              <Button size="sm" variant="ghost" className="p-2" asChild>
                <a href={`https://instagram.com/${team.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-4 h-4" />
                </a>
              </Button>
            )}
            {team.twitter && (
              <Button size="sm" variant="ghost" className="p-2" asChild>
                <a href={`https://twitter.com/${team.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                  <Twitter className="w-4 h-4" />
                </a>
              </Button>
            )}
            {team.facebook && (
              <Button size="sm" variant="ghost" className="p-2" asChild>
                <a href={`https://facebook.com/${team.facebook}`} target="_blank" rel="noopener noreferrer">
                  <Facebook className="w-4 h-4" />
                </a>
              </Button>
            )}
          </div>
          
          <Button size="sm" variant="outline">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamCard;