"use client";

import { Trash2, Upload, AlertCircle, Video, Image as ImageIcon, Music, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { IAsset } from "@/types/asset.types";
import { useTimelineStore } from "@/stores/timeline-store";
import { useAssetHasActiveJob } from "@/hooks/use-ai-jobs";

interface UploadingAsset {
  id: string;
  file: File;
  type: "video" | "image" | "audio";
  status: "uploading" | "error";
  progress: number;
  error?: string;
}

interface AssetCardProps {
  asset?: IAsset;
  uploadingAsset?: UploadingAsset;
  onDelete?: (assetId: string) => void;
  onRetry?: (uploadId: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function AssetCard({ asset, uploadingAsset, onDelete, onRetry, isSelected, onSelect }: AssetCardProps) {
  const { addClip } = useTimelineStore();

  // Check if asset has active AI job
  const { hasActiveJob, activeJob } = useAssetHasActiveJob(asset?.assetId || "", asset?.projectId);

  const isUploading = !!uploadingAsset;
  const isError = uploadingAsset?.status === "error";

  const type = asset?.type || uploadingAsset?.type || "video";
  const name = asset?.originalName || uploadingAsset?.file?.name || "";
  const size = asset?.fileSize || uploadingAsset?.file?.size || 0;

  const getTypeIcon = () => {
    const size = "w-3 h-3";
    switch (type) {
      case "video":
        return <Video className={size} />;
      case "image":
        return <ImageIcon className={size} />;
      case "audio":
        return <Music className={size} />;
      default:
        return <Video className={size} />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "video":
        return "bg-blue-100 text-blue-700";
      case "image":
        return "bg-green-100 text-green-700";
      case "audio":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const handleDelete = () => {
    if (asset && onDelete) {
      onDelete(asset.assetId);
    }
  };

  const handleRetry = () => {
    if (uploadingAsset && onRetry) {
      onRetry(uploadingAsset.id);
    }
  };

  const handleDoubleClick = () => {
    if (asset && canSelect) {
      addClip(asset);
    }
  };

  const canSelect = !isUploading && !isError;

  return (
    <div
      className={`
        relative p-3 border rounded-lg cursor-pointer transition-all
        ${isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"}
        ${!canSelect ? "opacity-60 cursor-not-allowed" : ""}
      `}
      onClick={canSelect ? onSelect : undefined}
      onDoubleClick={handleDoubleClick}
    >
      {/* Type Badge */}
      <div className="flex items-center justify-between mb-2">
        <div
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-xl text-[10px] font-medium ${getTypeColor()}`}
        >
          {getTypeIcon()}
          {type.toUpperCase()}
        </div>

        {/* AI Processing Badge */}
        {hasActiveJob && activeJob && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] px-1 py-0">
            <Loader2 className="w-2 h-2 mr-1 animate-spin" />
            AI Processing
          </Badge>
        )}
      </div>

      {/* File Name */}
      <div className="text-sm font-medium text-gray-900 truncate mb-1">{name}</div>

      {/* File Size */}
      <div className="text-xs text-gray-500 mb-2">{formatFileSize(size)}</div>

      {/* Upload Progress */}
      {isUploading && !isError && (
        <div className="mb-2">
          <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
            <Upload className="w-3 h-3" />
            Uploading... {uploadingAsset.progress}%
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div
              className="bg-blue-500 h-1 rounded-full transition-all"
              style={{ width: `${uploadingAsset.progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="mb-2">
          <div className="flex items-center gap-2 text-xs text-red-600 mb-1">
            <AlertCircle className="w-3 h-3" />
            Upload failed
          </div>
          {uploadingAsset.error && <div className="text-xs text-gray-500 mb-2">{uploadingAsset.error}</div>}
          <button onClick={handleRetry} className="text-xs text-blue-600 hover:text-blue-700 underline">
            Retry upload
          </button>
        </div>
      )}

      {/* Delete Button */}
      {asset && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="absolute top-2 right-2 p-1 text-gray-400 hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
