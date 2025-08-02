export interface ExportSettings {
  format: 'mp4' | 'webm';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  bitrate?: number; // in kbps
  includeAudio: boolean;
}
