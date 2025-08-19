# Analytics Metrics Dictionary

## Overview
This document defines all metrics, formulas, and event names used in the Football Tournaments UK analytics dashboard (Phase 1A).

---

## Tournament KPIs

### Total Tournaments
- **Definition**: Total number of tournaments in the system
- **Formula**: `COUNT(*) FROM tournaments`
- **Source**: `tournaments` table
- **Refresh**: Real-time

### Active Tournaments
- **Definition**: Tournaments currently running (between start_date and end_date)
- **Formula**: `COUNT(*) FROM tournaments WHERE NOW() BETWEEN start_date AND end_date`
- **Source**: `tournaments` table
- **Refresh**: Real-time

### Expired/Completed Tournaments
- **Definition**: Tournaments that have finished (end_date < NOW())
- **Formula**: `COUNT(*) FROM tournaments WHERE end_date < NOW()`
- **Source**: `tournaments` table
- **Refresh**: Real-time

### Demo vs Real Tournaments
- **Demo Definition**: Tournaments without an organizer_id (system-generated demo data)
- **Real Definition**: Tournaments with an organizer_id (created by real users)
- **Formula**: 
  - Demo: `COUNT(*) FROM tournaments WHERE organizer_id IS NULL`
  - Real: `COUNT(*) FROM tournaments WHERE organizer_id IS NOT NULL`
- **Source**: `tournaments` table

### Tournament Trends
- **7-day Trend**: New tournaments created in the last 7 days
- **30-day Trend**: New tournaments created in the last 30 days
- **Formula**: `COUNT(*) FROM tournaments WHERE created_at >= NOW() - INTERVAL '7 days'`
- **Source**: `tournaments` table

### Format Popularity
- **Definition**: Distribution of tournaments by format (5v5, 7v7, 11v11, etc.)
- **Formula**: `GROUP BY format ORDER BY COUNT(*) DESC`
- **Source**: `tournaments.format` column

### Type Distribution
- **Definition**: Distribution of tournaments by type (Tournament, League, Cup, etc.)
- **Formula**: `GROUP BY type ORDER BY COUNT(*) DESC`
- **Source**: `tournaments.type` column

---

## User & Auth Health

### Total Users
- **Definition**: Total registered user profiles
- **Formula**: `COUNT(*) FROM profiles`
- **Source**: `profiles` table
- **Refresh**: Real-time

### Sign-up Trends
- **7-day Sign-ups**: New user registrations in the last 7 days
- **30-day Sign-ups**: New user registrations in the last 30 days
- **Formula**: `COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days'`
- **Source**: `profiles` table

### Email Verification Rate
- **Definition**: Percentage of users who have verified their email addresses
- **Formula**: `(verified_users / total_users) * 100`
- **Source**: `auth.users` table (requires service role access)
- **Note**: Currently mocked at 94.5% (real implementation needs auth.users access)

### Average Time to Verify
- **Definition**: Average time between user signup and email verification
- **Formula**: `AVG(email_confirmed_at - created_at)`
- **Source**: `auth.users` table
- **Unit**: Hours
- **Note**: Currently mocked at 2.3 hours

### Password Reset Success Rate
- **Definition**: Percentage of password reset attempts that are completed
- **Formula**: `(successful_resets / total_reset_attempts) * 100`
- **Source**: Auth logs (future implementation)
- **Status**: Not yet implemented

---

## Funnel Metrics

### List Views
- **Definition**: Number of times the tournament listing page is viewed
- **Event Name**: `page_view_tournaments_list`
- **Source**: Frontend analytics events
- **Status**: Currently mocked (1,250)

### Detail Views
- **Definition**: Number of times individual tournament detail pages are viewed
- **Event Name**: `page_view_tournament_detail`
- **Source**: Frontend analytics events
- **Status**: Currently mocked (380)

### Registration Starts
- **Definition**: Number of times users begin the tournament registration process
- **Event Name**: `registration_start`
- **Source**: Frontend analytics events
- **Status**: Currently mocked (85)

### Registration Completions
- **Definition**: Number of successfully completed tournament registrations
- **Event Name**: `registration_complete`
- **Source**: Frontend analytics events
- **Status**: Currently mocked (67)

### Conversion Rates
- **List → Detail**: `(detail_views / list_views) * 100`
- **Detail → Registration Start**: `(registration_starts / detail_views) * 100`
- **Registration Start → Complete**: `(registration_completions / registration_starts) * 100`
- **Overall (List → Complete)**: `(registration_completions / list_views) * 100`

### Drop-off Rate
- **Definition**: Percentage of users who don't complete the full funnel
- **Formula**: `((list_views - registration_completions) / list_views) * 100`
- **Current**: 21.2% (mocked)

---

## Geography Metrics

### Top Cities
- **Definition**: Cities with the most tournaments, ranked by count
- **Formula**: `GROUP BY location_name ORDER BY COUNT(*) DESC LIMIT 10`
- **Source**: `tournaments.location_name` column

### Top Postcodes
- **Definition**: Postcodes with the most tournaments, ranked by count
- **Formula**: `GROUP BY postcode ORDER BY COUNT(*) DESC LIMIT 10`
- **Source**: `tournaments.postcode` column

