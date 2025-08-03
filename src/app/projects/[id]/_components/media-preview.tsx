"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import Image from "next/image";
import { Rnd } from "react-rnd";
import { useTimelineStore } from "@/stores/timeline-store";
import { ITimelineClip } from "@/types/timeline";

interface MediaPreviewProps {
  width?: number;
  height?: number;
  projectWidth?: number;
  projectHeight?: number;
}

interface MediaElementProps {
  clip: ITimelineClip;
  containerWidth: number;
  containerHeight: number;
  zIndex: number;
  onVideoRef: (clipId: string, video: HTMLVideoElement | null) => void;
}

// Individual media element component with drag and resize
const MediaElement = React.memo(({ clip, containerWidth, containerHeight, zIndex, onVideoRef }: MediaElementProps) => {
  const { updateClipTransform, currentTime, isPlaying } = useTimelineStore();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Simple video synchronization - only sync when paused or when video drifts significantly
  useEffect(() => {
    const video = videoRef.current;
    if (!video || clip.type !== "video") return;

    // Calculate the time within this clip
    const clipTime = currentTime - clip.startTime + clip.trimStart;

    // Only sync if we're within this clip's time range
    if (currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration) {
      const videoTimeDiff = Math.abs(video.currentTime - clipTime);

      // Sync video time if:
      // 1. Timeline is paused (for precise scrubbing)
      // 2. Video has drifted significantly during playback (>0.5s)
      if (!isPlaying || videoTimeDiff > 0.5) {
        video.currentTime = clipTime;
      }
    }
  }, [currentTime, isPlaying, clip.startTime, clip.duration, clip.trimStart, clip.type]);

  useEffect(() => {
    if (videoRef.current && clip.type === "video") {
      onVideoRef(clip.id, videoRef.current);
    }
    return () => {
      onVideoRef(clip.id, null);
    };
  }, [clip.id, clip.type, onVideoRef]);

  // Get current dimensions without artificial constraints during resize/drag
  const getCurrentDimensions = useCallback(() => {
    if (!clip.transform) return { x: 0, y: 0, width: 200, height: 150 };

    const { x, y, width, height } = clip.transform;

    // Only ensure position is within reasonable bounds (allow some overflow)
    const boundedX = Math.max(-width * 0.5, Math.min(x, containerWidth + width * 0.5));
    const boundedY = Math.max(-height * 0.5, Math.min(y, containerHeight + height * 0.5));

    return { x: boundedX, y: boundedY, width, height };
  }, [clip.transform, containerWidth, containerHeight]);

  const currentDimensions = getCurrentDimensions();

  const handleDragStop = useCallback(
    (e: unknown, data: { x: number; y: number }) => {
      updateClipTransform(clip.id, {
        x: data.x,
        y: data.y,
      });
    },
    [clip.id, updateClipTransform]
  );

  const handleResizeStop = useCallback(
    (e: unknown, direction: unknown, ref: HTMLElement, delta: unknown, position: { x: number; y: number }) => {
      updateClipTransform(clip.id, {
        x: position.x,
        y: position.y,
        width: parseInt(ref.style.width, 10),
        height: parseInt(ref.style.height, 10),
      });
    },
    [clip.id, updateClipTransform]
  );

  const renderContent = () => {
    switch (clip.type) {
      case "text":
        return (
          <div
            className="w-full h-full flex items-center justify-center text-white font-bold text-center p-2"
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              fontSize: Math.max(12, currentDimensions.height * 0.15),
              borderRadius: "4px",
            }}
          >
            {clip.text || "Text"}
          </div>
        );

      case "video":
        return clip.assetPath ? (
          <video
            ref={videoRef}
            src={clip.assetPath}
            className="w-full h-full object-cover rounded pointer-events-none select-none"
            draggable={false}
            playsInline
          />
        ) : (
          <div className="w-full h-full bg-gray-400 flex items-center justify-center rounded">Video Loading...</div>
        );

      case "image":
        return clip.assetPath ? (
          <div className="w-full h-full relative rounded overflow-hidden">
            <Image
              src={clip.assetPath}
              alt={clip.assetName || "Image"}
              fill
              className="object-cover pointer-events-none select-none"
              sizes="(max-width: 800px) 100vw, 800px"
              draggable={false}
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-400 flex items-center justify-center rounded">Image Loading...</div>
        );

      default:
        return <div className="w-full h-full bg-gray-500 flex items-center justify-center rounded">Unknown Media</div>;
    }
  };

  return (
    <Rnd
      style={{ zIndex }}
      size={{
        width: currentDimensions.width,
        height: currentDimensions.height,
      }}
      position={{
        x: currentDimensions.x,
        y: currentDimensions.y,
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      minWidth={50}
      minHeight={50}
      className="border-2 border-blue-400 hover:border-blue-500 rounded"
      resizeHandleStyles={{
        bottomRight: {
          background: "#3b82f6",
          borderRadius: "50%",
          width: "12px",
          height: "12px",
          border: "2px solid white",
        },
        bottomLeft: {
          background: "#3b82f6",
          borderRadius: "50%",
          width: "12px",
          height: "12px",
          border: "2px solid white",
        },
        topRight: {
          background: "#3b82f6",
          borderRadius: "50%",
          width: "12px",
          height: "12px",
          border: "2px solid white",
        },
        topLeft: {
          background: "#3b82f6",
          borderRadius: "50%",
          width: "12px",
          height: "12px",
          border: "2px solid white",
        },
      }}
    >
      {renderContent()}
    </Rnd>
  );
});

