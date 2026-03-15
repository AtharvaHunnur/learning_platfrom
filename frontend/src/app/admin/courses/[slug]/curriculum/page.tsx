"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, GripVertical, Youtube, AlignLeft, ArrowLeft } from "lucide-react";

import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Video {
  id: string;
  title: string;
  youtube_video_id: string;
  order_index: number;
}

interface Section {
  id: string;
  title: string;
  order_index: number;
  videos: Video[];
}

interface Course {
  id: string;
  title: string;
  slug: string;
}

export default function CurriculumBuilderPage() {
  const { slug } = useParams();
  const router = useRouter();
  
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dialog states
  const [isSectionDialogOpen, setIsSectionDialogOpen] = useState(false);
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  
  // Form states
  const [sectionTitle, setSectionTitle] = useState("");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [videoData, setVideoData] = useState({ title: "", youtubeId: "" });

  const fetchCourseData = async () => {
    try {
      setIsLoading(true);
      const res = await api.get(`/courses/${slug}`); // fetches course + sections + videos
      setCourse(res.data);
      setSections(res.data.sections || []);
    } catch (err) {
      console.error("Failed to fetch curriculum:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchCourseData();
  }, [slug]);

  const handleCreateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course) return;
    try {
      await api.post('/content/sections', {
        subjectId: course.id,
        title: sectionTitle,
        orderIndex: sections.length
      });
      setIsSectionDialogOpen(false);
      setSectionTitle("");
      fetchCourseData();
    } catch (err) {
      console.error("Failed to create section", err);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Are you sure? This deletes all videos inside it as well.")) return;
    try {
      await api.delete(`/content/sections/${sectionId}`);
      fetchCourseData();
    } catch (err) {
      console.error("Failed to delete section", err);
    }
  };

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!course || !activeSectionId) return;
    const targetSection = sections.find(s => s.id === activeSectionId);
    if (!targetSection) return;

    try {
      await api.post('/content/videos', {
        sectionId: activeSectionId,
        title: videoData.title,
        youtubeVideoId: videoData.youtubeId,
        durationSeconds: 600, // Dummy duration since Youtube API isn't configured for metadata
        orderIndex: targetSection.videos.length
      });
      setIsVideoDialogOpen(false);
      setVideoData({ title: "", youtubeId: "" });
      setActiveSectionId(null);
      fetchCourseData();
    } catch (err) {
      console.error("Failed to create video", err);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/content/videos/${videoId}`);
      fetchCourseData();
    } catch (err) {
      console.error("Failed to delete video", err);
    }
  };

  if (isLoading) return <div className="p-8 text-muted-foreground">Loading curriculum builder...</div>;
  if (!course) return <div className="p-8 text-destructive">Course not found.</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.push('/admin/courses')} className="hover:bg-white/5">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Curriculum Builder</h1>
          <p className="text-muted-foreground text-sm">Managing structure for <span className="text-primary font-medium">{course.title}</span></p>
        </div>
      </div>

      <div className="flex justify-between items-center bg-card/50 p-6 rounded-2xl border border-white/5 shadow-xl glass-card">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-white">Course Outline</h2>
          <p className="text-sm text-muted-foreground">Organize your course into sections and video lessons.</p>
        </div>
        <Dialog open={isSectionDialogOpen} onOpenChange={setIsSectionDialogOpen}>
          <DialogTrigger render={<Button className="shadow-[0_0_15px_rgba(var(--primary),0.3)]" />}>
            <Plus className="w-4 h-4 mr-2" />
            Add Section
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 bg-card/95 backdrop-blur-3xl">
            <DialogHeader>
              <DialogTitle>New Section</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateSection} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="sectionTitle">Section Title</Label>
                <Input id="sectionTitle" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} placeholder="e.g. Introduction to React" required className="bg-background/50" />
              </div>
              <Button type="submit" className="w-full">Create Section</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-20 px-4 bg-white/5 rounded-3xl border border-white/10 border-dashed">
          <AlignLeft className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Empty Curriculum</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">Start building your course structure by adding a new section above. Then, you can insert YouTube lessons into it.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section, sIdx) => (
            <Card key={section.id} className="glass-card border-white/10 shadow-lg overflow-hidden group/section">
              <div className="bg-white/5 p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="cursor-grab text-muted-foreground hover:text-white transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                    Section {sIdx + 1}: <span className="text-primary/90">{section.title}</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteSection(section.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                  
                  <Dialog open={isVideoDialogOpen && activeSectionId === section.id} onOpenChange={(open) => { setIsVideoDialogOpen(open); if(!open) setActiveSectionId(null); else setActiveSectionId(section.id); }}>
                    <DialogTrigger render={<Button variant="secondary" size="sm" className="ml-2 hover:bg-white/10" />}>
                      <Plus className="w-4 h-4 mr-1.5" /> Video Item
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/10 bg-card/95 backdrop-blur-3xl">
                      <DialogHeader>
                        <DialogTitle>Add YouTube Video</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateVideo} className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Video Title</Label>
                          <Input value={videoData.title} onChange={(e) => setVideoData(prev => ({...prev, title: e.target.value}))} placeholder="e.g. Components Deep Dive" required className="bg-background/50" />
                        </div>
                        <div className="space-y-2">
                          <Label>YouTube ID (11 chars)</Label>
                          <Input value={videoData.youtubeId} onChange={(e) => setVideoData(prev => ({...prev, youtubeId: e.target.value}))} placeholder="e.g. dQw4w9WgXcQ" required maxLength={11} minLength={11} className="bg-background/50 font-mono" />
                          <p className="text-xs text-muted-foreground">The 11-character string after &quot;v=&quot; in the YouTube URL.</p>
                        </div>
                        <Button type="submit" className="w-full">Add Video to {section.title}</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              <CardContent className="p-0">
                {section.videos.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground italic bg-background/20">
                    No modules inside this section. Click &quot;Video Item&quot; to add one.
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {section.videos.map((video, vIdx) => (
                      <div key={video.id} className="flex items-center justify-between p-4 bg-background/40 hover:bg-white/5 transition-colors group/video">
                        <div className="flex items-center gap-4">
                          <div className="cursor-grab text-muted-foreground/50 hover:text-white transition-colors px-1">
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-500/10 text-red-500 border border-red-500/20">
                            <Youtube className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white leading-none mb-1">{vIdx + 1}. {video.title}</p>
                            <a href={`https://youtube.com/watch?v=${video.youtube_video_id}`} target="_blank" rel="noreferrer" className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors">
                              ID: {video.youtube_video_id}
                            </a>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover/video:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white hover:bg-white/10">
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10" onClick={() => handleDeleteVideo(video.id)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