### Regional Distribution
- **Definition**: Distribution of tournaments across UK regions
- **Formula**: `GROUP BY region ORDER BY COUNT(*) DESC`
- **Source**: `tournaments.region` column

### Tournament Density
- **Definition**: Tournaments per capita by region/city
- **Formula**: `tournaments_count / population` (requires population data)
- **Status**: Future enhancement

---

## Performance Metrics

### Core Web Vitals

#### LCP (Largest Contentful Paint)
- **Definition**: Time until the largest content element is rendered
- **Good**: ≤ 2.5 seconds
- **Needs Improvement**: 2.5 - 4.0 seconds  
- **Poor**: > 4.0 seconds
- **Source**: `web-vitals` library
- **Current**: 2,200ms (simulated)

#### FID (First Input Delay)
- **Definition**: Time from first user interaction to browser response
- **Good**: ≤ 100ms
- **Needs Improvement**: 100 - 300ms
- **Poor**: > 300ms
- **Source**: `web-vitals` library
- **Current**: 85ms (simulated)

#### CLS (Cumulative Layout Shift)
- **Definition**: Visual stability measure (lower is better)
- **Good**: ≤ 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25
- **Source**: `web-vitals` library
- **Current**: 0.08 (simulated)

### API Performance
- **Average Latency**: Mean response time for API requests
- **Source**: Backend monitoring (future: APM tool)
- **Current**: 245ms (mocked)

### Error Rate
- **Definition**: Percentage of requests that result in errors
- **Formula**: `(error_requests / total_requests) * 100`
- **Source**: Error tracking service
- **Current**: 0.8% (mocked)

---

## PWA Metrics

### Install Prompts Shown
- **Definition**: Number of times the PWA install prompt is displayed
- **Event Name**: `pwa_prompt_shown`
- **Source**: Frontend PWA events
- **Current**: 245 (mocked)

### Install Completions
- **Definition**: Number of successful PWA installations
- **Event Name**: `pwa_installed`
- **Source**: Frontend PWA events
- **Current**: 67 (mocked)

### Install Conversion Rate
- **Definition**: Percentage of prompts that result in installations
- **Formula**: `(install_completions / prompts_shown) * 100`
- **Current**: 27.3%

### 7-day Retention
- **Definition**: Percentage of PWA users who return within 7 days
- **Formula**: `(returning_users_7d / new_installs) * 100`
- **Current**: 89% (mocked)

---

## SEO Metrics

### Indexed Pages
- **Definition**: Pages successfully indexed by search engines
- **Source**: Google Search Console API
- **Status**: Future implementation

### Excluded Pages
- **Definition**: Pages excluded from search index
- **Source**: Google Search Console API
- **Status**: Future implementation

### Schema Warnings
- **Definition**: Structured data validation issues
- **Source**: Google Search Console API / Schema validator
- **Status**: Future implementation

---

## Data Privacy & GDPR Compliance

### Privacy Guidelines
- No personally identifiable information (PII) is stored in analytics
- Only user IDs and aggregated data are used
- All data adheres to GDPR requirements
- Data retention follows platform policy

### Anonymization
- User emails are not stored in analytics
- Location data is aggregated at city/region level
- No individual user behavior tracking beyond aggregate metrics

---

## Event Tracking Plan

### Frontend Events (Phase 1A - Read Only)
```javascript
// Page views
analytics.track('page_view_tournaments_list', { timestamp, route });
analytics.track('page_view_tournament_detail', { tournament_id, timestamp });

// User interactions
analytics.track('search_performed', { query, results_count });
analytics.track('filter_applied', { filter_type, filter_value });

// PWA events
analytics.track('pwa_prompt_shown', { timestamp });
analytics.track('pwa_installed', { timestamp });

// Performance events
analytics.track('core_web_vital', { metric_name, value, rating });
analytics.track('api_error', { endpoint, error_code, timestamp });
```

### Backend Events (Future Implementation)
```javascript
// Tournament lifecycle
analytics.track('tournament_created', { tournament_id, organizer_id });
analytics.track('tournament_published', { tournament_id });

// User lifecycle  
analytics.track('user_registered', { user_id, verification_sent });
analytics.track('email_verified', { user_id, time_to_verify });
```

---

## Refresh Rates & Caching

| Metric Category | Refresh Rate | Cache TTL |
|----------------|--------------|-----------|
| Tournament KPIs | Real-time | 0s |
| User Analytics | Real-time | 0s |
| Geography Data | Real-time | 0s |
| Funnel Metrics | Event-driven | N/A |
| Performance | 5 minutes | 300s |
| PWA Metrics | Event-driven | N/A |

---

## Future Enhancements (Out of Scope for Phase 1A)

1. **Advanced Segmentation**: User cohorts, behavior segments
2. **Revenue Metrics**: If payment processing is added
3. **Marketing Attribution**: Campaign tracking, referral sources
4. **A/B Testing**: Experiment tracking and analysis
5. **Real-time Alerts**: Threshold-based notifications
6. **Custom Dashboards**: User-configurable views
7. **Data Export**: CSV/Excel download functionality
8. **API Integration**: Google Analytics, Search Console APIs

---

*Last Updated: 2024-01-19*
*Version: 1.0 (Phase 1A)*