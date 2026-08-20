import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './LiquidChrome.css';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragmentShader = `
precision highp float;
uniform float uTime;
uniform vec3 uResolution;
uniform vec3 uBaseColor;
uniform float uAmplitude;
uniform float uFrequencyX;
uniform float uFrequencyY;
uniform vec2 uMouse;
varying vec2 vUv;

vec4 renderImage(vec2 uvCoord) {
  vec2 fragCoord = uvCoord * uResolution.xy;
  vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

  for (float i = 1.0; i < 10.0; i++) {
    uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
    uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
  }

  vec2 diff = uvCoord - uMouse;
  float dist = length(diff);
  float falloff = exp(-dist * 16.0);
  float ripple = sin(12.0 * dist - uTime * 2.3) * 0.045;
  uv += (diff / (dist + 0.0001)) * ripple * falloff;

  vec3 color = uBaseColor / max(abs(sin(uTime - uv.y - uv.x)), 0.085);
  return vec4(color, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  for (int x = -1; x <= 1; x++) {
    for (int y = -1; y <= 1; y++) {
      vec2 offset = vec2(float(x), float(y)) / min(uResolution.x, uResolution.y);
      color += renderImage(vUv + offset);
    }
  }
  gl_FragColor = color / 9.0;
}
`;

export default function LiquidChrome({
  baseColor = [0.04, 0.09, 0.13],
  speed = 0.7,
  amplitude = 0.62,
  frequencyX = 2.5,
  frequencyY = 1.5,
  interactive = true,
  paused = false,
  disableOnMobile = false,
}) {
  const containerRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (disableOnMobile && isMobile) return undefined;

    const renderer = new Renderer({
      antialias: false,
      alpha: false,
      dpr: Math.min(window.devicePixelRatio, isMobile ? 0.6 : 1.25),
    });
    const gl = renderer.gl;
    gl.clearColor(baseColor[0], baseColor[1], baseColor[2], 1);

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: new Float32Array([1, 1, 1]) },
        uBaseColor: { value: new Float32Array(baseColor) },
        uAmplitude: { value: amplitude },
        uFrequencyX: { value: frequencyX },
        uFrequencyY: { value: frequencyY },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height);
      const resolution = program.uniforms.uResolution.value;
      resolution[0] = gl.canvas.width;
      resolution[1] = gl.canvas.height;
      resolution[2] = gl.canvas.width / gl.canvas.height;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    container.appendChild(gl.canvas);

    const onPointerMove = (event) => {
      if (!interactive) return;
      const mouse = program.uniforms.uMouse.value;
      mouse[0] = event.clientX / window.innerWidth;
      mouse[1] = 1 - event.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    let frame = 0;
    let lastRender = 0;
    const render = (time) => {
      frame = requestAnimationFrame(render);
      if (pausedRef.current) return;
      if (isMobile && time - lastRender < 41) return;
      lastRender = time;
      program.uniforms.uTime.value = time * 0.001 * speed;
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [amplitude, baseColor, disableOnMobile, frequencyX, frequencyY, interactive, speed]);

  return <div ref={containerRef} className="liquid-chrome-container" />;
}
