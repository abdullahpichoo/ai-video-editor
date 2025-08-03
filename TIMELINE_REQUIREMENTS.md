# Timeline System Requirements & Architecture

## Overview

The timeline is the core component of the video editor that manages multiple tracks (video, audio, image, subtitle), handles playback synchronization, and provides editing capabilities like trimming, splitting, and transformations.

## Core Timeline Requirements

### 1. Timeline Store Responsibilities

#### **SHOULD DO:**

- Manage timeline state: tracks, clips, currentTime, playbackState, zoom level
- Handle clip CRUD operations: add, update, delete, move, trim
- Manage playback state: play/pause/stop, playback speed, loop
- Track selection state: selected clips, multi-selection
- Handle undo/redo operations for all timeline actions
- Manage timeline settings: duration, fps, resolution
- Sync with video player current time
- Handle real-time collaboration state (future)

#### **SHOULD NOT DO:**

- Direct asset management (handled by assets store)
- File upload/download operations
- API calls (delegated to services)
- Video/audio processing (handled by FFmpeg)
- UI rendering logic (handled by components)

### 2. Assets Store Communication

#### **Assets Store → Timeline Store:**

```typescript
// When asset is selected for timeline
timelineStore.addClipFromAsset(asset, trackType, position);

// When asset is deleted
timelineStore.removeClipsWithAsset(assetId);

// When asset metadata changes
timelineStore.updateClipsWithAsset(assetId, metadata);
```

#### **Timeline Store → Assets Store:**

```typescript
// Get asset metadata for timeline clip
assetsStore.getAsset(assetId);

// Check if asset exists before adding to timeline
assetsStore.hasAsset(assetId);
```

## Track System Architecture

### 3. Four-Layer Track System

```typescript
interface Track {
  id: string;
  type: "video" | "audio" | "image" | "subtitle";
  name: string;
  layerIndex: number; // 0=bottom, higher=top
  isVisible: boolean;
  isMuted: boolean;
  volume: number; // 0-1
  clips: TimelineClip[];
  locked: boolean;
}

// Layer order (top to bottom in UI, reverse in rendering):
// Layer 3: Subtitle Track (rendered on top)
// Layer 2: Image Track (overlays on video)
// Layer 1: Video Track (main video content)
// Layer 0: Audio Track (mixed together)
```

#### **Track Behavior:**

- **Video Tracks**: One primary track, multiple secondary for picture-in-picture
- **Audio Tracks**: Multiple tracks, mixed together during playback
- **Image Tracks**: Overlay on video with positioning/scaling
- **Subtitle Tracks**: Text overlays with timing and styling

### 4. Clip System

```typescript
interface TimelineClip {
  id: string;
  assetId: string;
  trackId: string;

  // Timeline positioning
  startTime: number; // Timeline position (seconds)
  duration: number; // Clip duration (seconds)

  // Source trimming
  trimStart: number; // Trim from source start (seconds)
  trimEnd: number; // Trim from source end (seconds)

  // Transformations (for video/image clips)
  transform: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
  };

  // Audio properties
  volume: number;
  fadeIn: number;
  fadeOut: number;

  // Subtitle properties (subtitle clips only)
  text?: string;
  style?: SubtitleStyle;

  // Metadata
  name: string;
  color?: string;
  locked: boolean;
  selected: boolean;
}

interface SubtitleStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  position: "top" | "center" | "bottom";
  alignment: "left" | "center" | "right";
  outline: boolean;
  shadow: boolean;
}
```

## Timeline State Management

### 5. Timeline Store Structure

```typescript
interface TimelineState {
  // Project data
  projectId: string;
  timeline: {
    duration: number;
    fps: number;
    resolution: { width: number; height: number };
    tracks: Track[];
  };

  // Playback state
  playback: {
    currentTime: number;
    isPlaying: boolean;
    playbackSpeed: number;
    loop: boolean;
    previewRange?: { start: number; end: number };
  };

  // UI state
  ui: {
    zoom: number;
    scrollPosition: number;
    selectedClipIds: string[];
    selectedTrackId?: string;
    isDragging: boolean;
    dragData?: DragData;
  };

  // History
  history: {
    past: TimelineSnapshot[];
    present: TimelineSnapshot;
    future: TimelineSnapshot[];
  };
}

interface TimelineSnapshot {
  tracks: Track[];
  timeline: Timeline;
  timestamp: number;
}
```

