"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
}

export default function FileUploadZone({ onFilesSelected }: FileUploadZoneProps) {
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) onFilesSelected(files);
  }, [onFilesSelected]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={cn("mt-3 rounded-xl border-2 border-dashed px-8 py-8 text-center transition-colors", dragging ? "border-champagne/40 bg-champagne/5" : "border-white/10 hover:border-white/20")}
    >
      <div className="mb-2 text-2xl text-[#86868B]">⇧</div>
      <div className="text-[14px] text-[#86868B]">
        Drop files here or{" "}
        <label className="cursor-pointer text-champagne hover:underline">
          browse
          <input type="file" className="hidden" multiple onChange={(e) => { const files = Array.from(e.target.files ?? []); if (files.length > 0) onFilesSelected(files); }} />
        </label>
      </div>
      <div className="mt-1 text-[11px] text-[#4B5563]">PDF, XLSX, PPTX, DOCX — up to 50 MB per file</div>
    </div>
  );
}
