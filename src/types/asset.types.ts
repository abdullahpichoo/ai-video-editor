import { IApiResponse } from "./api-response.types";

export interface IAsset {
  assetId: string;
  projectId: string;
  originalName: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  type: "video" | "image" | "audio";
  storagePath: string;
  duration: number;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface IAssetUploadRequest {
  originalName: string;
  mimeType: string;
  fileSize: number;
  duration?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  fps?: number;
  hasAudio?: boolean;
  thumbnailDataUrl?: string;
}

export type IFetchAssetsResponse = IApiResponse<{
  assets: IAsset[];
}>;

export type IUploadAssetResponse = IApiResponse<{
  asset: IAsset;
}>;

export type IDeleteAssetResponse = IApiResponse<{
  message: string;
}>;
