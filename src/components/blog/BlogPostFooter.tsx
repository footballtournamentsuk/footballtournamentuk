import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, Calendar, User } from 'lucide-react';
import { BlogPost } from '@/types/blog';
import { formatPublishDate } from '@/utils/blogUtils';
import { SupportModal } from '@/components/SupportModal';

interface BlogPostFooterProps {
  post: BlogPost;
}

export function BlogPostFooter({ post }: BlogPostFooterProps) {
  const location = useLocation();
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  const handleContactClick = () => {
    setIsSupportModalOpen(true);
  };

  return (
    <>
      <div className="mt-12 space-y-6">
      {/* Author and Date Meta */}
      <div className="flex flex-wrap items-center gap-4 py-4 border-t border-border text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>BY ADMIN</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>Published: {formatPublishDate(post.published_at || post.created_at)}</span>
        </div>
        {post.updated_at !== post.created_at && (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Last updated: {formatPublishDate(post.updated_at)}</span>
          </div>
        )}
      </div>

      {/* Disclaimers */}
      <Card className="bg-muted/50">
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Information & Pricing Disclaimer</h3>
            <p className="text-sm text-muted-foreground">
              Tournament information, dates, and pricing are subject to change without notice. 
              We recommend verifying all details directly with the tournament organiser before making any commitments or payments.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2">No Professional Advice</h3>
            <p className="text-sm text-muted-foreground">
              This content is for informational purposes only and should not be considered as professional advice. 
              Always consult with qualified professionals for specific guidance relating to your circumstances.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-sm mb-2">Sources & Trademarks</h3>
            <p className="text-sm text-muted-foreground">
              Information is compiled from publicly available sources and our own research. 
              All trademarks, team names, and logos are the property of their respective owners.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact Block */}
      <Card>
        <CardContent className="p-6 text-center">
          <div className="flex items-center justify-center mb-3">
            <Mail className="h-5 w-5 mr-2 text-primary" />
            <h3 className="font-semibold">Questions or Corrections?</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Have feedback about this post or spotted an error? We&apos;d love to hear from you.
          </p>
          <Button 
            onClick={handleContactClick}
            variant="outline" 
            size="sm"
            aria-label={`Contact us about blog post: ${post.title}`}
          >
            Contact Us
          </Button>
        </CardContent>
      </Card>

      {/* Legal Links */}
      <div className="border-t border-border pt-6">
        <div className="text-center space-y-4">
          <h4 className="font-semibold text-sm">Legal & Policies</h4>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            <Link 
              to="/policies?tab=terms" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Terms of Use
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/policies?tab=editorial" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Editorial Policy
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/policies?tab=images" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Image Credits
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/policies?tab=takedown" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Notice & Takedown
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/policies?tab=affiliate" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Affiliate Disclosure
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link 
              to="/policies?tab=pricing" 
              className="text-muted-foreground hover:text-foreground underline"
            >
              Pricing Disclaimer
            </Link>
          </div>
        </div>
      </div>
      </div>

      {/* Support Modal */}
      <SupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        defaultSubject={`Blog Feedback: ${post.title}`}
        defaultCategory="General"
        defaultMessage={`I have feedback regarding the blog post:

Title: ${post.title}
URL: ${window.location.href}
Slug: ${post.slug}

My feedback:
`}
      />
    </>
  );
}