MediaElement.displayName = "MediaElement";

// Hook for managing active clips with proper z-index ordering
const useActiveClips = () => {
  const { timeline, currentTime } = useTimelineStore();

  return useMemo(() => {
    const activeClips: Array<{
      clip: ITimelineClip;
      zIndex: number;
    }> = [];

    timeline.tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const clipEndTime = clip.startTime + clip.duration;
        if (currentTime >= clip.startTime && currentTime <= clipEndTime) {
          let baseZIndex = 1;
          switch (track.type) {
            case "video":
              baseZIndex = 10;
              break;
            case "image":
              baseZIndex = 20; // Images should be on top of videos
              break;
            case "text":
              baseZIndex = 30; // Text should be on top of everything
              break;
            case "audio":
              baseZIndex = 0; // Audio has no visual component
              break;
          }

          const zIndex = baseZIndex + (track.layerIndex || 0);

          activeClips.push({ clip, zIndex });
        }
      });
    });

    return activeClips.sort((a, b) => a.zIndex - b.zIndex);
  }, [timeline, currentTime]);
};

// Video management hook - This hook now ONLY handles play/pause commands.
const useVideoRefs = () => {
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());
  const { isPlaying, currentTime } = useTimelineStore();
  const { timeline } = useTimelineStore();

  const setVideoRef = useCallback((clipId: string, video: HTMLVideoElement | null) => {
    if (video) {
      videoRefs.current.set(clipId, video);
    } else {
      videoRefs.current.delete(clipId);
    }
  }, []);

  // This effect handles the global play/pause state.
  useEffect(() => {
    videoRefs.current.forEach((video, clipId) => {
      const clip = timeline.tracks.flatMap((t) => t.clips).find((c) => c.id === clipId);

      if (!clip) return;

      // We only command the video to play if the timeline is within its active range.
      const isActive = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;

      if (isPlaying && isActive) {
        if (video.paused) {
          video.play().catch(console.error);
        }
      } else {
        if (!video.paused) {
          video.pause();
        }
      }
    });
  }, [isPlaying, currentTime, timeline.tracks]);

  return { setVideoRef };
};

export function MediaPreview({
  width = 640,
  height = 360,
  projectWidth = 1920,
  projectHeight = 1080,
}: MediaPreviewProps) {
  const { currentTime } = useTimelineStore();
  const activeClips = useActiveClips();
  const { setVideoRef } = useVideoRefs();

  const aspectRatio = projectWidth / projectHeight;
  let containerWidth = width;
  let containerHeight = width / aspectRatio;

  if (containerHeight > height) {
    containerHeight = height;
    containerWidth = height * aspectRatio;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Preview Container */}
      <div
        className="relative bg-gray-900 border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
        style={{
          width: containerWidth,
          height: containerHeight,
        }}
      >
        {/* Background grid pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />

        {/* Render active clips with proper z-index ordering */}
        {activeClips.map(({ clip, zIndex }) => (
          <MediaElement
            key={`${clip.id}`}
            clip={clip}
            containerWidth={containerWidth}
            containerHeight={containerHeight}
            zIndex={zIndex}
            onVideoRef={setVideoRef}
          />
        ))}

        {/* No content message */}
        {activeClips.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <div className="text-lg font-medium">No media at current time</div>
              <div className="text-sm">Add clips to the timeline to see preview</div>
              <div className="text-xs text-gray-500 mt-2">Time: {currentTime.toFixed(2)}s</div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Info */}
      <div className="text-sm text-gray-600 text-center">
        <div>
          Preview: {Math.round(containerWidth)} × {Math.round(containerHeight)}
          px
        </div>
        <div>
          Project: {projectWidth} × {projectHeight}px (Aspect: {aspectRatio.toFixed(2)})
        </div>
        <div>Active clips: {activeClips.length}</div>
      </div>
    </div>
  );
}
