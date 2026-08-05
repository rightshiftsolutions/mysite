/**
 * Reusable Countdown Timer Module
 * durationSeconds: total countdown duration, in seconds
 */
export class Timer {
  constructor(durationSeconds, onTickCallback, onExpireCallback) {
    this.durationSeconds = durationSeconds;
    this.remainingSeconds = this.durationSeconds;
    this.intervalId = null;
    this.onTick = onTickCallback;
    this.onExpire = onExpireCallback;
  }

  start() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      this.remainingSeconds--;
      
      const minutes = Math.floor(this.remainingSeconds / 60);
      const seconds = this.remainingSeconds % 60;
      const displayString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      const isWarning = this.remainingSeconds <= 60;

      if (this.onTick) {
        this.onTick({
          display: displayString,
          secondsLeft: this.remainingSeconds,
          isWarning
        });
      }

      if (this.remainingSeconds <= 0) {
        this.stop();
        if (this.onExpire) {
          this.onExpire();
        }
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  getRemainingTime() {
    return this.remainingSeconds;
  }
}

export default Timer;
