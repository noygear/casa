import { useRef, useEffect, useCallback } from 'react';

const DOT_SPACING = 32;
const DOT_RADIUS = 1.2;
const MOUSE_RADIUS = 120;
const PUSH_STRENGTH = 18;
const RETURN_SPEED = 0.08;
const DOT_COLOR = 'rgba(255, 255, 255, 0.12)';
const DOT_HOVER_COLOR = 'rgba(255, 255, 255, 0.35)';

interface Dot {
  ox: number; // origin x
  oy: number; // origin y
  x: number;
  y: number;
}

export function DotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotsRef = useRef<Dot[]>([]);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const rafRef = useRef<number>(0);
  const resizeRef = useRef<() => void>();

  const initDots = useCallback((canvas: HTMLCanvasElement) => {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const dots: Dot[] = [];
    const cols = Math.ceil(w / DOT_SPACING) + 1;
    const rows = Math.ceil(h / DOT_SPACING) + 1;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * DOT_SPACING;
        const y = r * DOT_SPACING;
        dots.push({ ox: x, oy: y, x, y });
      }
    }
    dotsRef.current = dots;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    initDots(canvas);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseLeave = () => {
      mouseRef.current = { x: -9999, y: -9999 };
    };

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.scale(dpr, dpr);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const dots = dotsRef.current;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = dot.ox - mx;
        const dy = dot.oy - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < MOUSE_RADIUS) {
          const force = (1 - dist / MOUSE_RADIUS) * PUSH_STRENGTH;
          const angle = Math.atan2(dy, dx);
          dot.x += (dot.ox + Math.cos(angle) * force - dot.x) * 0.2;
          dot.y += (dot.oy + Math.sin(angle) * force - dot.y) * 0.2;
        } else {
          dot.x += (dot.ox - dot.x) * RETURN_SPEED;
          dot.y += (dot.oy - dot.y) * RETURN_SPEED;
        }

        const offsetDist = Math.sqrt(
          (dot.x - dot.ox) ** 2 + (dot.y - dot.oy) ** 2
        );
        const t = Math.min(offsetDist / PUSH_STRENGTH, 1);

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, DOT_RADIUS + t * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = t > 0.05 ? DOT_HOVER_COLOR : DOT_COLOR;
        ctx.fill();
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      rafRef.current = requestAnimationFrame(animate);
    };

    resizeRef.current = () => {
      initDots(canvas);
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', resizeRef.current);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (resizeRef.current) window.removeEventListener('resize', resizeRef.current);
      cancelAnimationFrame(rafRef.current);
    };
  }, [initDots]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
