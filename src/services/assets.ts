import api from "@/lib/api";
import { IAssetUploadRequest } from "@/types/asset";
import {
  IDeleteAssetResponse,
  IFetchAssetsResponse,
  IUploadAssetResponse,
} from "@/types/asset";

export class AssetsService {
  static async fetchAssets(projectId: string): Promise<IFetchAssetsResponse> {
    const response = await api.get<IFetchAssetsResponse>(
      `/media/${projectId}/assets`
    );
    return response.data;
  }

  static async uploadAsset(
    projectId: string,
    file: File,
    uploadData: IAssetUploadRequest
  ): Promise<IUploadAssetResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("originalName", uploadData.originalName);
    formData.append("mimeType", uploadData.mimeType);
    formData.append("fileSize", uploadData.fileSize.toString());

    if (uploadData.duration !== undefined) {
      formData.append("duration", uploadData.duration.toString());
    }

    if (uploadData.dimensions) {
      formData.append("dimensions", JSON.stringify(uploadData.dimensions));
    }

    if (uploadData.fps !== undefined) {
      formData.append("fps", uploadData.fps.toString());
    }

    if (uploadData.hasAudio !== undefined) {
      formData.append("hasAudio", uploadData.hasAudio.toString());
    }

    if (uploadData.thumbnailDataUrl) {
      formData.append("thumbnailDataUrl", uploadData.thumbnailDataUrl);
    }

    const response = await api.post(`/media/${projectId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data as IUploadAssetResponse;
  }

  static async deleteAsset(
    projectId: string,
    assetId: string
  ): Promise<IDeleteAssetResponse> {
    const response = await api.delete(`/media/${assetId}`);
    return response.data as IDeleteAssetResponse;
  }
}
