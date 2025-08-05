import { create } from "zustand";
import { produce } from "immer";
import { IAsset } from "@/types/asset.types";
import { ITimeline, ITimelineClip, ITimelineTrack, ISubtitleStyle } from "@/types/timeline.types";
import { ISubtitleSegment } from "@/types/ai-job.types";

interface ITimelineState {
  timeline: ITimeline;
  currentTime: number;
  isPlaying: boolean;
  selectedClip: ITimelineClip | null;
}

interface ITimelineActions {
  initializeTimeline: (projectId: string, timeline?: ITimeline) => void;
  addClip: (asset: IAsset) => void;
  addTextClip: (text: string, style?: ISubtitleStyle, duration?: number) => void;
  removeClip: (clipId: string) => void;
  removeClipsByAssetId: (assetId: string) => void;
  moveClip: (clipId: string, newStartTime: number) => void;
  splitClip: (clipId: string, splitTime: number) => void;
  trimClip: (clipId: string, newStartTime: number, newEndTime: number) => void;
  trimSelectedClip: (newStartTime: number, newEndTime: number) => void;
  deleteClip: (clipId: string) => void;
  selectClip: (clipId: string) => void;
  clearSelection: () => void;
  updateClipTransform: (
    clipId: string,
    transform: Partial<{
      x: number;
      y: number;
      width: number;
      height: number;
      scaleX: number;
      scaleY: number;
      rotation: number;
    }>
  ) => void;
  updateClipProperties: (
    clipId: string,
    properties: Partial<{
      text: string;
      style: ISubtitleStyle;
    }>
  ) => void;
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;

  // Subtitle-related methods
  addSubtitleClips: (assetId: string, subtitles: ISubtitleSegment[]) => void;
  findAssetClips: (assetId: string) => ITimelineClip[];
  calculateTimelinePosition: (assetId: string, assetTime: number) => number | null;
  ensureSubtitleTrack: () => string;
}

const tracks: ITimelineTrack[] = [
  {
    id: "text-track-1",
    type: "text",
    name: "Text Track 1",
    clips: [],
    layerIndex: 0,
    isVisible: true,
    isMuted: false,
    volume: 1,
    locked: false,
  },
  {
    id: "image-track-1",
    type: "image",
    name: "Image Track 1",
    clips: [],
    layerIndex: 1,
    isVisible: true,
    isMuted: false,
    volume: 1,
    locked: false,
  },
  {
    id: "video-track-1",
    type: "video",
    name: "Video Track 1",
    clips: [],
    layerIndex: 2,
    isVisible: true,
    isMuted: false,
    volume: 1,
    locked: false,
  },
  {
    id: "audio-track-1",
    type: "audio",
    name: "Audio Track 1",
    clips: [],
    layerIndex: 3,
    isVisible: true,
    isMuted: false,
    volume: 1,
    locked: false,
  },
];

const defaultTextStyle: ISubtitleStyle = {
  fontSize: 18,
  fontFamily: "Arial",
  color: "#000000",
  backgroundColor: "#ffffff",
  position: "center",
  alignment: "center",
  outline: false,
  shadow: false,
};

const initialTimeline: ITimeline = {
  id: "default-timeline",
  projectId: "",
  duration: 10, // Default duration
  tracks: tracks,
};

