"use client";

export default function AudioVisualizer({ isPlaying, onToggle }) {
  return (
    <div className="fixed top-20 right-4 md:right-8 z-50">
      <button
        onClick={onToggle}
        className="flex items-center gap-3 px-4 py-2.5 rounded-full glass-panel hover:bg-white/10 active:scale-95 transition-all duration-300 shadow-lg cursor-pointer"
        title={isPlaying ? "Mute Ambient Music" : "Play Ambient Music"}
      >
        {/* Animated wave bars */}
        <div className="flex items-end gap-[3px] h-4 w-6">
          <div
            className={`w-[3px] bg-primary rounded-full transition-all duration-500 ${
              isPlaying ? "animate-wave-bar-1" : "h-1.5"
            }`}
          />
          <div
            className={`w-[3px] bg-secondary rounded-full transition-all duration-500 ${
              isPlaying ? "animate-wave-bar-2" : "h-3"
            }`}
          />
          <div
            className={`w-[3px] bg-tertiary rounded-full transition-all duration-500 ${
              isPlaying ? "animate-wave-bar-3" : "h-1"
            }`}
          />
          <div
            className={`w-[3px] bg-primary rounded-full transition-all duration-500 ${
              isPlaying ? "animate-wave-bar-4" : "h-2.5"
            }`}
          />
          <div
            className={`w-[3px] bg-secondary rounded-full transition-all duration-500 ${
              isPlaying ? "animate-wave-bar-5" : "h-1"
            }`}
          />
        </div>

        <span className="text-xs font-label-md text-white/90 select-none">
          {isPlaying ? "AMBIENT ON" : "SOUND OFF"}
        </span>

        <span className="material-symbols-outlined text-lg text-white/90">
          {isPlaying ? "volume_up" : "volume_off"}
        </span>
      </button>
    </div>
  );
}
