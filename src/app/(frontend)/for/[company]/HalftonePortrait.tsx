"use client";

import { useEffect, useRef } from "react";
import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
  VideoTexture,
  Vector2,
  LinearFilter,
  RGBAFormat,
} from "three";
import { useInteractionVelocity } from "./useInteractionVelocity";

interface HalftonePortraitProps {
  videoSrc: string;
  className?: string;
}

const RENDER_SIZE = 1200;
const TRAIL_LENGTH = 8;

const VERTEX_SHADER = `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 vUv;

uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform vec2 uMouse;
uniform vec2 uMouseVel;
uniform float uScrollVel;
uniform float uTime;
uniform float uLightDirection;
uniform vec2 uMouseTrail[8];

const float CELL_WIDTH = 14.0;
const float CELL_HEIGHT = 8.0;
const float DASH_LENGTH_MIN = 1.8;
const float DASH_LENGTH_MAX = 30.0;
const float DASH_THICK_MIN = 0.35;
const float DASH_THICK_MAX = 3.5;
const float MOUSE_RADIUS = 0.25;
const float MOUSE_STRENGTH = 2.5;
const float SCROLL_STRENGTH = 1.5;

const float DARKNESS_THRESHOLD = 0.03;

const float MAX_H_OFFSET_BRIGHT = 10.0;
const float MAX_H_OFFSET_DARK = 1.5;

const float ANGLE_MAGNITUDE = 0.12;
const float MAX_ANGLE_DEVIATION = 0.087;

// Terra10 (#f5f1ec) — matches $portfolio-terra-10
const vec3 BG_COLOR = vec3(0.961, 0.945, 0.925);
const vec3 DASH_COLOR = vec3(0.2, 0.212, 1.0);

float getLuminance(vec3 color) {
  return dot(color, vec3(0.299, 0.587, 0.114));
}

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float hash21b(vec2 p) {
  p = fract(p * vec2(123.45, 678.91));
  p += dot(p, p + 56.78);
  return fract(p.x * p.y);
}

float getDashFromCell(vec2 pixelCoord, vec2 cellIdx, float time, vec2 mouse, vec2 mouseVel, float scrollVel, float baseAngle) {
  vec2 cellSize = vec2(CELL_WIDTH, CELL_HEIGHT);
  vec2 baseCellCenterPx = (cellIdx + 0.5) * cellSize;
  
  vec2 cellCenterUV = clamp(baseCellCenterPx / uResolution, 0.001, 0.999);
  
  vec4 texColor = texture2D(uTexture, cellCenterUV);
  float luminance = clamp(getLuminance(texColor.rgb), 0.0, 1.0);
  float darkness = (1.0 - luminance) * texColor.a;
  
  if (darkness < DARKNESS_THRESHOLD) {
    return 0.0;
  }
  
  float skipThreshold = 0.35;
  if (darkness < skipThreshold) {
    float keepProbability;
    
    if (darkness < 0.08) {
      keepProbability = mix(0.1, 0.3, smoothstep(DARKNESS_THRESHOLD, 0.08, darkness));
    } else if (darkness < 0.18) {
      keepProbability = mix(0.3, 0.7, smoothstep(0.08, 0.18, darkness));
    } else {
      keepProbability = mix(0.7, 1.0, smoothstep(0.18, skipThreshold, darkness));
    }
    
    float randomVal = hash21(cellIdx + vec2(99.0, 77.0));
    if (randomVal > keepProbability) {
      return 0.0;
    }
  }
  
  float brightness = 1.0 - darkness;
  float maxOffset = mix(MAX_H_OFFSET_DARK, MAX_H_OFFSET_BRIGHT, brightness * brightness);
  float randomOffset = (hash21(cellIdx) - 0.5) * 2.0 * maxOffset;
  float vJitter = (hash21b(cellIdx) - 0.5) * brightness * 2.5;
  
  float dashRandom = hash21(cellIdx * 7.31);
  
  float isOddRow = mod(cellIdx.y, 2.0);
  
  float rowMultiplier = mix(0.5, 0.7, isOddRow);
  
  float globalWave = sin(time * 0.4);
  
  float rowPhase = cellIdx.y * 0.15;
  float rowWave = sin(time * 0.4 + rowPhase);
  
  float mainFloat = mix(globalWave, rowWave, 0.3) * rowMultiplier;
  
  float subtleIndividual = sin(time * 0.5 + dashRandom * 3.0) * 0.1;
  
  float floatAmount = 4.0;
  
  float hWaveSpeed = 0.45;
  float hWaveAmplitude = 2.0;
  
  float hWave1 = sin(cellCenterUV.x * 6.28318 * 2.0 - time * hWaveSpeed);
  float hWave2 = sin((cellCenterUV.x + cellCenterUV.y * 0.2) * 6.28318 * 1.5 - time * hWaveSpeed * 0.8) * 0.4;
  float horizontalOceanWave = (hWave1 + hWave2) * hWaveAmplitude;
  
  float vWaveSpeed = 0.38;
  float vWaveAmplitude = 1.5;
  
  float vWave1 = sin(cellCenterUV.y * 6.28318 * 2.5 - time * vWaveSpeed);
  float vWave2 = sin((cellCenterUV.y + cellCenterUV.x * 0.15) * 6.28318 * 2.0 - time * vWaveSpeed * 0.6) * 0.3;
  float verticalOceanWave = (vWave1 + vWave2) * vWaveAmplitude;
  
  float totalFloat = (mainFloat + subtleIndividual) * floatAmount + horizontalOceanWave + verticalOceanWave;
  
  float hMoveSpeed = 0.45;
  float hMoveAmplitude = 5.0;
  
  float columnDelay = cellCenterUV.x * 2.0;
  
  float hSway1 = sin(time * hMoveSpeed - columnDelay);
  
  float rowDelay = cellCenterUV.y * 1.5;
  float hSway2 = sin(time * hMoveSpeed * 0.7 - columnDelay * 0.8 - rowDelay * 0.3) * 0.4;
  
  float hDrift = (hSway1 + hSway2) * hMoveAmplitude;
  
  vec2 dashCenterPx = baseCellCenterPx + vec2(randomOffset + hDrift, vJitter + totalFloat);
  
  vec2 dashUV = dashCenterPx / uResolution;
  vec2 totalRipple = vec2(0.0);
  
  float rippleRadius = 0.08;
  float maxDisplacement = 2.0;
  
  for (int i = 0; i < 8; i++) {
    vec2 trailPos = uMouseTrail[i];
    vec2 fromTrail = dashUV - trailPos;
    float distFromTrail = length(fromTrail);
    
    float strength = 1.0 - smoothstep(0.0, rippleRadius, distFromTrail);
    strength = strength * strength;
    
    float ageFactor = 1.0 - float(i) / 8.0;
    ageFactor = ageFactor * ageFactor;
    strength *= ageFactor;
    
    vec2 rippleDir = distFromTrail > 0.001 ? normalize(fromTrail) : vec2(0.0);
    
    totalRipple += rippleDir * strength * maxDisplacement;
  }
  
  dashCenterPx += totalRipple;
  
  float angle = baseAngle;
  
  float edgeDeviation = sin(cellIdx.x * 7.7 + cellIdx.y * 13.3) * 0.04;
  angle += edgeDeviation;
  
  float cellNoise = sin(cellIdx.x * 12.3 + cellIdx.y * 45.6) * 0.025;
  angle += cellNoise;
  
  angle = clamp(angle, baseAngle - MAX_ANGLE_DEVIATION, baseAngle + MAX_ANGLE_DEVIATION);
  
  vec2 dashCenterUV = dashCenterPx / uResolution;
  vec2 toMouse = mouse - dashCenterUV;
  float mouseDist = length(toMouse);
  float mouseInfluence = 1.0 - smoothstep(0.0, MOUSE_RADIUS, mouseDist);
  mouseInfluence = mouseInfluence * mouseInfluence * mouseInfluence;
  
  float mouseVelMag = length(mouseVel);
  float mouseAngle = mouseVelMag > 0.005 ? atan(mouseVel.y, mouseVel.x) : 0.0;
  float mouseRotation = mouseAngle * mouseInfluence * MOUSE_STRENGTH * clamp(mouseVelMag * 2.0, 0.0, 1.0);
  
  float scrollWave = sin(dashCenterUV.y * 6.28318 + time * 1.5) * 0.3 + 1.0;
  float scrollRotation = scrollVel * SCROLL_STRENGTH * scrollWave;
  
  float breathe = sin(time * 0.3 + dashCenterUV.x * 2.0 + dashCenterUV.y * 1.5) * 0.015;
  
  float finalAngle = angle + mouseRotation + scrollRotation + breathe;
  
  vec2 relPos = pixelCoord - dashCenterPx;
  
  float cosA = cos(finalAngle);
  float sinA = sin(finalAngle);
  vec2 rotatedPos = vec2(
    relPos.x * cosA - relPos.y * sinA,
    relPos.x * sinA + relPos.y * cosA
  );
  
  float sizeFactor = smoothstep(0.0, 1.0, darkness);
  float lengthFactor = pow(sizeFactor, 0.7);
  float dashHalfLength = mix(DASH_LENGTH_MIN, DASH_LENGTH_MAX, lengthFactor) * 0.5;
  
  float thickFactor = pow(sizeFactor, 0.6);
  float dashHalfThick = mix(DASH_THICK_MIN, DASH_THICK_MAX, thickFactor) * 0.5;
  
  float shrinkAmount = mouseInfluence * 0.7;
  dashHalfLength *= (1.0 - shrinkAmount);
  dashHalfThick *= (1.0 - shrinkAmount);
  
  float dx = abs(rotatedPos.x) - dashHalfLength;
  float dy = abs(rotatedPos.y) - dashHalfThick;
  float outsideDist = length(max(vec2(dx, dy), 0.0));
  float insideDist = min(max(dx, dy), 0.0);
  float dist = outsideDist + insideDist;
  
  return 1.0 - smoothstep(-0.5, 0.5, dist);
}

void main() {
  vec2 pixelCoord = vUv * uResolution;
  vec2 cellSize = vec2(CELL_WIDTH, CELL_HEIGHT);
  vec2 baseCellIdx = floor(pixelCoord / cellSize);
  
  float baseAngle = ANGLE_MAGNITUDE * uLightDirection;
  
  float totalDash = 0.0;
  
  for (float dy = -2.0; dy <= 2.0; dy += 1.0) {
    for (float dx = -2.0; dx <= 2.0; dx += 1.0) {
      vec2 neighborCell = baseCellIdx + vec2(dx, dy);
      float contribution = getDashFromCell(
        pixelCoord, 
        neighborCell, 
        uTime, 
        uMouse, 
        uMouseVel, 
        uScrollVel,
        baseAngle
      );
      totalDash = max(totalDash, contribution);
    }
  }
  
  totalDash = clamp(totalDash, 0.0, 1.0);
  
  vec3 finalColor = mix(BG_COLOR, DASH_COLOR, totalDash);
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default function HalftonePortrait({ videoSrc, className }: HalftonePortraitProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const interactionValues = useInteractionVelocity(canvasRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const pixelRatio = Math.min(window.devicePixelRatio, 2);

    // Target ~2400 physical pixels regardless of DPR so detail is consistent
    // across Retina (2x) and non-Retina (1x) displays. Also ensures the
    // buffer is at least as large as the container to prevent upscaling.
    // GPU cost is identical on both: 2400² physical pixels = 5.76M.
    const renderSize = Math.max(
      container.clientWidth,
      container.clientHeight,
      RENDER_SIZE,
      Math.ceil(2400 / pixelRatio),
    );
    const renderer = new WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      preserveDrawingBuffer: false,
    });
    renderer.setPixelRatio(pixelRatio);
    renderer.setSize(renderSize, renderSize, false);
    // Terra10 (#f5f1ec) — matches page / $portfolio-terra-10
    renderer.setClearColor(0xf5f1ec, 1);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const trailUniforms: Vector2[] = [];
    for (let i = 0; i < TRAIL_LENGTH; i++) {
      trailUniforms.push(new Vector2(0.5, 0.5));
    }

    const uniforms = {
      uTexture: { value: null as VideoTexture | null },
      uResolution: {
        value: new Vector2(renderSize * pixelRatio, renderSize * pixelRatio),
      },
      uMouse: { value: new Vector2(0.5, 0.5) },
      uMouseVel: { value: new Vector2(0, 0) },
      uScrollVel: { value: 0 },
      uTime: { value: 0 },
      uLightDirection: { value: -1.0 },
      uMouseTrail: { value: trailUniforms },
    };

    const material = new ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
    });

    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const video = document.createElement("video");
    video.src = videoSrc;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.preload = "auto";

    const videoTexture = new VideoTexture(video);
    videoTexture.minFilter = LinearFilter;
    videoTexture.magFilter = LinearFilter;
    videoTexture.format = RGBAFormat;
    uniforms.uTexture.value = videoTexture;

    video.addEventListener("loadeddata", () => {
      video.play().catch(() => {});
    });

    let animationFrameId: number;
    const startTime = performance.now();
    const ACTIVE_INTERVAL = 1000 / 30;
    const IDLE_INTERVAL = 1000 / 15;
    const IDLE_THRESHOLD = 0.001;
    let lastRenderTime = 0;

    const animate = (now: number) => {
      animationFrameId = requestAnimationFrame(animate);

      const v = interactionValues.current;
      const isIdle =
        Math.abs(v.mouseVelX) < IDLE_THRESHOLD &&
        Math.abs(v.mouseVelY) < IDLE_THRESHOLD &&
        Math.abs(v.scrollVel) < IDLE_THRESHOLD;

      const interval = isIdle ? IDLE_INTERVAL : ACTIVE_INTERVAL;
      if (now - lastRenderTime < interval) return;
      lastRenderTime = now;

      const elapsed = (now - startTime) / 1000;

      uniforms.uMouse.value.set(v.mouseX, v.mouseY);

      if (prefersReducedMotion) {
        uniforms.uMouseVel.value.set(0, 0);
        uniforms.uScrollVel.value = 0;
        uniforms.uTime.value = 0;
      } else {
        uniforms.uMouseVel.value.set(v.mouseVelX, v.mouseVelY);
        uniforms.uScrollVel.value = v.scrollVel;
        uniforms.uTime.value = elapsed;

        const trail = v.mouseTrail;
        for (let i = 0; i < TRAIL_LENGTH; i++) {
          if (trail[i]) {
            trailUniforms[i].set(trail[i].x, trail[i].y);
          }
        }
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      videoTexture.dispose();
      renderer.dispose();
      video.pause();
      video.src = "";
    };
  }, [videoSrc, interactionValues]);

  return (
    <div ref={containerRef} className={className}>
      <canvas ref={canvasRef} />
    </div>
  );
}
