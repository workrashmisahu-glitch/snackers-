import React, { useEffect, useRef, useState } from 'react';

// Sound Synthesizer using Web Audio API
class SoundFX {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public flap(isDouble = false) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Primary spring whoosh
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isDouble ? 'triangle' : 'sine';

      const startF = isDouble ? 440 : 220;
      const peakF = isDouble ? 980 : 680;
      osc.frequency.setValueAtTime(startF, t);
      osc.frequency.exponentialRampToValueAtTime(peakF, t + 0.15);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.17);

      // Punchy bounce harmonic overtone
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(isDouble ? 660 : 160, t);
      osc2.frequency.exponentialRampToValueAtTime(isDouble ? 1320 : 380, t + 0.08);

      gain2.gain.setValueAtTime(0.18, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t);
      osc2.stop(t + 0.1);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public land() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(36, t + 0.08);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // Audio fallback
    }
  }

  public score() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Forest bell / gem chime
      [
        { freq: 880, delay: 0 },
        { freq: 1174, delay: 0.08 },
      ].forEach(({ freq, delay }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + delay);

        gain.gain.setValueAtTime(0.2, t + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t + delay);
        osc.stop(t + delay + 0.22);
      });
    } catch {
      // Audio fallback
    }
  }

  public eatFood(isSuper = false) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Juicy chomp sound
      const chomp = this.ctx.createOscillator();
      const chompGain = this.ctx.createGain();
      chomp.type = 'sine';
      chomp.frequency.setValueAtTime(340, t);
      chomp.frequency.exponentialRampToValueAtTime(120, t + 0.07);

      chompGain.gain.setValueAtTime(0.28, t);
      chompGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      chomp.connect(chompGain);
      chompGain.connect(this.ctx.destination);
      chomp.start(t);
      chomp.stop(t + 0.07);

      // High energetic harmonic bell
      const notes = isSuper ? [523.25, 659.25, 783.99, 1046.5] : [659.25, 880, 1174.66];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';

        const startTime = t + idx * 0.05;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {
      // Audio fallback
    }
  }

  public drinkEnergy() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Carbonated can "psssh" opening hiss
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.08);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(3200, t);
      const fizzGain = this.ctx.createGain();
      fizzGain.gain.setValueAtTime(0.24, t);
      fizzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      whiteNoise.connect(filter);
      filter.connect(fizzGain);
      fizzGain.connect(this.ctx.destination);
      whiteNoise.start(t);

      // Energetic electric arpeggio (surge notes)
      const tones = [587.33, 739.99, 880.0, 1174.66, 1479.98];
      tones.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        const start = t + 0.04 + idx * 0.035;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + 0.2);
      });
    } catch {
      // Audio fallback
    }
  }

  public powerSurge() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(1280, t + 0.28);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.32);
    } catch {
      // Audio fallback
    }
  }

  public hit() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Heavy rock thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.25);

      gain.gain.setValueAtTime(0.35, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.25);
    } catch {
      // Audio fallback
    }
  }

  public die() {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, t);
      osc.frequency.exponentialRampToValueAtTime(70, t + 0.35);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.35);
    } catch {
      // Audio fallback
    }
  }
}

interface Bat {
  x: number;
  y: number;
  speed: number;
  scale: number;
  wingSpeed: number;
  phase: number;
  swoopAmp: number;
  swoopFreq: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  rotation: number;
  vRot: number;
  isSpark?: boolean;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

interface Rock {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
  type: 'rock' | 'stalagmite' | 'boulder';
  color: string;
  mossTop: boolean;
}

interface FoodItem {
  id: number;
  x: number;
  y: number;
  baseY: number;
  type: 'golden_egg' | 'ruby_berry' | 'energy_apple' | 'glow_mushroom' | 'energy_drink';
  radius: number;
  energyVal: number;
  pointsVal: number;
  floatPhase: number;
  collected: boolean;
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const soundRef = useRef<SoundFX>(new SoundFX());

  useEffect(() => {
    soundRef.current.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const WIDTH = 360;
    const HEIGHT = 640;
    const GROUND_HEIGHT = 142; // thick forest earthen floor
    const GROUND_Y = HEIGHT - GROUND_HEIGHT; // 498
    const GRAVITY = 0.44; // Balanced, smooth gravity for larger serpent
    const JUMP_FORCE = -10.2; // Powerful leap clearing boulders
    const SCROLL_SPEED = 2.4;

    let gameState: 'START' | 'PLAYING' | 'GAMEOVER' = 'START';
    let score = 0;
    let bestScore = 0;
    try {
      bestScore = parseInt(localStorage.getItem('forest_snake_high_score') || '0', 10) || 0;
    } catch {
      bestScore = 0;
    }

    let isNewHigh = false;
    let frames = 0;
    let groundScroll = 0;
    let flashOpacity = 0;

    // Energy Bar System (0 to 100)
    let energy = 50;
    let wasHighEnergy = false;

    // Particles, Floating Text & Shockwaves
    const particles: Particle[] = [];
    const shockwaves: Shockwave[] = [];
    const floatingTexts: FloatingText[] = [];

    // Larger, Prominent Serpent Character
    const snake = {
      x: 82,
      y: GROUND_Y - 6,
      radius: 17, // ~35% larger head and body proportions
      vy: 0,
      isGrounded: true,
      slitherCycle: 0,
      rotation: 0,
      jumpsLeft: 2, // Ground leap + Mid-air slither double leap
      squashX: 1,
      squashY: 1,
      jumpBuffer: 0,
      coyoteFrames: 0,
      reset() {
        this.x = 82;
        this.y = GROUND_Y - 6;
        this.vy = 0;
        this.isGrounded = true;
        this.slitherCycle = 0;
        this.rotation = 0;
        this.jumpsLeft = 2;
        this.squashX = 1;
        this.squashY = 1;
        this.jumpBuffer = 0;
        this.coyoteFrames = 0;
      },
      tryJump() {
        this.jumpBuffer = 8;
      },
      performJump(): boolean {
        if (this.isGrounded || this.coyoteFrames > 0) {
          // Ground primary leap
          this.vy = JUMP_FORCE;
          this.isGrounded = false;
          this.coyoteFrames = 0;
          this.jumpsLeft = 1;
          this.squashX = 0.82;
          this.squashY = 1.32;
          soundRef.current.flap(false);
          spawnDustParticles(this.x - 12, GROUND_Y, 14);
          spawnShockwave(this.x - 6, GROUND_Y + 1, '#a8947f');
          return true;
        } else if (this.jumpsLeft > 0) {
          // Mid-air acrobatic double leap!
          const airForce = energy >= 75 ? -8.6 : -8.0;
          this.vy = airForce;
          this.jumpsLeft = 0;
          this.squashX = 0.85;
          this.squashY = 1.25;
          this.rotation = -0.4;
          soundRef.current.flap(true);
          spawnAirParticles(this.x, this.y, 14);
          return true;
        }
        return false;
      },
    };

    // Bats in background
    const bats: Bat[] = [
      { x: 50, y: 130, speed: 1.3, scale: 0.8, wingSpeed: 0.22, phase: 0, swoopAmp: 11, swoopFreq: 0.04 },
      { x: 160, y: 180, speed: 1.7, scale: 1.05, wingSpeed: 0.26, phase: 1.8, swoopAmp: 14, swoopFreq: 0.048 },
      { x: 270, y: 100, speed: 1.1, scale: 0.65, wingSpeed: 0.18, phase: 3.4, swoopAmp: 8, swoopFreq: 0.035 },
      { x: 340, y: 220, speed: 1.5, scale: 0.9, wingSpeed: 0.24, phase: 4.6, swoopAmp: 12, swoopFreq: 0.042 },
      { x: -20, y: 150, speed: 1.4, scale: 0.75, wingSpeed: 0.2, phase: 2.2, swoopAmp: 10, swoopFreq: 0.038 },
    ];

    // Ambient floating fireflies / mystical glowing spores in forest air
    const fireflies: { x: number; y: number; size: number; speed: number; alpha: number; phase: number; hue: number }[] = [];
    for (let i = 0; i < 34; i++) {
      fireflies.push({
        x: Math.random() * WIDTH,
        y: 120 + Math.random() * (GROUND_Y - 80),
        size: 1.4 + Math.random() * 2.8,
        speed: 0.25 + Math.random() * 0.7,
        alpha: 0.3 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.4 ? 120 : 45, // green or golden glow
      });
    }

    // Drifting volumetric forest fog patches
    const fogPatches: { x: number; y: number; width: number; height: number; speed: number; alpha: number }[] = [
      { x: 20, y: GROUND_Y - 55, width: 180, height: 45, speed: 0.6, alpha: 0.14 },
      { x: 220, y: GROUND_Y - 70, width: 220, height: 50, speed: 0.75, alpha: 0.12 },
      { x: 380, y: GROUND_Y - 45, width: 160, height: 40, speed: 0.5, alpha: 0.15 },
    ];

    function spawnDustParticles(x: number, y: number, count: number) {
      const colors = ['#8d7864', '#5e4e3e', '#7c6953', '#a8947f', '#3e342a'];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: x + (Math.random() - 0.5) * 18,
          y: y + (Math.random() - 0.5) * 4,
          vx: -SCROLL_SPEED * 0.6 + (Math.random() - 0.5) * 3.2,
          vy: -Math.random() * 3.4 - 0.6,
          size: 1.8 + Math.random() * 3.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.85,
          life: 0,
          maxLife: 22 + Math.random() * 26,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
        });
      }
    }

