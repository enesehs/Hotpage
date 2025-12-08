
export const playPomodoroSound = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    const playNote = (frequency: number, startTime: number, duration: number, volume: number = 0.15) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, startTime);
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };
    
    const now = audioContext.currentTime;
    
    playNote(523.25, now, 1.5, 0.12);
    playNote(659.25, now + 0.3, 1.2, 0.10);
    playNote(783.99, now + 0.6, 1.0, 0.08);
    playNote(1046.50, now + 0.9, 1.5, 0.06);
    
    playNote(261.63, now, 2.0, 0.05);
    playNote(329.63, now + 0.3, 1.8, 0.04);
    
  } catch (error) {
    console.log('Pomodoro notification sound failed:', error);
  }
};

export const playSimpleChime = (): void => {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const now = audioContext.currentTime;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, now);
    
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 2);
    
    oscillator.start(now);
    oscillator.stop(now + 2);
  } catch (error) {
    console.log('Simple chime failed:', error);
  }
};
