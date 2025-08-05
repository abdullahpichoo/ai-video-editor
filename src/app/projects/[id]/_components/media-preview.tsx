"use client";

import React, { useCallback } from "react";
import Image from "next/image";
import { Rnd } from "react-rnd";
import { useTimelineStore } from "@/stores/timeline-store";
import { ITimelineClip } from "@/types/timeline.types";
import { useMediaPreview } from "../_hooks/use-media-preview";
import { useMediaElementSync } from "../_hooks/use-media-element-sync";

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
  onAudioRef: (clipId: string, audio: HTMLAudioElement | null) => void;
}

// Individual media element component with drag and resize
const MediaElement = React.memo(
  ({ clip, containerWidth, containerHeight, zIndex, onVideoRef, onAudioRef }: MediaElementProps) => {
    const { updateClipTransform } = useTimelineStore();
    const { videoRef, audioRef } = useMediaElementSync(clip, onVideoRef, onAudioRef);

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
              className="w-full h-full flex items-center justify-center font-bold text-center p-2"
              style={{
                backgroundColor: clip.style?.backgroundColor || "rgba(0, 0, 0, 0.7)",
                color: clip.style?.color || "#ffffff",
                fontSize: clip.style?.fontSize || Math.max(12, currentDimensions.height * 0.15),
                fontFamily: clip.style?.fontFamily || "Arial",
                borderRadius: "4px",
                textAlign: clip.style?.alignment || "center",
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

        case "audio":
          return (
            <div className="w-full h-full bg-blue-600 flex items-center justify-center rounded relative">
              {clip.assetPath ? (
                <audio ref={audioRef} src={clip.assetPath} className="hidden" preload="metadata" />
              ) : null}
              <div className="text-white text-center">
                <div className="text-2xl mb-2">🎵</div>
                <div className="text-sm font-medium">{clip.assetName || "Audio"}</div>
              </div>
            </div>
          );

        default:
          return (
            <div className="w-full h-full bg-gray-500 flex items-center justify-center rounded">Unknown Media</div>
          );
      }
    };

    return (
      <Rnd
        style={{ zIndex, display: clip.type === "audio" ? "none" : "block" }}
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
        className={`border-2 border-blue-400 hover:border-blue-500 rounded ${
          clip.type === "audio" ? "pointer-events-none hidden" : ""
        }`}
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
  }
);

MediaElement.displayName = "MediaElement";

export function MediaPreview({
  width = 640,
  height = 360,
  projectWidth = 1920,
  projectHeight = 1080,
}: MediaPreviewProps) {
  const { currentTime } = useTimelineStore();
  const { activeClips, setVideoRef, setAudioRef } = useMediaPreview();

  const aspectRatio = projectWidth / projectHeight;
  let containerWidth = width;
  let containerHeight = width / aspectRatio;

  if (containerHeight > height) {
    containerHeight = height;
    containerWidth = height * aspectRatio;
  }

  return (
    <div className="flex flex-col gap-0">
      {/* Preview Container */}
      <div className="flex flex-col items-center gap-4 p-4">
        <div
          className="relative bg-background border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
          style={{
            width: containerWidth,
            height: containerHeight,
          }}
        >
          {activeClips.map(({ clip, zIndex }) => (
            <MediaElement
              key={`${clip.id}`}
              clip={clip}
              containerWidth={containerWidth}
              containerHeight={containerHeight}
              zIndex={zIndex}
              onVideoRef={setVideoRef}
              onAudioRef={setAudioRef}
            />
          ))}

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

        <div className="text-xs text-muted-foreground text-center">
          <div>
            Project: {projectWidth} × {projectHeight}px (Aspect: {aspectRatio.toFixed(2)})
          </div>
          <div>
            Preview: {Math.round(containerWidth)} × {Math.round(containerHeight)} px
          </div>
          <div>Active clips: {activeClips.length}</div>
        </div>
      </div>
    </div>
  );
}
