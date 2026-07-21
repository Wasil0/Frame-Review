import React, { useState, useRef } from "react";
import { Upload, FileVideo, CheckCircle2, Check, X, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils";

export default function PushVersionModal({
  isOpen,
  onClose,
  tasks = [],
  nextVersionTag = "V2",
  onConfirmPush
}) {
  const [optionMode, setOptionMode] = useState("editor_clip"); // "editor_clip" | "manual_upload"
  const [selectedClip, setSelectedClip] = useState(null);
  const [manualFile, setManualFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // Extract all clip files attached to resolved tasks
  const availableClips = [];
  tasks.forEach((t) => {
    if (t.internalFiles && t.internalFiles.length > 0) {
      t.internalFiles.forEach((f) => {
        availableClips.push({
          ...f,
          taskTitle: t.title,
          taskTime: t.formattedTime
        });
      });
    }
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return "45.2 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleManualFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setManualFile(file);
  };

  const activeMasterFilename =
    optionMode === "editor_clip"
      ? selectedClip?.name
      : manualFile?.name;

  const canConfirm = Boolean(activeMasterFilename);

  const handleConfirmPush = () => {
    if (!canConfirm) return;

    if (optionMode === "manual_upload" && manualFile) {
      setIsUploading(true);
      setProgress(15);
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              onConfirmPush(manualFile.name, nextVersionTag);
              setIsUploading(false);
              onClose();
            }, 300);
            return 100;
          }
          return prev + 25;
        });
      }, 250);
    } else {
      onConfirmPush(selectedClip.name, nextVersionTag);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 text-left relative">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#22C55E]" /> Push New Master Version ({nextVersionTag})
          </h3>
          <button
            onClick={() => {
              if (!isUploading) onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option Tabs: Pick Editor Clip vs Upload New Master */}
        <div className="flex gap-2 p-1 bg-[#1A1B23] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setOptionMode("editor_clip")}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5",
              optionMode === "editor_clip"
                ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-bold"
                : "text-slate-400 hover:text-white"
            )}
          >
            Option A: Select Editor Clip ({availableClips.length})
          </button>
          <button
            type="button"
            onClick={() => setOptionMode("manual_upload")}
            className={cn(
              "flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5",
              optionMode === "manual_upload"
                ? "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30 font-bold"
                : "text-slate-400 hover:text-white"
            )}
          >
            Option B: Direct File Upload
          </button>
        </div>

        {/* OPTION A: LIST EDITOR CLIPS */}
        {optionMode === "editor_clip" && (
          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {availableClips.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs italic bg-[#1A1B23]/40 rounded-xl border border-white/5">
                No working clips attached to resolved tasks yet. Switch to Option B to upload directly.
              </div>
            ) : (
              availableClips.map((clip) => {
                const isSelected = selectedClip?.id === clip.id;
                return (
                  <div
                    key={clip.id}
                    onClick={() => setSelectedClip(clip)}
                    className={cn(
                      "p-3 rounded-xl border transition-all text-xs cursor-pointer flex items-center justify-between",
                      isSelected
                        ? "bg-[#1A1B23] border-[#22C55E] shadow-md shadow-emerald-500/10"
                        : "bg-[#12131A] border-white/5 hover:border-white/15"
                    )}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <FileVideo className="w-5 h-5 text-[#22C55E] shrink-0" />
                      <div className="truncate">
                        <p className="font-bold text-white truncate">{clip.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {clip.uploader} • {clip.size}
                        </p>
                      </div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#22C55E] shrink-0 ml-2" />}
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* OPTION B: MANUAL FILE UPLOAD */}
        {optionMode === "manual_upload" && (
          <div className="space-y-3 text-xs">
            {!manualFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-[#22C55E]/40 rounded-xl p-6 text-center cursor-pointer transition-colors space-y-2 bg-[#1A1B23]/50"
              >
                <FileVideo className="w-7 h-7 text-slate-400 mx-auto" />
                <p className="font-bold text-slate-200">Click to select new master export</p>
                <p className="text-[10px] text-slate-500 font-mono">ProRes 422 HQ / 4K H.264</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*"
                  onChange={handleManualFileChange}
                  className="hidden"
                />
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#1A1B23] border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3 truncate">
                  <FileVideo className="w-6 h-6 text-[#22C55E] shrink-0" />
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{manualFile.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatFileSize(manualFile.size)}</p>
                  </div>
                </div>
                {!isUploading && (
                  <button onClick={() => setManualFile(null)} className="text-slate-400 hover:text-red-400 p-1">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* SUMMARY CONFIRMATION STEP */}
        {activeMasterFilename && (
          <div className="p-3.5 rounded-xl bg-[#1A1B23] border border-white/5 space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-slate-300 font-semibold">
              <span>Master File Selected:</span>
              <span className="font-mono text-[#22C55E] font-bold truncate max-w-[180px]">{activeMasterFilename}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 text-[11px]">
              <span>New Public Version:</span>
              <span className="font-mono font-bold text-white">{nextVersionTag}</span>
            </div>
            <p className="text-[10px] text-slate-500 font-mono pt-1 border-t border-white/5">
              ⚠️ Pushing {nextVersionTag} will lock previous version comments and publish the new stream to the client portal.
            </p>
          </div>
        )}

        {/* Progress Bar when uploading */}
        {isUploading && (
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center text-[10px] font-mono">
              <span className="text-slate-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin text-[#22C55E]" /> Uploading master file...
              </span>
              <span className="text-[#22C55E] font-bold">{progress}%</span>
            </div>
            <div className="w-full bg-[#090A0F] h-2 rounded-full overflow-hidden border border-white/5">
              <div
                className="bg-[#22C55E] h-full rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={onClose}
            className="text-xs border-white/10 bg-[#1A1B23] text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmPush}
            disabled={!canConfirm || isUploading}
            className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-5 hover:bg-[#22C55E]/90 disabled:opacity-50 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" /> Confirm & Push {nextVersionTag}
          </Button>
        </div>

      </div>
    </div>
  );
}
