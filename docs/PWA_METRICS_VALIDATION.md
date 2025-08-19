# PWA Metrics Validation Guide

## Current Status: LIVE DATA (as of latest update)

The PWA metrics in Admin → Analytics → PWA are now pulling **real production data** from the `analytics_events` table.

## Data Sources & Technical Details

### 1. **Install Prompts Shown**
- **Data Source**: `public.analytics_events` table
- **Event Name**: `pwa_prompt_shown`
- **SQL Query**:
  ```sql
  SELECT COUNT(*) as prompts_shown
  FROM public.analytics_events 
  WHERE event_name = 'pwa_prompt_shown' 
    AND timestamp BETWEEN NOW() - INTERVAL '30 days' AND NOW();
  ```

### 2. **Installs Completed**
- **Data Source**: `public.analytics_events` table  
- **Event Name**: `pwa_installed`
- **SQL Query**:
  ```sql
  SELECT COUNT(*) as installs_completed
  FROM public.analytics_events 
  WHERE event_name = 'pwa_installed' 
    AND timestamp BETWEEN NOW() - INTERVAL '30 days' AND NOW();
  ```

### 3. **7-day Retention**
- **Definition**: Users who had activity 6-8 days after PWA installation
- **Data Source**: Cross-reference between `pwa_installed` and `user_activity` events
- **SQL Query**:
  ```sql
  WITH installs AS (
    SELECT user_id, timestamp as install_date
    FROM public.analytics_events 
    WHERE event_name = 'pwa_installed' 
      AND timestamp BETWEEN NOW() - INTERVAL '37 days' AND NOW() - INTERVAL '7 days'
      AND user_id IS NOT NULL
  ),
  retention AS (
    SELECT DISTINCT i.user_id
    FROM installs i
    JOIN public.analytics_events ae ON ae.user_id = i.user_id
    WHERE ae.timestamp BETWEEN (i.install_date + INTERVAL '6 days') 
      AND (i.install_date + INTERVAL '8 days')
      AND ae.event_name = 'user_activity'
  )
  SELECT 
    COUNT(DISTINCT i.user_id) as total_installs,
    COUNT(DISTINCT r.user_id) as retained_users,
    CASE 
      WHEN COUNT(DISTINCT i.user_id) > 0 
      THEN ROUND((COUNT(DISTINCT r.user_id)::NUMERIC / COUNT(DISTINCT i.user_id)::NUMERIC) * 100, 1) 
      ELSE 0 
    END as retention_rate
  FROM installs i
  LEFT JOIN retention r ON r.user_id = i.user_id;
  ```

## Configuration Details

### Time Window & Timezone
- **Default Range**: Last 30 days (configurable via date filters)
- **Timezone**: UTC (all timestamps stored as `timestamptz`)
- **Refresh Strategy**: Live query on page load (no caching)

### Privacy & GDPR Compliance
- **No PII Stored**: Only hashed user IDs, no emails or personal data
- **Demo Events**: Not excluded (real vs demo determined by `user_id` presence)
- **Session Tracking**: Temporary session IDs, cleared on session end

## Validation Queries

### Check Raw Events (Last 7 Days)
```sql
-- View all PWA-related events
SELECT 
  event_name,
  COUNT(*) as event_count,
  MIN(timestamp) as earliest,
  MAX(timestamp) as latest
FROM public.analytics_events 
WHERE event_name IN ('pwa_prompt_shown', 'pwa_installed', 'pwa_prompt_dismissed')
  AND timestamp >= NOW() - INTERVAL '7 days'
GROUP BY event_name
ORDER BY event_count DESC;
```

### Check Event Properties
```sql
-- Sample event details
SELECT 
  event_name,
  properties,
  timestamp,
  user_id IS NOT NULL as has_user_id
FROM public.analytics_events 
WHERE event_name LIKE 'pwa_%'
ORDER BY timestamp DESC 
LIMIT 10;
```

### Validate User Activity for Retention
```sql
-- Check user activity events (for retention calculation)
SELECT 
  DATE(timestamp) as activity_date,
  COUNT(DISTINCT user_id) as active_users,
  COUNT(*) as total_activities
FROM public.analytics_events 
WHERE event_name = 'user_activity'
  AND timestamp >= NOW() - INTERVAL '14 days'
  AND user_id IS NOT NULL
GROUP BY DATE(timestamp)
ORDER BY activity_date DESC;
```

### Full PWA Metrics Function Call
```sql
-- Call the actual function used by the dashboard
SELECT * FROM public.get_pwa_metrics(
  NOW() - INTERVAL '30 days',  -- start_date
  NOW()                        -- end_date
);
```

## Event Tracking Implementation

### Frontend Triggers
The following actions automatically trigger PWA event tracking:

1. **Prompt Shown**: When PWA install prompt appears (automatic or manual)
2. **Install Completed**: When user accepts the install prompt
3. **Prompt Dismissed**: When user dismisses the install prompt
4. **User Activity**: Every page view (for retention calculation)

### Event Properties
Each event includes:
- `timestamp`: Event occurrence time
- `user_agent`: Browser information
- `url`: Current page URL
- `pathname`: Current route
- `trigger`: 'automatic' or 'manual' (for prompts)
- `engagement_data`: User engagement metrics at time of event

## Troubleshooting

### If Metrics Show Zero
1. **Check Events Table**:
   ```sql
   SELECT COUNT(*) FROM public.analytics_events WHERE event_name LIKE 'pwa_%';
   ```

2. **Check Recent Events**:
   ```sql
   SELECT event_name, COUNT(*) 
   FROM public.analytics_events 
   WHERE timestamp >= NOW() - INTERVAL '1 hour'
   GROUP BY event_name;
   ```

3. **Test Event Tracking**: Check browser console for analytics logs when PWA prompt appears

### If Retention Shows Zero
- Retention requires at least 7 days of historical install data
- Users must have `user_activity` events after installation
- Check that user authentication is working (events need `user_id`)

## Migration Notes

### Previous Implementation (Mock Data)
- Prompts Shown: 245 (hardcoded)
- Installs Completed: 67 (hardcoded)  
- 7-day Retention: 89% (hardcoded)

### Current Implementation (Live Data)
- **Database Function**: `public.get_pwa_metrics(start_date, end_date)`
- **Fallback**: If queries fail, displays mock data with warning
- **Real-time**: Updates on each page load

## Security & Performance

### Database Policies
- **Insert**: Anyone can insert analytics events (RLS policy)
- **Select**: Only admins can view analytics events (RLS policy)
- **Performance**: Optimized indexes on `event_name + timestamp`

### Performance Considerations
- **Query Speed**: < 300ms target (indexed queries)
- **Memory**: Minimal impact (aggregated results only)
- **Network**: Events sent asynchronously, no blocking

---

*Last Updated: 2025-08-19*
*Status: Production Ready - Live Data*