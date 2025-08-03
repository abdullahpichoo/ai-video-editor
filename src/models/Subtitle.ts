export interface SubtitleItem {
  subtitleId: string; // UUID for this subtitle
  
  // Timing
  startTime: number; // in seconds
  endTime: number; // in seconds
  
  // Content
  text: string;
  
  // Styling
  style: {
    fontSize: number; // in pixels
    fontFamily: string;
    color: string; // hex color
    backgroundColor?: string; // hex color for background
    position: {
      x: number; // horizontal position (0-1, relative to video)
      y: number; // vertical position (0-1, relative to video)
    };
    alignment: 'left' | 'center' | 'right';
    bold: boolean;
    italic: boolean;
    underline: boolean;
  };
  
  // Generation metadata
  isAIGenerated: boolean;
  confidence?: number; // 0-1, for AI-generated subtitles
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
