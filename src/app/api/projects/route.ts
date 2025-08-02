import { NextRequest } from 'next/server';
import { ProjectController } from '@/server/controllers/ProjectController';

const projectController = new ProjectController();

export async function POST(request: NextRequest) {
  return await projectController.createProject(request);
}

export async function GET(request: NextRequest) {
  return await projectController.listProjects(request);
}
