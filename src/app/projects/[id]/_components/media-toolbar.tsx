"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Type, Plus } from "lucide-react";
import { useTimelineStore } from "@/stores/timeline-store";
import { ISubtitleStyle } from "@/types/timeline";

export const MediaToolbar = () => {
  const { selectedClip, updateClipProperties, addTextClip } = useTimelineStore();
  const [newText, setNewText] = useState("Sample Text");

  const isTextClipSelected = selectedClip?.type === "text";

  const handleAddText = () => {
    if (newText.trim()) {
      const defaultStyle: ISubtitleStyle = {
        fontSize: 24,
        fontFamily: "Arial",
        color: "#000000",
        backgroundColor: "#ffffff",
        position: "center",
        alignment: "center",
        outline: false,
        shadow: false,
      };
      addTextClip(newText, defaultStyle, 3);
      setNewText("Sample Text"); // Reset the input
    }
  };

  const handleStyleChange = (property: keyof ISubtitleStyle, value: string | number | boolean) => {
    if (!selectedClip || selectedClip.type !== "text" || !selectedClip.style) return;

    const updatedStyle = {
      ...selectedClip.style,
      [property]: value,
    };

    updateClipProperties(selectedClip.id, {
      style: updatedStyle,
    });
  };

  const handleTextChange = (newTextValue: string) => {
    if (!selectedClip || selectedClip.type !== "text") return;

    updateClipProperties(selectedClip.id, {
      text: newTextValue,
    });
  };

  return (
    <div className="bg-card border-b border-border p-2 flex items-center gap-3 flex-wrap w-full text-xs">
      {/* Add Text Section */}
      <div className="flex items-center gap-2">
        <Type className="w-3 h-3 text-muted-foreground" />
        <Input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            e.stopPropagation(); // Prevent timeline shortcuts
            if (e.key === "Enter") {
              handleAddText();
            }
          }}
          placeholder="Enter text..."
          className="w-28 h-7 text-xs"
        />
        <Button size="sm" onClick={handleAddText} className="h-7 text-xs px-2">
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>

      {/* Text Editing Controls (shown when text clip is selected) */}
      {isTextClipSelected && selectedClip.style && (
        <>
          <div className="w-px h-5 bg-border" />

          {/* Font Size */}
          <div className="flex items-center gap-1">
            <Label className="text-xs">Size:</Label>
            <div className="flex items-center gap-1 w-20">
              <Slider
                value={[selectedClip.style.fontSize]}
                onValueChange={([value]) => handleStyleChange("fontSize", value)}
                min={8}
                max={48}
                step={1}
                className="flex-1 h-4"
              />
              <span className="text-xs w-5 text-center text-muted-foreground">{selectedClip.style.fontSize}</span>
            </div>
          </div>

          {/* Text Color */}
          <div className="flex items-center gap-1">
            <Label className="text-xs">Color:</Label>
            <input
              type="color"
              value={selectedClip.style.color}
              onChange={(e) => handleStyleChange("color", e.target.value)}
              className="w-6 h-6 rounded border border-border cursor-pointer"
            />
          </div>

          {/* Background Color */}
          <div className="flex items-center gap-1">
            <Label className="text-xs">BG:</Label>
            <input
              type="color"
              value={selectedClip.style.backgroundColor || "#000000"}
              onChange={(e) => handleStyleChange("backgroundColor", e.target.value)}
              className="w-6 h-6 rounded border border-border cursor-pointer"
            />
          </div>

          {/* Text Content for Selected Clip */}
          <div className="flex items-center gap-1">
            <Label className="text-xs">Text:</Label>
            <Input
              value={selectedClip.text || ""}
              onChange={(e) => {
                e.stopPropagation();
                handleTextChange(e.target.value);
              }}
              className="w-28 h-7 text-xs"
            />
          </div>
        </>
      )}
    </div>
  );
};
