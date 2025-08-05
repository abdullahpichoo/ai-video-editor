"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Volume2, Subtitles, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { IAIJob } from "@/types/ai-job.types";
import { formatDistanceToNow } from "date-fns";

interface JobStatusCardProps {
  job: IAIJob;
  onRetry?: (jobId: string) => void;
  showRetry?: boolean;
}

export function JobStatusCard({ job, onRetry, showRetry = true }: JobStatusCardProps) {
  const getStatusIcon = () => {
    switch (job.status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "processing":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (job.status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const getTypeIcon = () => {
    return job.type === "noise-removal" ? <Volume2 className="h-4 w-4" /> : <Subtitles className="h-4 w-4" />;
  };

  const getTypeName = () => {
    return job.type === "noise-removal" ? "Noise Removal" : "Subtitle Generation";
  };

  const getTimeDisplay = () => {
    if (job.completedAt) {
      return `Completed ${formatDistanceToNow(new Date(job.completedAt), { addSuffix: true })}`;
    }
    if (job.startedAt) {
      return `Started ${formatDistanceToNow(new Date(job.startedAt), { addSuffix: true })}`;
    }
    return `Created ${formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}`;
  };

  const getEstimatedTimeRemaining = () => {
    if (job.status !== "processing" || !job.estimatedDuration) return null;

    const elapsed = job.startedAt ? (Date.now() - new Date(job.startedAt).getTime()) / 1000 : 0;
    const remaining = Math.max(0, job.estimatedDuration - elapsed);

    if (remaining < 60) {
      return `~${Math.round(remaining)}s remaining`;
    }
    return `~${Math.round(remaining / 60)}m remaining`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            {getTypeIcon()}
            {getTypeName()}
          </CardTitle>
          <Badge variant="outline" className={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1 capitalize">{job.status}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Progress Bar for Processing Jobs */}
          {job.status === "processing" && (
            <div className="space-y-1">
              <Progress value={job.progress} className="w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{job.progress}% complete</span>
                <span>{getEstimatedTimeRemaining()}</span>
              </div>
            </div>
          )}

          {/* Error Message for Failed Jobs */}
          {job.status === "failed" && job.errorMessage && (
            <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">{job.errorMessage}</div>
          )}

          {/* Job Details */}
          <div className="text-xs text-muted-foreground">{getTimeDisplay()}</div>

          {/* Retry Button for Failed Jobs */}
          {job.status === "failed" && showRetry && onRetry && (
            <Button size="sm" variant="outline" onClick={() => onRetry(job.jobId)} className="w-full">
              Retry Job
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
