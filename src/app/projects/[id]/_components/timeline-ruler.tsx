"use client";

import { formatTime } from "../_utils/timeline";

interface TimelineRulerProps {
  currentTime: number;
  timeToPercent: (time: number) => number;
  generateTimeMarkers: () => number[];
  onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  rulerHeight: number;
  timelineRef: React.RefObject<HTMLDivElement | null>;
}

export const TimelineRuler = ({
  timeToPercent,
  generateTimeMarkers,
  onTimelineClick,
  rulerHeight,
  timelineRef,
}: TimelineRulerProps) => {
  return (
    <div
      className="bg-card border-b border-border relative cursor-pointer"
      style={{ height: rulerHeight }}
      onClick={onTimelineClick}
      ref={timelineRef}
    >
      {/* Time markers */}
      {generateTimeMarkers().map((time) => {
        const leftPercent = timeToPercent(time);

        const VISIBILITY_MARGIN = 5;
        const MIN_VISIBLE_PERCENT = -VISIBILITY_MARGIN;
        const MAX_VISIBLE_PERCENT = 100 + VISIBILITY_MARGIN;

        if (leftPercent < MIN_VISIBLE_PERCENT || leftPercent > MAX_VISIBLE_PERCENT) return null;

        return (
          <div
            key={time}
            className="absolute top-0 h-full flex flex-col justify-between"
            style={{ left: `${leftPercent}%` }}
          >
            <div className="w-px h-3 bg-border"></div>
            <div className="text-xs text-muted-foreground -translate-x-1/2 whitespace-nowrap">{formatTime(time)}</div>
            <div className="w-px h-3 bg-border"></div>
          </div>
        );
      })}
    </div>
  );
};
