import { Mesh, Program, Renderer, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import './Balatro.css';

function hexToVec4(hex) {
  const value = hex.replace('#', '');
  if (value.length !== 6 && value.length !== 8) return [0, 0, 0, 1];
  return [
    parseInt(value.slice(0, 2), 16) / 255,
    parseInt(value.slice(2, 4), 16) / 255,
    parseInt(value.slice(4, 6), 16) / 255,
    value.length === 8 ? parseInt(value.slice(6, 8), 16) / 255 : 1,
  ];
}

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `
precision highp float;
uniform float iTime;
uniform vec3 iResolution;
uniform float uSpinRotation;
uniform float uSpinSpeed;
uniform vec2 uOffset;
uniform vec4 uColor1;
uniform vec4 uColor2;
uniform vec4 uColor3;
uniform float uContrast;
uniform float uLighting;
uniform float uSpinAmount;
uniform float uPixelFilter;
uniform float uSpinEase;
uniform bool uIsRotate;
uniform vec2 uMouse;
varying vec2 vUv;

vec4 effect(vec2 screenSize, vec2 screenCoords) {
  float pixelSize = length(screenSize.xy) / uPixelFilter;
  vec2 uv = (floor(screenCoords.xy / pixelSize) * pixelSize - 0.5 * screenSize.xy) / length(screenSize.xy) - uOffset;
  float uvLength = length(uv);
  float speed = uSpinRotation * uSpinEase * 0.2;
  if (uIsRotate) speed = iTime * speed;
  speed += 302.2;
  float mouseInfluence = uMouse.x * 2.0 - 1.0;
  speed += mouseInfluence * 0.1;
  float angle = atan(uv.y, uv.x) + speed - uSpinEase * 20.0 * (uSpinAmount * uvLength + (1.0 - uSpinAmount));
  vec2 mid = (screenSize.xy / length(screenSize.xy)) / 2.0;
  uv = vec2(uvLength * cos(angle) + mid.x, uvLength * sin(angle) + mid.y) - mid;
  uv *= 30.0;
  speed = iTime * uSpinSpeed + mouseInfluence * 2.0;
  vec2 uv2 = vec2(uv.x + uv.y);
  for (int i = 0; i < 5; i++) {
    uv2 += sin(max(uv.x, uv.y)) + uv;
    uv += 0.5 * vec2(
      cos(5.1123314 + 0.353 * uv2.y + speed * 0.131121),
      sin(uv2.x - 0.113 * speed)
    );
    uv -= cos(uv.x + uv.y) - sin(uv.x * 0.711 - uv.y);
  }
  float contrastMod = 0.25 * uContrast + 0.5 * uSpinAmount + 1.2;
  float paint = min(2.0, max(0.0, length(uv) * 0.035 * contrastMod));
  float c1 = max(0.0, 1.0 - contrastMod * abs(1.0 - paint));
  float c2 = max(0.0, 1.0 - contrastMod * abs(paint));
  float c3 = 1.0 - min(1.0, c1 + c2);
  float light = (uLighting - 0.2) * max(c1 * 5.0 - 4.0, 0.0) + uLighting * max(c2 * 5.0 - 4.0, 0.0);
  return (0.3 / uContrast) * uColor1 + (1.0 - 0.3 / uContrast) * (uColor1 * c1 + uColor2 * c2 + vec4(c3 * uColor3.rgb, c3 * uColor1.a)) + light;
}

void main() {
  gl_FragColor = effect(iResolution.xy, vUv * iResolution.xy);
}
`;

export default function Balatro({
  spinRotation = -2,
  spinSpeed = 7,
  offset = [0, 0],
  color1 = '#1a2a6a',
  color2 = '#0b6f72',
  color3 = '#0f2022',
  contrast = 3.5,
  lighting = 0.4,
  spinAmount = 0.25,
  pixelFilter = 1500,
  spinEase = 1,
  isRotate = false,
  mouseInteraction = true,
  paused = false,
}) {
  const containerRef = useRef(null);
  const pausedRef = useRef(paused);

  useEffect(() => { pausedRef.current = paused; }, [paused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 1.25), alpha: false });
    const gl = renderer.gl;
    gl.clearColor(0.03, 0.05, 0.07, 1);
    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: [1, 1, 1] },
        uSpinRotation: { value: spinRotation },
        uSpinSpeed: { value: spinSpeed },
        uOffset: { value: offset },
        uColor1: { value: hexToVec4(color1) },
        uColor2: { value: hexToVec4(color2) },
        uColor3: { value: hexToVec4(color3) },
        uContrast: { value: contrast },
        uLighting: { value: lighting },
        uSpinAmount: { value: spinAmount },
        uPixelFilter: { value: pixelFilter },
        uSpinEase: { value: spinEase },
        uIsRotate: { value: isRotate },
        uMouse: { value: [0.5, 0.5] },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const width = Math.max(1, container.clientWidth);
      const height = Math.max(1, container.clientHeight);
      renderer.setSize(width, height);
      program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height];
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();
    container.appendChild(gl.canvas);

    const onPointerMove = (event) => {
      if (!mouseInteraction) return;
      const rect = container.getBoundingClientRect();
      program.uniforms.uMouse.value = [
        (event.clientX - rect.left) / rect.width,
        1 - (event.clientY - rect.top) / rect.height,
      ];
    };
    container.addEventListener('pointermove', onPointerMove, { passive: true });

    let frame = 0;
    const render = (time) => {
      frame = requestAnimationFrame(render);
      if (pausedRef.current) return;
      program.uniforms.iTime.value = time * 0.001;
      renderer.render({ scene: mesh });
    };
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      if (gl.canvas.parentNode === container) container.removeChild(gl.canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [color1, color2, color3, contrast, isRotate, lighting, mouseInteraction, offset, pixelFilter, spinAmount, spinEase, spinRotation, spinSpeed]);

  return <div ref={containerRef} className="balatro-container" />;
}

