"use client";

import { useEffect, useState } from "react";
import { PlayCircle } from "lucide-react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface EnrolledCourse {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  progress: number;
  totalVideos: number;
  completedVideos: number;
}

export default function MyLearningPage() {
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLearnings = async () => {
      try {
        const { data } = await api.get("/progress/my-learnings");
        setCourses(data);
      } catch (error) {
        console.error("Failed to fetch learnings", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLearnings();
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <h1 className="text-3xl font-bold text-white">My Learning</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[300px] w-full rounded-2xl bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">My Learning</h1>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white/[0.02] rounded-3xl border border-white/[0.06]">
          <PlayCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground text-lg">You haven&apos;t enrolled in any courses yet.</p>
          <Button className="mt-4 rounded-xl">
            <Link href="/dashboard">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="glass-card overflow-hidden group border-white/[0.06] hover:border-primary/20 transition-all duration-300">
              <div className="relative aspect-video overflow-hidden">
                <img
                  src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"}
                  alt={course.title}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end p-4">
                   <div className="w-full">
                      <Progress value={course.progress} className="h-1.5 mb-2" />
                      <div className="flex justify-between items-center text-[10px] text-white/70 font-medium">
                        <span>{course.progress}% Complete</span>
                        <span>{course.completedVideos}/{course.totalVideos} Videos</span>
                      </div>
                   </div>
                </div>
              </div>
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-lg text-white group-hover:text-primary transition-colors line-clamp-1">{course.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button className="w-full rounded-xl bg-white/5 hover:bg-primary hover:text-white transition-all group">
                  <Link href={`/course/${course.slug}/play`}>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Continue Learning
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
