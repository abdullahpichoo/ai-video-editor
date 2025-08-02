import { ObjectId } from 'mongodb';
import { TimelineTrack } from './Timeline';
import { SubtitleItem } from './Subtitle';
import { ExportSettings } from './ExportSettings';

export interface VideoProject {
  _id?: ObjectId;
  userId: string; // References User._id
  projectId: string; // UUID for this project
  
  // Project metadata
  title: string;
  description?: string;
  
  // Timeline configuration
  timelineSettings: {
    duration: number; // total project duration in seconds
    resolution: {
      width: number;
      height: number;
    };
    fps: number;
  };
  
  // Media assets used in this project
  mediaAssets: string[]; // Array of asset IDs
  
  // Timeline tracks
  tracks: TimelineTrack[];
  
  // Subtitles
  subtitles: SubtitleItem[];
  
  // Project state
  lastPlaybackPosition: number; // in seconds
  exportSettings?: ExportSettings;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastOpenedAt: Date;
}
