"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { PlayCircle, Clock, Star, Shield, Award } from "lucide-react";

import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface CourseDetail {
  id: string;
  title: string;
  slug: string;
  headline: string;
  description: string;
  thumbnail_url: string;
  price: string;
  rating: string;
  review_count: number;
  is_bestseller: boolean;
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  videos: Video[];
}

interface Video {
  id: string;
  title: string;
  duration_seconds: number;
}

export default function CourseLandingPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${slug}`);
        setCourse(res.data);
        
        try {
          const progressRes = await api.get(`/progress/status/${res.data.id}`);
          if (progressRes.data) {
            setIsEnrolled(true);
          }
        } catch {
          // Not enrolled
        }
      } catch (err) {
        console.error("Course load failed", err);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) fetchCourse();
  }, [slug]);

  const handleEnroll = async () => {
    if (!course) return;
    setIsEnrolling(true);
    try {
      await api.post('/payments/enroll', { 
        subjectId: course.id,
        amount: course.price 
      });
      setIsEnrolled(true);
      setShowPaymentModal(false);
      router.push(`/course/${slug}/play`);
    } catch (err) {
      console.error("Enrollment failed", err);
    } finally {
      setIsEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="w-full h-[250px] sm:h-[350px] lg:h-[400px] rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-40 w-full mt-8" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">Course Not Found</h1>
          <p className="text-muted-foreground text-sm sm:text-base">The course you are looking for does not exist or has been removed.</p>
          <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const totalVideos = course.sections?.reduce((acc, sec) => acc + sec.videos.length, 0) || 0;
  const totalDuration = course.sections?.reduce((acc, sec) => acc + sec.videos.reduce((a, v) => a + (v.duration_seconds || 0), 0), 0) || 0;
  const hours = Math.floor(totalDuration / 3600);
  const minutes = Math.floor((totalDuration % 3600) / 60);

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Banner */}
      <div className="bg-card border-b border-border/40 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/[0.03] blur-[100px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 lg:py-20 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="space-y-5 order-2 lg:order-1">
            <div className="flex flex-wrap gap-2">
              {course.is_bestseller && (
                <Badge className="bg-amber-500 text-black hover:bg-amber-600 text-xs font-semibold">Bestseller</Badge>
              )}
              <Badge variant="outline" className="border-primary/30 text-primary text-xs">High Fidelity Learning</Badge>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight text-balance">
              {course.title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {course.headline}
            </p>
            <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm">
              <div className="flex items-center gap-1.5 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
                <span className="text-amber-500 font-bold">{course.rating}</span>
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-muted-foreground text-xs ml-0.5">({course.review_count.toLocaleString()})</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 text-muted-foreground text-xs">
                <Shield className="w-3.5 h-3.5" /> Professional Certificate
              </div>
            </div>
          </div>
          
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/40 shadow-2xl glass-card order-1 lg:order-2">
            <Image src={course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"} alt={course.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 sm:p-6">
              <div className="flex items-center gap-2 text-foreground text-sm">
                <PlayCircle className="w-5 h-5" /> Preview Course
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8 sm:space-y-10">
          {/* About */}
          <section className="space-y-3">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">About This Course</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground text-sm sm:text-base leading-relaxed">
              {course.description || "No detailed description provided for this course yet. Expect high quality material covering the core subjects outlined in the curriculum."}
            </div>
          </section>

          {/* Curriculum */}
          <section className="space-y-5">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground flex flex-wrap items-center gap-2">
              Course Curriculum
              <Badge variant="secondary" className="font-normal text-xs">
                {course.sections?.length || 0} sections • {totalVideos} videos
              </Badge>
            </h2>
            
            <div className="glass-card rounded-2xl border border-border/40 overflow-hidden">
              {course.sections?.length > 0 ? (
                course.sections.map((section, idx) => (
                  <div key={section.id} className={`p-4 sm:p-6 ${idx !== course.sections.length - 1 ? 'border-b border-border/40' : ''}`}>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-3">
                      <div className="bg-primary/15 text-primary w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <span className="line-clamp-1">{section.title}</span>
                    </h3>
                    <div className="space-y-2 pl-10 sm:pl-11">
                      {section.videos.length > 0 ? (
                        section.videos.map((video) => (
                          <div key={video.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-2.5 sm:p-3 rounded-xl hover:bg-accent/5 transition-colors gap-1 sm:gap-2">
                            <div className="flex items-center gap-2.5">
                              <PlayCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="text-sm font-medium text-foreground/90">{video.title}</span>
                            </div>
                            <span className="text-xs text-muted-foreground flex items-center gap-1.5 whitespace-nowrap pl-6.5 sm:pl-0">
                              <Clock className="w-3 h-3" />
                              {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No videos in this section yet.</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  Curriculum is currently being updated. Check back shortly.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar — sticky on desktop, normal flow on mobile */}
        <div>
          <Card className="glass-card border-border/40 lg:sticky lg:top-8 shadow-2xl backdrop-blur-xl">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="text-center pb-5 border-b border-border/40">
                <div className="text-3xl sm:text-4xl font-extrabold text-foreground mb-1.5">
                  ₹{parseFloat(course.price).toLocaleString('en-IN')}
                </div>
                <p className="text-sm text-primary font-medium flex justify-center items-center gap-1.5">
                  <Award className="w-4 h-4" /> Full Lifetime Access
                </p>
              </div>

              <div className="space-y-3 pb-5 border-b border-border/40">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <PlayCircle className="w-4 h-4 text-primary shrink-0" /> {totalVideos} HD Videos
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" /> {hours > 0 ? `${hours}h ` : ''}{minutes}m Total Length
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Award className="w-4 h-4 text-primary shrink-0" /> Certificate of Completion
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Shield className="w-4 h-4 text-primary shrink-0" /> 30-Day Guarantee
                </div>
              </div>

              {isEnrolled ? (
                <Button 
                  className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold glow-primary"
                  onClick={() => router.push(`/course/${slug}/play`)}
                >
                  Continue Learning
                </Button>
              ) : (
                <div className="space-y-2.5">
                  <Button 
                    className="w-full h-12 sm:h-14 text-base sm:text-lg font-bold glow-primary transition-all hover:scale-[1.02]"
                    onClick={() => setShowPaymentModal(true)}
                    disabled={isEnrolling}
                  >
                    {isEnrolling ? "Enrolling..." : "Enroll Now"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Secure transaction verified.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="glass-card border-border/40 text-foreground sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Complete Enrollment</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Unlock lifetime access to <strong>{course.title}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 space-y-6">
            <div className="bg-accent/5 p-4 rounded-2xl border border-border/40 flex justify-between items-center">
              <span className="text-sm font-medium">Course Price</span>
              <span className="text-xl font-bold text-primary">₹{parseFloat(course.price).toLocaleString('en-IN')}</span>
            </div>
            
            <div className="space-y-3">
               <div className="flex items-center gap-3 text-sm text-foreground/70">
                 <Shield className="w-5 h-5 text-primary shrink-0" />
                 <span>Secure 256-bit SSL encrypted payment</span>
               </div>
               <div className="flex items-center gap-3 text-sm text-foreground/70">
                 <Award className="w-5 h-5 text-primary shrink-0" />
                 <span>Certificate of completion included</span>
               </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl flex gap-3">
              <Shield className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-[10px] text-amber-500/80 leading-tight">
                This is a simulated payment gateway for demonstration purposes. Clicking &quot;Pay & Enroll&quot; will process a dummy transaction.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              className="w-full h-12 font-bold rounded-xl" 
              onClick={handleEnroll}
              disabled={isEnrolling}
            >
              {isEnrolling ? "Processing..." : "Pay & Enroll Now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
