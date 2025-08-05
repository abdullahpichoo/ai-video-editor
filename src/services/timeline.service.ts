import api from "@/lib/api";
import {
  ITimeline,
  ITimelineTrack,
  ITimelineClip,
  IFetchTimelineResponse,
  IUpdateTimelineResponse,
  ITimelineMongoResponse,
  ITimelineTrackMongoResponse,
  ITimelineClipMongoResponse,
} from "@/types/timeline.types";

export class TimelineService {
  static async fetchTimeline(projectId: string): Promise<ITimeline | null> {
    const response = await api.get<IFetchTimelineResponse>(this.getBaseURL(projectId));
    const result = response.data;

    if (!result.success) {
      throw new Error(result.error?.message || "Failed to fetch timeline");
    }

    if (!result.data) {
      return null;
    }

    return this.transformTimelineResponse(result.data);
  }

  static async updateTimeline(projectId: string, timeline: ITimeline): Promise<ITimeline> {
    const response = await api.put<IUpdateTimelineResponse>(this.getBaseURL(projectId), timeline);
    const result = response.data;

    if (!result.success || !result.data) {
      throw new Error(result.error?.message || "Failed to update timeline");
    }

    return this.transformTimelineResponse(result.data);
  }

  static async autoSaveTimeline(projectId: string, timeline: ITimeline): Promise<ITimeline> {
    try {
      return await this.updateTimeline(projectId, timeline);
    } catch (error) {
      console.warn("Auto-save failed:", error);
      throw error;
    }
  }

  static transformTimelineResponse(mongoTimeline: ITimelineMongoResponse): ITimeline {
    const { _id, tracks, ...timelineData } = mongoTimeline;

    return {
      ...timelineData,
      id: _id,
      tracks: tracks.map((track) => this.transformTrackResponse(track)),
    };
  }
  static transformTrackResponse(mongoTrack: ITimelineTrackMongoResponse): ITimelineTrack {
    const { _id, clips, ...trackData } = mongoTrack;

    return {
      ...trackData,
      id: _id,
      clips: clips.map((clip) => this.transformClipResponse(clip)),
    };
  }

  static transformClipResponse(mongoClip: ITimelineClipMongoResponse): ITimelineClip {
    const { _id, ...clipData } = mongoClip;

    return {
      ...clipData,
      id: _id,
    };
  }

  private static getBaseURL(projectId: string): string {
    return `/projects/${projectId}/timeline`;
  }
}
