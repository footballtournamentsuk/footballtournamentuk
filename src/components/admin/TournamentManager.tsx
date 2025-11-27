import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Edit, 
  Search, 
  Calendar,
  MapPin,
  Users,
  Loader2,
  Eye,
  EyeOff,
  AlertCircle,
  Save,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tournament } from '@/types/tournament';
import { transformTournament } from '@/hooks/useTournaments';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const TournamentManager: React.FC = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editForm, setEditForm] = useState<any>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformed = data.map((item: any) => transformTournament(item));
      setTournaments(transformed);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tournaments',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tournament deleted successfully',
      });

      setTournaments(prev => prev.filter(t => t.id !== id));
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete tournament',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      setProcessingIds(prev => new Set(prev).add(id));
      
      const { error } = await supabase
        .from('tournaments')
        .update({ is_published: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Tournament ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });

      await fetchTournaments();
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tournament',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleEdit = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setEditForm({
      name: tournament.name,
      description: tournament.description || '',
      location_name: tournament.location.name,
      postcode: tournament.location.postcode,
      region: tournament.location.region,
      start_date: new Date(tournament.dates.start).toISOString().slice(0, 16),
      end_date: new Date(tournament.dates.end).toISOString().slice(0, 16),
      registration_deadline: tournament.dates.registrationDeadline 
        ? new Date(tournament.dates.registrationDeadline).toISOString().slice(0, 16) 
        : '',
      format: tournament.format,
      type: tournament.type,
      age_groups: tournament.ageGroups.join(', '),
      team_types: tournament.teamTypes.join(', '),
      cost_amount: tournament.cost?.amount || '',
      cost_currency: tournament.cost?.currency || 'GBP',
      max_teams: tournament.maxTeams || '',
      contact_name: tournament.contact.name,
      contact_email: tournament.contact.email,
      contact_phone: tournament.contact.phone || '',
      website: tournament.website || '',
      banner_position: tournament.banner_position || 'center',
      venue_details: tournament.venue_details || '',
      additional_notes: tournament.additional_notes || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingTournament || !editForm) return;

    try {
      setProcessingIds(prev => new Set(prev).add(editingTournament.id));

      const { error } = await supabase
        .from('tournaments')
        .update({
          name: editForm.name,
          description: editForm.description || null,
          location_name: editForm.location_name,
          postcode: editForm.postcode,
          region: editForm.region,
          start_date: editForm.start_date,
          end_date: editForm.end_date,
          registration_deadline: editForm.registration_deadline || null,
          format: editForm.format,
          type: editForm.type,
          age_groups: editForm.age_groups.split(',').map((s: string) => s.trim()).filter(Boolean),
          team_types: editForm.team_types.split(',').map((s: string) => s.trim()).filter(Boolean),
          cost_amount: editForm.cost_amount ? parseFloat(editForm.cost_amount) : null,
          cost_currency: editForm.cost_currency || 'GBP',
          max_teams: editForm.max_teams ? parseInt(editForm.max_teams) : null,
          contact_name: editForm.contact_name,
          contact_email: editForm.contact_email,
          contact_phone: editForm.contact_phone || null,
          website: editForm.website || null,
          banner_position: editForm.banner_position,
          venue_details: editForm.venue_details || null,
          additional_notes: editForm.additional_notes || null,
        })
        .eq('id', editingTournament.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Tournament updated successfully',
      });

      setEditingTournament(null);
      setEditForm(null);
      await fetchTournaments();
    } catch (error) {
      console.error('Error updating tournament:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tournament',
        variant: 'destructive',
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(editingTournament.id);
        return newSet;
      });
    }
  };

  const filteredTournaments = tournaments.filter(tournament =>
    tournament.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tournament.location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tournament Management</CardTitle>
          <div className="flex items-center gap-2 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button onClick={fetchTournaments} variant="outline">
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTournaments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No tournaments found</p>
              </div>
            ) : (
              filteredTournaments.map((tournament) => (
                <Card key={tournament.id} className="border-2">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{tournament.name}</h3>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <Badge variant="outline">{tournament.type}</Badge>
                              <Badge variant="outline">{tournament.format}</Badge>
                              <Badge 
                                variant={tournament.status === 'upcoming' ? 'default' : 'secondary'}
                              >
                                {tournament.status}
                              </Badge>
                            </div>
                          </div>
                          {tournament.banner_url && (
                            <img 
                              src={tournament.banner_url} 
                              alt={tournament.name}
                              className="w-24 h-24 object-cover rounded"
                              style={{
                                objectPosition: tournament.banner_position || 'center'
                              }}
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {formatDate(tournament.dates.start)} - {formatDate(tournament.dates.end)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{tournament.location.name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{tournament.ageGroups.join(', ')}</span>
                          </div>
                          <div className="text-muted-foreground">
                            ID: {tournament.id.slice(0, 8)}...
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTogglePublish(tournament.id, true)}
                            disabled={processingIds.has(tournament.id)}
                          >
                            {processingIds.has(tournament.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Eye className="h-4 w-4 mr-2" />
                                Publish
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleTogglePublish(tournament.id, false)}
                            disabled={processingIds.has(tournament.id)}
                          >
                            {processingIds.has(tournament.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <EyeOff className="h-4 w-4 mr-2" />
                                Unpublish
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(tournament)}
                            disabled={processingIds.has(tournament.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(`/tournaments/${tournament.slug || tournament.id}`, '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteConfirmId(tournament.id)}
                            disabled={processingIds.has(tournament.id)}
                          >
                            {processingIds.has(tournament.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tournament
              and all associated data including images.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Tournament Dialog */}
      <Dialog open={!!editingTournament} onOpenChange={(open) => !open && setEditingTournament(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Tournament</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Tournament Name *</Label>
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Location Name *</Label>
                  <Input
                    value={editForm.location_name}
                    onChange={(e) => setEditForm({ ...editForm, location_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Postcode *</Label>
                  <Input
                    value={editForm.postcode}
                    onChange={(e) => setEditForm({ ...editForm, postcode: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Region *</Label>
                  <Input
                    value={editForm.region}
                    onChange={(e) => setEditForm({ ...editForm, region: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Type *</Label>
                  <Input
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Start Date *</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>End Date *</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Format *</Label>
                  <Input
                    value={editForm.format}
                    onChange={(e) => setEditForm({ ...editForm, format: e.target.value })}
                    placeholder="3v3,5v5,7v7"
                  />
                </div>

                <div>
                  <Label>Age Groups * (comma-separated)</Label>
                  <Input
                    value={editForm.age_groups}
                    onChange={(e) => setEditForm({ ...editForm, age_groups: e.target.value })}
                    placeholder="U7,U8,U9"
                  />
                </div>

                <div>
                  <Label>Team Types * (comma-separated)</Label>
                  <Input
                    value={editForm.team_types}
                    onChange={(e) => setEditForm({ ...editForm, team_types: e.target.value })}
                    placeholder="boys,girls,mixed"
                  />
                </div>

                <div>
                  <Label>Registration Deadline</Label>
                  <Input
                    type="datetime-local"
                    value={editForm.registration_deadline}
                    onChange={(e) => setEditForm({ ...editForm, registration_deadline: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Cost Amount</Label>
                  <Input
                    type="number"
                    value={editForm.cost_amount}
                    onChange={(e) => setEditForm({ ...editForm, cost_amount: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Max Teams</Label>
                  <Input
                    type="number"
                    value={editForm.max_teams}
                    onChange={(e) => setEditForm({ ...editForm, max_teams: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Contact Name *</Label>
                  <Input
                    value={editForm.contact_name}
                    onChange={(e) => setEditForm({ ...editForm, contact_name: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Contact Email *</Label>
                  <Input
                    type="email"
                    value={editForm.contact_email}
                    onChange={(e) => setEditForm({ ...editForm, contact_email: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Contact Phone</Label>
                  <Input
                    value={editForm.contact_phone}
                    onChange={(e) => setEditForm({ ...editForm, contact_phone: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Website</Label>
                  <Input
                    value={editForm.website}
                    onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Banner Position</Label>
                  <select
                    className="w-full border rounded px-3 py-2"
                    value={editForm.banner_position}
                    onChange={(e) => setEditForm({ ...editForm, banner_position: e.target.value })}
                  >
                    <option value="center">Center</option>
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                    <option value="top left">Top Left</option>
                    <option value="top right">Top Right</option>
                    <option value="bottom left">Bottom Left</option>
                    <option value="bottom right">Bottom Right</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <Label>Venue Details</Label>
                  <Textarea
                    value={editForm.venue_details}
                    onChange={(e) => setEditForm({ ...editForm, venue_details: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Additional Notes</Label>
                  <Textarea
                    value={editForm.additional_notes}
                    onChange={(e) => setEditForm({ ...editForm, additional_notes: e.target.value })}
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setEditingTournament(null)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={editingTournament && processingIds.has(editingTournament.id)}
                >
                  {editingTournament && processingIds.has(editingTournament.id) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};