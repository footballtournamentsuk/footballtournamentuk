import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Globe, Instagram, Twitter, Facebook, Mail, Phone } from 'lucide-react';

interface Team {
  id: string;
  name: string;
  city: string;
  region: string;
  country: string;
  venue_address: string;
  genders: string[];
  age_groups: string[];
  formats: string[];
  logo_url: string;
  banner_url: string;
  website: string;
  instagram: string;
  twitter: string;
  facebook: string;
  is_published: boolean;
  profiles: {
    contact_email: string;
    contact_phone: string;
  } | null;
}

const TeamViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadTeam();
    }
  }, [id]);

  const loadTeam = async () => {
    try {
      // First get the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (teamError || !teamData) {
        setNotFound(true);
        return;
      }

      // Then get the profile separately
      const { data: profileData } = await supabase
        .from('profiles')
        .select('contact_email, contact_phone')
        .eq('user_id', teamData.owner_id)
        .single();

      setTeam({
        ...teamData,
        profiles: profileData || null
      });
    } catch (error: any) {
      toast({
        title: "Error loading team",
        description: error.message,
        variant: "destructive",
      });
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (notFound || !team) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Banner */}
      <div className="h-64 bg-gradient-to-r from-primary to-secondary relative">
        {team.banner_url && (
          <img 
            src={team.banner_url} 
            alt="Team banner" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Team Header */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  {team.logo_url && (
                    <img 
                      src={team.logo_url} 
                      alt="Team logo" 
                      className="w-20 h-20 rounded-lg object-cover border-2 border-background shadow-lg"
                    />
                  )}
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">{team.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {team.city}
                        {team.region && `, ${team.region}`}
                        {team.country && `, ${team.country}`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Venue Information */}
            {team.venue_address && (
              <Card>
                <CardHeader>
                  <CardTitle>Venue</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground">{team.venue_address}</p>
                </CardContent>
              </Card>
            )}

            {/* Team Preferences */}
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {team.genders.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Genders</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.genders.map((gender) => (
                        <Badge key={gender} variant="secondary">{gender}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {team.age_groups.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Age Groups</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.age_groups.map((age) => (
                        <Badge key={age} variant="outline">{age}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {team.formats.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Formats</h4>
                    <div className="flex flex-wrap gap-2">
                      {team.formats.map((format) => (
                        <Badge key={format} variant="default">{format}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {team.profiles?.contact_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`mailto:${team.profiles.contact_email}`}
                      className="text-primary hover:underline"
                    >
                      {team.profiles.contact_email}
                    </a>
                  </div>
                )}
                
                {team.profiles?.contact_phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={`tel:${team.profiles.contact_phone}`}
                      className="text-primary hover:underline"
                    >
                      {team.profiles.contact_phone}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            {(team.website || team.instagram || team.twitter || team.facebook) && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {team.website && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={team.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}
                  
                  {team.instagram && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`https://instagram.com/${team.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Instagram className="w-4 h-4 mr-2" />
                        Instagram
                      </a>
                    </Button>
                  )}
                  
                  {team.twitter && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`https://x.com/${team.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer">
                        <Twitter className="w-4 h-4 mr-2" />
                        X (Twitter)
                      </a>
                    </Button>
                  )}
                  
                  {team.facebook && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={team.facebook.includes('http') ? team.facebook : `https://facebook.com/${team.facebook}`} target="_blank" rel="noopener noreferrer">
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamViewPage;