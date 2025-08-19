# Analytics Tracking Plan - Phase 1A

## Overview
This document outlines the tracking plan for Football Tournaments UK analytics implementation. Phase 1A focuses on read-only analytics with essential KPIs and monitoring.

---

## Event Categories

### 1. Page Views & Navigation

#### Tournament List Views
```javascript
// Event: page_view_tournaments_list
analytics.track('page_view_tournaments_list', {
  timestamp: Date.now(),
  route: '/tournaments',
  filters_applied: {
    city: string || null,
    type: string || null,
    format: string || null,
    date_range: { start: string, end: string } || null
  },
  results_count: number,
  user_id: string || null, // Only ID, no PII
  session_id: string
});
```

#### Tournament Detail Views
```javascript
// Event: page_view_tournament_detail  
analytics.track('page_view_tournament_detail', {
  timestamp: Date.now(),
  tournament_id: string,
  tournament_type: string,
  tournament_format: string,
  city: string,
  region: string,
  user_id: string || null,
  session_id: string,
  referrer_page: string
});
```

#### City Pages
```javascript
// Event: page_view_city_tournaments
analytics.track('page_view_city_tournaments', {
  timestamp: Date.now(),
  city: string,
  region: string,
  tournaments_count: number,
  user_id: string || null,
  session_id: string
});
```

### 2. User Interactions

#### Search Usage
```javascript
// Event: search_performed
analytics.track('search_performed', {
  timestamp: Date.now(),
  search_query: string,
  results_count: number,
  filters_active: boolean,
  user_id: string || null,
  session_id: string
});
```

#### Filter Usage
```javascript
// Event: filter_applied
analytics.track('filter_applied', {
  timestamp: Date.now(),
  filter_type: 'city' | 'type' | 'format' | 'date' | 'age_group',
  filter_value: string,
  previous_results_count: number,
  new_results_count: number,
  user_id: string || null,
  session_id: string
});

// Event: filter_cleared
analytics.track('filter_cleared', {
  timestamp: Date.now(),
  filter_type: 'city' | 'type' | 'format' | 'date' | 'age_group' | 'all',
  user_id: string || null,
  session_id: string
});
```

#### Map Interactions
```javascript
// Event: map_marker_clicked
analytics.track('map_marker_clicked', {
  timestamp: Date.now(),
  tournament_id: string,
  city: string,
  user_id: string || null,
  session_id: string
});
```

### 3. Registration Funnel (Mock Data for Phase 1A)

#### Registration Intent
```javascript
// Event: registration_start (Future implementation)
analytics.track('registration_start', {
  timestamp: Date.now(),
  tournament_id: string,
  tournament_type: string,
  user_id: string,
  session_id: string,
  source_page: string
});
```

#### Registration Completion
```javascript
// Event: registration_complete (Future implementation)
analytics.track('registration_complete', {
  timestamp: Date.now(),
  tournament_id: string,
  user_id: string,
  session_id: string,
  time_to_complete: number, // milliseconds
  steps_completed: number
});
```

### 4. Authentication & User Lifecycle

#### User Registration
```javascript
// Event: user_registered
analytics.track('user_registered', {
  timestamp: Date.now(),
  user_id: string, // Hash/UUID only
  registration_method: 'email',
  verification_email_sent: boolean,
  session_id: string
});
```

#### Email Verification
```javascript
// Event: email_verified
analytics.track('email_verified', {
  timestamp: Date.now(),
  user_id: string,
  time_to_verify: number, // milliseconds from registration
  verification_attempts: number
});
```

#### Login Activity
```javascript
// Event: user_login
analytics.track('user_login', {
  timestamp: Date.now(),
  user_id: string,
  login_method: 'email',
  session_id: string
});
```

### 5. PWA & Mobile Experience

#### PWA Install Prompt
```javascript
// Event: pwa_prompt_shown
analytics.track('pwa_prompt_shown', {
  timestamp: Date.now(),
  trigger: 'automatic' | 'manual',
  user_engagement_score: number,
  page_views: number,
  time_on_site: number, // milliseconds
  user_id: string || null,
  session_id: string
});
```

#### PWA Installation
```javascript
// Event: pwa_installed
analytics.track('pwa_installed', {
  timestamp: Date.now(),
  time_from_prompt: number, // milliseconds
  user_id: string || null,
  session_id: string
});

// Event: pwa_prompt_dismissed
analytics.track('pwa_prompt_dismissed', {
  timestamp: Date.now(),
  dismissal_reason: 'user_dismissed' | 'auto_dismissed',
  user_id: string || null,
  session_id: string
});
```

### 6. Performance Monitoring

