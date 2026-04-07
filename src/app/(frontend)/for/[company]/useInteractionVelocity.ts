import { useEffect, useRef, useCallback } from 'react';

interface VelocityState {
  mousePos: { x: number; y: number };
  mouseVel: { x: number; y: number };
  scrollVel: number;
  lastMousePos: { x: number; y: number };
  lastTime: number;
}

export interface InteractionValues {
  mouseX: number;
  mouseY: number;
  mouseVelX: number;
  mouseVelY: number;
  scrollVel: number;
  mouseTrail: { x: number; y: number }[];
}

const SMOOTHING = 0.045;
const DECAY = 0.985;

const TRAIL_LENGTH = 8;
const TRAIL_UPDATE_INTERVAL = 50;
const UPDATE_INTERVAL = 1000 / 30;

export function useInteractionVelocity(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
): React.MutableRefObject<InteractionValues> {
  const values = useRef<InteractionValues>({
    mouseX: 0.5,
    mouseY: 0.5,
    mouseVelX: 0,
    mouseVelY: 0,
    scrollVel: 0,
    mouseTrail: Array(TRAIL_LENGTH).fill({ x: 0.5, y: 0.5 }),
  });

  const state = useRef<VelocityState>({
    mousePos: { x: 0.5, y: 0.5 },
    mouseVel: { x: 0, y: 0 },
    scrollVel: 0,
    lastMousePos: { x: 0.5, y: 0.5 },
    lastTime: performance.now(),
  });

  const lastTrailUpdate = useRef<number>(performance.now());
  const animationFrameId = useRef<number>(0);
  const lastUpdateTime = useRef<number>(0);

  const updateLoop = useCallback(() => {
    animationFrameId.current = requestAnimationFrame(updateLoop);
    const now = performance.now();
    if (now - lastUpdateTime.current < UPDATE_INTERVAL) return;
    lastUpdateTime.current = now;

    const dt = Math.min((now - state.current.lastTime) / 16.67, 2);
    state.current.lastTime = now;

    values.current.mouseX +=
      (state.current.mousePos.x - values.current.mouseX) * SMOOTHING * dt;
    values.current.mouseY +=
      (state.current.mousePos.y - values.current.mouseY) * SMOOTHING * dt;

    values.current.mouseVelX +=
      (state.current.mouseVel.x - values.current.mouseVelX) * SMOOTHING * dt;
    values.current.mouseVelY +=
      (state.current.mouseVel.y - values.current.mouseVelY) * SMOOTHING * dt;
    values.current.mouseVelX *= DECAY;
    values.current.mouseVelY *= DECAY;

    values.current.scrollVel +=
      (state.current.scrollVel - values.current.scrollVel) * SMOOTHING * dt;
    values.current.scrollVel *= DECAY;

    state.current.mouseVel.x *= 0.92;
    state.current.mouseVel.y *= 0.92;
    state.current.scrollVel *= 0.92;

    if (now - lastTrailUpdate.current > TRAIL_UPDATE_INTERVAL) {
      lastTrailUpdate.current = now;
      
      const newTrail = [...values.current.mouseTrail];
      for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
        newTrail[i] = newTrail[i - 1];
      }
      newTrail[0] = { x: values.current.mouseX, y: values.current.mouseY };
      values.current.mouseTrail = newTrail;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1.0 - (e.clientY - rect.top) / rect.height;

      const dx = x - state.current.lastMousePos.x;
      const dy = y - state.current.lastMousePos.y;

      if (x >= -0.2 && x <= 1.2 && y >= -0.2 && y <= 1.2) {
        state.current.mouseVel.x += dx * 8;
        state.current.mouseVel.y += dy * 8;
        state.current.mouseVel.x = Math.max(-2, Math.min(2, state.current.mouseVel.x));
        state.current.mouseVel.y = Math.max(-2, Math.min(2, state.current.mouseVel.y));
      }

      state.current.mousePos.x = Math.max(0, Math.min(1, x));
      state.current.mousePos.y = Math.max(0, Math.min(1, y));
      state.current.lastMousePos.x = x;
      state.current.lastMousePos.y = y;
    };

    const handleWheel = (e: WheelEvent) => {
      const delta = e.deltaY * 0.001;
      state.current.scrollVel += delta * 3;
      state.current.scrollVel = Math.max(-1, Math.min(1, state.current.scrollVel));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const touch = e.touches[0];
      const rect = canvas.getBoundingClientRect();
      const x = (touch.clientX - rect.left) / rect.width;
      const y = 1.0 - (touch.clientY - rect.top) / rect.height;

      const dx = x - state.current.lastMousePos.x;
      const dy = y - state.current.lastMousePos.y;

      state.current.mouseVel.x += dx * 8;
      state.current.mouseVel.y += dy * 8;
      state.current.mouseVel.x = Math.max(-2, Math.min(2, state.current.mouseVel.x));
      state.current.mouseVel.y = Math.max(-2, Math.min(2, state.current.mouseVel.y));
      
      state.current.mousePos.x = Math.max(0, Math.min(1, x));
      state.current.mousePos.y = Math.max(0, Math.min(1, y));
      state.current.lastMousePos.x = x;
      state.current.lastMousePos.y = y;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    animationFrameId.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [canvasRef, updateLoop]);

  return values;
}
