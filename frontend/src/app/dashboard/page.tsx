"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, Star, Clock, AlertCircle, Sparkles } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/axios";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  slug: string;
  headline: string | null;
  thumbnail_url: string | null;
  price: string;
  rating: string;
  review_count: number;
  is_bestseller: boolean;
  users: { name: string } | null;
}

export default function DashboardHome() {
  const { user } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        setCourses(res.data);
      } catch (err) {
        setError("Failed to load courses. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 pb-20 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Welcome section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-balance">
            Welcome back, <span className="text-gradient">{user?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">Ready to continue your learning journey today?</p>
        </div>
        <Badge variant="secondary" className="px-3 py-1.5 text-xs sm:text-sm bg-primary/10 text-primary border border-primary/15 shrink-0">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          Pro Learner
        </Badge>
      </div>

      {/* Course listing */}
      <div className="space-y-4 sm:space-y-5">
        <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Available Courses
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="glass-card border-none overflow-hidden">
                <Skeleton className="h-40 sm:h-44 w-full rounded-none" />
                <CardContent className="p-4 sm:p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 text-destructive bg-destructive/10 p-4 rounded-xl border border-destructive/20">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-16 sm:py-20 px-4 bg-white/[0.02] rounded-2xl border border-white/[0.06] border-dashed">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">No courses available yet</h3>
            <p className="text-muted-foreground text-sm">Check back later for exciting new content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {courses.map((course) => (
              <Link href={`/course/${course.slug}`} key={course.id}>
                <Card className="glass-card border border-border/40 hover:border-primary/30 transition-all duration-300 overflow-hidden h-full flex flex-col group cursor-pointer card-hover">
                  <div className="relative h-40 sm:h-44 w-full bg-muted overflow-hidden">
                    <Image
                      src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"}
                      alt={course.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {course.is_bestseller && (
                      <Badge className="absolute top-3 left-3 bg-amber-500 text-black hover:bg-amber-600 text-xs font-semibold">
                        Bestseller
                      </Badge>
                    )}
                  </div>
                  
                  <CardContent className="p-4 sm:p-5 flex-1 flex flex-col">
                    <h3 className="font-semibold text-base sm:text-lg leading-tight mb-1.5 group-hover:text-primary transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
                      {course.headline || 'Learn the fundamental skills needed to excel.'}
                    </p>
                    
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-500 font-medium">{course.rating}</span>
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span className="text-xs">({course.review_count})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs">Self-paced</span>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="p-4 sm:p-5 pt-0 border-t border-border/40 mt-auto bg-accent/2 flex items-center justify-between">
                    <div className="font-bold text-base sm:text-lg text-foreground">
                      ₹{parseFloat(course.price).toLocaleString('en-IN')}
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 hover:bg-primary/20 text-primary text-xs">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
