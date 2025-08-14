import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, Save, Eye, Globe, Trash2, Plus, X, User, Settings, AlertTriangle, Trophy } from 'lucide-react';
import { DateTimePicker } from '@/components/ui/date-time-picker';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { PostcodeAutocomplete } from '@/components/ui/postcode-autocomplete';

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
  // Extended content fields for individual tournament pages
  extended_description?: string;
  venue_details?: string;
  rules_and_regulations?: string;
  what_to_bring?: string;
  accommodation_info?: string;
  gallery_images?: string[];
  social_media_links?: any;
  sponsor_info?: string;
  schedule_details?: string;
  prize_information?: string;
  additional_notes?: string;
}

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [activeTab, setActiveTab] = useState('personal');
  const [selectedTournamentForDetails, setSelectedTournamentForDetails] = useState<Tournament | null>(null);
  const [savingExtendedDetails, setSavingExtendedDetails] = useState(false);
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

  const saveProfile = async () => {
    if (!user || !profile) return;

    setSavingProfile(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: profile.full_name,
        contact_email: profile.contact_email,
        contact_phone: profile.contact_phone || '',
        role: profile.role || 'organizer'
      };

      if (profile.id) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from('profiles')
          .insert([profileData])
          .select()
          .single();
        
        if (error) throw error;
        setProfile({ ...profile, id: data.id });
      }

      toast({
        title: "Profile saved!",
        description: "Your personal details have been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving profile",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) return;

    setDeletingAccount(true);
    try {
      // Call the delete account edge function
      const { error } = await supabase.functions.invoke('delete-account');
      
      if (error) throw error;

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });

      // Sign out after successful deletion
      await signOut();
    } catch (error: any) {
      toast({
        title: "Error deleting account",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeletingAccount(false);
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

  const saveExtendedDetails = async () => {
    if (!selectedTournamentForDetails?.id) return;

    setSavingExtendedDetails(true);
    try {
      const extendedData = {
        extended_description: selectedTournamentForDetails.extended_description || '',
        venue_details: selectedTournamentForDetails.venue_details || '',
        rules_and_regulations: selectedTournamentForDetails.rules_and_regulations || '',
        what_to_bring: selectedTournamentForDetails.what_to_bring || '',
        accommodation_info: selectedTournamentForDetails.accommodation_info || '',
        gallery_images: selectedTournamentForDetails.gallery_images || [],
        social_media_links: selectedTournamentForDetails.social_media_links || {},
        sponsor_info: selectedTournamentForDetails.sponsor_info || '',
        schedule_details: selectedTournamentForDetails.schedule_details || '',
        prize_information: selectedTournamentForDetails.prize_information || '',
        additional_notes: selectedTournamentForDetails.additional_notes || ''
      };

      const { error } = await supabase
        .from('tournaments')
        .update(extendedData)
        .eq('id', selectedTournamentForDetails.id);

      if (error) throw error;

      toast({
        title: "Extended details saved!",
        description: "Tournament page content has been updated.",
      });

      // Update the tournament in our local state
      setTournaments(prev => prev.map(t => 
        t.id === selectedTournamentForDetails.id 
          ? { ...t, ...extendedData }
          : t
      ));

      await loadTournaments();
    } catch (error: any) {
      toast({
        title: "Error saving extended details",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingExtendedDetails(false);
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
          <h1 className="text-3xl font-bold text-foreground">Profile Management</h1>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Vertical Tabs Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <TabsList className="flex flex-col h-auto w-full bg-muted p-1 space-y-1">
                <TabsTrigger 
                  value="personal" 
                  className="w-full flex items-center justify-start gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <User className="w-4 h-4" />
                  Personal Details
                </TabsTrigger>
                <TabsTrigger 
                  value="tournaments" 
                  className="w-full flex items-center justify-start gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Trophy className="w-4 h-4" />
                  Tournament Management
                </TabsTrigger>
                <TabsTrigger 
                  value="extended-details" 
                  className="w-full flex items-center justify-start gap-2 p-3 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <Globe className="w-4 h-4" />
                  Extended Tournament Details
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-w-0">

          {/* Personal Details Tab */}
          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Personal Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="full_name">Full Name</Label>
                      <Input
                        id="full_name"
                        value={profile?.full_name || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, full_name: e.target.value } : null)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_email">Email Address</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={profile?.contact_email || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, contact_email: e.target.value } : null)}
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <Label htmlFor="contact_phone">Phone Number</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={profile?.contact_phone || ''}
                        onChange={(e) => setProfile(prev => prev ? { ...prev, contact_phone: e.target.value } : null)}
                        placeholder="+44 7700 900123"
                      />
                    </div>

                    <Button 
                      onClick={saveProfile} 
                      disabled={savingProfile}
                      className="w-full"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingProfile ? 'Saving...' : 'Save Personal Details'}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Danger Zone
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-foreground">Delete Account</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" className="w-full">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Account
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Account</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete your account? This will:
                            <br />• Delete all your tournaments
                            <br />• Remove your profile information
                            <br />• Cancel any ongoing registrations
                            <br /><br />
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteAccount}
                            disabled={deletingAccount}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deletingAccount ? 'Deleting...' : 'Delete Account'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>

                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Quick Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="outline" className="w-full" asChild>
                      <a href="/">
                        <Eye className="w-4 h-4 mr-2" />
                        View Homepage
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tournament Management Tab */}
          <TabsContent value="tournaments" className="space-y-6">
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
                      <AddressAutocomplete
                        id="location_name"
                        value={editingTournament.location_name}
                        onChange={(value) => setEditingTournament(prev => ({ ...prev, location_name: value }))}
                        placeholder="e.g., Etihad Campus"
                        onAddressSelect={(suggestion) => {
                          // Extract region and postcode from selected address if available
                          const parts = suggestion.place_name.split(', ');
                          if (parts.length > 1) {
                            const region = parts[parts.length - 2] || '';
                            setEditingTournament(prev => ({ 
                              ...prev, 
                              location_name: suggestion.place_name,
                              region: region,
                              latitude: suggestion.center[1],
                              longitude: suggestion.center[0]
                            }));
                          }
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="postcode">Postcode *</Label>
                      <PostcodeAutocomplete
                        id="postcode"
                        value={editingTournament.postcode}
                        onChange={(value) => setEditingTournament(prev => ({ ...prev, postcode: value }))}
                        placeholder="Enter postcode (e.g., TN62HR)"
                        onAddressSelect={(suggestion) => {
                          // Extract location details from the selected address
                          const context = suggestion.context || [];
                          const region = context.find(c => c.id.includes('region'))?.text || 
                                       context.find(c => c.id.includes('place'))?.text || '';
                          
                          setEditingTournament(prev => ({ 
                            ...prev, 
                            postcode: suggestion.postcode,
                            region: region,
                            latitude: suggestion.center[1],
                            longitude: suggestion.center[0]
                          }));
                        }}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="region">Region *</Label>
                      <AddressAutocomplete
                        id="region"
                        value={editingTournament.region}
                        onChange={(value) => setEditingTournament(prev => ({ ...prev, region: value }))}
                        placeholder="Greater Manchester"
                        onAddressSelect={(suggestion) => {
                          setEditingTournament(prev => ({ 
                            ...prev, 
                            region: suggestion.place_name 
                          }));
                        }}
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
                      <div className="grid grid-cols-1 gap-2 mt-2">
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
              </div>
            </div>
          </TabsContent>

          {/* Extended Tournament Details Tab */}
          <TabsContent value="extended-details" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tournament Selection */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Select Tournament</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {tournaments.length === 0 ? (
                      <p className="text-muted-foreground text-sm">
                        Create a tournament first in the Tournament Management tab.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {tournaments.map((tournament) => (
                          <Button
                            key={tournament.id}
                            variant={selectedTournamentForDetails?.id === tournament.id ? "default" : "outline"}
                            className="w-full justify-start text-left"
                            onClick={() => setSelectedTournamentForDetails(tournament)}
                          >
                            <div className="truncate">
                              <div className="font-medium">{tournament.name}</div>
                              <div className="text-xs opacity-60">{tournament.location_name}</div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Extended Details Form */}
              <div className="lg:col-span-2">
                {selectedTournamentForDetails ? (
                  <div className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Extended Description</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="extended_description">Detailed Tournament Description</Label>
                          <Textarea
                            id="extended_description"
                            value={selectedTournamentForDetails.extended_description || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, extended_description: e.target.value } : null)}
                            placeholder="Write a comprehensive description of your tournament, its history, unique features, what makes it special..."
                            rows={6}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Venue Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="venue_details">Venue Details</Label>
                          <Textarea
                            id="venue_details"
                            value={selectedTournamentForDetails.venue_details || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, venue_details: e.target.value } : null)}
                            placeholder="Describe the venue facilities, pitch quality, spectator areas, accessibility information..."
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Rules & Competition Format</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="rules_and_regulations">Rules & Regulations</Label>
                          <Textarea
                            id="rules_and_regulations"
                            value={selectedTournamentForDetails.rules_and_regulations || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, rules_and_regulations: e.target.value } : null)}
                            placeholder="Detail the tournament format, rules, regulations, disciplinary procedures..."
                            rows={5}
                          />
                        </div>

                        <div>
                          <Label htmlFor="schedule_details">Schedule & Match Format</Label>
                          <Textarea
                            id="schedule_details"
                            value={selectedTournamentForDetails.schedule_details || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, schedule_details: e.target.value } : null)}
                            placeholder="Detailed schedule, match durations, break times, group stages, knockout format..."
                            rows={4}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Practical Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="what_to_bring">What to Bring</Label>
                          <Textarea
                            id="what_to_bring"
                            value={selectedTournamentForDetails.what_to_bring || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, what_to_bring: e.target.value } : null)}
                            placeholder="List what teams and players should bring: kit requirements, boots, water bottles, medical forms..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="accommodation_info">Accommodation & Travel</Label>
                          <Textarea
                            id="accommodation_info"
                            value={selectedTournamentForDetails.accommodation_info || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, accommodation_info: e.target.value } : null)}
                            placeholder="Information about nearby hotels, travel directions, parking arrangements..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Awards & Prizes</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="prize_information">Prize Information</Label>
                          <Textarea
                            id="prize_information"
                            value={selectedTournamentForDetails.prize_information || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, prize_information: e.target.value } : null)}
                            placeholder="Details about trophies, medals, individual awards, prize ceremony timing..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Additional Information</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="sponsor_info">Sponsors & Partners</Label>
                          <Textarea
                            id="sponsor_info"
                            value={selectedTournamentForDetails.sponsor_info || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, sponsor_info: e.target.value } : null)}
                            placeholder="Information about tournament sponsors, partners, and supporters..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label htmlFor="additional_notes">Additional Notes</Label>
                          <Textarea
                            id="additional_notes"
                            value={selectedTournamentForDetails.additional_notes || ''}
                            onChange={(e) => setSelectedTournamentForDetails(prev => prev ? { ...prev, additional_notes: e.target.value } : null)}
                            placeholder="Any other important information for teams and spectators..."
                            rows={3}
                          />
                        </div>
                      </CardContent>
                    </Card>

                    <Button
                      onClick={saveExtendedDetails}
                      disabled={savingExtendedDetails}
                      className="w-full"
                      size="lg"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingExtendedDetails ? 'Saving Details...' : 'Save Extended Details'}
                    </Button>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select a Tournament</h3>
                      <p className="text-muted-foreground">
                        Choose a tournament from the left to add extended details for its individual page.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;