### 6. Timeline Store Actions

```typescript
interface TimelineActions {
  // Project management
  loadTimeline: (projectId: string) => Promise<void>;
  saveTimeline: () => Promise<void>;

  // Track management
  addTrack: (type: TrackType) => void;
  removeTrack: (trackId: string) => void;
  reorderTracks: (trackIds: string[]) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;

  // Clip management
  addClip: (clip: Omit<TimelineClip, "id">) => void;
  updateClip: (clipId: string, updates: Partial<TimelineClip>) => void;
  removeClip: (clipId: string) => void;
  moveClip: (clipId: string, trackId: string, startTime: number) => void;
  trimClip: (clipId: string, trimStart: number, trimEnd: number) => void;
  splitClip: (clipId: string, splitTime: number) => void;

  // Selection
  selectClip: (clipId: string, multi?: boolean) => void;
  selectClips: (clipIds: string[]) => void;
  clearSelection: () => void;

  // Playback
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  setPlaybackSpeed: (speed: number) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushSnapshot: () => void;

  // UI
  setZoom: (zoom: number) => void;
  setScrollPosition: (position: number) => void;
}
```

## Transformation & Properties System

### 7. Asset Transformation State

#### **Where Transform State Lives:**

- **Timeline Store**: Transform properties per clip instance
- **Properties Panel**: UI for editing current selected clip transforms
- **Asset Store**: Original asset dimensions/metadata (read-only)

#### **Transform State Flow:**

```typescript
// User selects clip → Properties panel shows current transform
const selectedClip = timelineStore.getSelectedClip();
const currentTransform = selectedClip.transform;

// User modifies transform → Update timeline store
timelineStore.updateClip(clipId, {
  transform: { ...currentTransform, x: newX, y: newY },
});

// Timeline store → Trigger preview update
videoRenderer.updateClipTransform(clipId, newTransform);
```

#### **Transform Editing:**

- **Video/Image Clips**: Position, scale, rotation, opacity
- **Subtitle Clips**: Position, font styling, background
- **Audio Clips**: Volume, fade in/out (no visual transform)

## Subtitle System

### 8. Subtitle Track Management

#### **Subtitle Clip Structure:**

```typescript
interface SubtitleClip extends TimelineClip {
  type: "subtitle";
  text: string;
  style: SubtitleStyle;
  // No asset reference - generated inline
  assetId: null;
}
```

#### **Subtitle Editing Workflow:**

1. **Add Subtitle**: User clicks "Add Text" → Creates subtitle clip at current time
2. **Edit Text**: Double-click clip → Opens text editor modal
3. **Style Text**: Properties panel shows font/color/position controls
4. **Position**: Drag clip on timeline to change timing
5. **Duration**: Resize clip handles to adjust display duration

#### **Subtitle Rendering:**

```typescript
// During playback, check active subtitle clips
const activeSubtitles = getActiveClipsAtTime(currentTime, "subtitle");
activeSubtitles.forEach((clip) => {
  renderSubtitle(clip.text, clip.style, clip.transform);
});
```

## Clip Duration & Trimming System

### 9. Trimming Operations

#### **Trim Types:**

