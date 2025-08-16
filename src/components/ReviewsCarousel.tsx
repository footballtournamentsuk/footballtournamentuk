import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

// Google Icon SVG Component
const GoogleIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={cn("w-4 h-4", className)}
    fill="none"
  >
    <path 
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" 
      fill="#4285F4"
    />
    <path 
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" 
      fill="#34A853"
    />
    <path 
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" 
      fill="#FBBC05"
    />
    <path 
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" 
      fill="#EA4335"
    />
  </svg>
);

interface Review {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
  source: string;
}

export const ReviewsCarousel = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("id, author_name, rating, text, created_at, source")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + "...";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Create duplicated reviews for seamless loop
  const duplicatedReviews = reviews.length > 0 ? [...reviews, ...reviews] : [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">What organizers say</h2>
          <p className="text-muted-foreground">Real feedback from teams and hosts using our free listings.</p>
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="flex-1 animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="h-4 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">What organizers say</h2>
        <p className="text-muted-foreground mb-6">Real feedback from teams and hosts using our free listings.</p>
        <p className="text-muted-foreground">Be the first to leave a review.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">What organizers say</h2>
        <p className="text-muted-foreground">Real feedback from teams and hosts using our free listings.</p>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex gap-4 hover:pause"
          style={{
            width: `${duplicatedReviews.length * 320}px`,
            animation: `scroll-continuous ${reviews.length * 10}s linear infinite`,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.animationPlayState = 'paused';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.animationPlayState = 'running';
          }}
        >
          {duplicatedReviews.map((review, index) => (
            <div key={`${review.id}-${index}`} className="w-80 flex-shrink-0">
              <Card className="h-full hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6 flex flex-col h-full">
                  {/* Rating Stars */}
                  <div className="flex gap-1 mb-3" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-4 w-4",
                          star <= review.rating
                            ? "fill-accent text-accent"
                            : "text-muted-foreground"
                        )}
                      />
                    ))}
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-foreground leading-relaxed mb-4 flex-1">
                    "{truncateText(review.text)}"
                  </blockquote>

                  {/* Author Info */}
                  <div className="flex items-center gap-3 mt-auto">
                    {/* Avatar with Initials */}
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {getInitials(review.author_name)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">
                        {review.author_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatDate(review.created_at)}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <GoogleIcon />
                          <span>Google Review</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};