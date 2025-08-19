import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Trophy, 
  Users, 
  TrendingUp, 
  MapPin, 
  Activity,
  Smartphone,
  Gauge,
  Search,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye
} from 'lucide-react';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useCoreWebVitals } from '@/hooks/useCoreWebVitals';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#8884d8', '#82ca9d', '#ffc658'];

interface AnalyticsDashboardProps {
  dateRange?: { start: Date; end: Date };
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ dateRange }) => {
  const { data, refetch } = useAnalyticsData(dateRange);
  const webVitals = useCoreWebVitals();

  if (data.loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (data.error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
          <p className="text-destructive mb-4">Failed to load analytics data</p>
          <button 
            onClick={refetch}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Retry
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tournaments</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.tournaments.total}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-green-600">{data.tournaments.active} active</span>
              <span className="mx-2">•</span>
              <span>{data.tournaments.expired} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Sign-ups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.totalUsers}</div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <span className="text-green-600">+{data.users.signUpsLast7d} this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Funnel Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((data.funnel.registrationCompletions / data.funnel.listViews) * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              List → Registration
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Verification</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.users.emailVerificationRate}%</div>
            <div className="text-xs text-muted-foreground mt-1">
              Avg {data.users.avgTimeToVerify}h to verify
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tournaments" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="tournaments">Tournaments</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="funnel">Funnel</TabsTrigger>
              <TabsTrigger value="geography">Geography</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="pwa">PWA</TabsTrigger>
            </TabsList>

            <TabsContent value="tournaments" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Tournament Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.tournaments.byType}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ type, count }) => `${type}: ${count}`}
                        >
                          {data.tournaments.byType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Format Popularity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.tournaments.byFormat}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="format" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Demo vs Real</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Demo Tournaments</span>
                        <Badge variant="secondary">{data.tournaments.demo}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Real Tournaments</span>
                        <Badge variant="default">{data.tournaments.real}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Growth Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Last 7 days</span>
                        <Badge variant="outline">+{data.tournaments.trends7d}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Last 30 days</span>
                        <Badge variant="outline">+{data.tournaments.trends30d}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Status Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Active</span>
                        <Badge className="bg-green-100 text-green-800">{data.tournaments.active}</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Completed</span>
                        <Badge variant="secondary">{data.tournaments.expired}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">User Growth</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-primary" />
                          <span>Total Users</span>
                        </div>
                        <span className="text-2xl font-bold">{data.users.totalUsers}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <span>Last 7 days</span>
                        </div>
                        <span className="text-xl font-semibold text-green-600">+{data.users.signUpsLast7d}</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <span>Last 30 days</span>
                        </div>
                        <span className="text-xl font-semibold text-blue-600">+{data.users.signUpsLast30d}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Auth Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span>Email Verification Rate</span>
                        </div>
                        <span className="text-xl font-semibold text-green-600">{data.users.emailVerificationRate}%</span>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span>Avg Time to Verify</span>
                        </div>
                        <span className="text-xl font-semibold text-blue-600">{data.users.avgTimeToVerify}h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="funnel" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">User Journey Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-blue-600">{data.funnel.listViews}</div>
                        <div className="text-sm text-muted-foreground">List Views</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-green-600">{data.funnel.detailViews}</div>
                        <div className="text-sm text-muted-foreground">Detail Views</div>
                        <div className="text-xs text-green-600 mt-1">
                          {((data.funnel.detailViews / data.funnel.listViews) * 100).toFixed(1)}% conversion
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-orange-600">{data.funnel.registrationStarts}</div>
                        <div className="text-sm text-muted-foreground">Registration Starts</div>
                        <div className="text-xs text-orange-600 mt-1">
                          {((data.funnel.registrationStarts / data.funnel.detailViews) * 100).toFixed(1)}% conversion
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <CheckCircle className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-purple-600">{data.funnel.registrationCompletions}</div>
                        <div className="text-sm text-muted-foreground">Completions</div>
                        <div className="text-xs text-purple-600 mt-1">
                          {((data.funnel.registrationCompletions / data.funnel.registrationStarts) * 100).toFixed(1)}% conversion
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span>Overall Drop-off Rate</span>
                        <Badge variant={data.funnel.dropOffRate > 25 ? "destructive" : "secondary"}>
                          {data.funnel.dropOffRate}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="geography" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Top Cities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {data.geography.topCities.slice(0, 8).map((city, index) => (
                        <div key={city.city} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{city.city}</span>
                            <Badge variant="outline" className="text-xs">{city.region}</Badge>
                          </div>
                          <Badge>{city.count}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Regional Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.geography.regionDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          label={({ region, count }) => `${region}: ${count}`}
                        >
                          {data.geography.regionDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Core Web Vitals</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Gauge className="h-5 w-5" />
                          <span>LCP (Largest Contentful Paint)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{data.performance.coreWebVitals.lcp}ms</div>
                          <Badge variant="secondary" className="text-xs">Good</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5" />
                          <span>FID (First Input Delay)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{data.performance.coreWebVitals.fid}ms</div>
                          <Badge variant="secondary" className="text-xs">Good</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-5 w-5" />
                          <span>CLS (Cumulative Layout Shift)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{data.performance.coreWebVitals.cls}</div>
                          <Badge variant="secondary" className="text-xs">Good</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">System Health</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Activity className="h-5 w-5 text-green-600" />
                          <span>API Latency (avg)</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{data.performance.avgApiLatency}ms</div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Healthy</Badge>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-green-600" />
                          <span>Error Rate</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">{data.performance.errorRate}%</div>
                          <Badge className="bg-green-100 text-green-800 text-xs">Low</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="pwa" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">PWA Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Smartphone className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">245</div>
                      <div className="text-sm text-muted-foreground">Install Prompts Shown</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">67</div>
                      <div className="text-sm text-muted-foreground">Installs Completed</div>
                      <div className="text-xs text-green-600 mt-1">27.3% conversion</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">89%</div>
                      <div className="text-sm text-muted-foreground">7-day Retention</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};