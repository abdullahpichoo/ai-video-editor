"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Volume2, Subtitles, Loader2, Activity, CheckCircle2 } from "lucide-react";
import { useAssetsStore } from "@/stores/assets-store";
import { useTimelineStore } from "@/stores/timeline-store";
import { AssetCard } from "./asset-card";
import { JobStatusCard } from "./job-status-card";
import { JobResultCard } from "./job-result-card";
import { IAsset } from "@/types/asset.types";
import { IAIJob } from "@/types/ai-job.types";
import { useStartNoiseRemoval, useStartSubtitleGeneration, useProjectJobs } from "@/hooks/use-ai-jobs";
import { toast } from "sonner";

interface AIDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function AIDrawer({ open, onOpenChange, projectId }: AIDrawerProps) {
  const { assets } = useAssetsStore();
  const { timeline } = useTimelineStore();
  const [selectedAsset, setSelectedAsset] = useState<IAsset | null>(null);
  const [activeTab, setActiveTab] = useState("start-jobs");

  const shouldPollJobs = open && (activeTab === "job-status" || activeTab === "results");

  const startNoiseRemoval = useStartNoiseRemoval();
  const startSubtitleGeneration = useStartSubtitleGeneration();
  const { data: projectJobs = [], isLoading: isLoadingJobs } = useProjectJobs(projectId, {
    enabled: shouldPollJobs,
  });

  const activeJobsList = projectJobs.filter((job) => ["pending", "processing"].includes(job.status));
  const completedJobs = projectJobs.filter((job) => job.status === "completed");
  const failedJobs = projectJobs.filter((job) => job.status === "failed");

  const aiFeatures = [
    {
      id: "noise-removal",
      name: "Noise Removal",
      description: "Remove background noise from audio tracks",
      icon: Volume2,
      requiresAudio: true,
    },
    {
      id: "subtitle-generation",
      name: "Generate Subtitles",
      description: "Automatically generate subtitles from speech",
      icon: Subtitles,
      requiresVideo: true,
    },
  ];

  const toggleAssetSelection = (asset: IAsset) => {
    if (selectedAsset === asset) {
      setSelectedAsset(null);
    } else {
      setSelectedAsset(asset);
    }
  };

  const hasActiveJobForAsset = (assetId: string) => {
    return activeJobsList.some((job) => job.assetId === assetId);
  };

  const getFilteredAssets = () => {
    // Get all clips from all tracks in the timeline
    const allClips = timeline.tracks.flatMap((track) => track.clips);
    const timelineAssetIds = new Set(allClips.map((clip) => clip.assetId).filter(Boolean));

    return assets.filter(
      (asset) =>
        ["video", "audio"].includes(asset.type) &&
        timelineAssetIds.has(asset.assetId) &&
        !hasActiveJobForAsset(asset.assetId)
    );
  };

