import { z } from "zod";

export const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Project title is required")
    .max(100, "Title must be less than 100 characters"),
  description: z.string().optional(),
  resolution: z.object({
    width: z
      .number()
      .min(320, "Width must be at least 320px")
      .max(7680, "Width cannot exceed 7680px"),
    height: z
      .number()
      .min(240, "Height must be at least 240px")
      .max(4320, "Height cannot exceed 4320px"),
  }),
  fps: z
    .number()
    .min(1, "FPS must be at least 1")
    .max(120, "FPS cannot exceed 120")
    .default(30),
});

export type CreateProjectFormData = z.infer<typeof createProjectSchema>;

export const resolutionPresets = [
  { label: "HD (1280x720)", width: 1280, height: 720 },
  { label: "Full HD (1920x1080)", width: 1920, height: 1080 },
  { label: "4K (3840x2160)", width: 3840, height: 2160 },
  { label: "Instagram Square (1080x1080)", width: 1080, height: 1080 },
  { label: "Instagram Story (1080x1920)", width: 1080, height: 1920 },
  { label: "YouTube Shorts (1080x1920)", width: 1080, height: 1920 },
];
