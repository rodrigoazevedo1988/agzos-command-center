import { 
  useGetDashboardKpis, 
  useGetRevenueChart, 
  useGetRecentActivity 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, DollarSign, Briefcase, Globe, Target, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const { data: kpis, isLoading: kpisLoading } = useGetDashboardKpis();
  const { data: chartData, isLoading: chartLoading } = useGetRevenueChart({ months: 6 });
  const { data: activity, isLoading: activityLoading } = useGetRecentActivity();

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Command Center</h1>
        <p className="text-muted-foreground text-sm">Agency overview and quick metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Monthly Revenue" 
          value={kpis?.monthlyRevenue ? `$${kpis.monthlyRevenue.toLocaleString()}` : "$0"} 
          icon={DollarSign}
          loading={kpisLoading}
        />
        <KpiCard 
          title="Active Projects" 
          value={kpis?.activeProjects?.toString() || "0"} 
          icon={Briefcase}
          loading={kpisLoading}
        />
        <KpiCard 
          title="Managed Sites" 
          value={kpis?.managedSites?.toString() || "0"} 
          icon={Globe}
          loading={kpisLoading}
        />
        <KpiCard 
          title="Overdue Projects" 
          value={kpis?.overdueProjects?.toString() || "0"} 
          icon={AlertTriangle}
          loading={kpisLoading}
          alert={kpis?.overdueProjects ? kpis.overdueProjects > 0 : false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="col-span-1 lg:col-span-2 border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Revenue & Profit (Last 6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartLoading ? (
              <Skeleton className="h-[300px] w-full bg-muted/50 rounded-md" />
            ) : chartData && chartData.length > 0 ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                      tickFormatter={(value) => `$${value/1000}k`}
                    />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                      formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                    <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
                No revenue data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-2 w-2 rounded-full mt-2" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activity && activity.length > 0 ? (
              <div className="space-y-6">
                {activity.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex gap-3 relative before:absolute before:left-[3px] before:top-4 before:bottom-[-20px] before:w-[2px] before:bg-border last:before:hidden">
                    <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0 z-10 ring-4 ring-card" />
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-foreground">{item.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.entityName} • {new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                No recent activity
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon: Icon, loading, alert }: { title: string, value: string, icon: any, loading: boolean, alert?: boolean }) {
  return (
    <Card className={`border-border/50 bg-card/50 backdrop-blur-xl ${alert ? 'border-destructive/50 shadow-[0_0_15px_-3px_rgba(239,68,68,0.1)]' : ''}`}>
      <CardContent className="p-6 flex flex-col justify-between min-h-[120px]">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className={`p-2 rounded-md ${alert ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div>
          {loading ? (
            <Skeleton className="h-8 w-24 mt-2" />
          ) : (
            <p className={`text-2xl font-bold mt-2 ${alert ? 'text-destructive' : 'text-foreground'}`}>{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
