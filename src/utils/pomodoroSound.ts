// Calm, soothing notification sound for Pomodoro timer
// Uses Web Audio API to generate a gentle chime sound

export const playPomodoroSound = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create a gentle, calming chime sequence
    const playNote = (frequency: number, startTime: number, duration: number, volume: number = 0.15) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Sine wave for soft, pleasant tone
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      // Gentle envelope - fade in and fade out
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    
    // Gentle ascending chime pattern (C5 - E5 - G5 - C6)
    // Like a soft meditation bell
    playNote(523.25, now, 1.5, 0.12);        // C5
    playNote(659.25, now + 0.3, 1.2, 0.10);  // E5
    playNote(783.99, now + 0.6, 1.0, 0.08);  // G5
    playNote(1046.50, now + 0.9, 1.5, 0.06); // C6 (higher, softer)
    
    // Add a subtle second layer with lower frequencies for warmth
    playNote(261.63, now, 2.0, 0.05);        // C4 (bass layer)
    playNote(329.63, now + 0.3, 1.8, 0.04); // E4
    
  } catch (error) {
    // Fallback: try to play a simple beep if Web Audio API fails
    console.log('Pomodoro notification sound failed:', error);
  }
};

// Alternative: Simple bell-like sound
export const playSimpleChime = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    // Single bell-like tone
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, now); // A5
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    oscillator.start(now);
    oscillator.stop(now + 2);
  } catch (error) {
    console.log('Simple chime failed:', error);
  }
};
