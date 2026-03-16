"use client";

import { useEffect, useState } from "react";
import { Save, Mail, Globe, ShieldAlert, UserPlus, Loader2 } from "lucide-react";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    site_name: "",
    support_email: "",
    maintenance_mode: false,
    allow_new_registrations: true
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/settings');
      setSettings(res.data);
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put('/settings', settings);
      alert("Settings updated successfully!");
    } catch (err) {
      console.error("Save failure:", err);
      alert("Failed to update settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">Platform Settings</h1>
          <p className="text-muted-foreground text-sm">Configure global website options and policies.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="glow-primary px-6">
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card className="glass-card border-white/[0.04] bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Globe className="w-5 h-5 text-primary" />
              General Configuration
            </CardTitle>
            <CardDescription>Main brand and contact details for the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input 
                id="site_name" 
                value={settings.site_name} 
                onChange={(e) => setSettings(prev => ({ ...prev, site_name: e.target.value }))}
                className="bg-background/40 border-white/[0.08]"
                placeholder="LMSPro"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="support_email">Support Contact Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  id="support_email" 
                  value={settings.support_email} 
                  onChange={(e) => setSettings(prev => ({ ...prev, support_email: e.target.value }))}
                  className="pl-9 bg-background/40 border-white/[0.08]"
                  placeholder="support@example.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card className="glass-card border-white/[0.04] bg-card/40 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <UserPlus className="w-5 h-5 text-emerald-400" />
              Access & Registration
            </CardTitle>
            <CardDescription>Control how users join and access the platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Allow New Registrations</Label>
                <p className="text-xs text-muted-foreground">Toggle whether new students can sign up.</p>
              </div>
              <Switch 
                checked={settings.allow_new_registrations}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_new_registrations: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* System & Maintenance */}
        <Card className="glass-card border-white/[0.04] bg-card/40 backdrop-blur-xl border-t-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-orange-400">
              <ShieldAlert className="w-5 h-5" />
              System Status
            </CardTitle>
            <CardDescription>Critical maintenance and system-wide overrides.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Maintenance Mode</Label>
                <p className="text-xs text-muted-foreground text-orange-400/80">If enabled, only admins can access the platform.</p>
              </div>
              <Switch 
                checked={settings.maintenance_mode}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, maintenance_mode: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
