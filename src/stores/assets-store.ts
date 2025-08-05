import { create } from "zustand";
import { IAsset } from "@/types/asset.types";
import { useTimelineStore } from "./timeline-store";

interface UploadingAsset {
  id: string;
  file: File;
  type: "video" | "image" | "audio";
  status: "uploading" | "error";
  progress: number;
  error?: string;
}

interface AssetsState {
  assets: IAsset[];
  uploadingAssets: UploadingAsset[];
}

interface AssetsActions {
  setAssets: (assets: IAsset[]) => void;
  addAsset: (asset: IAsset) => void;
  removeAsset: (assetId: string) => void;
  updateAsset: (assetId: string, updates: Partial<IAsset>) => void;

  addUploadingAsset: (uploadingAsset: UploadingAsset) => void;
  updateUploadingAsset: (id: string, updates: Partial<UploadingAsset>) => void;
  removeUploadingAsset: (id: string) => void;
}

export const useAssetsStore = create<AssetsState & AssetsActions>((set) => ({
  assets: [],
  uploadingAssets: [],

  setAssets: (assets) => set({ assets }),

  addAsset: (asset) =>
    set((state) => ({
      assets: [...state.assets, asset],
    })),

  removeAsset: (assetId) => {
    // Remove the asset from the assets array
    set((state) => ({
      assets: state.assets.filter((asset) => asset.assetId !== assetId),
    }));

    // Also remove any clips that reference this asset
    useTimelineStore.getState().removeClipsByAssetId(assetId);
  },

  updateAsset: (assetId, updates) =>
    set((state) => ({
      assets: state.assets.map((asset) => (asset.assetId === assetId ? { ...asset, ...updates } : asset)),
    })),

  addUploadingAsset: (uploadingAsset) =>
    set((state) => ({
      uploadingAssets: [...state.uploadingAssets, uploadingAsset],
    })),

  updateUploadingAsset: (id, updates) =>
    set((state) => ({
      uploadingAssets: state.uploadingAssets.map((asset) => (asset.id === id ? { ...asset, ...updates } : asset)),
    })),

  removeUploadingAsset: (id) =>
    set((state) => ({
      uploadingAssets: state.uploadingAssets.filter((asset) => asset.id !== id),
    })),
}));
