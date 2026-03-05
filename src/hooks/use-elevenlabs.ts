import { useState, useRef, useCallback } from "react";

interface UseElevenLabsReturn {
  readonly speak: (text: string, voiceId?: string) => Promise<void>;
  readonly isPlaying: boolean;
  readonly stop: () => void;
}

export function useElevenLabs(): UseElevenLabsReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const urlRef = useRef<string | null>(null);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (urlRef.current) {
      URL.revokeObjectURL(urlRef.current);
      urlRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const speak = useCallback(
    async (text: string, voiceId?: string): Promise<void> => {
      // Stop any currently playing audio
      stop();

      try {
        const res = await fetch("/api/elevenlabs/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, voiceId }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: "TTS request failed" }));
          throw new Error(errorData.error ?? `TTS error: ${res.status}`);
        }

        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        urlRef.current = url;

        const audio = new Audio(url);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          urlRef.current = null;
          audioRef.current = null;
        };

        audio.onerror = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(url);
          urlRef.current = null;
          audioRef.current = null;
        };

        setIsPlaying(true);
        await audio.play();
      } catch (err) {
        setIsPlaying(false);
        console.error("ElevenLabs TTS error:", err);
      }
    },
    [stop],
  );

  return { speak, isPlaying, stop };
}
