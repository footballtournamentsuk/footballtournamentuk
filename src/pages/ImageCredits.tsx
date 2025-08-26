import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';

export default function ImageCredits() {
  return (
    <>
      <SEO 
        title="Image Credits & Licensing | Football Tournaments UK"
        description="Image licensing information, attribution requirements, and takedown procedures for Football Tournaments UK."
        canonicalUrl="/image-credits"
      />
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Image Credits & Licensing</h1>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Image Usage and Attribution</CardTitle>
              </CardHeader>
              <CardContent className="prose max-w-none">
                <p className="lead">
                  This page outlines our image licensing, attribution policies, and procedures 
                  for content creators and rights holders.
                </p>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>1. Image Sources</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Licensed Stock Photography</h3>
                  <p>
                    We use properly licensed images from reputable stock photography services including:
                  </p>
                  <ul>
                    <li>Unsplash (Creative Commons and Unsplash License)</li>
                    <li>Pexels (Pexels License)</li>
                    <li>Shutterstock (Standard License)</li>
                    <li>Getty Images (Editorial and Commercial Licenses)</li>
                  </ul>

                  <h3>User-Contributed Content</h3>
                  <p>
                    Tournament organisers and users may upload images related to their events. 
                    By uploading, users confirm they have the right to use and license these images.
                  </p>

                  <h3>Original Photography</h3>
                  <p>
                    Some images are taken by our team or contributors specifically for 
                    Football Tournaments UK content.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>2. Licensing and Usage Rights</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Our Usage Rights</h3>
                  <p>
                    All images used on our platform are licensed appropriately for our intended use, 
                    which includes:
                  </p>
                  <ul>
                    <li>Website display and digital marketing</li>
                    <li>Social media promotion</li>
                    <li>Print materials where applicable</li>
                    <li>Editorial and commercial use as licensed</li>
                  </ul>

                  <h3>User Responsibilities</h3>
                  <p>
                    Users uploading images to our platform must ensure they have:
                  </p>
                  <ul>
                    <li>Full rights to use and license the image</li>
                    <li>Permission from any identifiable people in the image</li>
                    <li>Rights to grant us a license for platform use</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>3. Attribution Requirements</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Creative Commons Content</h3>
                  <p>
                    Where we use Creative Commons licensed content, we provide appropriate attribution 
                    including:
                  </p>
                  <ul>
                    <li>Creator name and source</li>
                    <li>License type and link</li>
                    <li>Indication of any modifications made</li>
                  </ul>

                  <h3>Professional Photography</h3>
                  <p>
                    Professional photographers and agencies are credited where required by license terms 
                    or professional courtesy.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>4. Fair Use and Editorial Content</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    Some images may be used under fair dealing provisions for:
                  </p>
                  <ul>
                    <li>News reporting and commentary</li>
                    <li>Educational purposes</li>
                    <li>Critical review or analysis</li>
                  </ul>
                  
                  <p>
                    We ensure such use is proportionate, properly attributed, and serves a legitimate 
                    editorial purpose.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>5. Takedown Procedure</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <h3>Copyright Concerns</h3>
                  <p>
                    If you believe we are using your copyrighted image without permission, please contact us with:
                  </p>
                  <ul>
                    <li>Specific image(s) and location on our site</li>
                    <li>Proof of ownership or representation</li>
                    <li>Your contact information</li>
                    <li>A statement of good faith belief that use is unauthorised</li>
                  </ul>

                  <h3>Response Time</h3>
                  <p>
                    We aim to respond to legitimate takedown requests within 48 hours and will 
                    remove disputed content promptly while investigating.
                  </p>

                  <h3>Counter-Notification</h3>
                  <p>
                    If you believe content was removed in error, you may submit a counter-notification 
                    with supporting evidence of your right to use the image.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>6. Image Quality Standards</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    We maintain quality standards for images on our platform:
                  </p>
                  <ul>
                    <li>Appropriate resolution for web display</li>
                    <li>Relevant to football tournaments and events</li>
                    <li>Professional or high amateur quality</li>
                    <li>Free from offensive or inappropriate content</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>7. Contact for Image Issues</CardTitle>
                </CardHeader>
                <CardContent className="prose max-w-none">
                  <p>
                    For all image-related inquiries, including licensing, attribution, or takedown requests:
                  </p>
                  <p>
                    <strong>Email:</strong> info@footballtournamentsuk.co.uk<br />
                    <strong>Subject:</strong> Image Rights - [Description]
                  </p>
                  
                  <p>
                    Please include as much detail as possible to help us respond quickly and effectively.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}