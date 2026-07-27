import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './RippleGrid.css';

const hexToRgb = (hex) => {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return match
    ? [parseInt(match[1], 16) / 255, parseInt(match[2], 16) / 255, parseInt(match[3], 16) / 255]
    : [1, 1, 1];
};

const vertexShader = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

const float PI = 3.141592;
mat2 rotate(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  uv.x *= iResolution.x / iResolution.y;
  uv = rotate(gridRotation * PI / 180.0) * uv;

  float dist = length(uv);
  float wave = sin(PI * (iTime - dist));
  vec2 rippleUv = uv + uv * wave * rippleIntensity;

  vec2 mouseUv = mousePosition * 2.0 - 1.0;
  mouseUv.x *= iResolution.x / iResolution.y;
  float mouseDist = length(uv - mouseUv);
  float influence = mouseInfluence * exp(-mouseDist * mouseDist / (mouseInteractionRadius * mouseInteractionRadius));
  float mouseWave = sin(PI * (iTime * 2.0 - mouseDist * 3.0)) * influence;
  rippleUv += normalize(uv - mouseUv + 0.0001) * mouseWave * rippleIntensity * 0.42;

  vec2 bands = abs(sin(gridSize * 0.5 * PI * rippleUv - PI / 2.0));
  vec2 smoothBands = smoothstep(vec2(0.0), vec2(0.5), bands);
  vec3 lines = vec3(0.0);
  lines += exp(-gridThickness * smoothBands.x * (0.82 + 0.48 * sin(PI * iTime)));
  lines += exp(-gridThickness * smoothBands.y);
  lines += glowIntensity * exp(-gridThickness * 0.42 * smoothBands.x);
  lines += glowIntensity * exp(-gridThickness * 0.42 * smoothBands.y);

  float centerFade = exp(-1.35 * clamp(pow(dist, fadeDistance), 0.0, 1.0));
  float vignetteDistance = length(vUv - 0.5);
  float vignette = clamp(1.0 - pow(vignetteDistance * 1.75, vignetteStrength), 0.0, 1.0);
  float finalFade = centerFade * vignette;
  float alpha = length(lines) * finalFade * opacity;
  gl_FragColor = vec4(lines * gridColor * finalFade * opacity, alpha);
}
`;

export default function RippleGrid({
  gridColor = '#4ff5e9',
  rippleIntensity = 0.11,
  gridSize = 12,
  gridThickness = 10,
  fadeDistance = 2.2,
  vignetteStrength = 1.2,
  glowIntensity = 0.24,
  opacity = 0.76,
  gridRotation = 14,
  mouseInteraction = true,
  mouseInteractionRadius = 1.25,
  speed = 0.55,
  paused = false,
}) {
  const containerRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, isMobile ? 0.6 : 1.25),
      alpha: true,
      antialias: false,
    });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: [1, 1] },
      gridColor: { value: hexToRgb(gridColor) },
      rippleIntensity: { value: rippleIntensity },
      gridSize: { value: gridSize },
      gridThickness: { value: gridThickness },
      fadeDistance: { value: fadeDistance },
      vignetteStrength: { value: vignetteStrength },
      glowIntensity: { value: glowIntensity },
      opacity: { value: opacity },
      gridRotation: { value: gridRotation },
      mousePosition: { value: [0.5, 0.5] },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: mouseInteractionRadius },
    };
    const program = new Program(gl, { vertex: vertexShader, fragment: fragmentShader, uniforms });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    container.appendChild(gl.canvas);

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height);
      uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const target = { x: 0.5, y: 0.5, influence: 0 };
    const current = { x: 0.5, y: 0.5, influence: 0 };
    const onPointerMove = (event) => {
      if (!mouseInteraction) return;
      target.x = event.clientX / window.innerWidth;
      target.y = 1 - event.clientY / window.innerHeight;
      target.influence = 1;
    };
    const onPointerLeave = () => { target.influence = 0; };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave, { passive: true });

    let frame = 0;
    let lastRender = 0;
    const render = (time) => {
      frame = requestAnimationFrame(render);
      if (pausedRef.current) return;
      if (isMobile && time - lastRender < 33) return;
      lastRender = time;
      current.x += (target.x - current.x) * 0.075;
      current.y += (target.y - current.y) * 0.075;
      current.influence += (target.influence - current.influence) * 0.045;
      uniforms.mousePosition.value = [current.x, current.y];
      uniforms.mouseInfluence.value = current.influence;
      uniforms.iTime.value = time * 0.001 * speed;
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [fadeDistance, glowIntensity, gridColor, gridRotation, gridSize, gridThickness, mouseInteraction, mouseInteractionRadius, opacity, rippleIntensity, speed, vignetteStrength]);

  return <div ref={containerRef} className="ripple-grid-container" />;
}
