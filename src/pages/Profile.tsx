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
import { Upload, Save, Eye, Globe, Trash2 } from 'lucide-react';

const GENDERS = ['Boys', 'Girls', 'Mixed'];
const AGE_GROUPS = ['U6', 'U7', 'U8', 'U9', 'U10', 'U11', 'U12', 'U13', 'U14', 'U15', 'U16', 'U17', 'U18', 'U19', 'U20', 'U21'];
const FORMATS = ['3v3', '5v5', '7v7', '9v9', '11v11'];

interface Profile {
  id: string;
  role: string;
  contact_email: string;
  contact_phone: string;
  full_name: string;
}

interface Team {
  id?: string;
  name: string;
  city: string;
  region: string;
  country: string;
  venue_address: string;
  venue_latitude?: number;
  venue_longitude?: number;
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
}

const ProfilePage = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [team, setTeam] = useState<Team>({
    name: '',
    city: '',
    region: '',
    country: '',
    venue_address: '',
    genders: [],
    age_groups: [],
    formats: [],
    logo_url: '',
    banner_url: '',
    website: '',
    instagram: '',
    twitter: '',
    facebook: '',
    is_published: false,
  });

  // Redirect if not authenticated
  if (!loading && !user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (user) {
      loadProfile();
      loadTeam();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create initial profile with user's name from auth metadata
        const userName = user?.user_metadata?.full_name || '';
        setProfile({
          id: '',
          role: 'organizer',
          contact_email: user?.email || '',
          contact_phone: '',
          full_name: userName
        });
      }
    } catch (error: any) {
      toast({
        title: "Error loading profile",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('owner_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setTeam(data);
      }
    } catch (error: any) {
      toast({
        title: "Error loading team",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const autosave = async (updates: Partial<Profile> | Partial<Team>, table: 'profiles' | 'teams') => {
    setSaving(true);
    try {
      if (table === 'profiles' && profile) {
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('user_id', user?.id);

        if (error) throw error;
        setProfile({ ...profile, ...updates } as Profile);
      } else if (table === 'teams') {
        if (team.id) {
          const { error } = await supabase
            .from('teams')
            .update(updates)
            .eq('id', team.id);

          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('teams')
            .insert([{ ...team, ...updates, owner_id: user?.id }])
            .select()
            .single();

          if (error) throw error;
          setTeam(data);
          return;
        }
        setTeam({ ...team, ...updates });
      }
    } catch (error: any) {
      toast({
        title: "Autosave failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const geocodeAddress = async (address: string) => {
    if (!address.trim()) return;

    try {
      const response = await supabase.functions.invoke('mapbox-token');
      if (!response.data?.token) throw new Error('Failed to get Mapbox token');

      const geocodeResponse = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${response.data.token}`
      );
      
      const data = await geocodeResponse.json();
      
      if (data.features && data.features.length > 0) {
        const [longitude, latitude] = data.features[0].center;
        autosave({ venue_latitude: latitude, venue_longitude: longitude }, 'teams');
      }
    } catch (error: any) {
      console.error('Geocoding failed:', error);
    }
  };

  const canPublish = team.name && team.city && team.country && team.age_groups.length > 0;

  const togglePublish = async () => {
    if (!canPublish) return;
    autosave({ is_published: !team.is_published }, 'teams');
  };

  const handleDeleteAccount = async () => {
    try {
      // Call the edge function to delete the account
      const { error } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      // Sign out and redirect to home page
      await signOut();
      window.location.href = '/';
    } catch (error: any) {
      console.error('Delete account error:', error);
      toast({
        title: "Error deleting account",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Profile Setup</h1>
          <div className="flex items-center gap-2">
            {saving && <span className="text-sm text-muted-foreground">Saving...</span>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profile?.full_name || ''}
                  onChange={(e) => autosave({ full_name: e.target.value }, 'profiles')}
                />
              </div>

              <div>
                <Label htmlFor="role">Role</Label>
                <Select
                  value={profile?.role || 'organizer'}
                  onValueChange={(value) => autosave({ role: value }, 'profiles')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="organizer">Organizer</SelectItem>
                    <SelectItem value="team">Team</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="contact_email">Contact Email</Label>
                <Input
                  id="contact_email"
                  type="email"
                  value={profile?.contact_email || user?.email || ''}
                  onChange={(e) => autosave({ contact_email: e.target.value }, 'profiles')}
                />
              </div>

              <div>
                <Label htmlFor="contact_phone">Contact Phone</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  value={profile?.contact_phone || ''}
                  onChange={(e) => autosave({ contact_phone: e.target.value }, 'profiles')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization/Team Details */}
          <Card>
            <CardHeader>
              <CardTitle>Organization/Team Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="team_name">Organization/Team Name *</Label>
                <Input
                  id="team_name"
                  value={team.name}
                  onChange={(e) => autosave({ name: e.target.value }, 'teams')}
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={team.city}
                    onChange={(e) => autosave({ city: e.target.value }, 'teams')}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="region">Region</Label>
                  <Input
                    id="region"
                    value={team.region}
                    onChange={(e) => autosave({ region: e.target.value }, 'teams')}
                  />
                </div>
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    value={team.country}
                    onChange={(e) => autosave({ country: e.target.value }, 'teams')}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="venue_address">Venue Address</Label>
                <Textarea
                  id="venue_address"
                  value={team.venue_address}
                  onChange={(e) => autosave({ venue_address: e.target.value }, 'teams')}
                  onBlur={(e) => geocodeAddress(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Team Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Genders</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {GENDERS.map((gender) => (
                    <div key={gender} className="flex items-center space-x-2">
                      <Checkbox
                        id={`gender-${gender}`}
                        checked={team.genders.includes(gender)}
                        onCheckedChange={(checked) => {
                          const newGenders = checked 
                            ? [...team.genders, gender]
                            : team.genders.filter(g => g !== gender);
                          autosave({ genders: newGenders }, 'teams');
                        }}
                      />
                      <Label htmlFor={`gender-${gender}`}>{gender}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Age Groups *</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {AGE_GROUPS.map((age) => (
                    <div key={age} className="flex items-center space-x-2">
                      <Checkbox
                        id={`age-${age}`}
                        checked={team.age_groups.includes(age)}
                        onCheckedChange={(checked) => {
                          const newAges = checked 
                            ? [...team.age_groups, age]
                            : team.age_groups.filter(a => a !== age);
                          autosave({ age_groups: newAges }, 'teams');
                        }}
                      />
                      <Label htmlFor={`age-${age}`}>{age}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Formats</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {FORMATS.map((format) => (
                    <div key={format} className="flex items-center space-x-2">
                      <Checkbox
                        id={`format-${format}`}
                        checked={team.formats.includes(format)}
                        onCheckedChange={(checked) => {
                          const newFormats = checked 
                            ? [...team.formats, format]
                            : team.formats.filter(f => f !== format);
                          autosave({ formats: newFormats }, 'teams');
                        }}
                      />
                      <Label htmlFor={`format-${format}`}>{format}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardHeader>
              <CardTitle>Social Links & Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={team.website}
                  onChange={(e) => autosave({ website: e.target.value }, 'teams')}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  value={team.instagram}
                  onChange={(e) => autosave({ instagram: e.target.value }, 'teams')}
                  placeholder="@username"
                />
              </div>

              <div>
                <Label htmlFor="twitter">X (Twitter)</Label>
                <Input
                  id="twitter"
                  value={team.twitter}
                  onChange={(e) => autosave({ twitter: e.target.value }, 'teams')}
                  placeholder="@username"
                />
              </div>

              <div>
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  value={team.facebook}
                  onChange={(e) => autosave({ facebook: e.target.value }, 'teams')}
                  placeholder="Page name or URL"
                />
              </div>

              <div className="space-y-2">
                <Label>Logo Upload</Label>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Logo
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Banner Upload</Label>
                <Button variant="outline" className="w-full">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Banner
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {!canPublish && (
          <Card className="border-warning bg-warning/5">
            <CardContent className="pt-6">
              <p className="text-warning-foreground text-sm">
                <strong>Required fields missing:</strong> Complete Team Name, City, Country, and at least one Age Group to publish your profile.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <Button
            onClick={togglePublish}
            disabled={!canPublish}
            variant={team.is_published ? "secondary" : "default"}
            className="flex items-center justify-center gap-2 w-full"
            size="lg"
          >
            {team.is_published ? <Eye className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            {team.is_published ? 'Published' : 'Publish Profile'}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                className="flex items-center justify-center gap-2 w-full"
                size="lg"
              >
                <Trash2 className="w-4 h-4" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account,
                  profile, team information, and remove all of your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Yes, delete my account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;