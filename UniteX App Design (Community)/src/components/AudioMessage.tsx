import { useState, useRef, useEffect } from "react";
import { Play, Pause, Loader2, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface AudioMessageProps {
  audioUrl: string;
  duration: number;
  waveform?: number[];
  isSent: boolean;
  onError?: () => void;
}

export default function AudioMessage({ 
  audioUrl, 
  duration, 
  waveform = [], 
  isSent,
  onError 
}: AudioMessageProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [audioLoaded, setAudioLoaded] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Preload audio
    const audio = new Audio(audioUrl);
    audio.preload = 'metadata';
    
    audio.addEventListener('loadedmetadata', () => {
      setIsLoading(false);
      setAudioLoaded(true);
    });

    audio.addEventListener('error', () => {
      setIsLoading(false);
      setError(true);
      onError?.();
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setCurrentTime(0);
    });

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      audio.remove();
    };
  }, [audioUrl]);

  const togglePlayPause = async () => {
    if (!audioRef.current || !audioLoaded) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Error playing audio:', err);
      setError(true);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressBarRef.current || !audioLoaded) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const retry = () => {
    setError(false);
    setIsLoading(true);
    if (audioRef.current) {
      audioRef.current.load();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Generate default waveform if not provided
  const displayWaveform = waveform.length > 0 ? waveform : Array(20).fill(0).map(() => Math.random() * 0.7 + 0.3);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`
        ${isSent 
          ? 'dark:bg-blue-500/10 light:bg-red-50' 
          : 'dark:bg-zinc-800 light:bg-gray-200'
        }
        rounded-2xl p-3 min-w-[200px] max-w-[280px]
      `}
    >
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayPause}
          disabled={isLoading || error}
          className={`
            w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
            ${isSent 
              ? 'dark:bg-blue-500 light:bg-red-600' 
              : 'dark:bg-zinc-700 light:bg-gray-300'
            }
            text-white hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed
            transition-opacity
          `}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : error ? (
            <RotateCcw className="w-4 h-4" onClick={retry} />
          ) : isPlaying ? (
            <Pause className="w-4 h-4 ml-0.5" />
          ) : (
            <Play className="w-4 h-4 ml-0.5" />
          )}
        </button>

        {/* Waveform and Progress */}
        <div className="flex-1 space-y-2">
          {/* Waveform Visualization */}
          <div 
            ref={progressBarRef}
            onClick={handleSeek}
            className="flex items-center justify-center gap-0.5 h-8 cursor-pointer"
          >
            {displayWaveform.map((value, index) => {
              const barProgress = (index / displayWaveform.length) * 100;
              const isActive = barProgress <= progress;
              
              return (
                <div
                  key={index}
                  className={`
                    w-1 rounded-full transition-all
                    ${isActive
                      ? isSent
                        ? 'dark:bg-blue-500 light:bg-red-600'
                        : 'dark:bg-zinc-400 light:bg-gray-500'
                      : isSent
                        ? 'dark:bg-blue-500/30 light:bg-red-300'
                        : 'dark:bg-zinc-600 light:bg-gray-400'
                    }
                  `}
                  style={{ 
                    height: `${Math.max(value * 100, 20)}%`,
                  }}
                />
              );
            })}
          </div>

          {/* Time Display */}
          <div className="flex items-center justify-between text-xs">
            <span className={`font-mono ${isSent ? 'dark:text-blue-200 light:text-red-700' : 'dark:text-zinc-400 light:text-gray-600'}`}>
              {formatTime(currentTime)}
            </span>
            <span className={`font-mono ${isSent ? 'dark:text-blue-200 light:text-red-700' : 'dark:text-zinc-400 light:text-gray-600'}`}>
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="mt-2 text-xs text-red-500 text-center">
          Failed to load audio
          <button onClick={retry} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}
    </motion.div>
  );
}
