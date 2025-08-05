import { useRef, useCallback, useEffect, useMemo } from "react";
import { useTimelineStore } from "@/stores/timeline-store";
import { ITimelineClip } from "@/types/timeline.types";

interface MediaRefs {
  videoRefs: Map<string, HTMLVideoElement>;
  audioRefs: Map<string, HTMLAudioElement>;
}

interface ActiveClip {
  clip: ITimelineClip;
  zIndex: number;
}

interface MediaPreviewHook {
  activeClips: ActiveClip[];
  setVideoRef: (clipId: string, video: HTMLVideoElement | null) => void;
  setAudioRef: (clipId: string, audio: HTMLAudioElement | null) => void;
}

export const useMediaPreview = (): MediaPreviewHook => {
  const { timeline, currentTime, isPlaying } = useTimelineStore();
  const mediaRefs = useRef<MediaRefs>({
    videoRefs: new Map(),
    audioRefs: new Map(),
  });

  const activeClips = useMemo(() => {
    const clips: ActiveClip[] = [];

    timeline.tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        const clipEndTime = clip.startTime + clip.duration;

        if (currentTime >= clip.startTime && currentTime <= clipEndTime) {
          const baseZIndex = getBaseZIndexForTrackType(track.type);
          const zIndex = baseZIndex + (track.layerIndex || 0);

          clips.push({ clip, zIndex });
        }
      });
    });

    return clips.sort((a, b) => a.zIndex - b.zIndex);
  }, [timeline, currentTime]);

  const setVideoRef = useCallback((clipId: string, video: HTMLVideoElement | null) => {
    if (video) {
      mediaRefs.current.videoRefs.set(clipId, video);
    } else {
      mediaRefs.current.videoRefs.delete(clipId);
    }
  }, []);

  const setAudioRef = useCallback((clipId: string, audio: HTMLAudioElement | null) => {
    if (audio) {
      mediaRefs.current.audioRefs.set(clipId, audio);
    } else {
      mediaRefs.current.audioRefs.delete(clipId);
    }
  }, []);

  useEffect(() => {
    mediaRefs.current.videoRefs.forEach((video, clipId) => {
      const clip = findClipById(timeline, clipId);
      if (!clip) return;

      const isActive = isClipActiveAtTime(clip, currentTime);
      handleMediaPlayback(video, isActive, isPlaying);
    });

    mediaRefs.current.audioRefs.forEach((audio, clipId) => {
      const clip = findClipById(timeline, clipId);
      if (!clip) return;

      const isActive = isClipActiveAtTime(clip, currentTime);
      handleMediaPlayback(audio, isActive, isPlaying);
    });
  }, [isPlaying, currentTime, timeline]);

  return {
    activeClips,
    setVideoRef,
    setAudioRef,
  };
};

function getBaseZIndexForTrackType(trackType: string): number {
  switch (trackType) {
    case "video":
      return 10;
    case "image":
      return 20;
    case "text":
      return 30;
    case "audio":
      return 0;
    default:
      return 1;
  }
}

function findClipById(
  timeline: { tracks: Array<{ clips: ITimelineClip[] }> },
  clipId: string
): ITimelineClip | undefined {
  return timeline.tracks.flatMap((track) => track.clips).find((clip: ITimelineClip) => clip.id === clipId);
}

function isClipActiveAtTime(clip: ITimelineClip, currentTime: number): boolean {
  return currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
}

function handleMediaPlayback(media: HTMLVideoElement | HTMLAudioElement, isActive: boolean, shouldPlay: boolean): void {
  if (shouldPlay && isActive) {
    if (media.paused) {
      media.play().catch(console.error);
    }
  } else {
    if (!media.paused) {
      media.pause();
    }
  }
}
