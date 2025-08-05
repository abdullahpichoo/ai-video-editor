import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTimelineStore } from "@/stores/timeline-store";
import { TimelineService } from "@/services/timeline.service";
import { ITimeline } from "@/types/timeline.types";
import { toast } from "sonner";
import { queryClient } from "@/components/providers/Providers";

export const useTimeline = (projectId: string) => {
  const { initializeTimeline } = useTimelineStore();

  const {
    data: timelineData,
    isLoading,
    error,
    refetch: fetchTimeline,
  } = useQuery({
    queryKey: ["timeline", projectId],
    queryFn: async () => {
      const timeline = await TimelineService.fetchTimeline(projectId);
      if (!timeline) {
        initializeTimeline(projectId);
        return null;
      }
      initializeTimeline(projectId, timeline);
      return timeline;
    },
    staleTime: 0,
    retry: false,
  });

  const updateTimelineMutation = useMutation({
    mutationFn: async (timeline: ITimeline) => {
      return await TimelineService.updateTimeline(projectId, timeline);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timeline", projectId] });
      toast.success("Timeline saved successfully");
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Failed to save timeline";
      toast.error(errorMessage);
    },
  });

  const autoSaveTimelineMutation = useMutation({
    mutationFn: async (timeline: ITimeline) => {
      return await TimelineService.autoSaveTimeline(projectId, timeline);
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : "Auto-save failed";
      toast.error(errorMessage);
    },
  });

  const saveTimeline = (timeline: ITimeline) => {
    updateTimelineMutation.mutate(timeline);
  };

  const autoSaveTimeline = (timeline: ITimeline) => {
    autoSaveTimelineMutation.mutate(timeline);
  };

  useEffect(() => {
    if (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to load timeline";
      toast.error(errorMessage);
    }
  }, [error]);

  return {
    timeline: timelineData,
    isLoading,
    error,
    fetchTimeline,
    saveTimeline,
    autoSaveTimeline,
    isUpdating: updateTimelineMutation.isPending,
    isAutoSaving: autoSaveTimelineMutation.isPending,
  };
};
