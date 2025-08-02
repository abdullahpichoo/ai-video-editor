import { NextRequest } from "next/server";
import { ProjectController } from "@/server/controllers/ProjectController";

const projectController = new ProjectController();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return await projectController.getProject(request, { params });
}
