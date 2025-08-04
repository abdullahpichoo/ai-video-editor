"use client";

import { Button } from "@/components/ui/button";
import { Play, Pause, SkipBack, SkipForward, Volume2, Scissors, ChevronLeft, ChevronRight } from "lucide-react";
import { formatTime } from "../_utils/timeline";

interface TimelineControlsProps {
  currentTime: number;
  totalDuration: number;
  isPlaying: boolean;
  zoom: number;
  selectedClipIds: string[];
  onPlay: () => void;
  onPause: () => void;
  onSeekToStart: () => void;
  onSeekToEnd: () => void;
  onSplitAtPlayhead: () => void;
  onTrimStartToPlayhead: () => void;
  onTrimEndToPlayhead: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export const TimelineControls = ({
  currentTime,
  totalDuration,
  isPlaying,
  zoom,
  selectedClipIds,
  onPlay,
  onPause,
  onSeekToStart,
  onSeekToEnd,
  onSplitAtPlayhead,
  onTrimStartToPlayhead,
  onTrimEndToPlayhead,
  onZoomIn,
  onZoomOut,
}: TimelineControlsProps) => {
  return (
    <div className="h-[12%] bg-card border-b border-border flex items-center justify-center px-4 gap-4">
      <Button variant="outline" size="sm" onClick={onSeekToStart}>
        <SkipBack />
      </Button>

      <Button variant="default" size="sm" onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </Button>

      <Button variant="outline" size="sm" onClick={onSeekToEnd} className="w-8 h-8 p-0">
        <SkipForward className="w-4 h-4" />
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onSplitAtPlayhead}
        disabled={selectedClipIds.length === 0}
        className="w-8 h-8 p-0"
        title="Split selected clips at playhead"
      >
        <Scissors className="w-4 h-4" />
      </Button>

      {/* Trim buttons - only show when clips are selected */}
      {selectedClipIds.length > 0 && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onTrimStartToPlayhead}
            className="w-8 h-8 p-0"
            title="Trim start to playhead"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onTrimEndToPlayhead}
            className="w-8 h-8 p-0"
            title="Trim end to playhead"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </>
      )}

      <div className="text-sm font-mono text-muted-foreground mx-4">
        {formatTime(currentTime)} / {formatTime(totalDuration)}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onZoomOut} className="w-8 h-8 p-0 text-xs">
          -
        </Button>
        <span className="text-xs text-muted-foreground min-w-12 text-center">{Math.round(zoom * 100)}%</span>
        <Button variant="outline" size="sm" onClick={onZoomIn} className="w-8 h-8 p-0 text-xs">
          +
        </Button>
        <Button variant="outline" size="sm" className="w-8 h-8 p-0">
          <Volume2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
