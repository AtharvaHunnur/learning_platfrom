"use client";

import { useEffect, useState } from "react";
import { Mail, Calendar, BookOpen, CheckCircle } from "lucide-react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface UserProfile {
  name: string;
  email: string;
  role: string;
  created_at: string;
}

interface ProfileSummary {
  totalEnrolled: number;
  completedCourses: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<ProfileSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, summaryRes] = await Promise.all([
          api.get("/users/me"),
          api.get("/users/profile-summary")
        ]);
        setProfile(profileRes.data);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="p-6"><Skeleton className="h-[400px] w-full rounded-3xl bg-white/5" /></div>;
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Basic Info */}
        <Card className="glass-card border-white/[0.06] lg:col-span-1">
          <CardContent className="pt-8 flex flex-col items-center">
            <Avatar className="w-24 h-24 border-2 border-primary/20 p-1 mb-4">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                {profile?.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-white">{profile?.name}</h2>
            <p className="text-muted-foreground text-sm capitalize">{profile?.role}</p>

            <div className="w-full mt-8 space-y-4">
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Mail className="w-4 h-4 text-primary" />
                <span>{profile?.email}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/70">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Joined {profile?.created_at && format(new Date(profile.created_at), 'MMMM yyyy')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Stats & More */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-primary/10 to-transparent border-white/[0.06] hover:border-primary/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Total Enrolled
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{summary?.totalEnrolled}</div>
                <p className="text-xs text-muted-foreground mt-1">Courses in progress</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-500/10 to-transparent border-white/[0.06] hover:border-emerald-500/20 transition-all">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">{summary?.completedCourses}</div>
                <p className="text-xs text-muted-foreground mt-1">Courses finished</p>
              </CardContent>
            </Card>
          </div>

          <Card className="glass-card border-white/[0.06]">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-white">Learning Activity</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center py-8">
                  <p className="text-white/40 text-sm">Learning activity visualization coming soon.</p>
                </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
