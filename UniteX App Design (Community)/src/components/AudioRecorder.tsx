import { useState, useRef, useEffect } from "react";
import { Mic, X, Send, Pause, Play, Loader2 } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { toast } from "sonner";

interface AudioRecorderProps {
  onSend: (audioBlob: Blob, duration: number, waveform: number[]) => Promise<void>;
  onCancel: () => void;
  maxDuration?: number; // seconds
}

export default function AudioRecorder({ onSend, onCancel, maxDuration = 60 }: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string>("");
  const [waveform, setWaveform] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // For swipe to cancel gesture
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-100, 0], [0, 1]);
  const scale = useTransform(x, [-100, 0], [0.8, 1]);

  useEffect(() => {
    // Request microphone permission and start recording
    startRecording();

    return () => {
      cleanup();
    };
  }, []);

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } 
      });

      // Setup audio context for waveform visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start visualizing
      visualizeWaveform();

      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= maxDuration) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Microphone access denied. Please enable it in settings.');
      onCancel();
    }
  };

  const visualizeWaveform = () => {
    if (!analyserRef.current) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Sample 20 points for waveform visualization
      const samples = [];
      const step = Math.floor(bufferLength / 20);
      for (let i = 0; i < 20; i++) {
        const value = dataArray[i * step] / 255; // Normalize to 0-1
        samples.push(value);
      }
      
      setWaveform(samples);
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRecording(false);
  };

  const handlePauseResume = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      if (timerRef.current) clearInterval(timerRef.current);
    }
    setIsPaused(!isPaused);
  };

  const handlePlayPause = () => {
    if (!audioPlayerRef.current) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
    } else {
      audioPlayerRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSend = async () => {
    if (!audioBlob) return;

    setIsSending(true);
    try {
      await onSend(audioBlob, recordingTime, waveform);
      toast.success('Audio message sent!');
    } catch (error) {
      console.error('Error sending audio:', error);
      toast.error('Failed to send audio message');
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    if (x.get() < -50) {
      // Swipe detected
      cleanup();
      onCancel();
    } else {
      // Reset position
      x.set(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto dark:bg-zinc-900 light:bg-white border-t dark:border-zinc-800 light:border-gray-200 p-4 z-50"
    >
      {/* Recording Mode */}
      {isRecording && (
        <div className="space-y-4">
          {/* Timer and Cancel */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                stopRecording();
                cleanup();
                onCancel();
              }}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-lg font-mono dark:text-white light:text-black">
                {formatTime(recordingTime)}
              </span>
            </div>
            <div className="w-6" /> {/* Spacer */}
          </div>

          {/* Waveform Visualization */}
          <div className="flex items-center justify-center gap-1 h-16">
            {waveform.map((value, index) => (
              <motion.div
                key={index}
                className="w-1 dark:bg-blue-500 light:bg-red-600 rounded-full"
                animate={{
                  height: `${Math.max(value * 100, 4)}%`
                }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Swipe to Cancel Hint */}
          <motion.div
            className="text-center text-sm text-muted-foreground"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ← Swipe left to cancel
          </motion.div>

          {/* Stop Recording Button */}
          <button
            onClick={stopRecording}
            className="w-full py-3 dark:bg-blue-500 light:bg-red-600 text-white rounded-full font-medium hover:opacity-90"
          >
            Stop Recording
          </button>
        </div>
      )}

      {/* Preview Mode */}
      {!isRecording && audioURL && (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">Audio Preview</p>
            <p className="text-lg font-mono dark:text-white light:text-black">
              {formatTime(recordingTime)}
            </p>
          </div>

          {/* Waveform Static Preview */}
          <div className="flex items-center justify-center gap-1 h-12 dark:bg-zinc-800 light:bg-gray-100 rounded-lg p-2">
            {waveform.map((value, index) => (
              <div
                key={index}
                className="w-1 dark:bg-blue-400 light:bg-red-500 rounded-full"
                style={{ height: `${Math.max(value * 100, 8)}%` }}
              />
            ))}
          </div>

          {/* Audio Player (hidden) */}
          <audio
            ref={audioPlayerRef}
            src={audioURL}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              setPlaybackTime(0);
            }}
            onTimeUpdate={(e) => {
              const audio = e.target as HTMLAudioElement;
              setPlaybackTime(Math.floor(audio.currentTime));
            }}
            className="hidden"
          />

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePlayPause}
              className="w-12 h-12 dark:bg-zinc-800 light:bg-gray-200 rounded-full flex items-center justify-center hover:opacity-80"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 dark:text-white light:text-black" />
              ) : (
                <Play className="w-5 h-5 dark:text-white light:text-black" />
              )}
            </button>
            <div className="flex-1 text-sm dark:text-zinc-400 light:text-gray-600">
              {isPlaying ? formatTime(playbackTime) : "Tap to preview"}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => {
                cleanup();
                onCancel();
              }}
              className="flex-1 py-3 dark:bg-zinc-800 light:bg-gray-200 dark:text-white light:text-black rounded-full font-medium hover:opacity-80"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending}
              className="flex-1 py-3 dark:bg-blue-500 light:bg-red-600 text-white rounded-full font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
