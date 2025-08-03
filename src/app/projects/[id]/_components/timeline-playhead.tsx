"use client";

import React from "react";

interface TimelinePlayheadProps {
  currentTime: number;
  timeToPercent: (time: number) => number;
  rulerHeight: number;
  trackHeight: number;
  trackCount: number;
  onMouseDown: (e: React.MouseEvent) => void;
}

export const TimelinePlayhead = React.memo(
  ({
    currentTime,
    timeToPercent,
    rulerHeight,
    trackHeight,
    trackCount,
    onMouseDown,
  }: TimelinePlayheadProps) => {
    const playheadPercent = timeToPercent(currentTime);

    // Don't render if off-screen (generous bounds for better visibility)
    if (playheadPercent < -5 || playheadPercent > 110) return null;

    const totalHeight = rulerHeight + trackCount * trackHeight;

    return (
      <div
        className="absolute top-0 w-px bg-red-500 z-20 cursor-ew-resize pointer-events-auto"
        style={{
          left: `${playheadPercent}%`,
          height: `${totalHeight}px`,
        }}
        onMouseDown={onMouseDown}
      >
        <div className="absolute -top-1 -left-2 w-4 h-3 bg-red-500 cursor-ew-resize" />
        <div
          className="absolute -left-2 w-4 h-3 bg-red-500 cursor-ew-resize"
          style={{ bottom: "0px" }}
        />
      </div>
    );
  }
);
TimelinePlayhead.displayName = "TimelinePlayhead";
