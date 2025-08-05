"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useCreateProject } from "../_api/use-projects";
import { resolutionPresets } from "./schema";

interface CreateProjectData {
  title: string;
  description?: string;
  resolution: {
    width: number;
    height: number;
  };
  fps?: number;
}

interface CreateProjectDialogProps {
  children: React.ReactNode;
}

export function CreateProjectDialog({ children }: CreateProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateProjectData>({
    title: "",
    description: "",
    resolution: {
      width: 1920,
      height: 1080,
    },
    fps: 30,
  });

  const createProjectMutation = useCreateProject();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Project title is required");
      return;
    }

    if (formData.resolution.width < 320 || formData.resolution.height < 240) {
      toast.error("Resolution too small");
      return;
    }

    try {
      await createProjectMutation.mutateAsync(formData);
      setOpen(false);
      setFormData({
        title: "",
        description: "",
        resolution: { width: 1920, height: 1080 },
        fps: 30,
      });
    } catch {
      // Error is handled by the hook
    }
  };

  const handlePresetChange = (preset: string) => {
    const selectedPreset = resolutionPresets.find((p) => `${p.width}x${p.height}` === preset);
    if (selectedPreset) {
      setFormData((prev) => ({
        ...prev,
        resolution: {
          width: selectedPreset.width,
          height: selectedPreset.height,
        },
      }));
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setFormData({
            title: "",
            description: "",
            resolution: { width: 1920, height: 1080 },
            fps: 30,
          });
        }
      }}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
          <DialogDescription>Set up your video project with the desired dimensions and settings.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Project Title</Label>
            <Input
              id="title"
              placeholder="My awesome video"
              value={formData.title}
              onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              placeholder="Brief description of your project"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Resolution Presets</Label>
            <Select onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a preset or set custom" />
              </SelectTrigger>
              <SelectContent>
                {resolutionPresets.map((preset, id) => (
                  <SelectItem key={`${id}`} value={`${preset.width}x${preset.height}`}>
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                type="number"
                placeholder="1920"
                value={formData.resolution.width}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    resolution: {
                      ...prev.resolution,
                      width: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                min={320}
                max={7680}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                type="number"
                placeholder="1080"
                value={formData.resolution.height}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    resolution: {
                      ...prev.resolution,
                      height: parseInt(e.target.value) || 0,
                    },
                  }))
                }
                min={240}
                max={4320}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fps">Frame Rate (FPS)</Label>
            <Input
              id="fps"
              type="number"
              placeholder="30"
              value={formData.fps}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  fps: parseInt(e.target.value) || 30,
                }))
              }
              min={1}
              max={120}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
