"use client";

import { useState } from "react";
import PortalButton from "@/components/portal/shared/PortalButton";

interface StatusUpdateEditorProps {
  onSave: (title: string, body: string) => void;
  onCancel: () => void;
}

export default function StatusUpdateEditor({ onSave, onCancel }: StatusUpdateEditorProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [preview, setPreview] = useState(false);

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Update title..." className="mb-3 w-full rounded bg-white/5 px-3 py-2 text-[15px] font-medium text-white outline-none placeholder:text-[#4B5563] focus:ring-1 focus:ring-champagne/50" />
      <div className="mb-3 flex gap-2">
        <button onClick={() => setPreview(false)} className={`text-[12px] ${!preview ? "text-white" : "text-[#86868B]"}`}>Write</button>
        <button onClick={() => setPreview(true)} className={`text-[12px] ${preview ? "text-white" : "text-[#86868B]"}`}>Preview</button>
      </div>
      {preview ? (
        <div className="min-h-[120px] rounded bg-white/5 p-4 text-[14px] leading-relaxed text-[#e5e5e5] whitespace-pre-wrap">{body || "Nothing to preview."}</div>
      ) : (
        <textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your update... (plain text)" rows={6} className="w-full resize-y rounded bg-white/5 px-3 py-2 text-[14px] leading-relaxed text-white outline-none placeholder:text-[#4B5563] focus:ring-1 focus:ring-champagne/50" />
      )}
      <div className="mt-4 flex gap-2">
        <PortalButton variant="accent" onClick={() => { if (title.trim() && body.trim()) onSave(title.trim(), body.trim()); }} disabled={!title.trim() || !body.trim()}>Publish Update</PortalButton>
        <PortalButton onClick={onCancel}>Cancel</PortalButton>
      </div>
    </div>
  );
}
