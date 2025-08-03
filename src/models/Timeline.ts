export interface TimelineTrack {
  trackId: string; // UUID for this track
  type: 'video' | 'audio' | 'image';
  name: string;
  isVisible: boolean;
  isMuted: boolean; // for audio tracks
  volume?: number; // 0-1, for audio tracks
  
  // Track position in timeline
  zIndex: number; // layering order
  
  // Clips on this track
  clips: TimelineClip[];
}

export interface TimelineClip {
  clipId: string; // UUID for this clip
  assetId: string; // References MediaAsset
  
  // Timeline position
  startTime: number; // when clip starts on timeline (seconds)
  endTime: number; // when clip ends on timeline (seconds)
  
  // Source trimming
  sourceStartTime: number; // trim start in source media (seconds)
  sourceEndTime: number; // trim end in source media (seconds)
  
  // Transformations (for video/image clips)
  transform?: {
    x: number; // horizontal position
    y: number; // vertical position
    scaleX: number; // horizontal scale (1 = original size)
    scaleY: number; // vertical scale (1 = original size)
    rotation: number; // rotation in degrees
    opacity: number; // 0-1
  };
  
  // Audio properties (for video/audio clips)
  audioSettings?: {
    volume: number; // 0-1
    isMuted: boolean;
    fadeIn?: number; // fade in duration (seconds)
    fadeOut?: number; // fade out duration (seconds)
  };
}
