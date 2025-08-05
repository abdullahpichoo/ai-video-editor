import { create } from "zustand";
import { IAIJob } from "@/types/ai-job.types";

interface AIJobsStore {
  // State
  activeJobs: IAIJob[];
  completedJobs: IAIJob[];
  jobNotifications: { jobId: string; message: string; type: "success" | "error" }[];

  // Actions
  setActiveJobs: (jobs: IAIJob[]) => void;
  updateJobProgress: (jobId: string, progress: number) => void;
  completeJob: (job: IAIJob) => void;
  failJob: (jobId: string, errorMessage: string) => void;
  addJobNotification: (jobId: string, message: string, type: "success" | "error") => void;
  removeJobNotification: (jobId: string) => void;
  clearNotifications: () => void;

  // Computed
  getJobById: (jobId: string) => IAIJob | undefined;
  getJobsByProject: (projectId: string) => IAIJob[];
  getJobsByAsset: (assetId: string) => IAIJob[];
  hasActiveJobForAsset: (assetId: string) => boolean;
}

export const useAIJobsStore = create<AIJobsStore>((set, get) => ({
  // Initial state
  activeJobs: [],
  completedJobs: [],
  jobNotifications: [],

  // Actions
  setActiveJobs: (jobs) => {
    set({ activeJobs: jobs });
  },

  updateJobProgress: (jobId, progress) => {
    set((state) => ({
      activeJobs: state.activeJobs.map((job) => (job.jobId === jobId ? { ...job, progress } : job)),
    }));
  },

  completeJob: (completedJob) => {
    set((state) => ({
      activeJobs: state.activeJobs.filter((job) => job.jobId !== completedJob.jobId),
      completedJobs: [...state.completedJobs, completedJob],
    }));

    // Add success notification
    get().addJobNotification(
      completedJob.jobId,
      `${completedJob.type === "noise-removal" ? "Noise removal" : "Subtitle generation"} completed successfully!`,
      "success"
    );
  },

  failJob: (jobId, errorMessage) => {
    set((state) => ({
      activeJobs: state.activeJobs.filter((job) => job.jobId !== jobId),
    }));

    // Add error notification
    get().addJobNotification(jobId, errorMessage, "error");
  },

  addJobNotification: (jobId, message, type) => {
    set((state) => ({
      jobNotifications: [
        ...state.jobNotifications.filter((n) => n.jobId !== jobId), // Remove existing notification for this job
        { jobId, message, type },
      ],
    }));
  },

  removeJobNotification: (jobId) => {
    set((state) => ({
      jobNotifications: state.jobNotifications.filter((n) => n.jobId !== jobId),
    }));
  },

  clearNotifications: () => {
    set({ jobNotifications: [] });
  },

  // Computed getters
  getJobById: (jobId) => {
    const state = get();
    return (
      state.activeJobs.find((job) => job.jobId === jobId) || state.completedJobs.find((job) => job.jobId === jobId)
    );
  },

  getJobsByProject: (projectId) => {
    const state = get();
    return [
      ...state.activeJobs.filter((job) => job.projectId === projectId),
      ...state.completedJobs.filter((job) => job.projectId === projectId),
    ];
  },

  getJobsByAsset: (assetId) => {
    const state = get();
    return [
      ...state.activeJobs.filter((job) => job.assetId === assetId),
      ...state.completedJobs.filter((job) => job.assetId === assetId),
    ];
  },

  hasActiveJobForAsset: (assetId) => {
    const state = get();
    return state.activeJobs.some((job) => job.assetId === assetId);
  },
}));
