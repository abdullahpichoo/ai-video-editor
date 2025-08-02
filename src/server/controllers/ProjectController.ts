import { NextRequest } from "next/server";
import { BaseController } from "./BaseController";
import {
  ProjectService,
  CreateProjectRequest,
} from "@/server/services/ProjectService";

export class ProjectController extends BaseController {
  private projectService = new ProjectService();

  async createProject(request: NextRequest) {
    try {
      const userId = await this.getUserId(request);
      if (!userId) {
        return this.unauthorized();
      }

      const body = await request.json();

      if (!body.title?.trim()) {
        return this.badRequest("Project title is required");
      }

      if (!body.resolution?.width || !body.resolution?.height) {
        return this.badRequest("Project resolution is required");
      }

      const createData: CreateProjectRequest = {
        title: body.title.trim(),
        description: body.description?.trim(),
        resolution: {
          width: parseInt(body.resolution.width),
          height: parseInt(body.resolution.height),
        },
        fps: body.fps ? parseInt(body.fps) : undefined,
      };

      if (
        isNaN(createData.resolution.width) ||
        isNaN(createData.resolution.height)
      ) {
        return this.badRequest("Invalid resolution values");
      }

      const project = await this.projectService.createProject(
        userId,
        createData
      );

      return this.created(project);
    } catch (error) {
      console.error("Error creating project:", error);
      return this.error("Failed to create project");
    }
  }

  async listProjects(request: NextRequest) {
    try {
      const userId = await this.getUserId(request);
      if (!userId) {
        return this.unauthorized();
      }

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50);

      if (page < 1 || limit < 1) {
        return this.badRequest("Invalid pagination parameters");
      }

      const result = await this.projectService.getUserProjects(
        userId,
        page,
        limit
      );

      return this.success(result);
    } catch (error) {
      console.error("Error listing projects:", error);
      return this.error("Failed to fetch projects");
    }
  }

  async getProject(
    request: NextRequest,
    { params }: { params: { id: string } }
  ) {
    try {
      const userId = await this.getUserId(request);
      if (!userId) {
        return this.unauthorized();
      }

      const projectId = params.id;
      if (!projectId) {
        return this.badRequest("Project ID is required");
      }

      const project = await this.projectService.getProjectById(
        projectId,
        userId
      );

      if (!project) {
        return this.notFound("Project not found");
      }

      return this.success(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      return this.error("Failed to fetch project");
    }
  }
}
