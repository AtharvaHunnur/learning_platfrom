"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import YouTube from "react-youtube";
import { CheckCircle2, Circle, ArrowLeft, PlayCircle, Lock, Shield, ListVideo, X } from "lucide-react";

import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface Video {
  id: string;
  title: string;
  youtube_video_id: string;
  duration_seconds: number;
}

interface Section {
  id: string;
  title: string;
  videos: Video[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

interface VideoProgress {
  video_id: string;
  last_position_seconds: number;
  is_completed: boolean;
}

export default function CoursePlayerPage() {
  const { slug } = useParams();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [progressData, setProgressData] = useState<VideoProgress[]>([]);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Player state
  const playerRef = useRef<any>(null);
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadCourseData = async () => {
      try {
        const courseRes = await api.get(`/courses/${slug}`);
        setCourse(courseRes.data);
        
        try {
          const progRes = await api.get(`/progress/status/${courseRes.data.id}`);
          if (progRes.data.enrolled) {
            setProgressData(progRes.data.progress || []);
            const flatVideos = (courseRes.data.sections || []).flatMap((s: Section) => s.videos);
            const firstUnwatched = flatVideos.find((v: Video) => {
              const p = progRes.data.progress?.find((p: any) => p.video_id === v.id);
              return !p?.is_completed;
            });
            setActiveVideo(firstUnwatched || flatVideos[0] || null);
          }
        } catch (err) {
          router.push(`/course/${slug}`);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    if (slug) loadCourseData();

    return () => stopSyncLoop();
  }, [slug, router]);

  const startSyncLoop = (player: any) => {
    if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    
    syncIntervalRef.current = setInterval(async () => {
      if (!activeVideo || !player) return;
      try {
        const currentTime = player.getCurrentTime();
        const res = await api.post(`/progress/sync/${activeVideo.id}`, {
          position_seconds: currentTime
        });
        
        setProgressData(prev => {
          const existing = prev.find(p => p.video_id === activeVideo.id);
          if (existing) {
            return prev.map(p => p.video_id === activeVideo.id ? {
              ...p, 
              last_position_seconds: res.data.progress.last_position_seconds,
              is_completed: res.data.progress.is_completed
            } : p);
          } else {
            return [...prev, {
              video_id: activeVideo.id,
              last_position_seconds: res.data.progress.last_position_seconds,
              is_completed: res.data.progress.is_completed
            }];
          }
        });
      } catch (err: any) {
        if (err.response?.status === 422) {
          const allowedTime = err.response.data.allowedPosition || 0;
          player.seekTo(allowedTime, true);
        }
      }
    }, 5000);
  };

  const stopSyncLoop = () => {
    if (syncIntervalRef.current) {
      clearInterval(syncIntervalRef.current);
      syncIntervalRef.current = null;
    }
  };

  const onPlayerReady = (e: any) => {
    playerRef.current = e.target;
    const myProg = progressData.find(p => p.video_id === activeVideo?.id);
    if (myProg && myProg.last_position_seconds > 0 && !myProg.is_completed) {
      e.target.seekTo(myProg.last_position_seconds, true);
    }
  };

  const onPlayerStateChange = (e: any) => {
    if (e.data === 1) {
      startSyncLoop(e.target);
    } else {
      stopSyncLoop();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col lg:flex-row h-screen overflow-hidden">
        <main className="flex-1 p-4 sm:p-8">
          <Skeleton className="w-full aspect-video rounded-2xl" />
          <Skeleton className="w-1/2 h-8 mt-6" />
        </main>
        <aside className="hidden lg:block w-[380px] border-l border-white/[0.06] p-6 space-y-4">
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
          <Skeleton className="w-full h-12" />
        </aside>
      </div>
    );
  }

  if (!course || !activeVideo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">No content available</h1>
        <p className="text-muted-foreground mb-6 text-sm">This course currently has no published video sections.</p>
        <Button onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const flatVideos = course.sections.flatMap(s => s.videos);
  const totalVideos = flatVideos.length;
  const completedVideos = flatVideos.filter(v => progressData.find(p => p.video_id === v.id)?.is_completed).length;
  const progressPercent = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;

  const curriculumSidebar = (
    <>
      <div className="p-4 sm:p-5 border-b border-white/[0.04] shrink-0 bg-background/50">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-white">Curriculum</h2>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs sm:text-sm text-muted-foreground">
            <span>Your Progress</span>
            <span className="text-primary font-medium">{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-white/[0.04] [&>div]:bg-primary" />
          <p className="text-xs text-muted-foreground text-right">{completedVideos} / {totalVideos} completed</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-5">
        {course.sections.map((section, sIdx) => (
          <div key={section.id} className="space-y-1.5">
            <h3 className="text-xs font-semibold text-white/80 px-2 uppercase tracking-wider sticky top-0 bg-card/90 backdrop-blur-md py-2 z-10 border-b border-white/[0.04]">
              Section {sIdx + 1}: {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.videos.map((video, vIdx) => {
                const isCompleted = progressData.find(p => p.video_id === video.id)?.is_completed;
                const isActive = activeVideo.id === video.id;
                
                return (
                  <button
                    key={video.id}
                    onClick={() => { setActiveVideo(video); setIsSidebarOpen(false); }}
                    className={`w-full text-left flex items-start gap-2.5 p-2.5 sm:p-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-primary/15 border border-primary/20 text-white' 
                        : 'hover:bg-white/[0.03] text-muted-foreground'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 ${isCompleted ? 'text-primary' : 'text-muted-foreground/40'}`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4 fill-primary/20" /> : <PlayCircle className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-tight mb-0.5 truncate ${isActive ? 'text-primary' : (isCompleted ? 'text-white/80' : '')}`}>
                        {vIdx + 1}. {video.title}
                      </p>
                      <span className="text-xs opacity-70">
                        {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-background text-foreground overflow-hidden">
      {/* Main Player Area */}
      <main className="flex-1 max-h-screen overflow-y-auto flex flex-col">
        <div className="p-3 sm:p-4 border-b border-white/[0.04] flex items-center justify-between bg-card shrink-0 gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white text-xs sm:text-sm" onClick={() => router.push(`/dashboard`)}>
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back
          </Button>
          <div className="text-xs sm:text-sm font-medium text-white px-3 py-1 bg-white/[0.04] rounded-full border border-white/[0.06] truncate max-w-[200px] sm:max-w-none">
            {course.title}
          </div>
          {/* Mobile sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-muted-foreground hover:text-white"
            onClick={() => setIsSidebarOpen(true)}
          >
            <ListVideo className="w-4 h-4 mr-1.5" /> Syllabus
          </Button>
        </div>

        <div className="flex-1 bg-black w-full flex items-center justify-center relative px-0 sm:px-4 py-4 sm:py-8 lg:p-10">
           <div className="w-full max-w-5xl aspect-video rounded-none sm:rounded-2xl overflow-hidden ring-1 ring-white/[0.08] shadow-2xl relative">
              <YouTube
                videoId={activeVideo.youtube_video_id}
                opts={{
                  width: '100%',
                  height: '100%',
                  playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                    showinfo: 0,
                    disablekb: 1
                  }
                }}
                className="absolute inset-0 w-full h-full"
                onReady={onPlayerReady}
                onStateChange={onPlayerStateChange}
              />
           </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-10 bg-card shrink-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">{activeVideo.title}</h1>
          <p className="text-muted-foreground text-xs sm:text-sm flex items-start gap-2">
            <Shield className="w-4 h-4 shrink-0 mt-0.5" /> Watch time is strictly tracked. Fast-forwarding is disabled to ensure learning integrity.
          </p>
        </div>
      </main>

      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Syllabus Sidebar */}
      <aside className={`
        fixed lg:relative right-0 top-0 z-50 lg:z-auto
        w-[320px] sm:w-[360px] lg:w-[380px] 
        h-screen border-l border-white/[0.06] bg-card/95 backdrop-blur-2xl 
        flex flex-col shrink-0 max-h-screen overflow-hidden
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        {curriculumSidebar}
      </aside>
    </div>
  );
}
