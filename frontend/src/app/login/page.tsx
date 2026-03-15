"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, ShieldCheck, Mail, Lock, ArrowRight, Activity, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/axios";
import { useAuthStore } from "@/store/authStore";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/layout/ThemeToggle";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authRole, setAuthRole] = useState<'student' | 'admin'>('student');
  const login = useAuthStore((state) => state.login);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    const target = e.target as typeof e.target & {
      name?: { value: string };
      email: { value: string };
      password: { value: string };
    };
    
    const email = target.email.value;
    const password = target.password.value;
    const name = target.name?.value;

    try {
      const endpoint = isRegistering && authRole === 'student' ? '/auth/register' : '/auth/login';
      const payload = isRegistering && authRole === 'student' ? { name, email, password } : { email, password, role: authRole };
      
      const response = await api.post(endpoint, payload);
      
      const { user, token, refreshToken } = response.data;
      login(user, token, refreshToken);
      
      router.push(authRole === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const error = err as any;
      setErrorMsg(error.response?.data?.error || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-6 overflow-x-hidden bg-background">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Ambient glass background */}
      <div className="absolute top-[-30%] left-[-15%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] right-[-15%] w-[50%] h-[50%] bg-accent/8 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] z-10 flex flex-col items-center"
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary/10 p-2.5 rounded-2xl border border-primary/20">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            LMS<span className="text-primary">Pro</span>
          </h1>
        </div>

        {/* Auth Card */}
        <Card className="glass-card w-full border-border/40 overflow-hidden rounded-3xl relative">
          {authRole === 'admin' && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent/40 via-accent to-accent/40" />
          )}
          
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-foreground">
              {authRole === 'admin' ? "Admin Portal" : (isRegistering ? "Join LMSPro" : "Welcome back")}
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm">
              {authRole === 'admin' ? "Authorized personnel login" : (isRegistering ? "Create your learner account" : "Enter details to continue learning")}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 px-5 sm:px-8">
            {/* Custom Role Switcher */}
            <div className="flex p-1 bg-accent/5 rounded-xl border border-border/40 mb-6">
              <button 
                onClick={() => { setAuthRole('student'); setIsRegistering(false); setErrorMsg(""); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                  authRole === 'student' ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <GraduationCap className="w-4 h-4" /> Learner
              </button>
              <button 
                onClick={() => { setAuthRole('admin'); setIsRegistering(false); setErrorMsg(""); }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                  authRole === 'admin' ? "bg-accent/15 text-accent" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <ShieldCheck className="w-4 h-4" /> Admin
              </button>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs p-3 rounded-xl text-center overflow-hidden"
                >
                  {errorMsg}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleAuth} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {isRegistering && authRole === 'student' && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-1.5"
                  >
                    <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Full Name</Label>
                    <div className="relative group/field">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                      <Input id="name" name="name" placeholder="John Doe" className="h-11 pl-11 bg-background/40 border-border/40 focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-xl" required />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                  {authRole === 'admin' ? "Username / Email" : "Email Address"}
                </Label>
                <div className="relative group/field">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                  <Input 
                    id="email" 
                    name="email" 
                    type={authRole === 'admin' ? "text" : "email"} 
                    placeholder={authRole === 'admin' ? "admin123" : "you@example.com"} 
                    className="h-11 pl-11 bg-background/40 border-border/40 focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-xl" 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center px-1 mb-1">
                  <Label htmlFor="password" title="password-label" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Password</Label>
                  {!isRegistering && (
                    <button type="button" className="text-[10px] text-primary hover:underline">Forgot password?</button>
                  )}
                </div>
                <div className="relative group/field">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within/field:text-primary transition-colors" />
                  <Input id="password" name="password" type="password" placeholder="••••••••" className="h-11 pl-11 bg-background/40 border-border/40 focus-visible:ring-primary/40 focus-visible:border-primary/40 rounded-xl" required minLength={6} />
                </div>
              </div>

              {authRole === 'admin' && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-xl bg-accent/10 border border-accent/20 space-y-1"
                >
                  <p className="text-[10px] font-bold text-accent uppercase tracking-widest">Demo Credentials</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Username:</span>
                    <code className="text-accent font-mono font-bold">admin123</code>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Password:</span>
                    <code className="text-accent font-mono font-bold">admin123</code>
                  </div>
                </motion.div>
              )}

              <Button 
                type="submit" 
                className={cn(
                  "w-full h-11 font-bold rounded-xl mt-2 transition-all group",
                  authRole === 'admin' ? "glow-accent bg-accent hover:bg-accent/90" : "glow-primary"
                )} 
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : (isRegistering ? "Create Free Account" : (authRole === 'admin' ? "Access Dashboard" : "Sign In"))}
                {!isLoading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-3 pb-8 pt-6 px-8 text-center bg-accent/2">
            <p className="text-sm text-muted-foreground">
              {authRole === 'admin' 
                ? "Looking for learner portal?" 
                : (isRegistering ? "Already have an account?" : "Ready to start your journey?")
              }
              <button 
                type="button" 
                onClick={() => { 
                  if (authRole === 'admin') setAuthRole('student');
                  else setIsRegistering(!isRegistering); 
                  setErrorMsg(""); 
                }} 
                className="text-primary font-bold hover:underline ml-1.5"
              >
                {authRole === 'admin' ? "Go to Learner" : (isRegistering ? "Sign in" : "Sign up for free")}
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
