/**
 * Audio Chime and Browser Notification System for Real-time Store Order Alerts
 * Uses Web Audio API synthesizer (no external audio files required, zero latency)
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtx && AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume().catch(() => {});
    }
    return audioCtx;
  } catch (e) {
    console.warn("[Order Chime] AudioContext initialization failed:", e);
    return null;
  }
}

/**
 * Plays a bright, pleasant 3-tone cash register / order alert chime (C5 -> E5 -> G5)
 */
export function playOrderAlertChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const notes = [
      { freq: 523.25, start: 0, duration: 0.12 }, // C5
      { freq: 659.25, start: 0.1, duration: 0.14 }, // E5
      { freq: 783.99, start: 0.22, duration: 0.35 }, // G5
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.3, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notes.forEach(({ freq, start, duration }) => {
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      noteGain.gain.setValueAtTime(0, ctx.currentTime + start);
      noteGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + start + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + duration);
    });

    // Mobile haptic vibration if supported
    if (typeof window !== "undefined" && "navigator" in window && navigator.vibrate) {
      try {
        navigator.vibrate([150, 80, 150]);
      } catch {}
    }
  } catch (error) {
    console.warn("[Order Chime] Error playing audio:", error);
  }
}

/**
 * Requests browser notification permission if not yet decided
 */
export async function requestOrderNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }
  if (Notification.permission === "granted") return true;
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }
  return false;
}

/**
 * Displays an OS-level browser push notification when an order arrives
 */
export function showBrowserOrderNotification(title: string, body: string, link = "/store/orders"): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    try {
      const notif = new Notification(title, {
        body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "new-order",
        requireInteraction: true,
      });

      notif.onclick = () => {
        window.focus();
        window.location.href = link;
      };
    } catch (e) {
      console.warn("[Order Chime] Browser notification failed:", e);
    }
  }
}
