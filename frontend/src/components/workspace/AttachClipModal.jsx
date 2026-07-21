import React, { useState, useRef } from "react";
import { Upload, FileVideo, X, Check, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

export default function AttachClipModal({ isOpen, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "42.5 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const handleStartUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onUploadSuccess(selectedFile.name, formatFileSize(selectedFile.size));
            setIsUploading(false);
            setSelectedFile(null);
            setProgress(0);
            onClose();
          }, 300);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100000] flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
      <div className="bg-[#12131A] border border-white/10 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-5 text-left relative">
        
        <div className="flex justify-between items-center border-b border-white/5 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Upload className="w-4 h-4 text-[#22C55E]" /> Attach Working Clip to Task
          </h3>
          <button
            onClick={() => {
              if (!isUploading) onClose();
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!selectedFile ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 hover:border-[#22C55E]/40 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-2 group bg-[#1A1B23]/50"
          >
            <FileVideo className="w-8 h-8 text-slate-400 group-hover:text-[#22C55E] mx-auto transition-colors" />
            <p className="text-xs font-bold text-slate-200">Click to browse video file</p>
            <p className="text-[10px] text-slate-500 font-mono">Supports .mp4, .mov, .m4v, .prores</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#1A1B23] border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 truncate">
                <FileVideo className="w-6 h-6 text-[#22C55E] shrink-0" />
                <div className="truncate">
                  <p className="font-bold text-white truncate">{selectedFile.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{formatFileSize(selectedFile.size)}</p>
                </div>
              </div>
              {!isUploading && (
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-slate-400 hover:text-red-400 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {isUploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin text-[#22C55E]" /> Uploading clip...
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

            <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
              <Button
                type="button"
                variant="outline"
                disabled={isUploading}
                onClick={() => {
                  setSelectedFile(null);
                  onClose();
                }}
                className="text-xs border-white/10 bg-[#1A1B23] text-slate-300"
              >
                Cancel
              </Button>
              <Button
                onClick={handleStartUpload}
                disabled={isUploading}
                className="bg-[#22C55E] text-[#090A0F] font-bold text-xs px-5 hover:bg-[#22C55E]/90 flex items-center gap-1.5"
              >
                {isUploading ? "Uploading..." : "Confirm & Attach Clip"}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
