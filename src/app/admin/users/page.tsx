"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Search, ShieldAlert, MoreVertical, Ban, Mail, UserPlus } from "lucide-react";

import { api } from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  enrollmentCount: number;
  progress: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editUser, setEditUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({ name: "", email: "", role: "student" });

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createFormData, setCreateFormData] = useState({ name: "", email: "", password: "", role: "student" });

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/users');
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredUsers(
        users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
      );
    }
  }, [searchQuery, users]);

  const handleWarnUser = async (userId: string, email: string) => {
    const reason = prompt(`Warning ${email}. Enter reason (e.g. Terms Violation, Suspicious Activity):`);
    if (!reason) return;
    
    try {
      await api.post(`/users/${userId}/warn`, { reason });
      alert(`Warning successfully issued to ${email}`);
    } catch {
      console.error("Warning failed");
      alert("Failed to issue warning.");
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Are you sure you want to delete ${user.name} (${user.email})? This action cannot be undone.`)) {
      try {
        await api.delete(`/users/${user.id}`);
        fetchUsers();
      } catch {
        console.error("Delete failed");
        alert("Failed to delete user.");
      }
    }
  };

  const openEditDialog = (user: User) => {
    setEditUser(user);
    setEditFormData({ name: user.name, email: user.email, role: user.role });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    try {
      await api.put(`/users/${editUser.id}`, editFormData);
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch {
      console.error("Update failed");
      alert("Failed to update user.");
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', createFormData);
      setIsCreateDialogOpen(false);
      setCreateFormData({ name: "", email: "", password: "", role: "student" });
      fetchUsers();
    } catch {
      console.error("Create failed");
      alert("Failed to create user. Email might already be in use.");
    }
  };

  const userActionMenu = (user: User) => (
    <DropdownMenu>
      <DropdownMenuTrigger className="h-8 w-8 p-0 hover:bg-accent/10 flex items-center justify-center rounded-md">
        <MoreVertical className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 glass-card border-border/40 bg-card/90 backdrop-blur-2xl">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs">Account Actions</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuItem className="cursor-pointer text-muted-foreground text-sm" onClick={() => openEditDialog(user)}>
            Edit Account
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer text-orange-400 focus:text-orange-400 focus:bg-orange-500/10 text-sm" onClick={() => handleWarnUser(user.id, user.email)}>
            <ShieldAlert className="w-4 h-4 mr-2" />
            Issue Warning
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-border/40" />
          <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 text-sm" onClick={() => handleDeleteUser(user)}>
            <Ban className="w-4 h-4 mr-2" />
            Delete Account
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Learner Database</h1>
          <p className="text-muted-foreground text-sm">Monitor platform members, enforce policies, and review activity.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="font-semibold glow-primary text-sm h-10 px-4 rounded-xl shrink-0"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Learner
          </Button>
          <div className="relative w-full sm:w-64 lg:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search name or email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-card/50 backdrop-blur-md border-border/40 w-full h-10 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {/* Mobile card view */}
      <div className="block md:hidden space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground text-sm">Loading learners...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No users found matching your criteria.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="glass-card border border-border/40">
              <CardContent className="p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold border border-primary/20 shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium text-foreground text-sm truncate">{user.name}</div>
                      <div className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="w-3 h-3 shrink-0" /> {user.email}
                      </div>
                    </div>
                  </div>
                  {userActionMenu(user)}
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progess</span>
                    <span className="text-foreground font-medium">{user.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-accent/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${user.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                  <div className="flex gap-2">
                    {user.role === 'admin' ? (
                      <Badge className="bg-primary hover:bg-primary text-[10px] px-1.5 h-4">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-border/40 text-[10px] px-1.5 h-4">Student</Badge>
                    )}
                    <Badge variant="secondary" className="bg-accent/5 text-muted-foreground border-none text-[10px] px-1.5 h-4">
                      {user.enrollmentCount} Courses
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Joined {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block glass-card rounded-2xl border border-border/40 overflow-hidden shadow-xl">
        <Table>
          <TableHeader className="bg-accent/5">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="font-semibold text-foreground text-sm">Learner</TableHead>
              <TableHead className="font-semibold text-foreground text-sm">Role</TableHead>
              <TableHead className="font-semibold text-foreground text-sm">Enrollments</TableHead>
              <TableHead className="font-semibold text-foreground text-sm">Avg. Progress</TableHead>
              <TableHead className="font-semibold text-foreground text-sm">Joined Date</TableHead>
              <TableHead className="font-semibold text-foreground text-right text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Loading learners...</TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12 text-muted-foreground text-sm">
                  No users found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-b border-border/40 hover:bg-accent/5">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center text-primary text-sm font-bold border border-primary/20 shrink-0">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-foreground text-sm">{user.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.role === 'admin' ? (
                      <Badge className="bg-primary hover:bg-primary text-xs">Admin</Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground border-border/40 text-xs">Student</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground text-sm font-medium">
                    {user.enrollmentCount}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-accent/5 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${user.progress}%` }} />
                      </div>
                      <span className="text-xs text-foreground font-medium">{user.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(user.created_at), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    {userActionMenu(user)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glass-card border-border/40 bg-card/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Edit User Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="edit-name" className="text-sm">Name</Label>
              <Input 
                id="edit-name" 
                value={editFormData.name} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-background/50 border-border/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-email" className="text-sm">Email</Label>
              <Input 
                id="edit-email" 
                value={editFormData.email} 
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className="bg-background/50 border-border/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Role</Label>
              <select 
                value={editFormData.role}
                onChange={(e) => setEditFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-background/50 border border-border/40 rounded-md h-9 px-3 text-sm text-foreground"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px] glass-card border-border/40 bg-card/90 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle>Add New Learner</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm">Name</Label>
              <Input 
                id="name" 
                placeholder="Full Name"
                value={createFormData.name} 
                onChange={(e) => setCreateFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                className="bg-background/50 border-border/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input 
                id="email" 
                type="email"
                placeholder="email@example.com"
                value={createFormData.email} 
                onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="bg-background/50 border-border/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input 
                id="password" 
                type="password"
                placeholder="••••••••"
                value={createFormData.password} 
                onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                className="bg-background/50 border-border/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Role</Label>
              <select 
                value={createFormData.role}
                onChange={(e) => setCreateFormData(prev => ({ ...prev, role: e.target.value }))}
                className="w-full bg-background/50 border border-border/40 rounded-md h-9 px-3 text-sm text-foreground"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
