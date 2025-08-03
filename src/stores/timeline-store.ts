import { create } from "zustand";
import { produce } from "immer";
import { IAsset } from "@/types/asset";
import { ITimeline, ITimelineClip, ITimelineTrack } from "@/types/timeline";

interface ITimelineState {
  timeline: ITimeline;
  currentTime: number;
  isPlaying: boolean;
  selectedClipIds: string[];
}

interface ITimelineActions {
  initializeTimeline: (projectId: string, timeline?: ITimeline) => void;
  addClip: (asset: IAsset) => void;
  addTextClip: (text: string, duration?: number) => void;
  removeClip: (clipId: string) => void;
  removeClipsByAssetId: (assetId: string) => void;
  moveClip?: (clipId: string, newStartTime: number) => void;
  splitClip?: (clipId: string, splitTime: number) => void;
  trimClip?: (clipId: string, newStartTime: number, newEndTime: number) => void;
  deleteClip?: (clipId: string) => void;
  selectClip?: (clipId: string) => void;
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
  setCurrentTime: (time: number) => void;
  play: () => void;
  pause: () => void;
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

const initialTimeline: ITimeline = {
  id: "default-timeline",
  projectId: "",
  duration: 10, // Default duration
  tracks: tracks,
};

export const useTimelineStore = create<ITimelineState & ITimelineActions>((set, get) => ({
  timeline: initialTimeline,
  selectedClipIds: [],
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
      selectedClipIds: [],
    });
  },

  addClip: (asset: IAsset) => {
    set(
      produce((state) => {
        const targetTrackType = asset.type;
        const targetTrack = state.timeline.tracks.find((track: ITimelineTrack) => track.type === targetTrackType);

        if (!targetTrack) {
          console.warn(`No track found for asset type: ${targetTrackType}`);
          return;
        }

        const lastClip = targetTrack.clips[targetTrack.clips.length - 1];
        const newClipStartTime = lastClip ? lastClip.startTime + lastClip.duration : 0;

        const newClip: ITimelineClip = {
          id: `clip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          assetId: asset.assetId,
          trackId: targetTrack.id,
          type: asset.type,
          startTime: newClipStartTime,
          duration: asset.type === "video" ? asset.duration : 2, // Default 2 seconds for non-video clips
          trimStart: 0,
          trimEnd: 0,
          name: asset.originalName,
          // Embed asset properties for performance
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

        // Update timeline duration
        state.timeline.duration = Math.max(state.timeline.duration, newClipStartTime + newClip.duration);

        // Add clip to target track
        targetTrack.clips.push(newClip);

        // Update selected clips
        state.selectedClipIds = [newClip.id];

        console.log(`Added clip ${newClip.name} to ${targetTrack.name}`);
      })
    );
  },

  addTextClip: (text: string, duration: number = 3) => {
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
          trimStart: 0,
          trimEnd: 0,
          name: `Text: ${text.slice(0, 20)}${text.length > 20 ? "..." : ""}`,
          text: text,
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

        // Update timeline duration
        state.timeline.duration = Math.max(state.timeline.duration, newClip.startTime + newClip.duration);

        // Add clip to text track
        textTrack.clips.push(newClip);

        // Update selected clips
        state.selectedClipIds = [newClip.id];

        console.log(`Added text clip: ${text}`);
      })
    );
  },

  removeClip: (clipId: string) => {
    set(
      produce((state) => {
        state.timeline.tracks.forEach((track: ITimelineTrack) => {
          track.clips = track.clips.filter((clip) => clip.id !== clipId);
        });
        state.selectedClipIds = state.selectedClipIds.filter((id: string) => id !== clipId);
      })
    );
  },

  removeClipsByAssetId: (assetId: string) => {
    set(
      produce((state) => {
        state.timeline.tracks.forEach((track: ITimelineTrack) => {
          track.clips = track.clips.filter((clip) => clip.assetId !== assetId);
        });
        // Remove any selected clips that were just deleted
        state.selectedClipIds = state.selectedClipIds.filter((clipId: string) => {
          // Check if this clip still exists
          return state.timeline.tracks.some((track: ITimelineTrack) =>
            track.clips.some((clip: ITimelineClip) => clip.id === clipId)
          );
        });
      })
    );
  },

  selectClip: (clipId: string) => {
    set({ selectedClipIds: [clipId] });
  },

  clearSelection: () => {
    set({ selectedClipIds: [] });
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
}));
