import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Save, Eye, Globe, Trash2, Plus, X } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';

const AGE_GROUPS = ['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21'];
const TEAM_TYPES = ['boys', 'girls', 'mixed'];
const FORMATS = ['3v3', '5v5', '7v7', '9v9', '11v11'];
const TOURNAMENT_TYPES = ['tournament', 'league', 'camp', 'friendly'];
const AVAILABLE_FEATURES = [
  'Professional coaching',
  'Equipment provided',
  'Lunch included',
  'Trophies',
  'Medals',
  'Refreshments',
  'Photography',
  'Professional pitches',
  'Changing rooms',
  'Parking',
  'First aid',
  'Live streaming'
];

interface Profile {
  id: string;
  role: string;
  contact_email: string;
  contact_phone: string;
  full_name: string;
}

interface Tournament {
  id?: string;
  name: string;
  description: string;
  location_name: string;
  postcode: string;
  region: string;
  format: string;
  age_groups: string[];
  team_types: string[];
  type: string;
  status: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  max_teams?: number;
  cost_amount?: number;
  cost_currency: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  website?: string;
  features: string[];
  organizer_id?: string;
  latitude?: number;
  longitude?: number;
}

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [editingTournament, setEditingTournament] = useState<Tournament>({
    name: '',
    description: '',
    location_name: '',
    postcode: '',
    region: '',
    format: '11v11',
    age_groups: [],
    team_types: [],
    type: 'tournament',
    status: 'upcoming',
    start_date: '',
    end_date: '',
    cost_currency: 'GBP',
    contact_name: '',
    contact_email: '',
    features: []
  });

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTournaments();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Profile loading error:', error);
        throw error;
      }

      if (data) {
        setProfile(data);
        setEditingTournament(prev => ({
          ...prev,
          contact_name: data.full_name || '',
          contact_email: data.contact_email || user?.email || ''
        }));
      } else {
        // Create initial profile
        const userName = user?.user_metadata?.full_name || '';
        const newProfile = {
          id: '',
          role: 'organizer',
          contact_email: user?.email || '',
          contact_phone: '',
          full_name: userName
        };
        setProfile(newProfile);
        setEditingTournament(prev => ({
          ...prev,
          contact_name: userName,
          contact_email: user?.email || ''
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .eq('organizer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Tournaments loading error:', error);
        throw error;
      }

      setTournaments(data || []);
    } catch (error: any) {
      toast({
        title: "Error loading tournaments",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saveTournament = async () => {
    if (!user || !profile) return;

    setSaving(true);
    try {
      // Validate required fields
      if (!editingTournament.name || !editingTournament.location_name || !editingTournament.postcode || 
          !editingTournament.start_date || !editingTournament.end_date || 
          editingTournament.age_groups.length === 0 || editingTournament.team_types.length === 0) {
        toast({
          title: "Missing required fields",
          description: "Please fill in all required fields before saving.",
          variant: "destructive",
        });
        return;
      }

      // Geocode the location
      let latitude, longitude;
      try {
        const response = await supabase.functions.invoke('mapbox-token');
        if (response.data?.token) {
          const geocodeResponse = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(editingTournament.location_name + ', ' + editingTournament.postcode)}.json?access_token=${response.data.token}`
          );
          const data = await geocodeResponse.json();
          if (data.features && data.features.length > 0) {
            [longitude, latitude] = data.features[0].center;
          }
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      }

      const tournamentData = {
        ...editingTournament,
        organizer_id: user.id,
        latitude: latitude || 51.5074, // Default to London
        longitude: longitude || -0.1278,
        contact_name: profile.full_name,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone
      };

      if (editingTournament.id) {
        // Update existing tournament
        const { error } = await supabase
          .from('tournaments')
          .update(tournamentData)
          .eq('id', editingTournament.id);

        if (error) throw error;
      } else {
        // Create new tournament
        const { error } = await supabase
          .from('tournaments')
          .insert([tournamentData]);

        if (error) throw error;
      }

      toast({
        title: "Tournament saved! 🎉",
        description: "Your tournament is now live on the homepage!",
      });

      // Reset form and reload tournaments
      setEditingTournament({
        name: '',
        description: '',
        location_name: '',
        postcode: '',
        region: '',
        format: '11v11',
        age_groups: [],
        team_types: [],
        type: 'tournament',
        status: 'upcoming',
        start_date: '',
        end_date: '',
        cost_currency: 'GBP',
        contact_name: profile.full_name,
        contact_email: profile.contact_email,
        features: []
      });

      await loadTournaments();
    } catch (error: any) {
      toast({
        title: "Error saving tournament",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteTournament = async (tournamentId: string) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournamentId);

      if (error) throw error;

      toast({
        title: "Tournament deleted",
        description: "Tournament has been removed.",
      });

      await loadTournaments();
    } catch (error: any) {
      toast({
        title: "Error deleting tournament",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const canSave = editingTournament.name && editingTournament.location_name && 
                  editingTournament.postcode && editingTournament.start_date && 
                  editingTournament.end_date && editingTournament.age_groups.length > 0 && 
                  editingTournament.team_types.length > 0;

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Create Tournament</h1>
          <div className="flex items-center gap-2">
            {saving && <span className="text-sm text-muted-foreground">Saving...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tournament Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tournament_name">Tournament Name *</Label>
                  <Input
                    id="tournament_name"
                    value={editingTournament.name}
                    onChange={(e) => setEditingTournament(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Manchester Youth League"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editingTournament.description}
                    onChange={(e) => setEditingTournament(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of your tournament"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={editingTournament.type}
                      onValueChange={(value) => setEditingTournament(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TOURNAMENT_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="format">Format *</Label>
                    <Select
                      value={editingTournament.format}
                      onValueChange={(value) => setEditingTournament(prev => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMATS.map((format) => (
                          <SelectItem key={format} value={format}>
                            {format}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Dates */}
            <Card>
              <CardHeader>
                <CardTitle>Location & Dates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="location_name">Venue Name *</Label>
                  <Input
                    id="location_name"
                    value={editingTournament.location_name}
                    onChange={(e) => setEditingTournament(prev => ({ ...prev, location_name: e.target.value }))}
                    placeholder="e.g., Etihad Campus"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="postcode">Postcode *</Label>
                  <Input
                    id="postcode"
                    value={editingTournament.postcode}
                    onChange={(e) => setEditingTournament(prev => ({ ...prev, postcode: e.target.value }))}
                    placeholder="tn62hr"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="region">Region *</Label>
                  <Input
                    id="region"
                    value={editingTournament.region}
                    onChange={(e) => setEditingTournament(prev => ({ ...prev, region: e.target.value }))}
                    placeholder="Greater Manchester"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="start_date">Start Date & Time *</Label>
                  <DateTimePicker
                    value={editingTournament.start_date}
                    onChange={(value) => setEditingTournament(prev => ({ ...prev, start_date: value }))}
                    placeholder="Select start date"
                  />
                </div>
                
                <div>
                  <Label htmlFor="end_date">End Date & Time *</Label>
                  <DateTimePicker
                    value={editingTournament.end_date}
                    onChange={(value) => setEditingTournament(prev => ({ ...prev, end_date: value }))}
                    placeholder="Select end date"
                  />
                </div>

                <div>
                  <Label htmlFor="registration_deadline">Registration Deadline</Label>
                  <DateTimePicker
                    value={editingTournament.registration_deadline || ''}
                    onChange={(value) => setEditingTournament(prev => ({ ...prev, registration_deadline: value }))}
                    placeholder="Select registration deadline"
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_teams">Max Teams</Label>
                  <Input
                    id="max_teams"
                    type="number"
                    value={editingTournament.max_teams || ''}
                    onChange={(e) => setEditingTournament(prev => ({ ...prev, max_teams: parseInt(e.target.value) || undefined }))}
                    placeholder="Optional"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card>
              <CardHeader>
                <CardTitle>Participants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Age Groups *</Label>
                  <div className="grid grid-cols-6 gap-2 mt-2">
                    {AGE_GROUPS.map((age) => (
                      <div key={age} className="flex items-center space-x-2">
                        <Checkbox
                          id={`age-${age}`}
                          checked={editingTournament.age_groups.includes(age)}
                          onCheckedChange={(checked) => {
                            const newAges = checked 
                              ? [...editingTournament.age_groups, age]
                              : editingTournament.age_groups.filter(a => a !== age);
                            setEditingTournament(prev => ({ ...prev, age_groups: newAges }));
                          }}
                        />
                        <Label htmlFor={`age-${age}`} className="text-sm">{age}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Team Types *</Label>
                  <div className="flex gap-4 mt-2">
                    {TEAM_TYPES.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={editingTournament.team_types.includes(type)}
                          onCheckedChange={(checked) => {
                            const newTypes = checked 
                              ? [...editingTournament.team_types, type]
                              : editingTournament.team_types.filter(t => t !== type);
                            setEditingTournament(prev => ({ ...prev, team_types: newTypes }));
                          }}
                        />
                        <Label htmlFor={`type-${type}`} className="capitalize">{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Features & Pricing */}
            <Card>
              <CardHeader>
                <CardTitle>Features & Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Features</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {AVAILABLE_FEATURES.map((feature) => (
                      <div key={feature} className="flex items-center space-x-2">
                        <Checkbox
                          id={`feature-${feature}`}
                          checked={editingTournament.features.includes(feature)}
                          onCheckedChange={(checked) => {
                            const newFeatures = checked 
                              ? [...editingTournament.features, feature]
                              : editingTournament.features.filter(f => f !== feature);
                            setEditingTournament(prev => ({ ...prev, features: newFeatures }));
                          }}
                        />
                        <Label htmlFor={`feature-${feature}`} className="text-sm">{feature}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost_amount">Entry Fee</Label>
                    <Input
                      id="cost_amount"
                      type="number"
                      step="0.01"
                      value={editingTournament.cost_amount || ''}
                      onChange={(e) => setEditingTournament(prev => ({ ...prev, cost_amount: parseFloat(e.target.value) || undefined }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cost_currency">Currency</Label>
                    <Select
                      value={editingTournament.cost_currency}
                      onValueChange={(value) => setEditingTournament(prev => ({ ...prev, cost_currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GBP">GBP (£)</SelectItem>
                        <SelectItem value="EUR">EUR (€)</SelectItem>
                        <SelectItem value="USD">USD ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    type="url"
                    value={editingTournament.website || ''}
                    onChange={(e) => setEditingTournament(prev => ({ ...prev, website: e.target.value }))}
                    placeholder="https://example.com"
                  />
                </div>
              </CardContent>
            </Card>

            {!canSave && (
              <Card className="border-warning bg-warning/5">
                <CardContent className="pt-6">
                  <p className="text-warning-foreground text-sm">
                    <strong>Required fields missing:</strong> Complete Tournament Name, Venue, Postcode, Dates, Age Groups, and Team Types to save.
                  </p>
                </CardContent>
              </Card>
            )}

            <Button
              onClick={saveTournament}
              disabled={!canSave || saving}
              className="w-full"
              size="lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving Tournament...' : editingTournament.id ? 'Update Tournament' : 'Create Tournament'}
            </Button>
          </div>

          {/* My Tournaments Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>My Tournaments ({tournaments.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {tournaments.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No tournaments created yet.</p>
                ) : (
                  <div className="space-y-3">
                    {tournaments.map((tournament) => (
                      <div key={tournament.id} className="p-3 border rounded-lg">
                        <h4 className="font-medium text-sm">{tournament.name}</h4>
                        <p className="text-xs text-muted-foreground">{tournament.location_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tournament.start_date).toLocaleDateString()}
                        </p>
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingTournament(tournament)}
                          >
                            Edit
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="destructive">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Tournament</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{tournament.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => deleteTournament(tournament.id!)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/">
                    <Eye className="w-4 h-4 mr-2" />
                    View Homepage
                  </a>
                </Button>
                <Button variant="outline" className="w-full" onClick={signOut}>
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;