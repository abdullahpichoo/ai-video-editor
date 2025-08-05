import { useCallback } from "react";

export const MEDIA_LIMITS = {
  video: {
    maxSize: 100 * 1024 * 1024, // 100MB
    formats: ["mp4", "webm"],
    mimeTypes: ["video/mp4", "video/webm"],
  },
  image: {
    maxSize: 5 * 1024 * 1024, // 5MB
    formats: ["jpg", "jpeg", "png"],
    mimeTypes: ["image/jpeg", "image/png", "image/jpg"],
  },
  audio: {
    maxSize: 10 * 1024 * 1024, // 10MB
    formats: ["mp3", "wav", "aac"],
    mimeTypes: ["audio/mpeg", "audio/wav", "audio/aac"],
  },
};

interface MediaMetadata {
  duration?: number;
  width?: number;
  height?: number;
  size: number;
  format: string;
}

interface UploadData {
  originalName: string;
  mimeType: string;
  fileSize: number;
  duration?: number;
  dimensions?: { width: number; height: number };
  fps?: number;
  hasAudio?: boolean;
  thumbnailDataUrl?: string;
}

export const useMediaProcessing = () => {
  const validateFile = useCallback((file: File, type: "video" | "image" | "audio"): string | null => {
    const limits = MEDIA_LIMITS[type];

    if (file.size > limits.maxSize) {
      return `File size exceeds ${Math.round(limits.maxSize / (1024 * 1024))}MB limit`;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !limits.formats.includes(extension)) {
      return `Unsupported format. Supported: ${limits.formats.join(", ")}`;
    }

    if (!limits.mimeTypes.includes(file.type)) {
      return `Invalid file type`;
    }

    return null;
  }, []);

  const extractMetadata = useCallback(async (file: File, type: "video" | "image" | "audio"): Promise<MediaMetadata> => {
    try {
      if (type === "image") {
        return new Promise<MediaMetadata>((resolve) => {
          const img = document.createElement("img");
          img.onload = () => {
            resolve({
              width: img.width,
              height: img.height,
              size: file.size,
              format: file.name.split(".").pop()?.toLowerCase() || "",
            });
            URL.revokeObjectURL(img.src);
          };
          img.src = URL.createObjectURL(file);
        });
      } else if (type === "video" || type === "audio") {
        return new Promise<MediaMetadata>((resolve) => {
          const element = type === "video" ? document.createElement("video") : document.createElement("audio");

          element.onloadedmetadata = () => {
            const metadata: MediaMetadata = {
              duration: element.duration,
              size: file.size,
              format: file.name.split(".").pop()?.toLowerCase() || "",
            };

            if (type === "video" && "videoWidth" in element) {
              metadata.width = (element as HTMLVideoElement).videoWidth;
              metadata.height = (element as HTMLVideoElement).videoHeight;
            }

            resolve(metadata);
            URL.revokeObjectURL(element.src);
          };
          element.src = URL.createObjectURL(file);
        });
      }
    } catch {
      console.error("Error extracting metadata");
    }

    return {
      size: file.size,
      format: file.name.split(".").pop()?.toLowerCase() || "",
    };
  }, []);

  const generateUploadData = useCallback(
    async (file: File, type: "video" | "image" | "audio", metadata: MediaMetadata): Promise<UploadData> => {
      const baseData: UploadData = {
        originalName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      };

      if (metadata.duration) {
        baseData.duration = metadata.duration;
      }

      if (metadata.width && metadata.height) {
        baseData.dimensions = {
          width: metadata.width,
          height: metadata.height,
        };
      }

      if (type === "video") {
        baseData.hasAudio = true;
        baseData.fps = 30;
      }

      // Generate thumbnail for video/image files
      if (type === "video" || type === "image") {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          if (type === "image") {
            const img = document.createElement("img");
            await new Promise((resolve) => {
              img.onload = resolve;
              img.src = URL.createObjectURL(file);
            });

            canvas.width = Math.min(img.width, 320);
            canvas.height = Math.min(img.height, 180);
            ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(img.src);
          } else if (type === "video") {
            const video = document.createElement("video");
            await new Promise((resolve) => {
              video.onloadedmetadata = resolve;
              video.src = URL.createObjectURL(file);
            });

            video.currentTime = 1; // Seek to 1 second for thumbnail
            await new Promise((resolve) => {
              video.onseeked = resolve;
            });

            canvas.width = Math.min(video.videoWidth, 320);
            canvas.height = Math.min(video.videoHeight, 180);
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(video.src);
          }

          baseData.thumbnailDataUrl = canvas.toDataURL("image/jpeg", 0.7);
        } catch (error) {
          console.warn("Failed to generate thumbnail:", error);
        }
      }

      return baseData;
    },
    []
  );

  return {
    MEDIA_LIMITS,
    validateFile,
    extractMetadata,
    generateUploadData,
  };
};
