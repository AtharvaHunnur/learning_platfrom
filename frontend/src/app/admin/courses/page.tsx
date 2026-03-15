"use client";

import { useEffect, useState } from "react";
import { Plus, Edit3, Trash2, Eye, EyeOff, Star, BookCopy } from "lucide-react";

import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Course {
  id: string;
  title: string;
  slug: string;
  price: string;
  is_published: boolean;
  is_bestseller: boolean;
  users: { name: string } | null;
  created_at: string;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    headline: "",
    description: "",
    thumbnail_url: "",
    price: "0",
  });

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/courses/all');
      setCourses(res.data);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const generateSlug = () => {
    if (!editMode) {
      setFormData(prev => ({
        ...prev,
        slug: prev.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {
        await api.put(`/courses/${editMode}`, formData);
      } else {
        await api.post('/courses', formData);
      }
      setIsDialogOpen(false);
      setEditMode(null);
      setFormData({ title: "", slug: "", headline: "", description: "", thumbnail_url: "", price: "0" });
      fetchCourses();
    } catch (err) {
      console.error("Failed to save course", err);
    }
  };

  const openEditDialog = (course: Course) => {
    setEditMode(course.id);
    setFormData({
      title: course.title,
      slug: course.slug,
      headline: (course as any).headline || "",
      description: (course as any).description || "",
      thumbnail_url: (course as any).thumbnail_url || "",
      price: course.price.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleDeleteCourse = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"? This will also delete all sections and videos.`)) {
      try {
        await api.delete(`/courses/${id}`);
        fetchCourses();
      } catch (err) {
        console.error("Failed to delete course", err);
      }
    }
  };

  const togglePublish = async (course: Course) => {
    try {
      await api.put(`/courses/${course.id}`, { is_published: !course.is_published });
      fetchCourses();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const toggleBestseller = async (course: Course) => {
    try {
      await api.put(`/courses/${course.id}`, { is_bestseller: !course.is_bestseller });
      fetchCourses();
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Course Inventory</h1>
          <p className="text-muted-foreground text-sm">Manage subjects, curriculum, and pricing.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditMode(null);
            setFormData({ title: "", slug: "", headline: "", description: "", thumbnail_url: "", price: "0" });
          }
        }}>
          <DialogTrigger render={<Button className="font-semibold glow-primary text-sm w-full sm:w-auto" />}>
            <Plus className="w-4 h-4 mr-2" />
            Create Subject
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] glass-card border-border/40 bg-card/90 backdrop-blur-2xl mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>{editMode ? "Edit Subject" : "New Subject"}</DialogTitle>
              <DialogDescription>
                {editMode ? "Update the course details." : "Define the core subject. You can add sections and video links later."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-3.5 py-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="title" className="text-sm">Course Title</Label>
                  <Input id="title" value={formData.title} onChange={handleInputChange} onBlur={generateSlug} placeholder="e.g. Advanced TypeScript" required className="bg-background/50 border-border/40 text-sm" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="slug" className="text-sm">URL Slug</Label>
                  <Input id="slug" value={formData.slug} onChange={handleInputChange} placeholder="advanced-typescript" required className="bg-background/50 border-border/40 text-muted-foreground text-sm" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="headline" className="text-sm">Headline Summary</Label>
                  <Input id="headline" value={formData.headline} onChange={handleInputChange} placeholder="Master the hardest parts of TS" className="bg-background/50 border-border/40 text-sm" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="price" className="text-sm">Price (₹)</Label>
                  <Input id="price" type="number" min="0" value={formData.price} onChange={handleInputChange} required className="bg-background/50 border-border/40 text-sm" />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="thumbnail_url" className="text-sm">Thumbnail Image URL</Label>
                  <Input id="thumbnail_url" value={formData.thumbnail_url} onChange={handleInputChange} placeholder="https://..." className="bg-background/50 border-border/40 text-sm" />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-sm">Cancel</Button>
                <Button type="submit" className="text-sm">{editMode ? "Save Changes" : "Create Subject"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile card view */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading inventory...</div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookCopy className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-sm">No courses found. Create one to get started.</p>
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="glass-card border border-border/40">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground text-sm truncate">{course.title}</h3>
                    <p className="text-xs text-muted-foreground">/{course.slug}</p>
                  </div>
                  <span className="font-semibold text-foreground text-sm shrink-0">₹{course.price}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`rounded-full h-7 px-2.5 text-xs ${course.is_bestseller ? 'bg-amber-500/10 text-amber-500' : 'text-muted-foreground opacity-50'}`}
                    onClick={() => toggleBestseller(course)}
                  >
                    <Star className={`w-3 h-3 mr-1 ${course.is_bestseller ? 'fill-amber-500' : ''}`} />
                    Bestseller
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => togglePublish(course)}
                    className={`rounded-full h-7 px-2.5 text-xs ${course.is_published ? "text-emerald-400 bg-emerald-500/10" : "text-orange-400 bg-orange-500/10"}`}
                  >
                    {course.is_published ? <><Eye className="w-3 h-3 mr-1" /> Published</> : <><EyeOff className="w-3 h-3 mr-1" /> Draft</>}
                  </Button>
                </div>
                <div className="flex gap-2 pt-1 border-t border-border/40">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 text-xs flex-1"
                    onClick={() => openEditDialog(course)}
                  >
                    <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Edit
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 text-xs flex-1"
                    onClick={() => handleDeleteCourse(course.id, course.title)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block glass-card rounded-2xl border border-border/40 overflow-hidden">
        <Table>
          <TableHeader className="bg-accent/5">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="font-semibold text-foreground text-sm">Course Details</TableHead>
              <TableHead className="font-semibold text-foreground text-right text-sm">Price</TableHead>
              <TableHead className="font-semibold text-foreground text-center text-sm">Badges</TableHead>
              <TableHead className="font-semibold text-foreground text-center text-sm">Status</TableHead>
              <TableHead className="font-semibold text-foreground text-right text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground text-sm">Loading inventory...</TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <BookCopy className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                  <p className="text-sm">No courses found. Create one to get started.</p>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow key={course.id} className="border-b border-border/40 hover:bg-accent/5">
                  <TableCell>
                    <div className="font-medium text-foreground text-sm">{course.title}</div>
                    <div className="text-xs text-muted-foreground">/{course.slug}</div>
                  </TableCell>
                  <TableCell className="text-right font-medium text-sm">₹{course.price}</TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`rounded-full h-7 px-2.5 text-xs ${course.is_bestseller ? 'bg-amber-500/10 text-amber-500' : 'text-muted-foreground opacity-50'}`}
                      onClick={() => toggleBestseller(course)}
                    >
                      <Star className={`w-3 h-3 mr-1 ${course.is_bestseller ? 'fill-amber-500' : ''}`} />
                      Bestseller
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => togglePublish(course)}
                      className={`text-xs ${course.is_published ? "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10" : "text-orange-400 hover:text-orange-300 bg-orange-500/10"}`}
                    >
                      {course.is_published ? <><Eye className="w-3.5 h-3.5 mr-1.5" /> Published</> : <><EyeOff className="w-3.5 h-3.5 mr-1.5" /> Draft</>}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
                      onClick={() => openEditDialog(course)}
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
