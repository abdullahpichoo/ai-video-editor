import { useEffect, useRef } from "react";
import { useTimelineStore } from "@/stores/timeline-store";
import { ITimelineClip } from "@/types/timeline.types";

interface MediaSyncHook {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export const useMediaElementSync = (
  clip: ITimelineClip,
  onVideoRef: (clipId: string, video: HTMLVideoElement | null) => void,
  onAudioRef: (clipId: string, audio: HTMLAudioElement | null) => void
): MediaSyncHook => {
  const { currentTime, isPlaying } = useTimelineStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const clipTime = calculateClipTime(currentTime, clip);
    if (clip.type === "video") {
      const video = videoRef.current;
      if (!video) return;

      if (shouldSyncMedia(currentTime, clip, video.currentTime, clipTime, isPlaying)) {
        video.currentTime = clipTime;
      }
    } else if (clip.type === "audio") {
      const audio = audioRef.current;
      if (!audio) return;
      if (shouldSyncMedia(currentTime, clip, audio.currentTime, clipTime, isPlaying)) {
        audio.currentTime = clipTime;
      }
    }
  }, [currentTime, isPlaying, clip]);

  useEffect(() => {
    if (videoRef.current && clip.type === "video") {
      onVideoRef(clip.id, videoRef.current);
    }
    if (audioRef.current && clip.type === "audio") {
      onAudioRef(clip.id, audioRef.current);
    }

    return () => {
      onVideoRef(clip.id, null);
      onAudioRef(clip.id, null);
    };
  }, [clip.id, clip.type, onVideoRef, onAudioRef]);

  return {
    videoRef,
    audioRef,
  };
};

function calculateClipTime(currentTime: number, clip: ITimelineClip): number {
  return currentTime - clip.startTime + clip.trimStart;
}

function shouldSyncMedia(
  currentTime: number,
  clip: ITimelineClip,
  mediaCurrentTime: number,
  clipTime: number,
  isPlaying: boolean
): boolean {
  const isInRange = currentTime >= clip.startTime && currentTime < clip.startTime + clip.duration;
  if (!isInRange) return false;

  const timeDiff = Math.abs(mediaCurrentTime - clipTime);

  return !isPlaying || timeDiff > 0.5;
}
