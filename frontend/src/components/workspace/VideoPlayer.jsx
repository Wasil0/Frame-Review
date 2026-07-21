import React, { useState, useRef } from "react";
import { Play, Pause, RotateCcw, RotateCw, Volume2, VolumeX, Maximize2, Sparkles, MessageSquare } from "lucide-react";
import { cn } from "../../utils";

export default function VideoPlayer({
  currentTime,
  duration = 270,
  isPlaying,
  onTogglePlay,
  onSeek,
  markers = [],
  selectedMarkerId,
  onMarkerClick
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState(null);
  const progressBarRef = useRef(null);

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Handle clicking on progress bar to seek
  const handleProgressBarClick = (e) => {
    if (!progressBarRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = Math.round(percentage * duration);
    onSeek(newTime);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col h-full justify-between select-none">
      
      {/* VIDEO STAGE CONTAINER */}
      <div className="relative flex-1 bg-black rounded-xl overflow-hidden border border-white/5 flex items-center justify-center group shadow-2xl">
        
        {/* Mock Animated Video Screen Surface */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0C12] via-[#12131A] to-[#1A1B23] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-[#22C55E]/30 flex items-center justify-center mb-4 shadow-xl">
            {isPlaying ? (
              <Sparkles className="w-10 h-10 text-[#22C55E] animate-pulse" />
            ) : (
              <Play className="w-10 h-10 text-[#22C55E] ml-1" />
            )}
          </div>
          <p className="text-sm font-bold text-white tracking-wide">Aether Tech Commercial Cut V1 (4K Masters)</p>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Frame {Math.floor(currentTime * 24)} / {Math.floor(duration * 24)} (23.98 fps ProRes 422 HQ)
          </p>

          {!isPlaying && (
            <button
              onClick={onTogglePlay}
              className="mt-4 px-4 py-2 rounded-xl bg-[#22C55E] text-[#090A0F] font-bold text-xs hover:bg-[#22C55E]/90 transition-all shadow-lg shadow-emerald-500/20"
            >
              Play Review Stream
            </button>
          )}
        </div>

        {/* Top Video Overlay Badge */}
        <div className="absolute top-3 left-3 bg-[#090A0F]/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-ping" />
          FRAME-ACCURATE REVIEW MODE
        </div>
      </div>

      {/* TIMELINE & PLAYER CONTROLS SECTION */}
      <div className="mt-4 space-y-3 bg-[#1A1B23]/60 border border-white/5 rounded-xl p-3">
        
        {/* Scrubbable Timeline Track with Markers */}
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          className="relative h-3 bg-slate-800/80 rounded-full cursor-pointer group flex items-center"
        >
          {/* Progress Fill */}
          <div
            className="h-full bg-[#22C55E] rounded-full relative transition-all duration-75"
            style={{ width: `${progressPercent}%` }}
          />

          {/* Timestamp Markers (Green Dots for Comments) */}
          {markers.map((marker) => {
            const markerPercent = duration > 0 ? (marker.timestamp / duration) * 100 : 0;
            const isSelected = selectedMarkerId === marker.id;
            const isHovered = hoveredMarker?.id === marker.id;

            return (
              <div
                key={marker.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkerClick(marker.id, marker.timestamp);
                }}
                onMouseEnter={() => setHoveredMarker(marker)}
                onMouseLeave={() => setHoveredMarker(null)}
                style={{ left: `${markerPercent}%` }}
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full cursor-pointer transition-all z-20",
                  isSelected
                    ? "w-4 h-4 bg-white border-2 border-[#22C55E] shadow-lg shadow-emerald-500/50 scale-125"
                    : "w-3 h-3 bg-[#22C55E] border-2 border-[#090A0F] hover:scale-125"
                )}
              >
                {/* Tooltip Preview on Hover */}
                {isHovered && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#12131A] border border-white/15 text-white text-[11px] p-2 rounded-xl shadow-2xl pointer-events-none whitespace-nowrap z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <MessageSquare className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                    <div>
                      <span className="font-mono text-emerald-400 font-bold mr-1.5">[{marker.formattedTime}]</span>
                      <span className="text-slate-200 font-semibold">{marker.author}:</span>
                      <span className="text-slate-400 ml-1 truncate max-w-[200px] inline-block align-bottom">{marker.text}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Control Buttons Bar */}
        <div className="flex items-center justify-between text-xs text-slate-300">
          
          <div className="flex items-center gap-3">
            <button
              onClick={onTogglePlay}
              className="p-2 rounded-lg bg-[#22C55E]/10 text-[#22C55E] hover:bg-[#22C55E]/20 transition-colors"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>

            <button
              onClick={() => onSeek(Math.max(0, currentTime - 5))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Rewind 5s"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onSeek(Math.min(duration, currentTime + 5))}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Forward 5s"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            {/* Time Code Display */}
            <span className="font-mono text-xs text-slate-200 font-bold ml-2">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            <button
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