1. **Source Trim**: Adjust `trimStart`/`trimEnd` (doesn't move clip position)
2. **Timeline Trim**: Adjust `startTime`/`duration` (moves clip boundaries)
3. **Ripple Trim**: Trim and move subsequent clips

#### **Trim Constraints:**

```typescript
// Source trim constraints
const maxTrimStart = asset.duration - 0.1; // Minimum 0.1s clip
const maxTrimEnd = asset.duration - trimStart - 0.1;

// Timeline trim constraints
const minStartTime = 0;
const maxDuration = timeline.duration - startTime;
```

#### **Trim Validation:**

```typescript
function validateTrim(
  clip: TimelineClip,
  newTrimStart: number,
  newTrimEnd: number
) {
  const asset = assetsStore.getAsset(clip.assetId);
  const sourceDuration = asset.duration;
  const availableDuration = sourceDuration - newTrimStart - newTrimEnd;

  return {
    isValid: availableDuration > 0.1 && newTrimStart >= 0 && newTrimEnd >= 0,
    availableDuration,
    reason: availableDuration <= 0.1 ? "Clip too short" : null,
  };
}
```

### 10. Clipping/Splitting Operations

#### **Split Clip:**

```typescript
function splitClip(clipId: string, splitTime: number) {
  const clip = getClip(clipId);
  const relativeTime = splitTime - clip.startTime; // Time within clip
  const sourceSplitTime = clip.trimStart + relativeTime;

  // Create two clips
  const firstClip = {
    ...clip,
    id: generateId(),
    duration: relativeTime,
    // trimEnd increases to cut at split point
    trimEnd: clip.trimEnd + (clip.duration - relativeTime),
  };

  const secondClip = {
    ...clip,
    id: generateId(),
    startTime: splitTime,
    duration: clip.duration - relativeTime,
    // trimStart increases to start from split point
    trimStart: sourceSplitTime,
  };

  // Replace original with two new clips
  removeClip(clipId);
  addClip(firstClip);
  addClip(secondClip);
}
```

## Video Playback & Synchronization

### 11. Multi-Track Playback System

#### **Playback Architecture:**

```typescript
interface PlaybackEngine {
  // Video player (primary timeline driver)
  videoPlayer: HTMLVideoElement;

  // Audio context for mixing multiple audio tracks
  audioContext: AudioContext;
  audioSources: Map<string, AudioBufferSourceNode>;

  // Canvas for rendering video + image overlays
  renderCanvas: HTMLCanvasElement;
  renderContext: CanvasRenderingContext2D;

  // Subtitle renderer
  subtitleRenderer: SubtitleRenderer;
}
```

#### **Playback Synchronization:**

1. **Master Clock**: Video player serves as master timecode
2. **Audio Sync**: Audio tracks sync to video currentTime
3. **Image Overlay**: Images rendered on canvas synced to currentTime
4. **Subtitle Sync**: Subtitles show/hide based on currentTime

### 12. Seeker/Timeline Cursor System

#### **Timeline Cursor Logic:**

```typescript
class TimelineSeeker {
  private currentTime: number = 0;

  // Update from video player
  onVideoTimeUpdate(time: number) {
    this.currentTime = time;
    this.updateAllTracks(time);
    timelineStore.setCurrentTime(time);
  }

  // Update from timeline drag
  onTimelineSeeek(time: number) {
    this.currentTime = time;
    this.seekVideoPlayer(time);
    this.seekAudioTracks(time);
    this.updateVisibleElements(time);
  }

  private updateAllTracks(time: number) {
    // Update active video clips
    const activeVideoClips = getActiveClipsAtTime(time, "video");
    this.renderVideoFrame(activeVideoClips, time);

    // Update active audio clips
    const activeAudioClips = getActiveClipsAtTime(time, "audio");
    this.mixAudioAtTime(activeAudioClips, time);

    // Update active image overlays
    const activeImageClips = getActiveClipsAtTime(time, "image");
    this.renderImageOverlays(activeImageClips, time);

    // Update active subtitles
    const activeSubtitles = getActiveClipsAtTime(time, "subtitle");
    this.renderSubtitles(activeSubtitles, time);
  }
}
```

#### **Multi-Track Time Tracking:**

```typescript
function getActiveClipsAtTime(
  time: number,
  trackType?: TrackType
): TimelineClip[] {
  return timelineStore.timeline.tracks
    .filter((track) => !trackType || track.type === trackType)
    .flatMap((track) => track.clips)
    .filter((clip) => {
      const clipEndTime = clip.startTime + clip.duration;
      return time >= clip.startTime && time < clipEndTime;
    });
}
```

## Backend API Integration

### 13. Timeline Persistence APIs

#### **Timeline CRUD Operations:**

```typescript
// Timeline Service
class TimelineService {
  // Load timeline data
  static async getTimeline(projectId: string): Promise<TimelineData> {
    return api.get(`/api/projects/${projectId}/timeline`);
  }

  // Save timeline state
  static async saveTimeline(
    projectId: string,
    timeline: TimelineData
  ): Promise<void> {
    return api.put(`/api/projects/${projectId}/timeline`, timeline);
  }

  // Auto-save (debounced)
  static async autoSaveTimeline(
    projectId: string,
    timeline: TimelineData
  ): Promise<void> {
    return this.debouncedSave(projectId, timeline);
  }
}

// Timeline Hook
function useTimelinePersistence(projectId: string) {
  const { saveTimeline } = useMutation({
    mutationFn: (timeline: TimelineData) =>
      TimelineService.saveTimeline(projectId, timeline),
    onSuccess: () => {
      toast.success("Timeline saved");
    },
  });

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const timeline = timelineStore.getState().timeline;
      TimelineService.autoSaveTimeline(projectId, timeline);
    }, 30000);

    return () => clearInterval(interval);
  }, [projectId]);
}
```

### 14. Export System Integration

#### **Export Preparation:**

```typescript
// Convert timeline to export format
function prepareTimelineForExport(timeline: Timeline): ExportData {
  return {
    tracks: timeline.tracks.map((track) => ({
      type: track.type,
      clips: track.clips.map((clip) => ({
        assetId: clip.assetId,
        startTime: clip.startTime,
        duration: clip.duration,
        trimStart: clip.trimStart,
        trimEnd: clip.trimEnd,
        transform: clip.transform,
        volume: clip.volume,
      })),
    })),
    settings: {
      duration: timeline.duration,
      fps: timeline.fps,
      resolution: timeline.resolution,
    },
  };
}

// Export API call
const exportData = prepareTimelineForExport(timeline);
const exportJob = await ExportService.startExport(projectId, exportData);
```

## Implementation Phases

### Phase 1: Core Timeline Store (Week 1)

- [ ] Create timeline store with basic state management
- [ ] Implement track and clip CRUD operations
- [ ] Add selection and playback state management
- [ ] Create timeline persistence service

### Phase 2: Clip Management (Week 2)

- [ ] Implement drag-and-drop from assets to timeline
- [ ] Add clip trimming and splitting functionality
- [ ] Create clip transformation system
- [ ] Build undo/redo system

### Phase 3: Multi-Track Playback (Week 3)

- [ ] Integrate video player with timeline
- [ ] Implement audio track mixing
- [ ] Add image overlay rendering
- [ ] Create subtitle rendering system

### Phase 4: Timeline UI (Week 4)

- [ ] Build canvas-based timeline component
- [ ] Add timeline controls and scrubber
- [ ] Implement track headers and controls
- [ ] Create properties panel for clip editing

### Phase 5: Advanced Features (Week 5)

- [ ] Add advanced trimming operations
- [ ] Implement timeline zooming and panning
- [ ] Create timeline ruler and grid
- [ ] Add keyboard shortcuts

## Success Criteria

1. **Functional Requirements:**

   - ✅ Can add/remove/reorder tracks
   - ✅ Can add clips from assets to timeline
   - ✅ Can trim and split clips accurately
   - ✅ Can play timeline with synchronized A/V
   - ✅ Can transform video/image clips
   - ✅ Can add and edit subtitles

2. **Performance Requirements:**

   - Timeline renders smoothly with 100+ clips
   - Playback maintains 30fps with multiple tracks
   - Timeline operations complete within 100ms
   - Auto-save doesn't block UI

3. **UX Requirements:**
   - Intuitive drag-and-drop interactions
   - Real-time preview of edits
   - Responsive timeline scrubbing
   - Clear visual feedback for all operations
