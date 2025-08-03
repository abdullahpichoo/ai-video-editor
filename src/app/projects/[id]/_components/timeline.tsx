"use client";

import { useTimelineStore } from "@/stores/timeline-store";
import React, { useCallback, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2 } from "lucide-react";
import { TimelinePlayhead } from "./timeline-playhead";

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
  const { timeline, currentTime, isPlaying, selectedClipIds, setCurrentTime, play, pause, selectClip } =
    useTimelineStore();

  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [scrollX, setScrollX] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  const tracksRef = useRef<HTMLDivElement>(null);
  const currentTimeRef = useRef(currentTime);

  // Keep currentTimeRef in sync with currentTime state
  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  // Convert time to percentage (accounting for zoom and scroll)
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

  // Convert percentage to time (accounting for zoom and scroll)
  const percentToTime = useCallback(
    (percent: number) => {
      const visibleDuration = VISIBLE_DURATION / zoom;
      const startTime = scrollX;
      return startTime + (percent / 100) * visibleDuration;
    },
    [zoom, scrollX]
  );

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  // Handle timeline click for seeking
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

  // Handle playhead drag
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  // Handle mouse wheel for zoom and scroll
  const handleContainerWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.ctrlKey || e.metaKey) {
        // Zoom with Ctrl/Cmd + wheel
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setZoom((prev) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, prev * zoomFactor)));
      } else {
        // Scroll horizontally
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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingPlayhead || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const percent = (mouseX / rect.width) * 100;
      const newTime = percentToTime(percent);
      setCurrentTime(Math.max(0, Math.min(newTime, timeline.duration)));
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

  // Animate playhead during playback
  useEffect(() => {
    let animationFrame: number;
    let startTime = performance.now();
    let timeAtStart = currentTimeRef.current;

    const animate = (currentFrame: number) => {
      if (isPlaying && !isDraggingPlayhead) {
        const deltaTime = (currentFrame - startTime) / 1000; // Convert to seconds
        const newTime = timeAtStart + deltaTime;

        // Check if we've reached the end
        if (newTime >= timeline.duration) {
          setCurrentTime(timeline.duration);
          pause(); // Auto-pause at end
        } else {
          setCurrentTime(newTime);
        }

        // Continue animation if still playing
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

  // Track color mapping
  const getTrackColor = (trackType: string) => {
    const colors = {
      text: "bg-amber-100 border-amber-300",
      image: "bg-emerald-100 border-emerald-300",
      video: "bg-blue-100 border-blue-300",
      audio: "bg-purple-100 border-purple-300",
    };
    return colors[trackType as keyof typeof colors] || "bg-gray-100 border-gray-300";
  };

  // Get clip colors
  const getClipColors = (clipType: string) => {
    const colors = {
      text: "bg-amber-200 border-amber-400 hover:bg-amber-300",
      image: "bg-emerald-200 border-emerald-400 hover:bg-emerald-300",
      video: "bg-blue-200 border-blue-400 hover:bg-blue-300",
      audio: "bg-purple-200 border-purple-400 hover:bg-purple-300",
    };
    return colors[clipType as keyof typeof colors] || "bg-gray-200 border-gray-400";
  };

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
      <div className="h-[12%] bg-card border-b border-border flex items-center justify-center px-4 gap-4">
        <Button variant="outline" size="sm" onClick={() => setCurrentTime(0)}>
          <SkipBack />
        </Button>

        <Button variant="default" size="sm" onClick={isPlaying ? pause : play}>
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </Button>

        <Button variant="outline" size="sm" onClick={() => setCurrentTime(timeline.duration)} className="w-8 h-8 p-0">
          <SkipForward className="w-4 h-4" />
        </Button>

        <div className="text-sm font-mono text-muted-foreground mx-4">
          {formatTime(currentTime)} / {formatTime(timeline.duration)}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((prev) => Math.max(MIN_ZOOM, prev * 0.8))}
            className="w-8 h-8 p-0 text-xs"
          >
            -
          </Button>
          <span className="text-xs text-muted-foreground min-w-12 text-center">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom((prev) => Math.min(MAX_ZOOM, prev * 1.25))}
            className="w-8 h-8 p-0 text-xs"
          >
            +
          </Button>
          <Button variant="outline" size="sm" className="w-8 h-8 p-0">
            <Volume2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

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
          <div
            className="bg-card border-b border-border relative cursor-pointer"
            style={{
              height: RULER_HEIGHT,
            }}
            onClick={handleTimelineClick}
            ref={timelineRef}
          >
            {/* Time markers */}
            {generateTimeMarkers().map((time) => {
              const leftPercent = timeToPercent(time);
              // Only show markers within reasonable bounds
              if (leftPercent < -5 || leftPercent > 105) return null;

              return (
                <div
                  key={time}
                  className="absolute top-0 h-full flex flex-col justify-between"
                  style={{ left: `${leftPercent}%` }}
                >
                  <div className="w-px h-3 bg-border"></div>
                  <div className="text-xs text-muted-foreground -translate-x-1/2 whitespace-nowrap">
                    {formatTime(time)}
                  </div>
                  <div className="w-px h-3 bg-border"></div>
                </div>
              );
            })}
          </div>

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
              <div
                key={track.id}
                className={`border-b border-border relative cursor-pointer ${getTrackColor(track.type)}`}
                style={{ height: TRACK_HEIGHT }}
                onClick={handleTimelineClick}
              >
                {/* Track clips */}
                {track.clips.map((clip) => {
                  const clipLeft = timeToPercent(clip.startTime);
                  const clipRight = timeToPercent(clip.startTime + clip.duration);
                  const clipWidth = clipRight - clipLeft;
                  const isSelected = selectedClipIds.includes(clip.id);

                  // Only render clips that are partially visible
                  if (clipRight < -5 || clipLeft > 105) return null;

                  return (
                    <div
                      key={clip.id}
                      className={`absolute top-1 bottom-1 rounded border-2 cursor-pointer transition-all ${getClipColors(
                        clip.type
                      )} ${isSelected ? "ring-2 ring-primary ring-offset-1" : ""}`}
                      style={{
                        left: `${Math.max(0, clipLeft)}%`,
                        width: `${clipWidth}%`,
                        minWidth: "2px",
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        selectClip?.(clip.id);
                      }}
                    >
                      <div className="p-2 h-full flex items-center">
                        <span className="text-xs font-medium text-foreground truncate">{clip.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
