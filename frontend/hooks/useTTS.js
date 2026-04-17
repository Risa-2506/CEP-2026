import * as Speech from 'expo-speech';
import { useState, useCallback, useEffect } from 'react';

export function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const speak = useCallback(async (text) => {
    // Stop active speech before triggering new string
    Speech.stop();
    setIsSpeaking(true);

    Speech.speak(text, {
      language: 'en-US', // Enforced English
      rate: 0.85, 
      pitch: 1.0,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: (e) => {
        console.error("Speech Error:", e);
        setIsSpeaking(false);
      }
    });

  }, []);

  const stop = useCallback(() => {
    Speech.stop();
    setIsSpeaking(false);
  }, []);

  return { speak, stop, isSpeaking };
}
