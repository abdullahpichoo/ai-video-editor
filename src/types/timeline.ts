export interface ITimeline {
  id: string;
  projectId: string;
  duration: number;
  tracks: ITimelineTrack[];
}

export interface ITimelineTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "image" | "text";
  clips: ITimelineClip[];
  layerIndex: number;
  isVisible: boolean;
  isMuted: boolean;
  volume: number;
  locked: boolean;
}

export interface ITimelineClip {
  id: string;
  trackId: string;
  assetId?: string;

  type: "video" | "audio" | "image" | "text";

  startTime: number;
  duration: number;

  // Original bounds for non-destructive trimming
  originalStartTime: number;
  originalEndTime: number;

  trimStart: number;
  trimEnd: number;

  assetPath?: string;
  assetName?: string;
  assetDimensions?: {
    width: number;
    height: number;
  };

  transform?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    scaleX: number;
    scaleY: number;
  };

  volume: number;

  text?: string;
  style?: ISubtitleStyle;

  name: string;
  color?: string;
  locked: boolean;
  selected: boolean;
}

export interface ISubtitleStyle {
  fontSize: number;
  fontFamily: string;
  color: string;
  backgroundColor?: string;
  position: "top" | "center" | "bottom";
  alignment: "left" | "center" | "right";
  outline: boolean;
  shadow: boolean;
}
