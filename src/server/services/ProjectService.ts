import { VideoProject } from "@/server/models/VideoProject";
import { getCollection } from "@/lib/database";
import { ObjectId } from "mongodb";

export interface CreateProjectRequest {
  title: string;
  description?: string;
  resolution: {
    width: number;
    height: number;
  };
  fps?: number;
}

export class ProjectService {
  async createProject(
    userId: string,
    data: CreateProjectRequest
  ): Promise<VideoProject> {
    try {
      const collection = await getCollection<VideoProject>("videoProjects");

      const project: Omit<VideoProject, "_id"> = {
        userId,
        projectId: crypto.randomUUID(),
        title: data.title,
        description: data.description,
        timelineSettings: {
          duration: 0,
          resolution: data.resolution,
          fps: data.fps || 30,
        },
        mediaAssets: [],
        tracks: [],
        subtitles: [],
        lastPlaybackPosition: 0,
        exportSettings: {
          format: "mp4",
          quality: "high",
          resolution: data.resolution,
          fps: data.fps || 30,
          includeAudio: true,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        lastOpenedAt: new Date(),
      };

      const result = await collection.insertOne(project as VideoProject);

      const createdProject = await collection.findOne({
        _id: result.insertedId,
      });

      if (!createdProject) throw new Error("Failed to create project");

      return createdProject;
    } catch (error) {
      console.error("Error getting video projects collection:", error);
      throw new Error("Failed to access video projects collection");
    }
  }

  async getUserProjects(userId: string, page: number = 1, limit: number = 10) {
    const collection = await getCollection<VideoProject>("videoProjects");

    const skip = (page - 1) * limit;
    const filter = { userId };

    const [projects, total] = await Promise.all([
      collection
        .find(filter)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      collection.countDocuments(filter),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getProjectById(
    projectId: string,
    userId: string
  ): Promise<VideoProject | null> {
    const collection = await getCollection<VideoProject>("videoProjects");

    return await collection.findOne({
      $or: [
        { projectId, userId },
        { _id: new ObjectId(projectId), userId },
      ],
    });
  }
}
