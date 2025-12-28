import { useState, useEffect, useCallback } from 'react';

interface TypingTestState {
  started: boolean;
  startTime: number | null;
  elapsedMs: number;
  cursor: number;
  input: string;
  errors: number;
  totalTyped: number;
  finished: boolean;
}

interface TypingTestStats {
  wpm: number;
  accuracy: number;
  timeElapsed: string;
}

export interface CharacterStatus {
  char: string;
  status: 'pending' | 'correct' | 'incorrect' | 'current';
}

export function useTypingTest(
  targetText: string,
  mode: 'Timed (60s)' | 'Passage',
  onComplete?: (stats: TypingTestStats) => void
) {
  const [state, setState] = useState<TypingTestState>({
    started: false,
    startTime: null,
    elapsedMs: 0,
    cursor: 0,
    input: '',
    errors: 0,
    totalTyped: 0,
    finished: false,
  });

  // Timer effect for timed mode and elapsed time tracking
  useEffect(() => {
    if (!state.started || state.finished) return;

    const interval = setInterval(() => {
      setState(prev => {
        const elapsed = Date.now() - (prev.startTime || Date.now());
        
        // Check if time limit reached in timed mode
        if (mode === 'Timed (60s)' && elapsed >= 60000) {
          return { ...prev, elapsedMs: elapsed, finished: true };
        }
        
        return { ...prev, elapsedMs: elapsed };
      });
    }, 100);

    return () => clearInterval(interval);
  }, [state.started, state.finished, mode]);

  // Calculate stats when test finishes
  useEffect(() => {
    if (state.finished && onComplete) {
      const stats = calculateStats(state, targetText);
      onComplete(stats);
    }
  }, [state.finished, onComplete, targetText]);

  const startTest = useCallback(() => {
    setState({
      started: true,
      startTime: Date.now(),
      elapsedMs: 0,
      cursor: 0,
      input: '',
      errors: 0,
      totalTyped: 0,
      finished: false,
    });
  }, []);

  const resetTest = useCallback(() => {
    setState({
      started: false,
      startTime: null,
      elapsedMs: 0,
      cursor: 0,
      input: '',
      errors: 0,
      totalTyped: 0,
      finished: false,
    });
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (!state.started || state.finished) return;

    setState(prev => {
      // Handle backspace
      if (key === 'Backspace') {
        if (prev.cursor > 0) {
          const newInput = prev.input.slice(0, -1);
          return {
            ...prev,
            input: newInput,
            cursor: prev.cursor - 1,
          };
        }
        return prev;
      }

      // Ignore special keys
      if (key.length > 1) return prev;

      const expectedChar = targetText[prev.cursor];
      const isCorrect = key === expectedChar;
      const newInput = prev.input + key;
      const newCursor = prev.cursor + 1;
      
      // Check if test is complete in passage mode
      const isComplete = mode === 'Passage' && newCursor >= targetText.length;

      return {
        ...prev,
        input: newInput,
        cursor: newCursor,
        errors: isCorrect ? prev.errors : prev.errors + 1,
        totalTyped: prev.totalTyped + 1,
        finished: isComplete,
      };
    });
  }, [state.started, state.finished, targetText, mode]);

  // Get character statuses for rendering
  const getCharacterStatuses = useCallback((): CharacterStatus[] => {
    return targetText.split('').map((char, index) => {
      if (index < state.cursor) {
        const typedChar = state.input[index];
        return {
          char,
          status: typedChar === char ? 'correct' : 'incorrect',
        };
      } else if (index === state.cursor) {
        return {
          char,
          status: 'current',
        };
      } else {
        return {
          char,
          status: 'pending',
        };
      }
    });
  }, [targetText, state.cursor, state.input]);

  const currentStats = calculateCurrentStats(state, targetText);

  return {
    state,
    startTest,
    resetTest,
    handleKeyPress,
    getCharacterStatuses,
    currentStats,
  };
}

function calculateStats(
  state: TypingTestState,
  targetText: string
): TypingTestStats {
  const minutes = state.elapsedMs / 60000;
  const words = state.cursor / 5; // Standard: 5 characters = 1 word
  const wpm = Math.round(words / minutes);
  
  const correctChars = state.totalTyped - state.errors;
  const accuracy = state.totalTyped > 0 
    ? Math.round((correctChars / state.totalTyped) * 100)
    : 100;

  const seconds = Math.floor(state.elapsedMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeElapsed = `${mins}:${secs.toString().padStart(2, '0')}`;

  return { wpm, accuracy, timeElapsed };
}

function calculateCurrentStats(
  state: TypingTestState,
  targetText: string
): TypingTestStats {
  if (!state.started || state.elapsedMs === 0) {
    return { wpm: 0, accuracy: 100, timeElapsed: '0:00' };
  }

  const minutes = state.elapsedMs / 60000;
  const words = state.cursor / 5;
  const wpm = Math.round(words / minutes) || 0;
  
  const correctChars = state.totalTyped - state.errors;
  const accuracy = state.totalTyped > 0 
    ? Math.round((correctChars / state.totalTyped) * 100)
    : 100;

  const seconds = Math.floor(state.elapsedMs / 1000);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const timeElapsed = `${mins}:${secs.toString().padStart(2, '0')}`;

  return { wpm, accuracy, timeElapsed };
}

// CSS classes for character states
export const characterClasses = {
  pending: 'text-neutral-400',
  correct: 'text-green-400',
  incorrect: 'text-red-400 bg-red-900/30',
  current: 'text-white bg-blue-500/30 border-l-2 border-blue-500',
};