"use client";

import { useState } from "react";
import { AssetsLibrary } from "./assets-library";
import { Timeline } from "./timeline";
import { MediaPreview } from "./media-preview";
import { MediaToolbar } from "./media-toolbar";
import { useTimeline } from "../_api/use-timeline";
import { useTimelineStore } from "@/stores/timeline-store";
import { Button } from "@/components/ui/button";
import { Save, Download, Sparkles } from "lucide-react";
import { AIDrawer } from "./ai-drawer";

interface VideoEditorProps {
  projectId: string;
}

export function VideoEditor({ projectId }: VideoEditorProps) {
  const [aiDrawerOpen, setAIDrawerOpen] = useState(false);

  const { isLoading, error, saveTimeline, isUpdating } = useTimeline(projectId);
  const { timeline } = useTimelineStore();

  const handleSave = () => {
    if (timeline) {
      saveTimeline(timeline);
    }
  };

  // Enable auto-save after timeline has been initialized
  // useTimelineAutoSave(projectId, !isLoading, autoSaveTimeline);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading timeline...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Failed to load timeline</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col justify-between w-full bg-background overflow-hidden"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="flex h-full w-full">
        <AssetsLibrary projectId={projectId} />

        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between pr-4">
            <MediaToolbar />

            <div className="flex items-center gap-2">
              <Button onClick={handleSave} disabled={isUpdating} size="sm" variant="outline">
                <Save className="w-4 h-4 mr-2" />
                {isUpdating ? "Saving..." : "Save"}
              </Button>

              {/* <Button onClick={() => setExportDrawerOpen(true)} size="sm" variant="outline">
                <Download className="w-4 h-4" />
              </Button> */}

              <Button
                onClick={() => setAIDrawerOpen(true)}
                size="sm"
                variant="outline"
                className="bg-fuchsia-400 text-white hover:bg-fuchsia-600 hover:text-white"
              >
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 pt-0 w-full">
            <MediaPreview projectWidth={1920} projectHeight={1080} />
          </div>
        </div>
      </div>

      <div className="h-80">
        <Timeline height={320} />
      </div>

      <AIDrawer open={aiDrawerOpen} onOpenChange={setAIDrawerOpen} projectId={projectId} />
    </div>
  );
}
