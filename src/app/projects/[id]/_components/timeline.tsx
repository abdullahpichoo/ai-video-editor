"use client";

import { useTimelineStore } from "@/stores/timeline-store";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { TimelinePlayhead } from "./timeline-playhead";
import { TimelineControls } from "./timeline-controls";
import { TimelineRuler } from "./timeline-ruler";
import { TimelineTrack } from "./timeline-track";

interface TimelineProps {
  width?: number;
  height?: number;
}

const TRACK_HEIGHT = 45;
const TRACK_HEADER_WIDTH = 200;
const RULER_HEIGHT = 50;
const VISIBLE_DURATION = 10; // Show only 10 seconds initially
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 5;

export const Timeline = ({ height = 320 }: Omit<TimelineProps, "width">) => {
  const {
    timeline,
    currentTime,
    isPlaying,
    selectedClip,
    setCurrentTime,
    play,
    pause,
    selectClip,
    deleteClip,
    splitClip,
    moveClip,
    trimSelectedClip,
  } = useTimelineStore();
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef(currentTime);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const shouldDelete = e.key === "Delete" || e.key === "Backspace";
      const shouldSplit = e.key === "s" && selectedClip;

      if (shouldDelete && selectedClip) {
        deleteClip(selectedClip.id);
      } else if (shouldSplit && selectedClip) {
        if (currentTime > selectedClip.startTime && currentTime < selectedClip.startTime + selectedClip.duration) {
          splitClip(selectedClip.id, currentTime);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedClip, deleteClip, splitClip, currentTime]);

  // Animate playhead during playback
  useEffect(() => {
    let animationFrame: number;
    let startTime = performance.now();
    let timeAtStart = currentTimeRef.current;

    const animate = (currentFrame: number) => {
      if (isPlaying && !isDraggingPlayhead) {
        const deltaTime = (currentFrame - startTime) / 1000; // Convert to seconds
        const newTime = timeAtStart + deltaTime;

        if (newTime >= timeline.duration) {
          setCurrentTime(timeline.duration);
          pause(); // Auto-pause at end
        } else {
          setCurrentTime(newTime);
        }

        animationFrame = requestAnimationFrame(animate);
      }
    };

    if (isPlaying && !isDraggingPlayhead) {
      startTime = performance.now();
      timeAtStart = currentTimeRef.current;
      animationFrame = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, isDraggingPlayhead, timeline.duration, setCurrentTime, pause]);

  const timeToPercent = useCallback(
    (time: number) => {
      const visibleDuration = VISIBLE_DURATION / zoom;
      const startTime = scrollX;
      const endTime = startTime + visibleDuration;

      if (time < startTime || time > endTime) {
        return time < startTime ? -10 : 110; // Off-screen
      }

      return ((time - startTime) / visibleDuration) * 100;
    },
    [zoom, scrollX]
  );

  const percentToTime = useCallback(
    (percent: number) => {
      const visibleDuration = VISIBLE_DURATION / zoom;
      const startTime = scrollX;
      return startTime + (percent / 100) * visibleDuration;
    },
    [zoom, scrollX]
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingPlayhead && timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const percent = (mouseX / rect.width) * 100;
        const newTime = percentToTime(percent);
        setCurrentTime(Math.max(0, Math.min(newTime, timeline.duration)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
    };

    if (isDraggingPlayhead) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingPlayhead, percentToTime, setCurrentTime, timeline.duration]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDraggingPlayhead) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percent = (clickX / rect.width) * 100;
    const newTime = percentToTime(percent);
    setCurrentTime(Math.max(0, Math.min(newTime, timeline.duration)));

    if (isPlaying) {
      pause();
    }
  };

  const handleSplitAtPlayhead = useCallback(() => {
    if (
      selectedClip &&
      currentTime > selectedClip.startTime &&
      currentTime < selectedClip.startTime + selectedClip.duration
    ) {
      splitClip(selectedClip.id, currentTime);
    }
  }, [selectedClip, currentTime, splitClip]);

  const handleTrimStartToPlayhead = useCallback(() => {
    if (
      selectedClip &&
      currentTime > selectedClip.originalStartTime &&
      currentTime < selectedClip.startTime + selectedClip.duration
    ) {
      const newStartTime = currentTime;
      const newEndTime = selectedClip.startTime + selectedClip.duration;
      trimSelectedClip(newStartTime, newEndTime);
    }
  }, [selectedClip, currentTime, trimSelectedClip]);

  // Handle trim clip end to playhead
  const handleTrimEndToPlayhead = useCallback(() => {
    if (selectedClip && currentTime > selectedClip.startTime && currentTime < selectedClip.originalEndTime) {
      const newStartTime = selectedClip.startTime;
      const newEndTime = currentTime;
      trimSelectedClip(newStartTime, newEndTime);
    }
  }, [selectedClip, currentTime, trimSelectedClip]);

  // Stable clip click handler
  const handleClipClick = useCallback(
    (e: React.MouseEvent, clipId: string) => {
      e.stopPropagation();
      selectClip?.(clipId);
    },
    [selectClip]
  );

  // Handle playhead drag
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  // Handle mouse wheel for zoom and scroll - simplified for performance
  const handleContainerWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + wheel
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * zoomFactor)));
      } else {
        // Scroll horizontally - direct state update for better performance
        const scrollSpeed = 0.5;
        const deltaTime = (e.deltaY / 100) * scrollSpeed;
        setScrollX((prev) => {
          const maxScroll = Math.max(0, timeline.duration - VISIBLE_DURATION / zoom);
          return Math.max(0, Math.min(maxScroll, prev + deltaTime));
        });
      }
    },
    [zoom, timeline.duration]
  );

  // Track color mapping

  // Get clip colors

  // Generate time markers for ruler
  const generateTimeMarkers = () => {
    const markers = [];
    const visibleDuration = VISIBLE_DURATION / zoom;
    const startTime = scrollX;
    const endTime = startTime + visibleDuration;

    // Determine interval based on zoom level
    let interval = 1;
    if (visibleDuration > 60) interval = 10;
    else if (visibleDuration > 30) interval = 5;
    else if (visibleDuration > 10) interval = 2;
    else if (visibleDuration > 5) interval = 1;
    else interval = 0.5;

    // Generate markers for visible range only
    const startMarker = Math.floor(startTime / interval) * interval;
    const endMarker = Math.ceil(Math.min(endTime, timeline.duration) / interval) * interval;

    for (let time = startMarker; time <= endMarker; time += interval) {
      if (time >= 0 && time <= timeline.duration) {
        markers.push(time);
      }
    }
    return markers;
  };
  return (
    <div
      className="bg-background border-t border-border w-full h-full"
      onWheel={handleContainerWheel}
      style={{ touchAction: "none" }}
    >
      {/* Controls Header */}
      <TimelineControls
        currentTime={currentTime}
        totalDuration={timeline.duration}
        isPlaying={isPlaying}
        zoom={zoom}
        selectedClipIds={selectedClip ? [selectedClip.id] : []}
        onPlay={play}
        onPause={pause}
        onSeekToStart={() => setCurrentTime(0)}
        onSeekToEnd={() => setCurrentTime(timeline.duration)}
        onSplitAtPlayhead={handleSplitAtPlayhead}
        onTrimStartToPlayhead={handleTrimStartToPlayhead}
        onTrimEndToPlayhead={handleTrimEndToPlayhead}
        onZoomIn={() => setZoom((prev) => Math.min(MAX_ZOOM, prev * 1.25))}
        onZoomOut={() => setZoom((prev) => Math.max(MIN_ZOOM, prev * 0.8))}
      />

      {/* Timeline Content */}
      <div className="flex" style={{ height: height - 64 }}>
        {/* Track Headers */}
        <div className="bg-muted border-r border-border" style={{ width: TRACK_HEADER_WIDTH }}>
          {/* Ruler Header */}
          <div
            className="bg-card border-b border-border flex items-center justify-center"
            style={{ height: RULER_HEIGHT }}
          >
            <span className="text-sm font-medium text-muted-foreground">Timeline</span>
          </div>

          {/* Track Headers */}
          {timeline.tracks.map((track) => (
            <div
              key={track.id}
              className="border-b border-border flex items-center justify-center px-4"
              style={{ height: TRACK_HEIGHT }}
            >
              <div className="text-sm text-foreground uppercase">{track.type}</div>
            </div>
          ))}
        </div>

        <div className="flex-1 relative overflow-hidden select-none">
          <TimelineRuler
            currentTime={currentTime}
            timeToPercent={timeToPercent}
            generateTimeMarkers={generateTimeMarkers}
            onTimelineClick={handleTimelineClick}
            rulerHeight={RULER_HEIGHT}
            timelineRef={timelineRef}
          />

          <TimelinePlayhead
            currentTime={currentTime}
            timeToPercent={timeToPercent}
            rulerHeight={RULER_HEIGHT}
            trackHeight={TRACK_HEIGHT}
            trackCount={timeline.tracks.length}
            onMouseDown={handlePlayheadMouseDown}
          />

          <div className="relative" ref={tracksRef}>
            {timeline.tracks.map((track) => (
              <TimelineTrack
                key={track.id}
                track={track}
                trackHeight={TRACK_HEIGHT}
                selectedClipIds={selectedClip ? [selectedClip.id] : []}
                timeToPercent={timeToPercent}
                percentToTime={percentToTime}
                onTimelineClick={handleTimelineClick}
                onClipClick={handleClipClick}
                onClipMove={moveClip}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
