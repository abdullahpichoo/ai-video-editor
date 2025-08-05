import { IApiResponse } from "./api-response.types";

export interface IProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
}

export interface ICreateProjectData {
  title: string;
  description?: string;
  resolution: {
    width: number;
    height: number;
  };
  fps?: number;
}

export interface IProjectMongoResponse extends Omit<IProject, "id"> {
  _id: string;
}

export type IFetchProjectsResponse = IApiResponse<{ projects: IProjectMongoResponse[] }>;
export type IFetchProjectResponse = IApiResponse<{ project: IProjectMongoResponse }>;
export type ICreateProjectResponse = IApiResponse<{ project: IProjectMongoResponse }>;
export type IUpdateProjectResponse = IApiResponse<{ project: IProjectMongoResponse }>;
export type IDeleteProjectResponse = IApiResponse<{ message: string }>;
