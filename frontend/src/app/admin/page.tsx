"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  BookOpen, 
  PlaySquare, 
  TrendingUp,
  Activity,
  AlertCircle,
  BarChart3
} from "lucide-react";

import { api } from "@/lib/axios";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  totalVideos: number;
  totalRevenue: number;
}

interface ActivityItem {
  id: string;
  type: 'enrollment' | 'registration';
  user: string;
  email: string;
  target: string;
  timestamp: string;
}

interface TrendItem {
  date: string;
  enrollments: number;
}

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes, trendsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/stats/activity'),
          api.get('/admin/stats/trends')
        ]);
        setStats(statsRes.data);
        setActivities(activityRes.data);
        setTrends(trendsRes.data);
      } catch (err) {
        setError("Failed to load dashboard statistics.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    {
      title: "Total Learners",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      borderColor: "hover:border-blue-500/20",
      trend: "Total students"
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "text-accent",
      bg: "bg-accent/10",
      borderColor: "hover:border-accent/20",
      trend: "Across all subjects"
    },
    {
      title: "Active Enrollments",
      value: stats?.totalEnrollments || 0,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      borderColor: "hover:border-emerald-500/20",
      trend: "High engagement"
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue.toLocaleString() || 0}`,
      icon: BarChart3,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      borderColor: "hover:border-purple-500/20",
      trend: "Estimated earnings"
    }
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-20 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm">Welcome back, Administrator. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 bg-accent/10 text-accent px-3 py-1.5 rounded-full border border-accent/15 text-xs font-medium shrink-0">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Systems Online
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 text-destructive bg-destructive/10 p-3.5 rounded-xl border border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {isLoading
          ? Array(4).fill(0).map((_, i) => (
              <Card key={i} className="glass-card border-none">
                <CardHeader className="flex flex-row items-center justify-between pb-2 p-4">
                  <Skeleton className="h-3 w-[80px]" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <Skeleton className="h-7 w-[50px] mb-1.5" />
                  <Skeleton className="h-3 w-[90px]" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => (
              <Card key={index} className={`glass-card border border-white/[0.04] ${stat.borderColor} transition-colors`}>
                <CardHeader className="flex flex-row items-center justify-between pb-1.5 p-4">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-1.5 sm:p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-0.5">{stat.value}</div>
                  <p className="text-[11px] sm:text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                    {stat.trend}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Charts / Activity area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        <Card className="glass-card border border-white/[0.04] lg:col-span-2 min-h-[300px] sm:min-h-[350px]">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                Enrollment Trends
              </div>
              <span className="text-[10px] text-muted-foreground font-normal bg-white/5 px-2 py-0.5 rounded-full border border-white/5">Last 7 Days</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] sm:h-[300px] w-full p-4 sm:p-6 pt-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Skeleton className="h-full w-full rounded-xl" />
              </div>
            ) : trends.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-muted-foreground text-sm">No enrollment data available for trends</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEnroll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(15, 15, 15, 0.95)', 
                      borderColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                      color: 'white'
                    }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="enrollments" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEnroll)" 
                  />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#71717a', fontSize: 10 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="glass-card border border-white/[0.04] min-h-[300px] sm:min-h-[350px]">
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-base sm:text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-4 sm:p-6 pt-2">
            {isLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="w-8 h-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
              ))
            ) : activities.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">No recent activity</p>
              </div>
            ) : (
              activities.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/[0.05]">
                  <div className={`p-1.5 rounded-full shrink-0 ${item.type === 'enrollment' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {item.type === 'enrollment' ? <TrendingUp className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-white font-medium">
                      <span className="font-bold">{item.user}</span> {item.type === 'enrollment' ? 'enrolled in' : 'joined as'} 
                      <span className="text-primary/90 ml-1">{item.target}</span>
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.email}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