export const useTimelineStore = create<ITimelineState & ITimelineActions>((set, get) => ({
  timeline: initialTimeline,
  selectedClip: null,
  currentTime: 0,
  isPlaying: false,

  initializeTimeline: (projectId: string, timeline: ITimeline = initialTimeline) => {
    set({
      timeline: {
        ...timeline,
        projectId,
      },
      currentTime: 0,
      isPlaying: false,
      selectedClip: null,
    });
  },

  addClip: (asset: IAsset) => {
    set(
      produce((state: ITimelineState) => {
        const targetTrackType = asset.type;
        const targetTrack = state.timeline.tracks.find((track: ITimelineTrack) => track.type === targetTrackType);

        if (!targetTrack) {
          console.warn(`No track found for asset type: ${targetTrackType}`);
          return;
        }

        const nonMultimediaAssetDuration = 2;
        const intendedDuration = ["audio", "video"].includes(asset.type) ? asset.duration : nonMultimediaAssetDuration;

        const lastClip = targetTrack.clips[targetTrack.clips.length - 1];
        const newClipStartTime = lastClip ? lastClip.trimEnd : 0;
        const newClipEndTime = newClipStartTime + intendedDuration;

        // Extend timeline duration if needed
        if (newClipEndTime > state.timeline.duration) {
          state.timeline.duration = newClipEndTime;
        }

        const newClip: ITimelineClip = {
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          assetId: asset.assetId,
          trackId: targetTrack.id,
          type: asset.type,
          startTime: newClipStartTime,
          duration: intendedDuration,
          originalStartTime: newClipStartTime,
          originalEndTime: newClipEndTime,
          trimStart: newClipStartTime,
          trimEnd: newClipEndTime,
          name: asset.originalName,
          assetPath: asset.storagePath,
          assetName: asset.originalName,
          assetDimensions: asset.dimensions,
          transform: {
            // Center the asset on the canvas with reasonable size
            x:
              asset.dimensions?.width && asset.dimensions.width < 640
                ? (640 - asset.dimensions.width) / 2 // Center small assets
                : 50, // Default position for large assets
            y:
              asset.dimensions?.height && asset.dimensions.height < 360
                ? (360 - asset.dimensions.height) / 2 // Center small assets
                : 50, // Default position for large assets
            width:
              asset.dimensions?.width && asset.dimensions.width <= 640
                ? asset.dimensions.width // Use actual size if it fits
                : Math.min(asset.dimensions?.width || 300, 300), // Scale down large assets
            height:
              asset.dimensions?.height && asset.dimensions.height <= 360
                ? asset.dimensions.height // Use actual size if it fits
                : Math.min(asset.dimensions?.height || 200, 200), // Scale down large assets
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
          volume: 1,
          locked: false,
          selected: false,
        };

        targetTrack.clips.push(newClip);

        state.selectedClip = newClip;
      })
    );
  },

  addTextClip: (text: string, style?: ISubtitleStyle, duration: number = 3) => {
    set(
      produce((state) => {
        const textTrack = state.timeline.tracks.find((track: ITimelineTrack) => track.type === "text");
        if (!textTrack) {
          console.warn("No text track found");
          return;
        }

        const newClip: ITimelineClip = {
          id: `text-clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          trackId: textTrack.id,
          type: "text",
          startTime: state.currentTime,
          duration: duration,
          originalStartTime: state.currentTime,
          originalEndTime: state.currentTime + duration,
          trimStart: state.currentTime,
          trimEnd: state.currentTime + duration,
          name: `Text: ${text.slice(0, 20)}${text.length > 20 ? "..." : ""}`,
          text: text,
          style: style || defaultTextStyle,
          transform: {
            x: 320, // Center of 640px canvas
            y: 280, // Near bottom of 360px canvas
            width: 200,
            height: 50,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
          },
          volume: 1,
          locked: false,
          selected: false,
        };

        state.timeline.duration = Math.max(state.timeline.duration, newClip.startTime + newClip.duration);

        textTrack.clips.push(newClip);

        state.selectedClip = newClip;
      })
    );
  },

  removeClip: (clipId: string) => {
    set(
      produce((state) => {
        state.timeline.tracks.forEach((track: ITimelineTrack) => {
          track.clips = track.clips.filter((clip) => clip.id !== clipId);
        });
        if (state.selectedClip?.id === clipId) {
          state.selectedClip = null;
        }
      })
    );
  },

  removeClipsByAssetId: (assetId: string) => {
    set(
      produce((state) => {
        const removedClipIds: string[] = [];
        state.timeline.tracks.forEach((track: ITimelineTrack) => {
          const clipsToRemove = track.clips.filter((clip) => clip.assetId === assetId);
          removedClipIds.push(...clipsToRemove.map((c) => c.id));
          track.clips = track.clips.filter((clip) => clip.assetId !== assetId);
        });
        if (state.selectedClip && removedClipIds.includes(state.selectedClip.id)) {
          state.selectedClip = null;
        }
      })
    );
  },

  selectClip: (clipId: string) => {
    set(
      produce((state) => {
        // Find the clip across all tracks
        for (const track of state.timeline.tracks) {
          const clip = track.clips.find((c: ITimelineClip) => c.id === clipId);
          if (clip) {
            state.selectedClip = clip;
            return;
          }
        }
        state.selectedClip = null;
      })
    );
  },

  clearSelection: () => {
    set({ selectedClip: null });
  },

  updateClipTransform: (
    clipId: string,
    transform: Partial<{
      x: number;
      y: number;
      width: number;
      height: number;
      scaleX: number;
      scaleY: number;
      rotation: number;
    }>
  ) => {
    set(
      produce((state) => {
        for (const track of state.timeline.tracks) {
          const clip = track.clips.find((c: ITimelineClip) => c.id === clipId);
          if (clip) {
            if (clip.transform) {
              Object.assign(clip.transform, transform);
            } else {
              clip.transform = {
                x: transform.x || 0,
                y: transform.y || 0,
                width: transform.width || 100,
                height: transform.height || 100,
                rotation: transform.rotation || 0,
                scaleX: transform.scaleX || 1,
                scaleY: transform.scaleY || 1,
              };
            }
            break;
          }
        }
      })
    );
  },

  setCurrentTime: (time: number) => {
    set({
      currentTime: Math.max(0, Math.min(time, get().timeline.duration)),
    });
  },

  play: () => {
    set({ isPlaying: true });
  },

  pause: () => {
    set({ isPlaying: false });
  },

  updateClipProperties: (
    clipId: string,
    properties: Partial<{
      text: string;
      style: ISubtitleStyle;
    }>
  ) => {
    set(
      produce((state) => {
        for (const track of state.timeline.tracks) {
          const clip = track.clips.find((c: ITimelineClip) => c.id === clipId);
          if (clip) {
            if (properties.text !== undefined) {
              clip.text = properties.text;
            }
            if (properties.style !== undefined) {
              clip.style = properties.style;
            }

            if (state.selectedClip?.id === clipId) {
              state.selectedClip = { ...clip };
            }
            break;
          }
        }
      })
    );
  },

  moveClip: (clipId: string, newStartTime: number) => {
    set(
      produce((state) => {
        for (const track of state.timeline.tracks) {
          const clip = track.clips.find((c: ITimelineClip) => c.id === clipId);
          if (clip) {
            const sanitizedNewStartTime = Math.max(0, newStartTime);
            const newEndTime = sanitizedNewStartTime + clip.duration;

            clip.startTime = sanitizedNewStartTime;
            clip.trimStart = sanitizedNewStartTime;
            clip.trimEnd = sanitizedNewStartTime + clip.duration;

            if (state.selectedClip?.id === clipId) {
              state.selectedClip = clip;
            }

            // Extend timeline duration if needed
            if (newEndTime > state.timeline.duration) {
              state.timeline.duration = newEndTime;
            }

            break;
          }
        }
      })
    );
  },

  splitClip: (clipId: string, splitTime: number) => {
    set(
      produce((state) => {
        for (const track of state.timeline.tracks) {
          const clipIndex = track.clips.findIndex((c: ITimelineClip) => c.id === clipId);
          if (clipIndex !== -1) {
            const originalClip = track.clips[clipIndex];
            const splitPoint = splitTime - originalClip.startTime;

            // Only split if split point is within the clip
            if (splitPoint > 0 && splitPoint < originalClip.duration) {
              // Create the second half of the clip
              const newClip: ITimelineClip = {
                ...originalClip,
                id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                startTime: splitTime,
                duration: originalClip.duration - splitPoint,
                // For the second half: trim start increases by the split point
                trimStart: originalClip.trimStart + splitPoint,
                // trimEnd remains the same as it represents end trim from original media
                trimEnd: originalClip.trimEnd,
                // Original bounds shift by the amount we're trimming from the start
                originalStartTime: originalClip.originalStartTime + splitPoint,
                originalEndTime: originalClip.originalEndTime,
              };

              // Update the first half
              originalClip.duration = splitPoint;
              // For the first half: trimEnd needs to be updated to reflect the new end point
              // trimEnd represents how much is trimmed from the end of the original media
              const originalMediaDuration = originalClip.originalEndTime - originalClip.originalStartTime;
              const newEndPointInOriginalMedia = originalClip.trimStart + splitPoint;
              originalClip.trimEnd = originalMediaDuration - newEndPointInOriginalMedia;
              // originalStartTime and trimStart remain unchanged for the first half

              // Insert the new clip after the original
              track.clips.splice(clipIndex + 1, 0, newClip);
            }
            break;
          }
        }
      })
    );
  },

  trimSelectedClip: (newStartTime: number, newEndTime: number) => {
    const selectedClip = get().selectedClip;
    if (!selectedClip) return;
    get().trimClip(selectedClip.id, newStartTime, newEndTime);
  },

  trimClip: (clipId: string, newStartTime: number, newEndTime: number) => {
    set(
      produce((state) => {
        for (const track of state.timeline.tracks) {
          const clip = track.clips.find((c: ITimelineClip) => c.id === clipId);
          if (clip) {
            // Constrain to original bounds for non-destructive trimming
            const constrainedStartTime = Math.max(clip.originalStartTime, newStartTime);
            const constrainedEndTime = Math.min(clip.originalEndTime, newEndTime);

            const minimumDuration = 0.1;
            const newDuration = constrainedEndTime - constrainedStartTime;
            const isValidDuration = newDuration >= minimumDuration;

            if (isValidDuration) {
              clip.startTime = constrainedStartTime;
              clip.duration = constrainedEndTime - constrainedStartTime;

              clip.trimStart = constrainedStartTime - clip.originalStartTime;
              clip.trimEnd = constrainedEndTime;

              // Update selected clip reference if it's the one being trimmed
              if (state.selectedClip?.id === clipId) {
                state.selectedClip = clip;
              }
            }

            break;
          }
        }
      })
    );
  },

  deleteClip: (clipId: string) => {
    get().removeClip(clipId);
  },

  addSubtitleClips: (assetId: string, subtitles: ISubtitleSegment[]) => {
    set(
      produce((state: ITimelineState) => {
        const assetClips = get().findAssetClips(assetId);

        if (assetClips.length === 0) {
          console.warn(`No clips found for asset ${assetId}`);
          return;
        }

        // For now, use the first clip if multiple exist
        // TODO: Add UI for clip selection when multiple clips exist

        // Ensure subtitle track exists
        const subtitleTrackId = get().ensureSubtitleTrack();
        const subtitleTrack = state.timeline.tracks.find((track) => track.type === "text");

        if (!subtitleTrack) {
          console.error("Failed to create subtitle track");
          return;
        }

        // Convert subtitle segments to timeline clips
        subtitles.forEach((subtitle, index) => {
          const timelinePosition = get().calculateTimelinePosition(assetId, subtitle.startTime);

          if (timelinePosition === null) {
            console.warn(`Could not calculate timeline position for subtitle ${index}`);
            return;
          }

          const subtitleClip: ITimelineClip = {
            id: `subtitle-${assetId}-${index}-${Date.now()}`,
            trackId: subtitleTrackId,
            type: "text",
            startTime: timelinePosition,
            duration: subtitle.endTime - subtitle.startTime,
            originalStartTime: timelinePosition,
            originalEndTime: timelinePosition + (subtitle.endTime - subtitle.startTime),
            trimStart: 0,
            trimEnd: 0,
            text: subtitle.text,
            name: `Subtitle ${index + 1}`,
            volume: 1,
            locked: false,
            selected: false,
            style: defaultTextStyle,
          };

          subtitleTrack.clips.push(subtitleClip);
        });

        // Sort clips by start time
        subtitleTrack.clips.sort((a, b) => a.startTime - b.startTime);
      })
    );
  },

  findAssetClips: (assetId: string) => {
    const state = get();
    const clips: ITimelineClip[] = [];

    state.timeline.tracks.forEach((track) => {
      track.clips.forEach((clip) => {
        if (clip.assetId === assetId) {
          clips.push(clip);
        }
      });
    });

    return clips.sort((a, b) => a.startTime - b.startTime);
  },

  calculateTimelinePosition: (assetId: string, assetTime: number) => {
    const assetClips = get().findAssetClips(assetId);

    if (assetClips.length === 0) {
      return null;
    }

    // For now, use the first clip if multiple exist
    const targetClip = assetClips[0];

    // Calculate position relative to the clip's start time
    // Account for trim start when calculating relative position
    // TODO: use the targetClip's actual startTime
    const relativePosition = Math.max(assetTime - targetClip.trimStart, 0);

    // // Ensure the subtitle is within the clip's bounds
    // if (relativePosition < 0 || relativePosition > targetClip.duration) {
    //   return null;
    // }

    return targetClip.startTime + relativePosition;
  },

  ensureSubtitleTrack: () => {
    const state = get();

    // Check if subtitle track already exists
    const existingSubtitleTrack = state.timeline.tracks.find(
      (track) => track.type === "text" && track.name === "Subtitles"
    );

    if (existingSubtitleTrack) {
      return existingSubtitleTrack.id;
    }

    // Create new subtitle track
    const subtitleTrackId = `track-subtitles-${Date.now()}`;

    set(
      produce((state: ITimelineState) => {
        const newTrack: ITimelineTrack = {
          id: subtitleTrackId,
          name: "Subtitles",
          type: "text",
          clips: [],
          layerIndex: state.timeline.tracks.length, // Add at the end
          isVisible: true,
          isMuted: false,
          volume: 1,
          locked: false,
        };

        state.timeline.tracks.push(newTrack);
      })
    );

    return subtitleTrackId;
  },
}));
