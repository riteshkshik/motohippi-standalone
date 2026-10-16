let lastPlayedTimestamp = 0;
let isAudioUnlocked = false;

// Preload and keep an audio cache instance
let cachedAudio: HTMLAudioElement | null = null;

function getCachedAudio(): HTMLAudioElement | null {
  if (typeof window === 'undefined') return null;
  if (!cachedAudio) {
    try {
      cachedAudio = new Audio('/notification_sound.mp3');
      cachedAudio.preload = 'auto';
      cachedAudio.volume = 1.0;
    } catch (e) {
      console.warn('Could not initialize cached notification audio:', e);
    }
  }
  return cachedAudio;
}

// Unlock audio playback on first user gesture across mobile and desktop browsers
export function setupAudioAutoplayUnlock() {
  if (typeof window === 'undefined' || isAudioUnlocked) return;

  const unlock = () => {
    try {
      const audio = getCachedAudio() || new Audio('/notification_sound.mp3');
      audio.volume = 0.01;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1.0;
            isAudioUnlocked = true;
            cleanup();
          })
          .catch(() => {
            // Keep listeners if interaction was rejected
          });
      }
    } catch {
      // Ignore
    }
  };

  const cleanup = () => {
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('keydown', unlock);
  };

  window.addEventListener('click', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
}

export function playNotificationSound() {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  // Debounce rapid bursts within 800ms
  if (now - lastPlayedTimestamp < 800) {
    return;
  }
  lastPlayedTimestamp = now;

  try {
    // Creating a fresh audio instance guarantees that multiple notifications
    // can trigger without interrupting or getting stuck in a paused state.
    const audio = new Audio('/notification_sound.mp3');
    audio.volume = 1.0;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        // Autoplay may be restricted until user has tapped or clicked
        console.debug('Notification sound playback was blocked by browser policy:', err);
      });
    }
  } catch (e) {
    console.debug('Failed to play notification sound:', e);
  }
}