    function spawnAirParticles(x: number, y: number, count: number) {
      const colors = ['#a2f567', '#81c784', '#66bb6a', '#c8e6c9', '#ffd54f', '#ffffff'];
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.4 + Math.random() * 3.0;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed - SCROLL_SPEED * 0.4,
          vy: Math.sin(angle) * speed + 0.5,
          size: 2.0 + Math.random() * 3.0,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.95,
          life: 0,
          maxLife: 18 + Math.random() * 18,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.3,
          isSpark: true,
        });
      }
    }

    function spawnFoodParticles(x: number, y: number, color: string) {
      for (let i = 0; i < 16; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 3.8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed - SCROLL_SPEED * 0.5,
          vy: Math.sin(angle) * speed - 0.8,
          size: 2.2 + Math.random() * 3.4,
          color,
          alpha: 1,
          life: 0,
          maxLife: 20 + Math.random() * 16,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.4,
          isSpark: true,
        });
      }
    }

    function spawnShockwave(x: number, y: number, color: string) {
      shockwaves.push({
        x,
        y,
        radius: 4,
        maxRadius: 30,
        alpha: 0.8,
        color,
      });
    }

    function spawnFloatingText(x: number, y: number, text: string, color: string) {
      floatingTexts.push({
        x,
        y,
        text,
        color,
        alpha: 1,
        vy: -1.2,
        life: 0,
        maxLife: 42,
      });
    }

    // Rocks Obstacles on Forest Floor
    let obstacles: Rock[] = [];

    function spawnObstacle() {
      const types: ('rock' | 'stalagmite' | 'boulder')[] = ['rock', 'stalagmite', 'boulder'];
      const chosenType = types[Math.floor(Math.random() * types.length)];
      let w = 42;
      let h = 48;
      if (chosenType === 'boulder') {
        w = 48;
        h = 44;
      } else if (chosenType === 'stalagmite') {
        w = 34;
        h = 56;
      } else {
        w = 42;
        h = 46;
      }

      if (score > 15) {
        h += Math.floor(Math.random() * 6);
      }

      const colors = ['#4e4b47', '#5c5750', '#3b3a37', '#69645b'];
      obstacles.push({
        x: WIDTH + 24,
        y: GROUND_Y - h + 2,
        width: w,
        height: h,
        passed: false,
        type: chosenType,
        color: colors[Math.floor(Math.random() * colors.length)],
        mossTop: Math.random() > 0.25,
      });
    }

    // Food Items for High Energy
    let foods: FoodItem[] = [];
    let nextFoodId = 1;

    function spawnFood() {
      const foodTypes: FoodItem['type'][] = [
        'golden_egg',
        'ruby_berry',
        'energy_apple',
        'glow_mushroom',
        'energy_drink',
        'energy_drink',
      ];
      // Balanced rotation with frequent energy drink appearances
      const chosenType = foodTypes[Math.floor(Math.random() * foodTypes.length)];

      let energyVal = 25;
      let pointsVal = 3;
      let radius = 13;

      if (chosenType === 'energy_drink') {
        energyVal = 50; // Super energy charge!
        pointsVal = 6;
        radius = 15;
      } else if (chosenType === 'golden_egg') {
        energyVal = 40;
        pointsVal = 5;
        radius = 15;
      } else if (chosenType === 'ruby_berry') {
        energyVal = 30;
        pointsVal = 4;
        radius = 14;
      } else if (chosenType === 'energy_apple') {
        energyVal = 25;
        pointsVal = 3;
        radius = 13;
      } else {
        energyVal = 22;
        pointsVal = 2;
        radius = 13;
      }

      // Height variety: Some low (reachable while slithering), some high (requiring a jump/double leap)
      const isAirborne = Math.random() > 0.45;
      const targetY = isAirborne ? GROUND_Y - 75 - Math.random() * 55 : GROUND_Y - 22;

      foods.push({
        id: nextFoodId++,
        x: WIDTH + 30,
        y: targetY,
        baseY: targetY,
        type: chosenType,
        radius,
        energyVal,
        pointsVal,
        floatPhase: Math.random() * Math.PI * 2,
        collected: false,
      });
    }

    function triggerGameOver() {
      if (gameState === 'GAMEOVER') return;
      gameState = 'GAMEOVER';
      soundRef.current.hit();
      setTimeout(() => soundRef.current.die(), 120);
      flashOpacity = 0.75;
      spawnDustParticles(snake.x, GROUND_Y, 24);

      if (score > bestScore) {
        bestScore = score;
        isNewHigh = true;
        try {
          localStorage.setItem('forest_snake_high_score', bestScore.toString());
        } catch {
          // localStorage disabled
        }
      } else {
        isNewHigh = false;
      }
    }

    function handleAction() {
      if (gameState === 'START') {
        gameState = 'PLAYING';
        snake.tryJump();
      } else if (gameState === 'PLAYING') {
        snake.tryJump();
      } else if (gameState === 'GAMEOVER') {
        if (flashOpacity <= 0.2) {
          gameState = 'START';
          score = 0;
          energy = 50;
          obstacles = [];
          foods = [];
          snake.reset();
        }
      }
    }

    // Event Listeners
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === ' ') {
        e.preventDefault();
        handleAction();
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      handleAction();
    };

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      handleAction();
    };

    window.addEventListener('keydown', onKeyDown);
    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('touchstart', onTouchStart, { passive: false });

    // --- ART & DRAWING FUNCTIONS ---

    // 1. Realistic Forest Sky & Atmospheric Moon with Volumetric Light Shafts
    function drawSky() {
      if (!ctx) return;

      // Realistic deep twilight sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, '#091516');
      skyGrad.addColorStop(0.3, '#102525');
      skyGrad.addColorStop(0.65, '#1e3e36');
      skyGrad.addColorStop(0.9, '#2a5344');
      skyGrad.addColorStop(1, '#35634d');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Distant stars / celestial glow in upper atmosphere
      ctx.save();
      const stars = [
        { x: 30, y: 35, r: 1.0, a: 0.6 },
        { x: 85, y: 20, r: 1.2, a: 0.8 },
        { x: 140, y: 45, r: 0.8, a: 0.5 },
        { x: 190, y: 25, r: 1.1, a: 0.7 },
        { x: 230, y: 55, r: 0.9, a: 0.6 },
        { x: 320, y: 30, r: 1.3, a: 0.75 },
      ];
      stars.forEach((s) => {
        const pulse = 0.7 + 0.3 * Math.sin(frames * 0.05 + s.x);
        ctx.fillStyle = `rgba(240, 248, 255, ${s.a * pulse})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // Realistic Glowing Full Moon with atmospheric halo
      const moonX = WIDTH - 80;
      const moonY = 82;

      // Outer atmospheric bloom
      const haloGrad = ctx.createRadialGradient(moonX, moonY, 12, moonX, moonY, 80);
      haloGrad.addColorStop(0, 'rgba(255, 255, 230, 0.45)');
      haloGrad.addColorStop(0.4, 'rgba(200, 245, 225, 0.18)');
      haloGrad.addColorStop(0.8, 'rgba(170, 230, 210, 0.05)');
      haloGrad.addColorStop(1, 'rgba(170, 230, 210, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 80, 0, Math.PI * 2);
      ctx.fill();

      // Moon disc
      const moonDiscGrad = ctx.createRadialGradient(moonX - 5, moonY - 5, 2, moonX, moonY, 20);
      moonDiscGrad.addColorStop(0, '#fffae8');
      moonDiscGrad.addColorStop(0.7, '#f4eccb');
      moonDiscGrad.addColorStop(1, '#dbd2b0');
      ctx.fillStyle = moonDiscGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, 20, 0, Math.PI * 2);
      ctx.fill();

      // Detailed lunar maria & crater shading
      ctx.fillStyle = 'rgba(150, 155, 140, 0.38)';
      ctx.beginPath();
      ctx.arc(moonX - 5, moonY - 4, 4.5, 0, Math.PI * 2);
      ctx.arc(moonX + 6, moonY + 5, 3.8, 0, Math.PI * 2);
      ctx.arc(moonX - 3, moonY + 7, 3.2, 0, Math.PI * 2);
      ctx.arc(moonX + 4, moonY - 6, 2.8, 0, Math.PI * 2);
      ctx.arc(moonX - 8, moonY + 2, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Soft volumetric moonbeams / God rays cutting through the misty canopy
      ctx.save();
      const beamGrad = ctx.createLinearGradient(moonX, moonY, moonX - 180, GROUND_Y);
      beamGrad.addColorStop(0, 'rgba(235, 250, 240, 0.14)');
      beamGrad.addColorStop(0.5, 'rgba(200, 245, 230, 0.06)');
      beamGrad.addColorStop(1, 'rgba(200, 245, 230, 0)');
      ctx.fillStyle = beamGrad;

      ctx.beginPath();
      ctx.moveTo(moonX - 12, moonY + 8);
      ctx.lineTo(moonX - 220, GROUND_Y);
      ctx.lineTo(moonX - 140, GROUND_Y);
      ctx.lineTo(moonX + 16, moonY + 12);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(moonX - 6, moonY + 14);
      ctx.lineTo(moonX - 110, GROUND_Y);
      ctx.lineTo(moonX - 60, GROUND_Y);
      ctx.lineTo(moonX + 24, moonY + 14);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 2. Realistic Mountains with Crags, Ridges & Atmospheric Depth Haze
    function drawMountains() {
      if (!ctx) return;
      ctx.save();

      // Far Mountain Silhouette (Atmospheric Blue-Gray)
      const farMountainGrad = ctx.createLinearGradient(0, 140, 0, GROUND_Y);
      farMountainGrad.addColorStop(0, '#1c3432');
      farMountainGrad.addColorStop(0.7, '#1b322c');
      farMountainGrad.addColorStop(1, '#23443a');
      ctx.fillStyle = farMountainGrad;

      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(0, 230);
      ctx.lineTo(35, 175);
      ctx.lineTo(75, 215);
      ctx.lineTo(135, 142);
      ctx.lineTo(190, 195);
      ctx.lineTo(245, 150);
      ctx.lineTo(305, 205);
      ctx.lineTo(360, 168);
      ctx.lineTo(360, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Snowy / misty crest highlights catching the moonlight
      ctx.fillStyle = 'rgba(235, 250, 245, 0.18)';
      ctx.beginPath();
      ctx.moveTo(135, 142);
      ctx.lineTo(155, 180);
      ctx.lineTo(132, 175);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(245, 150);
      ctx.lineTo(262, 185);
      ctx.lineTo(240, 182);
      ctx.closePath();
      ctx.fill();

      // Mid-distance Craggy Mountain Ridge (Rich Forest Green-Black)
      const midRidgeGrad = ctx.createLinearGradient(0, 210, 0, GROUND_Y);
      midRidgeGrad.addColorStop(0, '#162b23');
      midRidgeGrad.addColorStop(0.6, '#14251e');
      midRidgeGrad.addColorStop(1, '#1b3327');
      ctx.fillStyle = midRidgeGrad;

      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(0, 275);
      ctx.lineTo(50, 238);
      ctx.lineTo(95, 268);
      ctx.lineTo(165, 218);
      ctx.lineTo(225, 258);
      ctx.lineTo(285, 226);
      ctx.lineTo(340, 262);
      ctx.lineTo(360, 248);
      ctx.lineTo(360, GROUND_Y);
      ctx.closePath();
      ctx.fill();

      // Atmospheric Valley Fog Layer between mountains and forest
      const valleyFog = ctx.createLinearGradient(0, 235, 0, 310);
      valleyFog.addColorStop(0, 'rgba(180, 225, 210, 0.18)');
      valleyFog.addColorStop(0.5, 'rgba(180, 225, 210, 0.12)');
      valleyFog.addColorStop(1, 'rgba(180, 225, 210, 0)');
      ctx.fillStyle = valleyFog;
      ctx.fillRect(0, 230, WIDTH, 80);

      ctx.restore();
    }

    // 3. Dense Realistic Forest with Tall Tree Trunks, Foliage & Canopy Overhang
    function drawTrees() {
      if (!ctx) return;
      ctx.save();

      // Distant tree silhouette backdrop
      const treeScroll = (groundScroll * 0.4) % 64;
      ctx.fillStyle = '#0f1f18';

      for (let tx = -64 + treeScroll; tx < WIDTH + 80; tx += 36) {
        const treeH = 105 + ((tx * 17) % 40);
        const topY = GROUND_Y - treeH;

        // Tree trunk
        ctx.fillStyle = '#0b1611';
        ctx.fillRect(tx + 8, topY + treeH * 0.5, 7, treeH * 0.5);

        // Tiered pine needles
        ctx.fillStyle = '#11251c';
        for (let tier = 0; tier < 4; tier++) {
          const tierY = topY + tier * (treeH * 0.2);
          const tierW = 18 + tier * 9;
          ctx.beginPath();
          ctx.moveTo(tx + 11.5, tierY);
          ctx.lineTo(tx + 11.5 + tierW, tierY + treeH * 0.28);
          ctx.lineTo(tx + 11.5 - tierW, tierY + treeH * 0.28);
          ctx.closePath();
          ctx.fill();
        }
      }

      // Midground ancient cedar and pine trunks with realistic textured bark
      const trunkScroll = (groundScroll * 0.65) % 90;
      for (let bx = -90 + trunkScroll; bx < WIDTH + 100; bx += 85) {
        const trunkW = 16 + (Math.abs(bx) % 10);
        const trunkH = 190;
        const trunkY = GROUND_Y - trunkH;

        // Trunk base
        const barkGrad = ctx.createLinearGradient(bx, 0, bx + trunkW, 0);
        barkGrad.addColorStop(0, '#121e17');
        barkGrad.addColorStop(0.35, '#1e3327');
        barkGrad.addColorStop(0.85, '#15251c');
        barkGrad.addColorStop(1, '#0c1611');
        ctx.fillStyle = barkGrad;
        ctx.fillRect(bx, trunkY, trunkW, trunkH);

        // Bark grooves
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(bx + 4, trunkY);
        ctx.lineTo(bx + 5, GROUND_Y);
        ctx.moveTo(bx + 9, trunkY);
        ctx.lineTo(bx + 11, GROUND_Y);
        ctx.stroke();

        // Branches reaching out
        ctx.strokeStyle = '#182b21';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(bx + trunkW / 2, trunkY + 45);
        ctx.quadraticCurveTo(bx + trunkW + 20, trunkY + 35, bx + trunkW + 35, trunkY + 28);
        ctx.moveTo(bx + trunkW / 2, trunkY + 80);
        ctx.quadraticCurveTo(bx - 20, trunkY + 70, bx - 35, trunkY + 60);
        ctx.stroke();

        // Hanging moss on branches
        ctx.strokeStyle = 'rgba(56, 110, 72, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bx + trunkW + 25, trunkY + 34);
        ctx.quadraticCurveTo(bx + trunkW + 28, trunkY + 55, bx + trunkW + 24, trunkY + 68);
        ctx.moveTo(bx - 25, trunkY + 68);
        ctx.quadraticCurveTo(bx - 23, trunkY + 85, bx - 26, trunkY + 98);
        ctx.stroke();
      }

      // Upper forest canopy foliage overhang
      const canopyGrad = ctx.createLinearGradient(0, 0, 0, 65);
      canopyGrad.addColorStop(0, '#0a1610');
      canopyGrad.addColorStop(0.7, '#0e2219');
      canopyGrad.addColorStop(1, 'rgba(14, 34, 25, 0)');
      ctx.fillStyle = canopyGrad;
      ctx.fillRect(0, 0, WIDTH, 65);

      // Hanging moss tendrils from top canopy
      ctx.strokeStyle = '#1e4030';
      ctx.lineWidth = 2.4;
      [20, 65, 115, 175, 230, 285, 335].forEach((vx, idx) => {
        const len = 30 + (idx % 4) * 14;
        const sway = Math.sin(frames * 0.03 + idx) * 3;
        ctx.beginPath();
        ctx.moveTo(vx, 0);
        ctx.quadraticCurveTo(vx + sway + 4, len * 0.5, vx + sway - 2, len);
        ctx.stroke();
      });

      ctx.restore();
    }

    // 4. Background Animated Flying Bats
    function drawBat(b: Bat) {
      if (!ctx) return;
      const currentY = b.y + Math.sin(frames * b.swoopFreq + b.phase) * b.swoopAmp;
      const wingFlap = Math.sin(frames * b.wingSpeed + b.phase);

      ctx.save();
      ctx.translate(b.x, currentY);
      ctx.scale(b.scale, b.scale);

      ctx.fillStyle = '#18131e';
      ctx.strokeStyle = '#0c0a0f';
      ctx.lineWidth = 1.4;

      // Left Wing
      ctx.beginPath();
      ctx.moveTo(-3, -2);
      const leftTipY = -6 + wingFlap * 10;
      ctx.quadraticCurveTo(-11, -12 + wingFlap * 7, -22, leftTipY);
      ctx.quadraticCurveTo(-16, -1 + wingFlap * 4, -10, 2);
      ctx.quadraticCurveTo(-6, 4, -3, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(3, -2);
      const rightTipY = -6 + wingFlap * 10;
      ctx.quadraticCurveTo(11, -12 + wingFlap * 7, 22, rightTipY);
      ctx.quadraticCurveTo(16, -1 + wingFlap * 4, 10, 2);
      ctx.quadraticCurveTo(6, 4, 3, 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Bat Body & Head
      ctx.fillStyle = '#110c17';
      ctx.beginPath();
      ctx.ellipse(0, 1, 4, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, -4.5, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Ears
      ctx.beginPath();
      ctx.moveTo(-3.5, -5.5);
      ctx.lineTo(-4.5, -10.5);
      ctx.lineTo(-1, -7.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(3.5, -5.5);
      ctx.lineTo(4.5, -10.5);
      ctx.lineTo(1, -7.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Glowing eyes
      if (b.scale >= 0.75) {
        ctx.fillStyle = '#ff3344';
        ctx.beginPath();
        ctx.arc(-1.5, -4.5, 0.9, 0, Math.PI * 2);
        ctx.arc(1.5, -4.5, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    // 5. Realistic Fireflies & Drifting Forest Mist Ribbons
    function drawAtmosphere() {
      if (!ctx) return;
      ctx.save();

      // Floating pulsing fireflies
      fireflies.forEach((f) => {
        f.x -= f.speed;
        if (f.x < -10) {
          f.x = WIDTH + 10;
          f.y = 120 + Math.random() * (GROUND_Y - 90);
        }
        const bobY = f.y + Math.sin(frames * 0.04 + f.phase) * 6;
        const pulse = 0.4 + 0.6 * Math.abs(Math.sin(frames * 0.06 + f.phase));

        // Glow halo
        const glowGrad = ctx.createRadialGradient(f.x, bobY, 0.5, f.x, bobY, f.size * 3.5);
        if (f.hue === 45) {
          glowGrad.addColorStop(0, `rgba(255, 230, 120, ${0.85 * pulse})`);
          glowGrad.addColorStop(0.5, `rgba(255, 210, 80, ${0.35 * pulse})`);
          glowGrad.addColorStop(1, 'rgba(255, 210, 80, 0)');
        } else {
          glowGrad.addColorStop(0, `rgba(180, 255, 120, ${0.85 * pulse})`);
          glowGrad.addColorStop(0.5, `rgba(130, 240, 80, ${0.35 * pulse})`);
          glowGrad.addColorStop(1, 'rgba(130, 240, 80, 0)');
        }
        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(f.x, bobY, f.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Center bright dot
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(f.x, bobY, f.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
      });

      // Drifting ground fog ribbons across the forest earth
      fogPatches.forEach((fp) => {
        fp.x -= fp.speed;
        if (fp.x < -fp.width) {
          fp.x = WIDTH + 30;
        }
        const fogGrad = ctx.createRadialGradient(
          fp.x + fp.width * 0.5,
          fp.y + fp.height * 0.5,
          10,
          fp.x + fp.width * 0.5,
          fp.y + fp.height * 0.5,
          fp.width * 0.5
        );
        fogGrad.addColorStop(0, `rgba(195, 235, 220, ${fp.alpha})`);
        fogGrad.addColorStop(0.6, `rgba(180, 225, 210, ${fp.alpha * 0.5})`);
        fogGrad.addColorStop(1, 'rgba(180, 225, 210, 0)');

        ctx.fillStyle = fogGrad;
        ctx.beginPath();
        ctx.ellipse(fp.x + fp.width * 0.5, fp.y + fp.height * 0.5, fp.width * 0.5, fp.height * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // 6. Realistic Forest Ground with Layered Earth, Roots, Moss & Pebbles
    function drawGround() {
      if (!ctx) return;
      ctx.save();

      // Deep rich earthen soil gradient
      const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, HEIGHT);
      groundGrad.addColorStop(0, '#2b2118');
      groundGrad.addColorStop(0.12, '#382c20');
      groundGrad.addColorStop(0.4, '#241b14');
      groundGrad.addColorStop(1, '#15100c');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, GROUND_Y, WIDTH, GROUND_HEIGHT);

      // Lush mossy turf band
      const turfGrad = ctx.createLinearGradient(0, GROUND_Y, 0, GROUND_Y + 18);
      turfGrad.addColorStop(0, '#42782e');
      turfGrad.addColorStop(0.4, '#325d23');
      turfGrad.addColorStop(1, '#203d16');
      ctx.fillStyle = turfGrad;
      ctx.fillRect(0, GROUND_Y, WIDTH, 18);

      // Top grass blades & organic mounds
      ctx.fillStyle = '#5ca838';
      const pebbleSpacing = 36;
      const offset = groundScroll % pebbleSpacing;

      for (let px = -pebbleSpacing + offset; px < WIDTH + pebbleSpacing; px += pebbleSpacing) {
        // Little grass tufts
        ctx.beginPath();
        ctx.moveTo(px + 4, GROUND_Y);
        ctx.lineTo(px + 8, GROUND_Y - 4);
        ctx.lineTo(px + 12, GROUND_Y);
        ctx.moveTo(px + 16, GROUND_Y);
        ctx.lineTo(px + 20, GROUND_Y - 5);
        ctx.lineTo(px + 24, GROUND_Y);
        ctx.closePath();
        ctx.fill();

        // Realistic granite pebbles with highlights and cast shadows
        ctx.fillStyle = '#221e1a';
        ctx.beginPath();
        ctx.ellipse(px + 12, GROUND_Y + 36, 9, 5, 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#5c564d';
        ctx.strokeStyle = '#292520';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(px + 10, GROUND_Y + 34, 8, 4.5, 0.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#8f887b';
        ctx.beginPath();
        ctx.ellipse(px + 8, GROUND_Y + 32.5, 4, 2, 0.1, 0, Math.PI * 2);
        ctx.fill();

        // Deep stone
        ctx.fillStyle = '#47413a';
        ctx.beginPath();
        ctx.ellipse(px + 28, GROUND_Y + 70, 13, 6.5, -0.12, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Soil texture speckles
        ctx.fillStyle = '#7a7061';
        ctx.fillRect(px + 16, GROUND_Y + 50, 3, 2.5);
        ctx.fillRect(px + 4, GROUND_Y + 88, 4, 3);
        ctx.fillRect(px + 24, GROUND_Y + 102, 3, 2);

        // Wild tiny glowing mushrooms on moss
        ctx.fillStyle = '#ff7043';
        ctx.beginPath();
        ctx.arc(px + 18, GROUND_Y + 4, 3, Math.PI, 0);
        ctx.fill();
        ctx.fillStyle = '#ffe0b2';
        ctx.fillRect(px + 17, GROUND_Y + 4, 2, 4);
      }

      // Snug ground boundary line
      ctx.strokeStyle = '#18120b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(WIDTH, GROUND_Y);
      ctx.stroke();

      ctx.restore();
    }

    // 7. Realistic Stone Obstacles (Chiseled Granite Boulders, Rocks & Stalagmites)
    function drawObstacle(rock: Rock) {
      if (!ctx) return;
      ctx.save();

      const rx = rock.x;
      const ry = rock.y;
      const rw = rock.width;
      const rh = rock.height;

      // Realistic granite shading
      const rockGrad = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
      rockGrad.addColorStop(0, '#7f7a70');
      rockGrad.addColorStop(0.35, rock.color);
      rockGrad.addColorStop(0.85, '#2e2c29');
      rockGrad.addColorStop(1, '#191816');

      ctx.fillStyle = rockGrad;
      ctx.strokeStyle = '#141311';
      ctx.lineWidth = 2.5;

      if (rock.type === 'stalagmite') {
        ctx.beginPath();
        ctx.moveTo(rx + rw * 0.45, ry);
        ctx.lineTo(rx + rw, ry + rh * 0.55);
        ctx.lineTo(rx + rw * 0.9, ry + rh);
        ctx.lineTo(rx + rw * 0.05, ry + rh);
        ctx.lineTo(rx, ry + rh * 0.65);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Moonlit facet highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(rx + rw * 0.45, ry);
        ctx.lineTo(rx + rw * 0.35, ry + rh * 0.7);
        ctx.stroke();
      } else if (rock.type === 'boulder') {
        ctx.beginPath();
        ctx.moveTo(rx + rw * 0.2, ry + 6);
        ctx.lineTo(rx + rw * 0.75, ry);
        ctx.lineTo(rx + rw, ry + rh * 0.4);
        ctx.lineTo(rx + rw * 0.95, ry + rh);
        ctx.lineTo(rx + 2, ry + rh);
        ctx.lineTo(rx, ry + rh * 0.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Rock surface depth shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(rx + rw * 0.65, ry + rh * 0.6, rw * 0.28, rh * 0.22, 0.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(rx + rw * 0.3, ry);
        ctx.lineTo(rx + rw * 0.8, ry + 4);
        ctx.lineTo(rx + rw, ry + rh * 0.45);
        ctx.lineTo(rx + rw * 0.85, ry + rh);
        ctx.lineTo(rx, ry + rh);
        ctx.lineTo(rx - 2, ry + rh * 0.35);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Lush clinging forest moss on top
      if (rock.mossTop) {
        ctx.fillStyle = '#4c992e';
        ctx.beginPath();
        ctx.ellipse(rx + rw * 0.5, ry + 4, rw * 0.38, 5.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#77c947';
        ctx.beginPath();
        ctx.ellipse(rx + rw * 0.42, ry + 2.5, rw * 0.22, 2.8, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // Contact shadow on earth
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(rx + rw * 0.5, GROUND_Y + 2, rw * 0.58, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 8. Foods for High Energy (Golden Eggs, Ruby Berries, Energy Apples, Glowing Mushrooms)
    function drawFoods() {
      if (!ctx) return;

      foods.forEach((food) => {
        if (food.collected) return;
        ctx.save();

        const floatOffset = Math.sin(frames * 0.08 + food.floatPhase) * 4;
        const fy = food.y + floatOffset;
        const fx = food.x;

        // Glowing outer halo
        const haloGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, food.radius * 2.4);
        if (food.type === 'energy_drink') {
          haloGrad.addColorStop(0, 'rgba(0, 229, 255, 0.7)');
          haloGrad.addColorStop(0.45, 'rgba(118, 255, 3, 0.3)');
          haloGrad.addColorStop(1, 'rgba(0, 229, 255, 0)');
        } else if (food.type === 'golden_egg') {
          haloGrad.addColorStop(0, 'rgba(255, 235, 59, 0.6)');
          haloGrad.addColorStop(0.5, 'rgba(255, 193, 7, 0.25)');
          haloGrad.addColorStop(1, 'rgba(255, 193, 7, 0)');
        } else if (food.type === 'ruby_berry') {
          haloGrad.addColorStop(0, 'rgba(255, 82, 82, 0.6)');
          haloGrad.addColorStop(0.5, 'rgba(233, 30, 99, 0.25)');
          haloGrad.addColorStop(1, 'rgba(233, 30, 99, 0)');
        } else if (food.type === 'energy_apple') {
          haloGrad.addColorStop(0, 'rgba(129, 199, 132, 0.6)');
          haloGrad.addColorStop(0.5, 'rgba(76, 175, 80, 0.25)');
          haloGrad.addColorStop(1, 'rgba(76, 175, 80, 0)');
        } else {
          haloGrad.addColorStop(0, 'rgba(179, 136, 255, 0.6)');
          haloGrad.addColorStop(0.5, 'rgba(124, 77, 255, 0.25)');
          haloGrad.addColorStop(1, 'rgba(124, 77, 255, 0)');
        }
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, food.radius * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Draw specific food item
        if (food.type === 'golden_egg') {
          // Golden Dragon Egg
          ctx.save();
          ctx.translate(fx, fy);
          const eggGrad = ctx.createRadialGradient(-3, -4, 2, 0, 0, food.radius);
          eggGrad.addColorStop(0, '#fffde7');
          eggGrad.addColorStop(0.3, '#ffeb3b');
          eggGrad.addColorStop(0.7, '#fbc02d');
          eggGrad.addColorStop(1, '#f57f17');

          ctx.fillStyle = eggGrad;
          ctx.strokeStyle = '#e65100';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.ellipse(0, 0, food.radius * 0.85, food.radius * 1.15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Golden scale specks
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-3, -5, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (food.type === 'ruby_berry') {
          // Ruby Forest Berry Cluster
          ctx.save();
          ctx.translate(fx, fy);

          // Leaves
          ctx.fillStyle = '#4caf50';
          ctx.beginPath();
          ctx.ellipse(-4, -food.radius - 2, 5, 2.5, -0.4, 0, Math.PI * 2);
          ctx.ellipse(4, -food.radius - 2, 5, 2.5, 0.4, 0, Math.PI * 2);
          ctx.fill();

          const berryGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, food.radius);
          berryGrad.addColorStop(0, '#ff8a80');
          berryGrad.addColorStop(0.4, '#e53935');
          berryGrad.addColorStop(0.85, '#b71c1c');
          berryGrad.addColorStop(1, '#880e4f');

          ctx.fillStyle = berryGrad;
          ctx.strokeStyle = '#5f0914';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, food.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Specular gleam
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-3.5, -3.5, 2.4, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (food.type === 'energy_apple') {
          // Emerald Energy Apple
          ctx.save();
          ctx.translate(fx, fy);

          // Stem
          ctx.strokeStyle = '#4e342e';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, -food.radius + 2);
          ctx.lineTo(2, -food.radius - 6);
          ctx.stroke();

          // Leaf
          ctx.fillStyle = '#81c784';
          ctx.beginPath();
          ctx.ellipse(4, -food.radius - 4, 4, 2, 0.3, 0, Math.PI * 2);
          ctx.fill();

          const appleGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, food.radius);
          appleGrad.addColorStop(0, '#c8e6c9');
          appleGrad.addColorStop(0.4, '#43a047');
          appleGrad.addColorStop(0.85, '#2e7d32');
          appleGrad.addColorStop(1, '#1b5e20');

          ctx.fillStyle = appleGrad;
          ctx.strokeStyle = '#0d3810';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, 0, food.radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-3.5, -3.5, 2.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (food.type === 'glow_mushroom') {
          // Glowing Bioluminescent Mushroom
          ctx.save();
          ctx.translate(fx, fy);

          // Stem
          ctx.fillStyle = '#ede7f6';
          ctx.beginPath();
          ctx.roundRect(-3, 0, 6, 12, 3);
          ctx.fill();

          // Cap
          const mushGrad = ctx.createRadialGradient(0, -4, 2, 0, 0, food.radius);
          mushGrad.addColorStop(0, '#e1bee7');
          mushGrad.addColorStop(0.4, '#8e24aa');
          mushGrad.addColorStop(1, '#4a148c');

          ctx.fillStyle = mushGrad;
          ctx.strokeStyle = '#311b92';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(0, 0, food.radius, Math.PI, 0);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Glowing spots
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-5, -4, 1.8, 0, Math.PI * 2);
          ctx.arc(4, -5, 1.8, 0, Math.PI * 2);
          ctx.arc(0, -8, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (food.type === 'energy_drink') {
          // Sleek Neon Electric Energy Drink Can
          ctx.save();
          ctx.translate(fx, fy);

          // Subtle floating tilt
          const canTilt = Math.sin(frames * 0.06 + food.floatPhase) * 0.12;
          ctx.rotate(canTilt);

          const cw = 16;
          const ch = 26;

          // Main can body with metallic electric gradient
          const canGrad = ctx.createLinearGradient(-cw / 2, 0, cw / 2, 0);
          canGrad.addColorStop(0, '#00e5ff');
          canGrad.addColorStop(0.25, '#76ff03');
          canGrad.addColorStop(0.55, '#00b0ff');
          canGrad.addColorStop(0.85, '#1a237e');
          canGrad.addColorStop(1, '#004d40');

          ctx.fillStyle = canGrad;
          ctx.strokeStyle = '#002633';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.roundRect(-cw / 2, -ch / 2 + 2, cw, ch - 4, 3);
          ctx.fill();
          ctx.stroke();

          // Silver top rim & pop tab
          ctx.fillStyle = '#cfd8dc';
          ctx.strokeStyle = '#546e7a';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(0, -ch / 2 + 2, cw / 2 - 0.5, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Pull tab
          ctx.fillStyle = '#eceff1';
          ctx.beginPath();
          ctx.roundRect(-2.5, -ch / 2 + 0.5, 5, 2.5, 1);
          ctx.fill();

          // Bottom rim
          ctx.fillStyle = '#90a4ae';
          ctx.beginPath();
          ctx.ellipse(0, ch / 2 - 2, cw / 2 - 1, 2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Bold Lightning Bolt Glyph on can face
          ctx.fillStyle = '#ffea00';
          ctx.strokeStyle = '#ff6d00';
          ctx.lineWidth = 1.0;
          ctx.beginPath();
          ctx.moveTo(1, -ch / 2 + 6);
          ctx.lineTo(-3.5, 0);
          ctx.lineTo(0.5, 0);
          ctx.lineTo(-1.5, ch / 2 - 6);
          ctx.lineTo(4, -1);
          ctx.lineTo(0, -1);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();

          // Specular metallic reflection line
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillRect(-cw / 2 + 2, -ch / 2 + 4, 2, ch - 8);

          // Carbonation fizz bubbles rising above the can
          for (let b = 0; b < 3; b++) {
            const bPhase = (frames * 0.12 + b * 2) % (Math.PI * 2);
            const bx = Math.sin(bPhase) * 5;
            const by = -ch / 2 - 2 - ((frames * 0.8 + b * 6) % 14);
            const bAlpha = Math.max(0, 1 - ((-ch / 2 - 2 - by) / 14));
            ctx.fillStyle = `rgba(118, 255, 3, ${bAlpha})`;
            ctx.beginPath();
            ctx.arc(bx, by, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }

        // Floating sparkles around food
        const sparkPhase = (frames * 0.1 + food.floatPhase) % (Math.PI * 2);
        const sparkX = fx + Math.cos(sparkPhase) * (food.radius + 6);
        const sparkY = fy + Math.sin(sparkPhase) * (food.radius + 6);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(sparkX, sparkY, 1.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    }

    // 9. Larger, Mighty Slithering Serpent Character with High-Energy Effects
    function drawSnake() {
      if (!ctx) return;
      ctx.save();

      const slitherY = snake.isGrounded ? Math.sin(snake.slitherCycle) * 3.6 : 0;
      const currentY = snake.y + slitherY;
      const isHighEnergy = energy >= 75;

      // Contact shadow on earth (fades realistically as snake ascends)
      const distFromGround = Math.max(0, GROUND_Y - (currentY + snake.radius));
      if (distFromGround < 140) {
        const shadowOpacity = Math.max(0, 0.58 * (1 - distFromGround / 140));
        const shadowScale = Math.max(0.4, 1 - distFromGround / 180);
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${shadowOpacity})`;
        ctx.beginPath();
        ctx.ellipse(snake.x, GROUND_Y + 2, 36 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      ctx.translate(snake.x, currentY);
      ctx.rotate(snake.rotation);

      // Squash and stretch scale transform
      ctx.scale(snake.squashX, snake.squashY);

      // High Energy Electric Radiance Aura
      if (isHighEnergy) {
        ctx.save();
        const auraPulse = 0.75 + 0.25 * Math.sin(frames * 0.2);
        const auraGrad = ctx.createRadialGradient(-12, 0, 8, -12, 0, 42);
        auraGrad.addColorStop(0, `rgba(255, 235, 59, ${0.45 * auraPulse})`);
        auraGrad.addColorStop(0.5, `rgba(102, 187, 106, ${0.28 * auraPulse})`);
        auraGrad.addColorStop(1, 'rgba(102, 187, 106, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(-12, 0, 42, 0, Math.PI * 2);
        ctx.fill();

        // Electric spark arcs
        ctx.strokeStyle = '#fff59d';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        const arcAngle = (frames * 0.3) % (Math.PI * 2);
        ctx.moveTo(-12 + Math.cos(arcAngle) * 26, Math.sin(arcAngle) * 26);
        ctx.lineTo(-12 + Math.cos(arcAngle + 0.4) * 32, Math.sin(arcAngle + 0.4) * 32);
        ctx.stroke();
        ctx.restore();
      }

      // Double jump aura glow when in mid-air with jumps used
      if (!snake.isGrounded && snake.jumpsLeft === 0) {
        ctx.save();
        ctx.fillStyle = 'rgba(129, 199, 132, 0.22)';
        ctx.beginPath();
        ctx.arc(-12, 0, 30, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 1. Larger Trailing Body Segments (Thicker, longer, more imposing)
      const segments = [
        { x: -50, amp: 5.6, phase: 3.4, r: 9.0, bellyH: 4.2 },
        { x: -38, amp: 6.2, phase: 2.6, r: 12.5, bellyH: 6.0 },
        { x: -26, amp: 5.4, phase: 1.8, r: 15.5, bellyH: 7.8 },
        { x: -14, amp: 4.2, phase: 1.0, r: 18.0, bellyH: 9.0 },
        { x: -2, amp: 2.8, phase: 0.2, r: 19.5, bellyH: 9.8 },
      ];

      // Tail Rattle (Larger 4-ring golden rattle)
      const tailWaveY = Math.sin(snake.slitherCycle + 4.2) * (snake.isGrounded ? 5.4 : 3.4);
      ctx.save();
      ctx.translate(-58, tailWaveY);
      ctx.fillStyle = isHighEnergy ? '#ffe082' : '#e8b31a';
      ctx.strokeStyle = '#5a3d04';
      ctx.lineWidth = 1.6;
      [-5, -2, 1, 4].forEach((rx, i) => {
        ctx.beginPath();
        ctx.arc(rx, 0, 4.2 - i * 0.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      });
      ctx.restore();

      // Draw Body Segments (Back to Front)
      segments.forEach((seg) => {
        const waveY = Math.sin(snake.slitherCycle + seg.phase) * (snake.isGrounded ? seg.amp : seg.amp * 0.65);

        const segGrad = ctx.createRadialGradient(seg.x, waveY - 3, 2, seg.x, waveY, seg.r);
        if (isHighEnergy) {
          segGrad.addColorStop(0, '#b9f6ca');
          segGrad.addColorStop(0.45, '#4caf50');
          segGrad.addColorStop(0.85, '#ffb300');
          segGrad.addColorStop(1, '#1b5e20');
        } else {
          segGrad.addColorStop(0, '#8be54c');
          segGrad.addColorStop(0.5, '#43a047');
          segGrad.addColorStop(1, '#1b5e20');
        }

        ctx.fillStyle = segGrad;
        ctx.strokeStyle = '#0d3811';
        ctx.lineWidth = 2.4;

        ctx.beginPath();
        ctx.arc(seg.x, waveY, seg.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Creamy belly scales
        ctx.fillStyle = isHighEnergy ? '#fff9c4' : '#c8e6c9';
        ctx.beginPath();
        ctx.ellipse(seg.x, waveY + seg.r * 0.38, seg.r * 0.68, seg.bellyH * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Emerald Diamond Scale Pattern
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.moveTo(seg.x, waveY - seg.r + 2);
        ctx.lineTo(seg.x + 4.5, waveY - seg.r * 0.35);
        ctx.lineTo(seg.x, waveY + 2);
        ctx.lineTo(seg.x - 4.5, waveY - seg.r * 0.35);
        ctx.closePath();
        ctx.fill();
      });

      // 2. Forked Tongue (More dramatic & animated)
      const tongueCycle = Math.sin(frames * 0.28);
      if (tongueCycle > 0.06) {
        const tongueLength = (tongueCycle - 0.06) * 16 + 6;
        ctx.save();
        ctx.strokeStyle = '#f44336';
        ctx.lineWidth = 2.4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        ctx.moveTo(18, 2);
        ctx.lineTo(18 + tongueLength, 2);
        ctx.lineTo(18 + tongueLength + 6, -2.5);
        ctx.moveTo(18 + tongueLength, 2);
        ctx.lineTo(18 + tongueLength + 6, 6.5);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Larger Serpent Head
      const headGrad = ctx.createRadialGradient(4, -4, 3, 4, 0, 20);
      if (isHighEnergy) {
        headGrad.addColorStop(0, '#c8e6c9');
        headGrad.addColorStop(0.5, '#66bb6a');
        headGrad.addColorStop(0.85, '#ffb300');
        headGrad.addColorStop(1, '#1b5e20');
      } else {
        headGrad.addColorStop(0, '#98ee59');
        headGrad.addColorStop(0.55, '#43a047');
        headGrad.addColorStop(1, '#1b5e20');
      }

      ctx.fillStyle = headGrad;
      ctx.strokeStyle = '#0d3811';
      ctx.lineWidth = 2.8;

      ctx.beginPath();
      ctx.moveTo(2, -14);
      ctx.quadraticCurveTo(18, -13, 21, -3);
      ctx.quadraticCurveTo(24, 3, 18, 11);
      ctx.quadraticCurveTo(4, 15, -6, 11);
      ctx.quadraticCurveTo(-14, 5, -11, -8);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crown scales on forehead
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.moveTo(1, -9);
      ctx.lineTo(6, -6);
      ctx.lineTo(1, -3);
      ctx.lineTo(-4, -6);
      ctx.closePath();
      ctx.fill();

      // Lime underjaw
      ctx.fillStyle = isHighEnergy ? '#fff9c4' : 'rgba(200, 230, 201, 0.85)';
      ctx.beginPath();
      ctx.ellipse(8, 7, 9, 4.5, 0.15, 0, Math.PI * 2);
      ctx.fill();

      // Nostril
      ctx.fillStyle = '#0d3811';
      ctx.beginPath();
      ctx.arc(17, -2, 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Large Golden Predatory Eye
      ctx.fillStyle = isHighEnergy ? '#ffeb3b' : '#ffd54f';
      ctx.strokeStyle = '#0d3811';
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.ellipse(6, -5.5, 7.0, 6.2, -0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Slit Pupil
      ctx.fillStyle = '#0a120b';
      ctx.beginPath();
      ctx.ellipse(6.5, -5.5, 2.2, 5.2, -0.05, 0, Math.PI * 2);
      ctx.fill();

      // Specular Gleam Sparkles
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4.8, -7.5, 1.6, 0, Math.PI * 2);
      ctx.arc(8.0, -4.0, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Cheek blush
      ctx.fillStyle = 'rgba(255, 112, 67, 0.45)';
      ctx.beginPath();
      ctx.arc(4, 3, 4.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // 10. Active Particles, Floating Text & Shockwaves
    function drawParticles() {
      if (!ctx) return;
      ctx.save();

      // Shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 1.8;
        sw.alpha = Math.max(0, sw.alpha - 0.05);

        ctx.save();
        ctx.strokeStyle = sw.color;
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.ellipse(sw.x, sw.y, sw.radius, sw.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        if (sw.alpha <= 0.01 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
        }
      }

      // Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.isSpark ? 0.05 : 0.16;
        p.rotation += p.vRot;
        p.life++;
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        if (p.isSpark) {
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        } else {
          ctx.rect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.fill();
        ctx.restore();

        if (p.life >= p.maxLife) {
          particles.splice(i, 1);
        }
      }

      // Floating Score / High Energy Text
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.y += ft.vy;
        ft.life++;
        ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);

        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '800 13px "Trebuchet MS", Arial, sans-serif';
        ctx.fillStyle = ft.color;
        ctx.globalAlpha = ft.alpha;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.4;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();

        if (ft.life >= ft.maxLife) {
          floatingTexts.splice(i, 1);
        }
      }

      ctx.restore();
    }

    // 11. Start Screen Overlay
    function drawStartScreen() {
      if (!ctx) return;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Title Shadow
      ctx.font = '900 34px "Trebuchet MS", Arial, sans-serif';
      ctx.fillStyle = '#06130d';
      ctx.fillText('FOREST SLITHER', WIDTH / 2 + 3, 148 + 3);

      // Gradient Title
      const titleGrad = ctx.createLinearGradient(0, 120, 0, 170);
      titleGrad.addColorStop(0, '#ffffff');
      titleGrad.addColorStop(0.35, '#a5f76b');
      titleGrad.addColorStop(1, '#43a047');
      ctx.fillStyle = titleGrad;
      ctx.fillText('FOREST SLITHER', WIDTH / 2, 148);

      // Subtitle
      ctx.font = '700 13px "Trebuchet MS", Arial, sans-serif';
      ctx.fillStyle = '#ffd54f';
      ctx.fillText('EAT FOODS & GRAB ENERGY DRINKS ⚡', WIDTH / 2, 185);

      // Prompt
      const alpha = 0.65 + 0.35 * Math.sin(frames * 0.08);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.8})`;
      ctx.lineWidth = 3;
      ctx.font = '700 15px "Trebuchet MS", Arial, sans-serif';
      ctx.strokeText('TAP / SPACE TO JUMP ROCKS', WIDTH / 2, 335);
      ctx.fillText('TAP / SPACE TO JUMP ROCKS', WIDTH / 2, 335);

      // Feature Tip
      ctx.font = '600 12px "Trebuchet MS", Arial, sans-serif';
      ctx.fillStyle = '#a5f76b';
      ctx.fillText('Double Tap in Air for Slither Leap!', WIDTH / 2, 362);

      // Best Score Pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.beginPath();
      ctx.roundRect(WIDTH / 2 - 80, 400, 160, 36, 18);
      ctx.fill();

      ctx.fillStyle = '#ffd54f';
      ctx.font = '700 14px "Trebuchet MS", Arial, sans-serif';
      ctx.fillText(`BEST SCORE: ${bestScore}`, WIDTH / 2, 418);

      ctx.restore();
    }

    // 12. Score HUD & Energy Meter
    function drawHUD() {
      if (!ctx) return;
      ctx.save();

      // Top Score
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '900 42px "Trebuchet MS", Arial, sans-serif';

      ctx.fillStyle = '#0c160f';
      ctx.fillText(score.toString(), WIDTH / 2 + 3, 53);

      ctx.fillStyle = '#ffffff';
      ctx.fillText(score.toString(), WIDTH / 2, 50);

      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(score.toString(), WIDTH / 2, 50);

      // High Energy Status Tag
      const isHighEnergy = energy >= 75;
      if (isHighEnergy) {
        ctx.save();
        ctx.font = '900 12px "Trebuchet MS", Arial, sans-serif';
        ctx.fillStyle = '#ffeb3b';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.4;
        ctx.strokeText('⚡ 2X HIGH ENERGY BOOST! ⚡', WIDTH / 2, 80);
        ctx.fillText('⚡ 2X HIGH ENERGY BOOST! ⚡', WIDTH / 2, 80);
        ctx.restore();
      }

      // Energy Bar Container
      const barX = 22;
      const barY = 22;
      const barW = 100;
      const barH = 14;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.strokeStyle = '#2d2b27';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(barX, barY, barW, barH, 7);
      ctx.fill();
      ctx.stroke();

      // Energy Fill
      const fillW = Math.max(0, (barW - 4) * (energy / 100));
      if (fillW > 0) {
        const energyGrad = ctx.createLinearGradient(barX + 2, 0, barX + 2 + fillW, 0);
        if (isHighEnergy) {
          energyGrad.addColorStop(0, '#ffca28');
          energyGrad.addColorStop(0.5, '#76ff03');
          energyGrad.addColorStop(1, '#ffeb3b');
        } else {
          energyGrad.addColorStop(0, '#66bb6a');
          energyGrad.addColorStop(1, '#a5d6a7');
        }
        ctx.fillStyle = energyGrad;
        ctx.beginPath();
        ctx.roundRect(barX + 2, barY + 2, fillW, barH - 4, 5);
        ctx.fill();
      }

      // Energy Label & Lightning Icon
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 9px "Trebuchet MS", Arial, sans-serif';
      ctx.fillText('⚡ ENERGY', barX + 6, barY + 7);

      ctx.restore();
    }

    // 13. Game Over Screen Overlay
    function drawGameOverScreen() {
      if (!ctx) return;
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Header
      ctx.font = '900 38px "Trebuchet MS", Arial, sans-serif';
      ctx.fillStyle = '#2d0a0a';
      ctx.fillText('GAME OVER', WIDTH / 2 + 3, 133);
      ctx.fillStyle = '#ef5350';
      ctx.fillText('GAME OVER', WIDTH / 2, 130);
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.strokeText('GAME OVER', WIDTH / 2, 130);

      // Scorecard Container
      const cardX = 35;
      const cardY = 175;
      const cardW = 290;
      const cardH = 175;

      ctx.fillStyle = '#ded895';
      ctx.strokeStyle = '#3e2e1a';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 12);
      ctx.fill();
      ctx.stroke();

      // Medal Box
      ctx.fillStyle = '#c5bc6a';
      ctx.beginPath();
      ctx.roundRect(cardX + 18, cardY + 38, 64, 64, 8);
      ctx.fill();
      ctx.strokeStyle = '#6e5d26';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#543847';
      ctx.font = '700 12px "Trebuchet MS", Arial, sans-serif';
      ctx.fillText('MEDAL', cardX + 50, cardY + 24);

      const medalCenter = { x: cardX + 50, y: cardY + 70 };
      if (score >= 10) {
        let medalColor = '#cd7f32'; // Bronze
        let rimColor = '#8c501c';
        if (score >= 40) {
          medalColor = '#e5e4e2'; // Platinum
          rimColor = '#9fa4a6';
        } else if (score >= 30) {
          medalColor = '#ffd700'; // Gold
          rimColor = '#b8860b';
        } else if (score >= 20) {
          medalColor = '#c0c0c0'; // Silver
          rimColor = '#708090';
        }

        ctx.fillStyle = medalColor;
        ctx.beginPath();
        ctx.arc(medalCenter.x, medalCenter.y, 22, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = rimColor;
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(medalCenter.x, medalCenter.y, 16, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(medalCenter.x - 6, medalCenter.y - 6, 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#8f885a';
        ctx.font = '600 11px "Trebuchet MS", Arial, sans-serif';
        ctx.fillText('NONE', medalCenter.x, medalCenter.y);
      }

      // Score labels
      ctx.textAlign = 'right';
      ctx.fillStyle = '#cf6412';
      ctx.font = '800 13px "Trebuchet MS", Arial, sans-serif';
      ctx.fillText('SCORE', cardX + cardW - 20, cardY + 34);

      ctx.fillStyle = '#1e1b18';
      ctx.font = '900 24px "Trebuchet MS", Arial, sans-serif';
      ctx.fillText(score.toString(), cardX + cardW - 20, cardY + 62);

      ctx.fillStyle = '#cf6412';
      ctx.font = '800 13px "Trebuchet MS", Arial, sans-serif';
      ctx.fillText('BEST', cardX + cardW - 20, cardY + 98);

      ctx.fillStyle = '#1e1b18';
      ctx.font = '900 24px "Trebuchet MS", Arial, sans-serif';
      ctx.fillText(bestScore.toString(), cardX + cardW - 20, cardY + 126);

      if (isNewHigh && score > 0) {
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.roundRect(cardX + cardW - 105, cardY + 84, 38, 16, 4);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = '900 9px "Trebuchet MS", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NEW', cardX + cardW - 86, cardY + 92);
      }

      // Restart Button
      const btnX = WIDTH / 2 - 75;
      const btnY = 380;
      const btnW = 150;
      const btnH = 46;

      ctx.fillStyle = '#4caf50';
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(btnX, btnY, btnW, btnH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(btnX + 3, btnY + 2, btnW - 6, btnH / 2 - 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = '800 18px "Trebuchet MS", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('RESTART', WIDTH / 2, btnY + btnH / 2);

      ctx.fillStyle = '#ffffff';
      ctx.font = '600 12px "Trebuchet MS", Arial, sans-serif';
      ctx.fillText('or Press Space / Tap screen', WIDTH / 2, 448);

      ctx.restore();
    }

    // --- MAIN GAME LOOP ---
    let animationId: number;

    function loop() {
      if (!ctx) return;
      frames++;

      // 1. UPDATE STATE
      if (gameState !== 'GAMEOVER') {
        groundScroll = (groundScroll - SCROLL_SPEED) % 72;
      }

      // Bats update
      bats.forEach((b) => {
        b.x -= b.speed;
        if (b.x < -60) {
          b.x = WIDTH + 50;
          b.y = 80 + Math.random() * 160;
        }
      });

      if (gameState === 'START') {
        snake.y = GROUND_Y - 6;
        snake.isGrounded = true;
        snake.slitherCycle += 0.22;
        snake.rotation = 0;
        snake.squashX = 1;
        snake.squashY = 1;
      } else if (gameState === 'PLAYING') {
        snake.slitherCycle += 0.32;

        // Energy decays slowly over time
        if (frames % 4 === 0 && energy > 0) {
          energy = Math.max(0, energy - 0.25);
        }

        // Check if just entered high energy mode
        const isHighEnergy = energy >= 75;
        if (isHighEnergy && !wasHighEnergy) {
          soundRef.current.powerSurge();
          spawnFloatingText(snake.x, snake.y - 28, 'HIGH ENERGY 2X!', '#ffeb3b');
        }
        wasHighEnergy = isHighEnergy;

        // Process buffered jump input
        if (snake.jumpBuffer > 0) {
          if (snake.performJump()) {
            snake.jumpBuffer = 0;
          } else {
            snake.jumpBuffer--;
          }
        }

        if (!snake.isGrounded) {
          snake.vy += GRAVITY;
          snake.y += snake.vy;

          // Smooth aerodynamic body tilt aligning with jump curve
          const targetRotation = Math.atan2(snake.vy, SCROLL_SPEED * 2.8) * 0.45;
          snake.rotation += (targetRotation - snake.rotation) * 0.16;

          // Recover squash/stretch smoothly towards 1
          snake.squashX += (1 - snake.squashX) * 0.1;
          snake.squashY += (1 - snake.squashY) * 0.1;

          // Land back on the forest floor
          if (snake.y >= GROUND_Y - 6) {
            snake.y = GROUND_Y - 6;
            snake.vy = 0;
            snake.isGrounded = true;
            snake.jumpsLeft = 2;
            snake.rotation = 0;

            // Landing squash cushion effect
            snake.squashX = 1.25;
            snake.squashY = 0.76;

            soundRef.current.land();
            spawnDustParticles(snake.x - 4, GROUND_Y, 8);
            spawnShockwave(snake.x - 2, GROUND_Y + 1, '#8d7864');
          }
        } else {
          // On Ground
          snake.y = GROUND_Y - 6;
          snake.vy = 0;
          snake.rotation = 0;
          snake.coyoteFrames = 6;
          snake.jumpsLeft = 2;

          // Spring recovery
          snake.squashX += (1 - snake.squashX) * 0.18;
          snake.squashY += (1 - snake.squashY) * 0.18;

          // Dust trail when slithering
          if (frames % 6 === 0) {
            spawnDustParticles(snake.x - 16, GROUND_Y, 2);
          }
        }

        // Spawn Rocks on Ground
        const spawnRate = Math.max(76, 96 - Math.floor(score * 0.7));
        if (frames % spawnRate === 0) {
          spawnObstacle();
        }

        // Spawn Energy Foods at regular intervals (every ~120 frames)
        if (frames % 125 === 0) {
          spawnFood();
        }

        // Update & Check Food Items
        for (let i = foods.length - 1; i >= 0; i--) {
          const food = foods[i];
          food.x -= SCROLL_SPEED;

          // Snug circular collision check with snake's head & body
          const distSq = (snake.x - food.x) * (snake.x - food.x) + (snake.y - food.y) * (snake.y - food.y);
          const collideRadius = snake.radius + food.radius;

          if (!food.collected && distSq < collideRadius * collideRadius) {
            food.collected = true;
            energy = Math.min(100, energy + food.energyVal);

            const scoreAdd = isHighEnergy ? food.pointsVal * 2 : food.pointsVal;
            score += scoreAdd;

            if (food.type === 'energy_drink') {
              soundRef.current.drinkEnergy();
              spawnFoodParticles(food.x, food.y, '#00e5ff');
              spawnFoodParticles(food.x, food.y, '#76ff03');
              spawnFloatingText(food.x, food.y - 14, '+50 ENERGY DRINK! ⚡', '#00e5ff');
              spawnShockwave(food.x, food.y, '#00e5ff');
            } else {
              soundRef.current.eatFood(food.type === 'golden_egg');
              spawnFoodParticles(food.x, food.y, food.type === 'golden_egg' ? '#ffd54f' : '#f44336');
              spawnFloatingText(food.x, food.y - 12, `+${food.energyVal} ENERGY!`, '#a5f76b');
            }
          }

          if (food.x < -40) {
            foods.splice(i, 1);
          }
        }

        // Move Obstacles & Check Collisions
        for (let i = obstacles.length - 1; i >= 0; i--) {
          const obs = obstacles[i];
          obs.x -= SCROLL_SPEED;

          if (!obs.passed && obs.x + obs.width < snake.x) {
            obs.passed = true;
            score += isHighEnergy ? 2 : 1;
            soundRef.current.score();
          }

          // Snug, forgiving hitbox check tailored for larger serpent
          const snakeBox = {
            left: snake.x - snake.radius + 5,
            right: snake.x + snake.radius - 5,
            top: snake.y - snake.radius + 4,
            bottom: snake.y + snake.radius - 2,
          };

          const rockBox = {
            left: obs.x + 4,
            right: obs.x + obs.width - 4,
            top: obs.y + 4,
            bottom: GROUND_Y,
          };

          const collides =
            snakeBox.right > rockBox.left &&
            snakeBox.left < rockBox.right &&
            snakeBox.bottom > rockBox.top &&
            snakeBox.top < rockBox.bottom;

          if (collides) {
            triggerGameOver();
          }

          if (obs.x < -obs.width - 20) {
            obstacles.splice(i, 1);
          }
        }
      } else if (gameState === 'GAMEOVER') {
        if (snake.y < GROUND_Y - 6) {
          snake.vy += GRAVITY * 1.2;
          snake.y += snake.vy;
          if (snake.y >= GROUND_Y - 6) {
            snake.y = GROUND_Y - 6;
            snake.vy = 0;
          }
        }
      }

      // Flash fade
      if (flashOpacity > 0) {
        flashOpacity = Math.max(0, flashOpacity - 0.05);
      }

      // 2. RENDER STAGE
      drawSky();
      drawMountains();
      drawTrees();
      bats.forEach(drawBat);
      drawAtmosphere();
      drawGround();

      // Render stone obstacles & foods
      obstacles.forEach(drawObstacle);
      drawFoods();

      // Render particles, shockwaves & snake
      drawParticles();
      drawSnake();

      // Overlays
      if (gameState === 'START') {
        drawStartScreen();
      } else if (gameState === 'PLAYING') {
        drawHUD();
      } else if (gameState === 'GAMEOVER') {
        drawGameOverScreen();
      }

      if (flashOpacity > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${flashOpacity})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      }

      animationId = requestAnimationFrame(loop);
    }

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('keydown', onKeyDown);
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('touchstart', onTouchStart);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-stone-950 select-none p-2 sm:p-4">
      {/* Game Header Bar */}
      <div className="w-full max-w-[360px] flex items-center justify-between py-2 px-1 text-stone-300 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold tracking-wider text-stone-200">FOREST SLITHER</span>
        </div>
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs transition-colors flex items-center gap-1.5"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? '🔇 Muted' : '🔊 Sound ON'}
        </button>
      </div>

      {/* Retro Arcade Screen Container */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-stone-800 bg-black flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={360}
          height={640}
          className="block w-full max-w-[360px] max-h-[85vh] object-contain cursor-pointer"
        />
      </div>

      {/* Control Instruction Hint */}
      <div className="mt-3 text-center text-xs text-stone-400 font-sans tracking-wide">
        Press <kbd className="px-1.5 py-0.5 bg-stone-900 border border-stone-800 rounded text-stone-200 font-mono">Space</kbd> or <span className="text-stone-200">Tap</span> to Jump • Grab <span className="text-cyan-400 font-semibold">Energy Drinks ⚡</span> for <span className="text-emerald-400 font-medium">Instant High Energy!</span>
      </div>
    </div>
  );
}
