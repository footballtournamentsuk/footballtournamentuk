import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ReviewModal } from "./ReviewModal";
import { ReviewsCarousel } from "./ReviewsCarousel";
import { supabase } from "@/integrations/supabase/client";

export const ReviewsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reviewStats, setReviewStats] = useState<{
    averageRating: number;
    totalReviews: number;
  } | null>(null);

  useEffect(() => {
    fetchReviewStats();
  }, []);

  const fetchReviewStats = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("rating")
        .eq("published", true);

      if (error) throw error;

      if (data && data.length > 0) {
        const total = data.length;
        const sum = data.reduce((acc, review) => acc + review.rating, 0);
        const average = sum / total;

        setReviewStats({
          averageRating: Math.round(average * 10) / 10, // Round to 1 decimal
          totalReviews: total,
        });
      }
    } catch (error) {
      console.error("Error fetching review stats:", error);
    }
  };

  // Generate JSON-LD structured data for SEO
  const generateStructuredData = () => {
    if (!reviewStats || reviewStats.totalReviews === 0) return null;

    return {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Football Tournament Listings",
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: reviewStats.averageRating,
        reviewCount: reviewStats.totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
    };
  };

  const structuredData = generateStructuredData();

  return (
    <section className="container mx-auto px-4 py-16" id="reviews">
      {/* Add structured data for SEO */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}

      <div className="space-y-8">
        {/* Leave Review Button */}
        <div className="text-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Leave a Review
          </Button>
        </div>

        {/* Reviews Carousel */}
        <ReviewsCarousel />

        {/* Review Modal */}
        <ReviewModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    </section>
  );
};