#### Core Web Vitals
```javascript
// Event: core_web_vital_measured
analytics.track('core_web_vital_measured', {
  timestamp: Date.now(),
  metric_name: 'LCP' | 'FID' | 'CLS' | 'TTFB' | 'FCP',
  metric_value: number,
  metric_rating: 'good' | 'needs-improvement' | 'poor',
  page_route: string,
  session_id: string
});
```

#### API Performance
```javascript
// Event: api_request_completed
analytics.track('api_request_completed', {
  timestamp: Date.now(),
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  response_time: number, // milliseconds
  status_code: number,
  session_id: string
});
```

#### Error Tracking
```javascript
// Event: frontend_error
analytics.track('frontend_error', {
  timestamp: Date.now(),
  error_type: 'javascript' | 'network' | 'rendering',
  error_message: string, // Sanitized, no PII
  page_route: string,
  user_agent: string,
  session_id: string
});
```

---

## Implementation Strategy

### Phase 1A (Current - Read-Only Analytics)
- **Focus**: Essential KPIs and monitoring
- **Data Sources**: Database queries, simulated funnel data
- **Real Events**: Page views, user interactions, performance metrics
- **Mock Events**: Registration funnel, PWA metrics

### Frontend Implementation
```javascript
// utils/analytics.ts
export const trackEvent = (eventName: string, properties: object) => {
  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log('Analytics Event:', eventName, properties);
  }
  
  // Future: Send to analytics service
  // analytics.track(eventName, properties);
};

// Hook for page tracking
export const usePageTracking = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackEvent('page_view', {
      route: location.pathname,
      timestamp: Date.now(),
      // ... other properties
    });
  }, [location]);
};
```

### Backend Implementation (Future)
```javascript
// Edge function: analytics-collector
export default async function handler(req: Request) {
  const event = await req.json();
  
  // Validate event structure
  if (!isValidEvent(event)) {
    return new Response('Invalid event', { status: 400 });
  }
  
  // Store in analytics table
  await supabase
    .from('analytics_events')
    .insert({
      event_name: event.name,
      properties: event.properties,
      timestamp: new Date(event.timestamp),
      session_id: event.session_id,
      user_id: event.user_id
    });
    
  return new Response('OK');
}
```

---

## Data Privacy & GDPR Compliance

### PII Handling
- **Never Track**: Email addresses, names, phone numbers, exact locations
- **Always Use**: Hashed user IDs, aggregated data, city-level geography
- **Session Data**: Temporary session IDs, cleared on session end

### Consent Management
```javascript
// Only track if consent is given
const trackWithConsent = (eventName: string, properties: object) => {
  const hasConsent = localStorage.getItem('analytics_consent') === 'true';
  
  if (hasConsent) {
    trackEvent(eventName, properties);
  }
};
```

### Data Retention
- **Analytics Events**: 2 years maximum
- **Aggregated Reports**: Indefinite (no PII)
- **User Sessions**: 30 days maximum

---

## Testing & Validation

### Development Testing
```javascript
// Test events in development
if (process.env.NODE_ENV === 'development') {
  window.analyticsTest = {
    trackPageView: () => trackEvent('page_view_tournaments_list', { /* test data */ }),
    trackSearch: () => trackEvent('search_performed', { /* test data */ }),
    trackFilter: () => trackEvent('filter_applied', { /* test data */ })
  };
}
```

### Quality Assurance
1. **Event Schema Validation**: Ensure all events match schema
2. **PII Detection**: Automated scanning for personal data
3. **Performance Impact**: Monitor analytics code performance
4. **Data Accuracy**: Validate metrics against database queries

---

## Monitoring & Alerts

### Key Metrics to Monitor
- Event volume (sudden drops may indicate tracking issues)
- Data quality (missing required fields)
- Performance impact of tracking code
- User consent rates

### Future Alert Thresholds
- Error rate > 2%
- API latency > 500ms
- Core Web Vitals in "poor" range
- PWA install rate < 20%

---

## Migration Path

### Phase 1A → 1B
1. Implement real-time event collection
2. Add user segmentation
3. Enable A/B testing framework
4. Add custom dashboard builder

### Phase 1B → 2.0
1. Advanced funnel analysis
2. Cohort analysis
3. Predictive analytics
4. Marketing attribution

---

## Technical Architecture

### Data Flow
```
Frontend Events → Local Storage (temp) → Analytics API → Supabase → Dashboard
                                      ↓
                               External Services (GA4, etc.)
```

### Database Schema (Future)
```sql
-- Analytics events table
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  properties JSONB NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_analytics_events_name_timestamp ON analytics_events(event_name, timestamp);
CREATE INDEX idx_analytics_events_user_timestamp ON analytics_events(user_id, timestamp);
```

---

*Last Updated: 2024-01-19*
*Version: 1.0 (Phase 1A)*
