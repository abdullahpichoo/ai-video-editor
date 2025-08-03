"use client";

import { useEffect } from "react";
import { AssetsLibrary } from "./assets-library";
import { Timeline } from "./timeline";
import { MediaPreview } from "./media-preview";
import { useTimelineStore } from "@/stores/timeline-store";

interface VideoEditorProps {
  projectId: string;
}

export function VideoEditor({ projectId }: VideoEditorProps) {
  const { initializeTimeline } = useTimelineStore();

  useEffect(() => {
    initializeTimeline(projectId);
  }, [projectId, initializeTimeline]);

  return (
    <div
      className="flex flex-col justify-between w-full bg-background overflow-hidden"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      <div className="flex h-full">
        <AssetsLibrary projectId={projectId} />

        {/* Text toolbar */}

        <div className="flex-1 flex items-center justify-center p-4">
          <MediaPreview projectWidth={1920} projectHeight={1080} />
        </div>
      </div>

      <div className="h-80">
        <Timeline height={320} />
      </div>
    </div>
  );
}
