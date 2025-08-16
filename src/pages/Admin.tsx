import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Check, X, Users, Trophy, MessageSquare, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

interface Testimonial {
  id: string;
  author_name: string;
  author_email: string | null;
  rating: number;
  text: string;
  created_at: string;
  published: boolean;
  source: string;
}

interface AdminStats {
  totalUsers: number;
  totalTournaments: number;
  pendingReviews: number;
  publishedReviews: number;
}

export const Admin = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalTournaments: 0,
    pendingReviews: 0,
    publishedReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const { user, session } = useAuth();
  const { toast } = useToast();

  // Simple admin check - in a real app, you'd check roles in a profiles table
  const isAdmin = user?.email?.includes("admin") || user?.email?.includes("owner");

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTestimonials(),
        fetchStats()
      ]);
    } catch (error) {
      console.error("Error fetching admin data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    setTestimonials(data || []);
  };

  const fetchStats = async () => {
    // Get user count
    const { count: userCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    // Get tournament count
    const { count: tournamentCount } = await supabase
      .from("tournaments")
      .select("*", { count: "exact", head: true });

    // Get review counts
    const { count: pendingCount } = await supabase
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("published", false);

    const { count: publishedCount } = await supabase
      .from("testimonials")
      .select("*", { count: "exact", head: true })
      .eq("published", true);

    setStats({
      totalUsers: userCount || 0,
      totalTournaments: tournamentCount || 0,
      pendingReviews: pendingCount || 0,
      publishedReviews: publishedCount || 0
    });
  };

  const handleReviewAction = async (id: string, action: "approve" | "reject") => {
    setProcessingIds(prev => new Set(prev).add(id));
    
    try {
      if (action === "approve") {
        const { error } = await supabase
          .from("testimonials")
          .update({ published: true })
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Review Approved",
          description: "The review is now live on the website.",
        });
      } else {
        const { error } = await supabase
          .from("testimonials")
          .delete()
          .eq("id", id);

        if (error) throw error;

        toast({
          title: "Review Rejected",
          description: "The review has been deleted.",
        });
      }

      await fetchData();
    } catch (error) {
      console.error("Error processing review:", error);
      toast({
        title: "Error",
        description: "Failed to process review action",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const toggleReviewStatus = async (id: string, currentStatus: boolean) => {
    setProcessingIds(prev => new Set(prev).add(id));
    
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({ published: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: currentStatus ? "Review Hidden" : "Review Published",
        description: currentStatus 
          ? "The review is no longer visible on the website." 
          : "The review is now visible on the website.",
      });

      await fetchData();
    } catch (error) {
      console.error("Error toggling review status:", error);
      toast({
        title: "Error",
        description: "Failed to update review status",
        variant: "destructive",
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  if (!user || !session) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-4">
                You don't have permission to access the admin panel.
              </p>
              <Button onClick={() => window.history.back()}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingTestimonials = testimonials.filter(t => !t.published);
  const publishedTestimonials = testimonials.filter(t => t.published);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "fill-accent text-accent" : "text-muted-foreground"
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage platform content and monitor activity
          </p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTournaments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pendingReviews}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.publishedReviews}</div>
            </CardContent>
          </Card>
        </div>

        {/* Review Management */}
        <Card>
          <CardHeader>
            <CardTitle>Review Management</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending">
                  Pending ({pendingTestimonials.length})
                </TabsTrigger>
                <TabsTrigger value="published">
                  Published ({publishedTestimonials.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="space-y-4">
                {pendingTestimonials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending reviews to moderate
                  </div>
                ) : (
                  pendingTestimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="border-orange-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold">{testimonial.author_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">{renderStars(testimonial.rating)}</div>
                              <Badge variant="secondary">{testimonial.source}</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(testimonial.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <p className="mb-4 text-sm">{testimonial.text}</p>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReviewAction(testimonial.id, "approve")}
                            disabled={processingIds.has(testimonial.id)}
                            className="gap-2"
                          >
                            <Check className="h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReviewAction(testimonial.id, "reject")}
                            disabled={processingIds.has(testimonial.id)}
                            className="gap-2"
                          >
                            <X className="h-4 w-4" />
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="published" className="space-y-4">
                {publishedTestimonials.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No published reviews yet
                  </div>
                ) : (
                  publishedTestimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="border-green-200">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-semibold">{testimonial.author_name}</h4>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">{renderStars(testimonial.rating)}</div>
                              <Badge variant="secondary">{testimonial.source}</Badge>
                              <Badge className="bg-green-100 text-green-800">Published</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(testimonial.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <p className="mb-4 text-sm">{testimonial.text}</p>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleReviewStatus(testimonial.id, testimonial.published)}
                          disabled={processingIds.has(testimonial.id)}
                          className="gap-2"
                        >
                          <EyeOff className="h-4 w-4" />
                          Hide Review
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};