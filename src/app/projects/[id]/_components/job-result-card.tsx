"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Volume2, Subtitles, Download, Plus, Edit, CheckCircle2, FileAudio, FileVideo } from "lucide-react";
import { IAIJob } from "@/types/ai-job.types";
import { useAssetsStore } from "@/stores/assets-store";
import { formatDistanceToNow } from "date-fns";

interface JobResultCardProps {
  job: IAIJob;
  onAddToTimeline?: (job: IAIJob) => void;
  onEditSubtitles?: (job: IAIJob) => void;
  onDownload?: (job: IAIJob) => void;
  showActions?: boolean;
}

export function JobResultCard({ job, onAddToTimeline, showActions = true }: JobResultCardProps) {
  const { assets } = useAssetsStore();

  if (job.status !== "completed" || !job.outputData) {
    return null;
  }

  // Find the source asset for this job
  const sourceAsset = assets.find((asset) => asset.assetId === job.assetId);

  const getTypeIcon = () => {
    return job.type === "noise-removal" ? <Volume2 className="h-4 w-4" /> : <Subtitles className="h-4 w-4" />;
  };

  const getTypeName = () => {
    return job.type === "noise-removal" ? "Noise Removal" : "Subtitle Generation";
  };

  const getAssetIcon = () => {
    if (sourceAsset?.type === "video") return <FileVideo className="h-4 w-4" />;
    if (sourceAsset?.type === "audio") return <FileAudio className="h-4 w-4" />;
    return <FileAudio className="h-4 w-4" />; // Default
  };

  const getAssetName = () => {
    return sourceAsset?.originalName || `Asset ${job.assetId}`;
  };

  const getResultDescription = () => {
    if (job.type === "noise-removal") {
      return "Clean audio track ready to use";
    }
    if (job.type === "subtitle-generation" && job.outputData?.subtitles) {
      const subtitles = job.outputData.subtitles;
      const duration = subtitles.length > 0 ? `${Math.floor(subtitles[subtitles.length - 1].endTime)}s` : "0s";
      return `${subtitles.length} subtitle segments generated (${duration} total)`;
    }
    return "Processing completed";
  };

  const canAddToTimeline = () => {
    return job.type === "noise-removal" && job.outputData?.resultAssetId;
  };

  const canAddSubtitlesToTimeline = () => {
    return job.type === "subtitle-generation" && job.outputData?.subtitles;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {getTypeIcon()}
            {getTypeName()}
          </CardTitle>
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        </div>

        {/* Source Asset Info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {getAssetIcon()}
          <span className="font-medium">{getAssetName()}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Result Description */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{getResultDescription()}</p>
            <p className="text-xs text-muted-foreground">
              Completed {formatDistanceToNow(new Date(job.completedAt!), { addSuffix: true })}
            </p>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex flex-col gap-2">
              {canAddToTimeline() && onAddToTimeline && (
                <Button size="sm" onClick={() => onAddToTimeline(job)} className="w-full justify-start">
                  <Plus className="h-3 w-3 mr-2" />
                  Add to Timeline
                </Button>
              )}

              {canAddSubtitlesToTimeline() && onAddToTimeline && (
                <Button size="sm" onClick={() => onAddToTimeline(job)} className="w-full justify-start">
                  <Plus className="h-3 w-3 mr-2" />
                  Add to Timeline
                </Button>
              )}
            </div>
          )}

          {/* Accordion for Job Output Details */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="output-details" className="border-0">
              <AccordionTrigger className="text-xs text-muted-foreground hover:no-underline py-2">
                View Output Details
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                {job.type === "subtitle-generation" && job.outputData?.subtitles && (
                  <div className="space-y-2">
                    <div className="max-h-32 overflow-y-auto bg-muted p-3 rounded text-xs space-y-2">
                      {job.outputData.subtitles.map((subtitle, index) => (
                        <div key={index} className="border-b border-muted-foreground/20 pb-1 last:border-b-0">
                          <div className="text-muted-foreground font-mono text-xs">
                            {Math.floor(subtitle.startTime)}s - {Math.floor(subtitle.endTime)}s
                          </div>
                          <div className="text-foreground">{subtitle.text}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {job.type === "noise-removal" && job.outputData?.resultAssetPath && (
                  <div className="space-y-2">
                    <div className="bg-muted p-3 rounded text-xs">
                      <div className="text-muted-foreground">Result Asset Path:</div>
                      <div className="text-foreground font-mono break-all">{job.outputData.resultAssetPath}</div>
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
}
