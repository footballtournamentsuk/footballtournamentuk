# SEO Component Migration Guide

## Quick Reference: How to Migrate Pages to UnifiedSEO

### Step 1: Import UnifiedSEO
```typescript
// Old
import { SEO } from '@/components/SEO';

// New
import { UnifiedSEO } from '@/components/UnifiedSEO';
```

### Step 2: Replace SEO Component
```typescript
// Old
<SEO
  title="Page Title"
  description="Page description"
  canonicalUrl="/page-url"
/>

// New
<UnifiedSEO
  title="Page Title"
  description="Page description"
  canonicalUrl="/page-url"
  keywords="keyword1, keyword2, keyword3"
  structuredData={[/* optional schemas */]}
/>
```

---

## Migration Checklist by Page

### ✅ Completed
- [x] FAQ.tsx
- [x] Support.tsx

### 🔄 High Priority (Do Next)
- [ ] Index.tsx (homepage)
- [ ] Tournaments.tsx
- [ ] TournamentDetails.tsx
- [ ] CityTournaments.tsx

### Medium Priority
- [ ] About.tsx
- [ ] HowItWorks.tsx
- [ ] YouthTournaments.tsx
- [ ] TournamentFormats.tsx
- [ ] Regions.tsx

### Low Priority
- [ ] Terms.tsx
- [ ] Policies.tsx
- [ ] Partners.tsx
- [ ] ImageCredits.tsx
- [ ] AffiliateDisclosure.tsx
- [ ] EditorialPolicy.tsx
- [ ] CookiePolicy.tsx
- [ ] NoticeAndTakedown.tsx

---

## Keyword Suggestions by Page

### Homepage (Index.tsx)
```
"football tournaments UK, youth football, grassroots football, UK football competitions, football events, tournament finder"
```

### Tournaments.tsx
```
"find football tournaments, search football events, UK tournament listings, football competitions near me, football tournament search"
```

### About.tsx
```
"about football tournaments UK, free tournament platform, grassroots football mission, youth football development UK"
```

### How It Works.tsx
```
"how to list football tournament, find youth football events, tournament organizer guide, football competition hosting"
```

### Youth Tournaments.tsx
```
"youth football tournaments UK, junior football competitions, U6-U21 football, children's football leagues, school football tournaments"
```

### Tournament Formats.tsx
```
"football tournament formats, 3v3 5v5 7v7 9v9 11v11, small-sided football, youth football formats, tournament format guide"
```

### Regions.tsx
```
"football tournaments by region, regional football events, England Scotland Wales football, London Manchester Birmingham tournaments"
```

---

## Example Migrations

### Example 1: About.tsx
```typescript
// BEFORE
<SEO
  title="About Us - Football Tournaments UK | Connecting Teams, Inspiring Players"
  description="Learn about Football Tournaments UK - the UK's premier free platform for youth football tournaments."
  canonicalUrl="/about"
  isHomePage={false}
/>

// AFTER
<UnifiedSEO
  title="About Us - Football Tournaments UK | Connecting Teams, Inspiring Players"
  description="Learn about Football Tournaments UK - the UK's premier free platform for youth football tournaments. Connecting teams, inspiring players, and growing the game nationwide."
  canonicalUrl="/about"
  keywords="about football tournaments UK, free tournament platform, grassroots football mission, youth football development UK, football community UK"
  structuredData={[
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      'name': 'About Football Tournaments UK',
      'description': 'Learn about the UK\'s premier free platform for youth football tournaments'
    }
  ]}
/>
```

### Example 2: How It Works.tsx
```typescript
// BEFORE
<SEO
  title="How It Works - Football Tournaments UK"
  description="Learn how to find and list football tournaments on our platform."
  canonicalUrl="/how-it-works"
/>

// AFTER
<UnifiedSEO
  title="How It Works - Football Tournaments UK | Easy Tournament Listing & Discovery"
  description="Learn how to find and list football tournaments on our platform. Free, simple, and accessible for organizers, teams, and players across the UK."
  canonicalUrl="/how-it-works"
  keywords="how to list football tournament, find youth football events, football tournament organizer guide, UK football competitions, tournament hosting guide"
  structuredData={[
    {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      'name': 'How to List a Football Tournament',
      'description': 'Step-by-step guide to listing football tournaments on Football Tournaments UK',
      'step': [
        {
          '@type': 'HowToStep',
          'position': 1,
          'name': 'Sign Up Free',
          'text': 'Create your account in under 2 minutes'
        },
        {
          '@type': 'HowToStep',
          'position': 2,
          'name': 'Add Tournament Details',
          'text': 'Fill in tournament information including dates, formats, and location'
        }
        // ... more steps
      ]
    }
  ]}
/>
```

---

## Benefits of UnifiedSEO

### ✅ Consistent Meta Tags
- All pages have same meta tag structure
- No missing canonical URLs
- Proper OG images and Twitter cards

### ✅ Better SEO
- Keywords on every page
- Structured data support
- Enhanced social sharing

### ✅ Easier Maintenance
- Single source of truth
- Update once, applies everywhere
- Type-safe with TypeScript

### ✅ Better Performance
- Optimized meta tag rendering
- No duplicate code
- Cleaner component structure

---

## Common Mistakes to Avoid

### ❌ Forgetting Keywords
```typescript
// Wrong
<UnifiedSEO
  title="Page Title"
  description="Description"
  canonicalUrl="/page"
/>

// Right
<UnifiedSEO
  title="Page Title"
  description="Description"
  canonicalUrl="/page"
  keywords="relevant, keywords, here"
/>
```

### ❌ Wrong Canonical URL Format
```typescript
// Wrong
<UnifiedSEO
  canonicalUrl="https://footballtournamentsuk.co.uk/page"
/>

// Right
<UnifiedSEO
  canonicalUrl="/page"  // UnifiedSEO adds domain automatically
/>
```

### ❌ Missing Description
```typescript
// Wrong
<UnifiedSEO
  title="Page Title"
  canonicalUrl="/page"
  // Missing description
/>

// Right - Description is REQUIRED
<UnifiedSEO
  title="Page Title"
  description="Clear, concise description under 160 characters"
  canonicalUrl="/page"
/>
```

---

## Testing After Migration

### 1. Visual Check
- Open page in browser
- View page source (Ctrl+U / Cmd+U)
- Verify meta tags are present:
  - `<title>`
  - `<meta name="description">`
  - `<meta name="keywords">`
  - `<link rel="canonical">`
  - `<meta property="og:*">`
  - `<meta name="twitter:*">`

### 2. Schema Validation
- Use Google's Rich Results Test
- URL: https://search.google.com/test/rich-results
- Paste your page URL
- Check for errors

### 3. Social Sharing Preview
- Facebook Debugger: https://developers.facebook.com/tools/debug/
- Twitter Card Validator: https://cards-dev.twitter.com/validator
- LinkedIn Post Inspector: https://www.linkedin.com/post-inspector/

### 4. Mobile-Friendly Test
- https://search.google.com/test/mobile-friendly
- Verify page renders correctly on mobile

---

## Need Help?

If you encounter issues during migration:

1. Check the UnifiedSEO.tsx component for props interface
2. Review completed migrations (FAQ.tsx, Support.tsx) as examples
3. Verify all required props are provided
4. Test in browser after changes

---

**Last Updated:** October 8, 2025