  const handleStartJob = async (featureId: string) => {
    if (!selectedAsset) return;

    const request = { assetId: selectedAsset.assetId, projectId };

    try {
      if (featureId === "noise-removal") {
        await startNoiseRemoval.mutateAsync(request);
      } else if (featureId === "subtitle-generation") {
        await startSubtitleGeneration.mutateAsync(request);
      }

      // Clear selection after starting job
      setSelectedAsset(null);

      // Switch to job status tab
      setActiveTab("job-status");
    } catch {
      // Error is handled by the mutation hooks
    }
  };
  const handleAddToTimeline = (job: IAIJob) => {
    const { addSubtitleClips, findAssetClips, addClip } = useTimelineStore.getState();

    if (job.type === "subtitle-generation" && job.outputData?.subtitles) {
      const assetClips = findAssetClips(job.assetId);

      if (assetClips.length === 0) {
        toast.error("Asset not found on timeline");
        return;
      }

      if (assetClips.length > 1) {
        toast.warning("Multiple clips found for asset. Using first clip for now.");
      }

      addSubtitleClips(job.assetId, job.outputData.subtitles);

      toast.success(`Added ${job.outputData.subtitles.length} subtitle clips to timeline`);
    } else if (job.type === "noise-removal" && job.outputData?.resultAssetId) {
      const processedAsset = job.outputData.resultAsset;
      if (!processedAsset) {
        toast.error("Processed audio asset not found. Please refresh and try again.");
        return;
      }
      const originalAssetClips = findAssetClips(job.assetId);

      addClip(processedAsset);

      if (originalAssetClips.length > 0) {
        toast.success(
          `Added cleaned audio "${processedAsset.originalName}" to timeline. ` +
            `Original asset still remains on timeline.`
        );
      } else {
        toast.success(`Added cleaned audio "${processedAsset.originalName}" to timeline`);
      }
    }
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Features
          </SheetTitle>
        </SheetHeader>

        <div className="mt-2 flex flex-col h-full overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="start-jobs">Start Jobs</TabsTrigger>
              <TabsTrigger value="job-status" className="relative">
                Job Status
                {activeJobsList.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                    {activeJobsList.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="results">Results</TabsTrigger>
            </TabsList>

            {/* Start Jobs Tab */}
            <TabsContent value="start-jobs" className="space-y-6 mt-6">
              {/* Asset Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Select Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 h-80 overflow-auto">
                    {getFilteredAssets().length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {assets.length === 0
                          ? "No assets available. Upload some assets first."
                          : "All compatible assets are currently being processed."}
                      </p>
                    ) : (
                      getFilteredAssets().map((asset) => (
                        <AssetCard
                          key={asset.assetId}
                          asset={asset}
                          isSelected={selectedAsset?.assetId === asset.assetId}
                          onSelect={() => toggleAssetSelection(asset)}
                        />
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Available AI Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {aiFeatures.map((feature) => {
                      const Icon = feature.icon;
                      const isDisabled =
                        !selectedAsset || startNoiseRemoval.isPending || startSubtitleGeneration.isPending;

                      return (
                        <div key={feature.id} className="space-y-3">
                          <div className="flex items-start gap-3 p-3 rounded-lg border">
                            <Icon className="h-5 w-5 mt-0.5 text-primary" />
                            <div className="flex-1">
                              <h3 className="text-sm font-medium">{feature.name}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                              <Button
                                size="sm"
                                className="mt-2"
                                onClick={() => handleStartJob(feature.id)}
                                disabled={isDisabled}
                              >
                                {(startNoiseRemoval.isPending && feature.id === "noise-removal") ||
                                (startSubtitleGeneration.isPending && feature.id === "subtitle-generation") ? (
                                  <>
                                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                    Starting...
                                  </>
                                ) : (
                                  "Apply to Selected"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {!selectedAsset && (
                <Card className="border-muted">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground text-center">
                      Select assets above to enable AI features
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Job Status Tab */}
            <TabsContent value="job-status" className="space-y-4 mt-6">
              {isLoadingJobs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {/* Active Jobs */}
                  {activeJobsList.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Active Jobs ({activeJobsList.length})
                      </h3>
                      {activeJobsList.map((job) => (
                        <JobStatusCard key={job.jobId} job={job} />
                      ))}
                    </div>
                  )}

                  {/* Failed Jobs */}
                  {failedJobs.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-red-600">Failed Jobs</h3>
                      {failedJobs.map((job) => (
                        <JobStatusCard
                          key={job.jobId}
                          job={job}
                          onRetry={(jobId) => {
                            // TODO: Implement retry functionality
                            console.log("Retry job:", jobId);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {activeJobsList.length === 0 && failedJobs.length === 0 && (
                    <Card className="border-muted">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center">
                          No active jobs. Start a job from the &quot;Start Jobs&quot; tab.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* Results Tab */}
            <TabsContent value="results" className="space-y-4 mt-6">
              {isLoadingJobs ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {completedJobs.length > 0 ? (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Completed Jobs ({completedJobs.length})
                      </h3>
                      {completedJobs.map((job) => (
                        <JobResultCard key={job.jobId} job={job} onAddToTimeline={handleAddToTimeline} />
                      ))}
                    </div>
                  ) : (
                    <Card className="border-muted">
                      <CardContent className="pt-6">
                        <p className="text-sm text-muted-foreground text-center">
                          No completed jobs yet. Results will appear here once jobs finish processing.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
