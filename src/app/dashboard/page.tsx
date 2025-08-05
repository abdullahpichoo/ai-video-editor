"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Video,
  Sparkles,
  Download,
  Users,
  Clock,
  TrendingUp,
  ArrowRight,
  FileVideo,
  Wand2,
  Share2,
} from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="relative">
        {/* Header Hero Section */}
        <div className="relative bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
          <div className="absolute inset-0 bg-grid-white/[0.1] bg-[size:20px_20px]" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-4">
                <div className="p-3 bg-white/10 rounded-full backdrop-blur-sm">
                  <Video className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
                Welcome back, {user?.name?.split(" ")[0] || "Creator"}!
              </h1>
              <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                Transform your creative vision into stunning videos with AI-powered editing tools
              </p>
              <Link href="/projects">
                <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
                  Start Creating
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { icon: FileVideo, label: "Projects", value: "12", change: "+3 this week" },
              { icon: Clock, label: "Hours Saved", value: "24", change: "with AI tools" },
              { icon: Download, label: "Exports", value: "8", change: "this month" },
              { icon: TrendingUp, label: "Efficiency", value: "85%", change: "improvement" },
            ].map((stat, index) => (
              <Card key={index} className="backdrop-blur-sm bg-white/80 border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <stat.icon className="h-8 w-8 text-primary" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">New Project</CardTitle>
                          <CardDescription>Start editing a new video</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Link href="/projects">
                        <Button className="w-full">
                          Create Project
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20">
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg group-hover:from-purple-500/20 group-hover:to-pink-500/20 transition-colors">
                          <Wand2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">AI Magic</CardTitle>
                          <CardDescription>Enhance with AI tools</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        Explore AI Tools
                        <Sparkles className="ml-2 h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Features Grid */}
              <div>
                <h2 className="text-2xl font-bold mb-6">Powerful Features</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    {
                      icon: Sparkles,
                      title: "AI Enhancement",
                      description: "Noise removal, auto-subtitles, and smart editing",
                      color: "from-purple-500/10 to-pink-500/10",
                      iconColor: "text-purple-600",
                    },
                    {
                      icon: Download,
                      title: "Export Options",
                      description: "Multiple formats and quality settings",
                      color: "from-green-500/10 to-emerald-500/10",
                      iconColor: "text-green-600",
                    },
                    {
                      icon: Share2,
                      title: "Easy Sharing",
                      description: "Direct upload to social platforms",
                      color: "from-blue-500/10 to-cyan-500/10",
                      iconColor: "text-blue-600",
                    },
                  ].map((feature, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className={`inline-flex p-3 rounded-lg bg-gradient-to-r ${feature.color} mb-4`}>
                          <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                        </div>
                        <h3 className="font-semibold mb-2">{feature.title}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity Sidebar */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { action: "Created", item: "Summer Vacation Edit", time: "2 hours ago" },
                    { action: "Exported", item: "Product Demo Video", time: "1 day ago" },
                    { action: "Applied AI", item: "Noise Removal", time: "3 days ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">
                          {activity.action} <span className="text-muted-foreground">{activity.item}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Tips & Tutorials
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 rounded-lg border">
                    <h4 className="font-medium text-sm mb-1">Master AI Tools</h4>
                    <p className="text-xs text-muted-foreground mb-2">Learn advanced AI editing techniques</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Watch Tutorial
                    </Button>
                  </div>
                  <div className="p-3 rounded-lg border">
                    <h4 className="font-medium text-sm mb-1">Export Settings</h4>
                    <p className="text-xs text-muted-foreground mb-2">Optimize your video quality</p>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
