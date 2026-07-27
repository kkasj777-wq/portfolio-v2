import { useEffect, useRef } from 'react';
import DirectorPortfolio from './DirectorPortfolio.jsx';
import './ray-director-portfolio.css';

const COLORS = {
  base: '#040607',
  blue: [71, 145, 255],
  cyan: [82, 205, 218],
  green: [71, 189, 145],
  gray: [150, 164, 175],
};

function rgba([red, green, blue], alpha) {
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function RayField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: false });
    if (!canvas || !context) return undefined;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = { x: 0.72, y: 0.42, targetX: 0.72, targetY: 0.42 };
    let width = 0;
    let height = 0;
    let frame = 0;
    let lastPaint = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onPointerMove = (event) => {
      pointer.targetX = event.clientX / Math.max(width, 1);
      pointer.targetY = event.clientY / Math.max(height, 1);
    };

    const paintBeam = (originX, originY, angle, length, spread, color, alpha) => {
      const endX = originX + Math.cos(angle) * length;
      const endY = originY + Math.sin(angle) * length;
      const normalX = Math.cos(angle + Math.PI / 2) * spread;
      const normalY = Math.sin(angle + Math.PI / 2) * spread;
      const gradient = context.createLinearGradient(originX, originY, endX, endY);
      gradient.addColorStop(0, rgba(color, 0));
      gradient.addColorStop(0.18, rgba(color, alpha));
      gradient.addColorStop(0.62, rgba(color, alpha * 0.34));
      gradient.addColorStop(1, rgba(color, 0));
      context.fillStyle = gradient;
      context.beginPath();
      context.moveTo(originX - normalX * 0.08, originY - normalY * 0.08);
      context.lineTo(endX - normalX, endY - normalY);
      context.lineTo(endX + normalX, endY + normalY);
      context.lineTo(originX + normalX * 0.08, originY + normalY * 0.08);
      context.closePath();
      context.fill();
    };

    const draw = (timestamp = 0) => {
      if (!reducedMotion.matches && timestamp - lastPaint < 32) {
        frame = window.requestAnimationFrame(draw);
        return;
      }
      lastPaint = timestamp;
      const time = reducedMotion.matches ? 0 : timestamp * 0.00018;
      pointer.x += (pointer.targetX - pointer.x) * 0.025;
      pointer.y += (pointer.targetY - pointer.y) * 0.025;

      context.globalCompositeOperation = 'source-over';
      context.fillStyle = COLORS.base;
      context.fillRect(0, 0, width, height);

      const wash = context.createRadialGradient(
        width * pointer.x,
        height * pointer.y,
        0,
        width * pointer.x,
        height * pointer.y,
        Math.max(width, height) * 0.78,
      );
      wash.addColorStop(0, 'rgba(19, 63, 77, 0.28)');
      wash.addColorStop(0.42, 'rgba(7, 31, 43, 0.16)');
      wash.addColorStop(1, 'rgba(4, 6, 7, 0)');
      context.fillStyle = wash;
      context.fillRect(0, 0, width, height);

      context.globalCompositeOperation = 'screen';
      const originX = width * (-0.08 + pointer.x * 0.16);
      const originY = height * (0.14 + pointer.y * 0.2);
      paintBeam(originX, originY, 0.09 + Math.sin(time) * 0.075, width * 1.45, height * 0.15, COLORS.blue, 0.18);
      paintBeam(originX - width * 0.05, originY + height * 0.3, -0.2 + Math.cos(time * 0.82) * 0.06, width * 1.5, height * 0.1, COLORS.green, 0.14);
      paintBeam(width * 0.42, height * 1.08, -1.08 + Math.sin(time * 0.7) * 0.045, height * 1.55, width * 0.055, COLORS.cyan, 0.1);
      paintBeam(width * 1.02, height * 0.72, -2.72 + Math.cos(time * 1.12) * 0.035, width * 1.15, height * 0.035, COLORS.gray, 0.075);

      context.globalCompositeOperation = 'source-over';
      context.strokeStyle = 'rgba(154, 189, 199, 0.045)';
      context.lineWidth = 1;
      const grid = Math.max(72, Math.round(width / 18));
      const offset = reducedMotion.matches ? 0 : (timestamp * 0.006) % grid;
      for (let x = -grid + offset; x < width + grid; x += grid) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x + height * 0.1, height);
        context.stroke();
      }
      for (let y = -grid; y < height + grid; y += grid) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      const vignette = context.createRadialGradient(width * 0.5, height * 0.44, height * 0.1, width * 0.5, height * 0.44, Math.max(width, height) * 0.72);
      vignette.addColorStop(0, 'rgba(4, 6, 7, 0)');
      vignette.addColorStop(1, 'rgba(1, 2, 3, 0.72)');
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);

      if (!reducedMotion.matches) frame = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    reducedMotion.addEventListener('change', draw);
    draw();

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      reducedMotion.removeEventListener('change', draw);
    };
  }, []);

  return <canvas ref={canvasRef} className="ray-field" aria-hidden="true" />;
}

export default function RayDirectorPortfolio() {
  useEffect(() => {
    document.body.classList.add('ray-director-page');
    return () => document.body.classList.remove('ray-director-page');
  }, []);

  return (
    <div className="ray-director-version">
      <RayField />
      <div className="ray-noise" aria-hidden="true" />
      <DirectorPortfolio />
    </div>
  );
}
