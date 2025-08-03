"use client";

import React from "react";
import { VideoEditor } from "./_components/video-editor";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default function EditPage({ params }: EditPageProps) {
  const { id } = React.use(params);

  // return
  return (
    <section
      className="grow h-full flex flex-col overflow-hidden"
      style={{ height: "calc(100vh - 4rem)" }}
      // turn off scroll
    >
      <VideoEditor projectId={id} />;
    </section>
  );
}
