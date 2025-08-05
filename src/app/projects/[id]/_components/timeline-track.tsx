"use client";

import { ITimelineTrack } from "@/types/timeline.types";
import { useState, useRef, useEffect, useCallback } from "react";

interface TimelineTrackProps {
  track: ITimelineTrack;
  trackHeight: number;
  selectedClipIds: string[];
  timeToPercent: (time: number) => number;
  percentToTime: (percent: number) => number;
  onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onClipClick: (e: React.MouseEvent, clipId: string) => void;
  onClipMove: (clipId: string, newStartTime: number) => void;
  onClipTrim?: (clipId: string, newStartTime: number, newEndTime: number) => void;
}

const getClipColors = (clipType: string) => {
  const colors = {
    text: "bg-amber-200 border-amber-400 hover:bg-amber-300",
    image: "bg-emerald-200 border-emerald-400 hover:bg-emerald-300",
    video: "bg-blue-200 border-blue-400 hover:bg-blue-300",
    audio: "bg-purple-200 border-purple-400 hover:bg-purple-300",
  };
  return colors[clipType as keyof typeof colors] || "bg-gray-200 border-gray-400";
};

const getTrackColor = (trackType: string) => {
  const colors = {
    text: "bg-amber-100 border-amber-300",
    image: "bg-emerald-100 border-emerald-300",
    video: "bg-blue-100 border-blue-300",
    audio: "bg-purple-100 border-purple-300",
  };
  return colors[trackType as keyof typeof colors] || "bg-gray-100 border-gray-300";
};

export const TimelineTrack = ({
  track,
  trackHeight,
  selectedClipIds,
  timeToPercent,
  percentToTime,
  onTimelineClick,
  onClipClick,
  onClipMove,
}: TimelineTrackProps) => {
  // Drag state - simple clip movement only
  const [dragState, setDragState] = useState<{
    clipId: string;
    startX: number;
    startTime: number;
    element: HTMLElement;
  } | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);

  const handleClipMouseDown = (e: React.MouseEvent, clipId: string, clipStartTime: number) => {
    e.preventDefault();
    e.stopPropagation();

    const element = e.currentTarget as HTMLElement;
    const startX = e.clientX;

    setDragState({
      clipId,
      startX,
      startTime: clipStartTime,
      element,
    });

    // Add dragging class for visual feedback
    element.style.zIndex = "1000";
    element.style.opacity = "0.8";

    onClipClick(e, clipId);
  };

  // Simple mouse move for clip dragging only
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState || !trackRef.current) return;

      const deltaX = e.clientX - dragState.startX;
      // Apply transform directly to DOM element - hardware accelerated!
      dragState.element.style.transform = `translateX(${deltaX}px)`;
    },
    [dragState]
  );

  const handleMouseUp = useCallback(() => {
    if (!dragState || !trackRef.current) return;

    // Calculate final position and update data
    const rect = trackRef.current.getBoundingClientRect();
    const deltaX = parseFloat(dragState.element.style.transform.replace("translateX(", "").replace("px)", "") || "0");
    const deltaPercent = (deltaX / rect.width) * 100;
    const deltaTime = percentToTime(deltaPercent) - percentToTime(0);

    const newStartTime = Math.max(0, dragState.startTime + deltaTime);
    onClipMove(dragState.clipId, newStartTime);

    // Reset all DOM styles
    dragState.element.style.transform = "";
    dragState.element.style.zIndex = "";
    dragState.element.style.opacity = "";

    setDragState(null);
  }, [dragState, percentToTime, onClipMove]);

  // Global mouse events for dragging
  useEffect(() => {
    if (dragState) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [dragState, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={trackRef}
      className={`border-b border-border relative cursor-pointer ${getTrackColor(track.type)}`}
      style={{ height: trackHeight }}
      onClick={onTimelineClick}
    >
      {/* Track clips - simple and fast rendering */}
      {track.clips.map((clip, index) => {
        const clipLeft = timeToPercent(clip.startTime);
        const clipRight = timeToPercent(clip.startTime + clip.duration);
        const clipWidth = clipRight - clipLeft;
        const isSelected = selectedClipIds.includes(clip.id);

        // Only render clips that are partially visible
        if (clipRight < -5 || clipLeft > 105) return null;

        // Calculate text positioning to keep it visible when clip extends beyond boundaries
        const visibleLeft = Math.max(0, clipLeft);
        const visibleRight = Math.min(100, clipRight);
        const visibleWidth = visibleRight - visibleLeft;

        // Calculate text offset within the visible portion
        const textOffset = clipLeft < 0 ? Math.abs(clipLeft) : 0;

        return (
          <div
            key={clip.id}
            className={`absolute top-1 bottom-1 rounded border-2 cursor-grab active:cursor-grabbing overflow-hidden ${getClipColors(
              clip.type
            )} ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
            style={{
              left: `${visibleLeft}%`,
              width: `${visibleWidth}%`,
              minWidth: "2px",
              zIndex: isSelected ? 100 + index : 10 + index,
            }}
            onMouseDown={(e) => handleClipMouseDown(e, clip.id, clip.startTime)}
            onClick={(e) => onClipClick(e, clip.id)}
          >
            {/* Clip content */}
            <div
              className="p-2 h-full flex items-center pointer-events-none absolute inset-0"
              style={{
                left: `${textOffset * (100 / clipWidth)}%`,
              }}
            >
              <span className="text-xs font-medium text-foreground truncate">{clip.name}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
