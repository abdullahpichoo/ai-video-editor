import { useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAssetsStore } from "@/stores/assets-store";
import { AssetsService } from "@/services/assets.service";
import { useMediaProcessing } from "../_hooks/use-media-processing";
import { IAssetUploadRequest } from "@/types/asset.types";
import { toast } from "sonner";
import { queryClient } from "@/components/providers/Providers";

export const useAssets = (projectId: string) => {
  const {
    assets: storeAssets,
    uploadingAssets,
    setAssets,
    addAsset,
    removeAsset,
    addUploadingAsset,
    updateUploadingAsset,
    removeUploadingAsset,
  } = useAssetsStore();

  const { validateFile, generateUploadData, extractMetadata } = useMediaProcessing();

  const {
    data: queryAssets = [],
    isLoading,
    error,
    refetch: fetchAssets,
  } = useQuery({
    queryKey: ["assets", projectId],
    queryFn: async () => {
      const result = await AssetsService.fetchAssets(projectId);
      if (!result.success) {
        throw new Error("Failed to fetch assets");
      }
      return result.data?.assets || [];
    },
    staleTime: 0,
    retry: false,
  });

  useEffect(() => {
    if (queryAssets.length > 0) {
      setAssets(queryAssets);
    }
  }, [queryAssets, setAssets]);

  const uploadMutation = useMutation({
    mutationFn: async ({ file, uploadData }: { file: File; uploadData: IAssetUploadRequest }) => {
      const result = await AssetsService.uploadAsset(projectId, file, uploadData);
      if (!result.success) {
        throw new Error("Upload failed");
      }
      return result.data.asset;
    },
    onSuccess: (newAsset) => {
      addAsset(newAsset);

      queryClient.invalidateQueries({ queryKey: ["assets", projectId] });
    },
    onError: (error, variables) => {
      const mediaFiles = useAssetsStore.getState().uploadingAssets;
      const mediaFile = mediaFiles.find((f) => f.file === variables.file);

      if (mediaFile) {
        updateUploadingAsset(mediaFile.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        });
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (assetId: string) => {
      const result = await AssetsService.deleteAsset(projectId, assetId);
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to delete asset");
      }
      return assetId;
    },
    onSuccess: (deletedAssetId) => {
      removeAsset(deletedAssetId);

      queryClient.invalidateQueries({ queryKey: ["assets", projectId] });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete asset");
    },
  });

  const uploadAsset = useCallback(
    async (file: File) => {
      const fileType = file.type.startsWith("video/") ? "video" : file.type.startsWith("image/") ? "image" : "audio";

      const validationError = validateFile(file, fileType);

      if (validationError) {
        throw new Error(validationError);
      }

      const uploadId = Math.random().toString(36).substr(2, 9);

      addUploadingAsset({
        id: uploadId,
        file,
        type: fileType,
        status: "uploading",
        progress: 0,
      });

      try {
        const metadata = await extractMetadata(file, fileType);

        const uploadData: IAssetUploadRequest = await generateUploadData(file, fileType, metadata);

        updateUploadingAsset(uploadId, { progress: 50 });

        const result = await uploadMutation.mutateAsync({ file, uploadData });

        removeUploadingAsset(uploadId);

        return result;
      } catch (error) {
        updateUploadingAsset(uploadId, {
          status: "error",
          error: error instanceof Error ? error.message : "Upload failed",
        });
        throw error;
      }
    },
    [
      validateFile,
      extractMetadata,
      generateUploadData,
      addUploadingAsset,
      updateUploadingAsset,
      removeUploadingAsset,
      uploadMutation,
    ]
  );

  const deleteAsset = useCallback(
    async (assetId: string) => {
      try {
        await deleteMutation.mutateAsync(assetId);
      } catch (error) {
        throw error;
      }
    },
    [deleteMutation]
  );

  const retryUpload = useCallback(
    async (uploadId: string) => {
      const uploadingAsset = uploadingAssets.find((asset) => asset.id === uploadId);
      if (uploadingAsset) {
        removeUploadingAsset(uploadId);
        await uploadAsset(uploadingAsset.file);
      }
    },
    [uploadingAssets, removeUploadingAsset, uploadAsset]
  );

  return {
    assets: storeAssets,
    uploadingAssets,
    isLoading,
    error: error?.message || uploadMutation.error?.message || deleteMutation.error?.message,
    fetchAssets,
    uploadAsset,
    deleteAsset,
    retryUpload,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
};
