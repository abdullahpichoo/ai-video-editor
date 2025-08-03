"use client";

import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateProjectDialog } from "./create-project-dialog";
import { VideoProject } from "@/models/VideoProject";
import { Plus, Video, Calendar, Settings } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export function ProjectsList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      return response.data;
    },
  });

  const projects = data?.data?.projects || [];

  if (isLoading) {
    return (
      <div className="bg-gray-50 p-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 p-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Failed to load projects
            </h2>
            <p className="text-gray-600">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-8 min-h-[calc(100vh-4rem)]">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
            <p className="text-gray-600 mt-2">
              Create and manage your video projects
            </p>
          </div>

          <CreateProjectDialog>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </CreateProjectDialog>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              No projects yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first video project to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project: VideoProject) => (
              <ProjectCard
                key={project._id?.toString() || project.projectId}
                project={project}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: VideoProject }) {
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-gray-900 line-clamp-1">
              {project.title}
            </CardTitle>
            {project.description && (
              <CardDescription className="line-clamp-2 mt-1">
                {project.description}
              </CardDescription>
            )}
          </div>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Resolution</span>
            <span className="font-medium">
              {project.timelineSettings.resolution.width} ×{" "}
              {project.timelineSettings.resolution.height}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Frame Rate</span>
            <span className="font-medium">
              {project.timelineSettings.fps} FPS
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Duration</span>
            <span className="font-medium">
              {project.timelineSettings.duration > 0
                ? `${Math.floor(
                    project.timelineSettings.duration / 60
                  )}:${String(project.timelineSettings.duration % 60).padStart(
                    2,
                    "0"
                  )}`
                : "0:00"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
            <Calendar className="w-4 h-4" />
            <span>Updated {formatDate(project.updatedAt)}</span>
          </div>
        </div>

        <div className="mt-4">
          <Link href={`/projects/${project.projectId}`}>
            <Button className="w-full">Open Project</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
