"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useAssets } from "../_api/use-assets";
import { AssetCard } from "./asset-card";
import { IAsset } from "@/types/asset.types";
import { MEDIA_LIMITS } from "../_hooks/use-media-processing";

interface UploadingAsset {
  id: string;
  file: File;
  type: "video" | "image" | "audio";
  status: "uploading" | "error";
  progress: number;
  error?: string;
}

interface AssetsLibraryProps {
  projectId: string;
}

export function AssetsLibrary({ projectId }: AssetsLibraryProps) {
  const [selectedAsset, setSelectedAsset] = useState<IAsset | undefined>();
  const { assets, uploadingAssets, isLoading, error, uploadAsset, deleteAsset, retryUpload } = useAssets(projectId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedMimeTypes = [
    ...MEDIA_LIMITS.video.mimeTypes,
    ...MEDIA_LIMITS.image.mimeTypes,
    ...MEDIA_LIMITS.audio.mimeTypes,
  ].join(",");

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await uploadAsset(file);
      } catch (error) {
        console.error("Upload error:", error);
      }
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const allAssets = [...assets, ...uploadingAssets];

  return (
    <aside className="w-52 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">Assets Library</h2>
        <p className="text-xs text-gray-500">Upload and manage your files</p>
      </div>

      {/* Upload Zone */}
      <div className="p-3 border-b border-gray-200">
        <div
          onClick={handleFileSelect}
          className={`
            border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors border-gray-300 hover:border-blue-400 hover:bg-blue-50
          `}
        >
          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
          <p className="text-xs text-gray-600 mb-1">Click to upload</p>
          <p className="text-xs text-gray-400">Video, Image, or Audio files</p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedMimeTypes}
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>

      {/* Assets List */}
      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-3 text-xs text-red-600 bg-red-50 border-b border-red-200">{error}</div>}

        {isLoading && assets.length === 0 && (
          <div className="p-3 text-xs text-gray-500 text-center">Loading assets...</div>
        )}

        <div className="p-3 space-y-2 flex flex-col h-[20rem]">
          {allAssets.map((item) => {
            // Handle regular assets
            if ("assetId" in item) {
              const asset = item as IAsset;
              return (
                <AssetCard
                  key={asset.assetId}
                  asset={asset}
                  onDelete={deleteAsset}
                  isSelected={selectedAsset?.assetId === asset.assetId}
                  onSelect={() => setSelectedAsset(asset)}
                />
              );
            }

            // Handle uploading assets
            const uploadingAsset = item as UploadingAsset;
            return <AssetCard key={uploadingAsset.id} uploadingAsset={uploadingAsset} onRetry={retryUpload} />;
          })}

          {allAssets.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500 mb-2">No assets uploaded</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
