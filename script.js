/**
 * 3D Coin Toss Website
 * Vanilla JavaScript Implementation
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // Sound Controller
  // Handles HTML5 Audio playback with automatic Web Audio API fallback.
  // ---------------------------------------------------------------------------
  class SoundController {
    constructor(soundFilePath) {
      this.soundFilePath = soundFilePath;
      this.audio = null;
      this.audioContext = null;
      this.hasAudioFile = false;
      this.initAudioFile();
    }

    /**
     * Attempts to initialize the HTML5 Audio element.
     */
    initAudioFile() {
      try {
        this.audio = new Audio();
        this.audio.preload = 'auto';
        this.audio.volume = 0.32; // Comfortable, pleasant volume

        this.audio.addEventListener('canplaythrough', () => {
          this.hasAudioFile = true;
        }, { once: true });

        this.audio.addEventListener('error', () => {
          // Gracefully fallback to Web Audio API
          this.hasAudioFile = false;
        });

        this.audio.src = this.soundFilePath;
        this.audio.load();
      } catch (e) {
        this.hasAudioFile = false;
      }
    }

    /**
     * Plays the coin flip sound effect, synchronized with the toss.
     */
    play() {
      if (this.hasAudioFile && this.audio) {
        this.audio.currentTime = 0;
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(() => {
            // If local file playback is restricted (e.g. sandbox), synthesize sound
            this.playSynthesizedSound();
          });
        }
      } else {
        this.playSynthesizedSound();
      }
    }

    /**
     * Synthesizes a realistic metallic coin flick, ringing resonance, and landing clink
     * using the Web Audio API without requiring any external audio files.
     */
    playSynthesizedSound() {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;

        if (!this.audioContext) {
          this.audioContext = new AudioContextClass();
        }

        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
        }

        const ctx = this.audioContext;
        const now = ctx.currentTime;

        // 1. Initial thumb flick snap (0.00s - 0.05s)
        const flickOsc = ctx.createOscillator();
        const flickGain = ctx.createGain();
        flickOsc.type = 'triangle';
        flickOsc.frequency.setValueAtTime(1500, now);
        flickOsc.frequency.exponentialRampToValueAtTime(320, now + 0.04);

        flickGain.gain.setValueAtTime(0.22, now);
        flickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

        flickOsc.connect(flickGain);
        flickGain.connect(ctx.destination);
        flickOsc.start(now);
        flickOsc.stop(now + 0.05);

        // 2. Resonant metallic harmonics with flutter (0.00s - 1.9s)
        const harmonics = [
          { freq: 2093, gain: 0.14, decay: 1.8 },
          { freq: 3136, gain: 0.09, decay: 1.5 },
          { freq: 4186, gain: 0.06, decay: 1.2 }
        ];

        harmonics.forEach(({ freq, gain, decay }) => {
          const osc = ctx.createOscillator();
          const gainNode = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gainNode.gain.setValueAtTime(gain, now);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, now + decay);

          osc.connect(gainNode);
          gainNode.connect(ctx.destination);

          osc.start(now);
          osc.stop(now + decay + 0.05);
        });

        // 3. Landing tap / clink (synchronized around 2.18s)
        const landTime = now + 2.18;
        const landOsc = ctx.createOscillator();
        const landGain = ctx.createGain();

        landOsc.type = 'triangle';
        landOsc.frequency.setValueAtTime(2350, landTime);
        landOsc.frequency.exponentialRampToValueAtTime(1600, landTime + 0.08);

        landGain.gain.setValueAtTime(0.18, landTime);
        landGain.gain.exponentialRampToValueAtTime(0.001, landTime + 0.08);

        landOsc.connect(landGain);
        landGain.connect(ctx.destination);

        landOsc.start(landTime);
        landOsc.stop(landTime + 0.1);

      } catch (e) {
        // Safe silent fallback - no uncaught errors
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Core Application Logic
  // ---------------------------------------------------------------------------
  const TOSS_DURATION_MS = 2400; // Animation duration in milliseconds

  // DOM Elements
  const tossBtn = document.getElementById('tossBtn');
  const coinWrapper = document.getElementById('coinWrapper');
  const coin = document.getElementById('coin');
  const coinShadow = document.getElementById('coinShadow');
  const resultDisplay = document.getElementById('resultDisplay');
  const resultValue = document.getElementById('resultValue');
  const headsFace = coin ? coin.querySelector('.coin-face-heads') : null;
  const tailsFace = coin ? coin.querySelector('.coin-face-tails') : null;

  // Initialize Sound Controller
  const sound = new SoundController('coin-flip.wav');

  // State Tracking
  let currentRotationX = 0;
  let isFlipping = false;
  let tossTimer = null;

  /**
   * Generates a random toss outcome with strict 50% probability.
   * @returns {"Heads" | "Tails"}
   */
  function tossCoin() {
    return Math.random() < 0.5 ? 'Heads' : 'Tails';
  }

  /**
   * Calculates the next continuous X-axis rotation angle matching the desired face.
   * Always advances forward with multiple full rotations.
   *
   * @param {number} currentAngle Current accumulated rotation in degrees.
   * @param {"Heads" | "Tails"} outcome Desired landing outcome.
   * @returns {number} The target rotation in degrees.
   */
  function calculateNextAngle(currentAngle, outcome) {
    // Perform at least 6 to 8 full 360° revolutions
    const baseRotations = 6;
    const variableRotations = Math.floor(Math.random() * 3); // 0, 1, or 2
    const addedDegrees = (baseRotations + variableRotations) * 360;

    let targetAngle = currentAngle + addedDegrees;
    const remainder = targetAngle % 360;

    if (outcome === 'Heads') {
      // Heads requires targetAngle % 360 === 0
      if (remainder !== 0) {
        targetAngle += (360 - remainder);
      }
    } else {
      // Tails requires targetAngle % 360 === 180
      if (remainder === 0) {
        targetAngle += 180;
      } else if (remainder === 180) {
        // Already matching
      } else {
        targetAngle += (180 - remainder);
      }
    }

    return targetAngle;
  }

  /**
   * Initiates the coin toss sequence.
   */
  function handleToss() {
    // Rule: Prevent multiple simultaneous tosses
    if (isFlipping) return;

    isFlipping = true;

    // Rule: Disable Toss button while animation is running
    tossBtn.disabled = true;
    tossBtn.setAttribute('aria-disabled', 'true');

    // Rule: Single random outcome for both animation and display
    const outcome = tossCoin();

    // Calculate rotation to ensure the coin lands on the exact generated outcome
    const nextRotationX = calculateNextAngle(currentRotationX, outcome);
    currentRotationX = nextRotationX;

    // Rule: Play sound when user starts a toss
    sound.play();

    // Prepare UI state during flipping
    resultDisplay.classList.remove('highlight');
    resultValue.classList.remove('revealed');
    resultValue.textContent = 'Flipping...';

    // Trigger physical jump and shadow pulse animations
    coinWrapper.classList.remove('is-tossing');
    coinShadow.classList.remove('is-tossing');

    // Force reflow so animation restarts cleanly on repeated tosses
    void coinWrapper.offsetWidth;

    coinWrapper.classList.add('is-tossing');
    coinShadow.classList.add('is-tossing');

    // Apply the 3D multi-rotation transform to the coin
    coin.style.transform = `rotateX(${nextRotationX}deg)`;

    // Clear any previous timer
    if (tossTimer) clearTimeout(tossTimer);

    // Rule: Show the result ONLY after the animation finishes
    tossTimer = setTimeout(() => {
      onTossComplete(outcome);
    }, TOSS_DURATION_MS);
  }

  /**
   * Handles completion of the toss animation.
   * @param {"Heads" | "Tails"} outcome The final outcome.
   */
  function onTossComplete(outcome) {
    // Remove temporary jumping classes
    coinWrapper.classList.remove('is-tossing');
    coinShadow.classList.remove('is-tossing');

    // Rule: Display the final result clearly
    resultValue.textContent = outcome;
    resultValue.classList.add('revealed');
    resultDisplay.classList.add('highlight');

    // Update accessibility attributes
    if (headsFace && tailsFace) {
      headsFace.setAttribute('aria-hidden', outcome === 'Heads' ? 'false' : 'true');
      tailsFace.setAttribute('aria-hidden', outcome === 'Tails' ? 'false' : 'true');
    }
    coin.setAttribute('aria-label', `3D coin showing ${outcome}`);

    // Rule: Allow another toss immediately after the previous animation finishes
    tossBtn.disabled = false;
    tossBtn.removeAttribute('aria-disabled');
    isFlipping = false;
    tossTimer = null;
  }

  // ---------------------------------------------------------------------------
  // Event Listeners
  // ---------------------------------------------------------------------------
  // Button click
  tossBtn.addEventListener('click', handleToss);

  // Clicking the coin also triggers a toss for a delightful interactive experience
  coinWrapper.addEventListener('click', () => {
    if (!isFlipping) {
      handleToss();
    }
  });

  // Keyboard accessibility: space or enter on coin wrapper
  coinWrapper.setAttribute('tabindex', '0');
  coinWrapper.setAttribute('role', 'button');
  coinWrapper.setAttribute('aria-label', 'Coin - click or press Enter to toss');
  coinWrapper.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isFlipping) {
      e.preventDefault();
      handleToss();
    }
  });

})();

