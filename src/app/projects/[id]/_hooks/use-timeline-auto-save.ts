import { useEffect, useRef } from "react";
import { useTimelineStore } from "@/stores/timeline-store";
import { ITimeline } from "@/types/timeline.types";

export const useTimelineAutoSave = (
  projectId: string,
  enabled: boolean = true,
  autoSaveFunction: (timeline: ITimeline) => void
) => {
  const { timeline } = useTimelineStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTimelineRef = useRef<string>("");
  const enabledRef = useRef(enabled);
  const autoSaveFunctionRef = useRef(autoSaveFunction);
  const timelineRef = useRef(timeline);

  // Update refs when values change
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    autoSaveFunctionRef.current = autoSaveFunction;
  }, [autoSaveFunction]);

  useEffect(() => {
    timelineRef.current = timeline;
  }, [timeline]);

  // Set up auto-save interval
  useEffect(() => {
    if (!enabled || !timeline || timeline.tracks.length === 0) {
      // Clear interval if conditions aren't met
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Only create interval if one doesn't exist
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        const currentTimeline = timelineRef.current;
        if (!enabledRef.current || !currentTimeline) return;

        const currentTimelineStr = JSON.stringify(currentTimeline);
        if (currentTimelineStr !== lastSavedTimelineRef.current) {
          autoSaveFunctionRef.current(currentTimeline);
          lastSavedTimelineRef.current = currentTimelineStr;
        }
      }, 30000);
    }

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, timeline?.tracks?.length]); // Only depend on enabled and tracks length

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      const currentTimeline = timelineRef.current;
      if (currentTimeline && enabledRef.current) {
        const currentTimelineStr = JSON.stringify(currentTimeline);
        if (currentTimelineStr !== lastSavedTimelineRef.current) {
          autoSaveFunctionRef.current(currentTimeline);
        }
      }
    };
  }, []); // Empty deps - only runs on unmount
};
