"use client";

import { useEffect, useRef } from "react";

// ─── Football 3D ball drawing ─────────────────────────────────────────────────

interface Ball {
  x: number;
  y: number;
  z: number;        // depth 0=far 1=near
  r: number;        // radius
  vx: number;
  vy: number;
  spin: number;     // rotation phase
  spinSpeed: number;
  tiltX: number;    // rotation axis tilt
  tiltY: number;
}

function drawBall(ctx: CanvasRenderingContext2D, b: Ball) {
  const { x, y, r, spin } = b;
  ctx.save();

  // Clipping circle
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();

  // Base sphere gradient — dark ball with subtle gray
  const baseGrad = ctx.createRadialGradient(
    x - r * 0.28, y - r * 0.32, r * 0.05,
    x + r * 0.05, y + r * 0.08, r * 1.08
  );
  baseGrad.addColorStop(0,   "rgba(100,100,100,0.92)");
  baseGrad.addColorStop(0.25,"rgba(55,55,55,0.95)");
  baseGrad.addColorStop(0.7, "rgba(18,18,18,0.97)");
  baseGrad.addColorStop(1,   "rgba(5,5,5,0.98)");
  ctx.fillStyle = baseGrad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  // Pentagon patches — classic football pattern
  // We draw 7 patches visible from the front view, rotating with spin
  const patches = [
    // center top
    { cx: 0,     cy: -0.42, rot: spin },
    // ring of 5 around center (offset by spin)
    { cx:  0.38, cy: -0.12, rot: spin + 1.25 },
    { cx:  0.23, cy:  0.36, rot: spin + 2.51 },
    { cx: -0.23, cy:  0.36, rot: spin + 3.77 },
    { cx: -0.38, cy: -0.12, rot: spin + 5.02 },
    // outer visible patches
    { cx:  0.68, cy:  0.30, rot: spin + 0.6 },
    { cx: -0.68, cy:  0.30, rot: spin + 2.1 },
    { cx:  0,    cy:  0.72, rot: spin + 1.8 },
  ];

  for (const p of patches) {
    // depth fade — patches near edge are dimmer
    const distFromCenter = Math.sqrt(p.cx * p.cx + p.cy * p.cy);
    const depthAlpha = 1 - distFromCenter * 0.4;

    ctx.save();
    ctx.translate(x + p.cx * r, y + p.cy * r);
    ctx.rotate(p.rot);

    // Pentagon shape
    const pr = r * 0.22;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
      const px = Math.cos(angle) * pr;
      const py = Math.sin(angle) * pr;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(0, 0, 0, ${0.85 * depthAlpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(80, 80, 80, ${0.5 * depthAlpha})`;
    ctx.lineWidth = r * 0.025;
    ctx.stroke();

    ctx.restore();
  }

  // Specular highlight — top-left bright spot
  const specGrad = ctx.createRadialGradient(
    x - r * 0.3, y - r * 0.35, 0,
    x - r * 0.3, y - r * 0.35, r * 0.55
  );
  specGrad.addColorStop(0,   "rgba(255,255,255,0.22)");
  specGrad.addColorStop(0.5, "rgba(255,255,255,0.05)");
  specGrad.addColorStop(1,   "rgba(255,255,255,0)");
  ctx.fillStyle = specGrad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  // Emerald rim light — bottom-right
  const rimGrad = ctx.createRadialGradient(
    x + r * 0.55, y + r * 0.55, 0,
    x + r * 0.55, y + r * 0.55, r * 0.9
  );
  rimGrad.addColorStop(0,   "rgba(16,232,138,0.20)");
  rimGrad.addColorStop(0.6, "rgba(16,232,138,0.04)");
  rimGrad.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.fillStyle = rimGrad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  ctx.restore();

  // Outer glow ring
  const glowGrad = ctx.createRadialGradient(x, y, r * 0.9, x, y, r * 1.5);
  glowGrad.addColorStop(0,   `rgba(16,232,138,${0.10 * b.z})`);
  glowGrad.addColorStop(0.5, `rgba(16,232,138,${0.04 * b.z})`);
  glowGrad.addColorStop(1,   "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.arc(x, y, r * 1.5, 0, Math.PI * 2);
  ctx.fillStyle = glowGrad;
  ctx.fill();
}

// ─── Football pitch drawing (2D canvas, CSS gives the 3D perspective) ─────────

function drawPitch(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
  const color = (a: number) => `rgba(16,232,138,${a})`;
  const lw = Math.max(1, w * 0.0018);

  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = color(0.30);
  ctx.lineWidth = lw;
  ctx.lineCap = "round";

  const px = (x: number) => x * w;
  const py = (y: number) => y * h;

  // Outer boundary
  ctx.strokeRect(px(0.04), py(0.05), px(0.92), py(0.90));

  // Halfway line
  ctx.beginPath();
  ctx.moveTo(px(0.04), py(0.50));
  ctx.lineTo(px(0.96), py(0.50));
  ctx.stroke();

  // Center circle
  ctx.beginPath();
  ctx.arc(px(0.50), py(0.50), px(0.14), 0, Math.PI * 2);
  ctx.stroke();

  // Center spot — pulsing
  const pulse = 0.5 + Math.sin(t * 2) * 0.5;
  ctx.beginPath();
  ctx.arc(px(0.50), py(0.50), px(0.008), 0, Math.PI * 2);
  ctx.fillStyle = color(0.3 + pulse * 0.3);
  ctx.fill();

  // Top penalty area
  ctx.strokeRect(px(0.22), py(0.05), px(0.56), py(0.22));
  // Top goal area
  ctx.strokeRect(px(0.35), py(0.05), px(0.30), py(0.09));
  // Top goal
  ctx.strokeStyle = color(0.40);
  ctx.strokeRect(px(0.42), py(0.01), px(0.16), py(0.05));

  // Bottom penalty area
  ctx.strokeStyle = color(0.30);
  ctx.strokeRect(px(0.22), py(0.73), px(0.56), py(0.22));
  // Bottom goal area
  ctx.strokeRect(px(0.35), py(0.86), px(0.30), py(0.09));
  // Bottom goal
  ctx.strokeStyle = color(0.40);
  ctx.strokeRect(px(0.42), py(0.94), px(0.16), py(0.05));

  // Penalty spots
  ctx.strokeStyle = color(0.30);
  for (const [sx, sy] of [[0.50, 0.175], [0.50, 0.825]] as const) {
    ctx.beginPath();
    ctx.arc(px(sx), py(sy), px(0.006), 0, Math.PI * 2);
    ctx.fillStyle = color(0.35);
    ctx.fill();
  }

  // Top penalty arc
  ctx.beginPath();
  ctx.arc(px(0.50), py(0.27), px(0.14), Math.PI * 0.18, Math.PI * 0.82);
  ctx.stroke();

  // Bottom penalty arc
  ctx.beginPath();
  ctx.arc(px(0.50), py(0.73), px(0.14), -Math.PI * 0.82, -Math.PI * 0.18);
  ctx.stroke();

  // Corner arcs
  const ca = px(0.04);
  const cr = px(0.03);
  for (const [cx2, cy2, start, end] of [
    [px(0.04), py(0.05), 0, Math.PI / 2],
    [px(0.96), py(0.05), Math.PI / 2, Math.PI],
    [px(0.04), py(0.95), -Math.PI / 2, 0],
    [px(0.96), py(0.95), Math.PI, 3 * Math.PI / 2],
  ] as const) {
    ctx.beginPath();
    ctx.arc(cx2, cy2, cr, start, end);
    ctx.stroke();
  }

  // Subtle field fill stripes
  ctx.strokeStyle = color(0.05);
  ctx.lineWidth = px(0.07);
  for (let i = 0; i < 6; i++) {
    const yy = py(0.05) + (i * py(0.90)) / 6;
    ctx.beginPath();
    ctx.moveTo(px(0.04), yy);
    ctx.lineTo(px(0.96), yy + py(0.15));
    ctx.stroke();
  }
}

// ─── Main component ──────────────────────────────────────────────────────────

export function AnimatedBackground() {
  const pitchRef  = useRef<HTMLCanvasElement>(null);
  const ballsRef  = useRef<HTMLCanvasElement>(null);

  // ── Pitch animation ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = pitchRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const resize = () => {
      canvas.width  = 900;
      canvas.height = 600;
    };
    resize();

    let t = 0;
    const draw = () => {
      t += 0.008;
      drawPitch(ctx, canvas.width, canvas.height, t);
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  // ── Balls animation ──────────────────────────────────────────────
  useEffect(() => {
    const canvas = ballsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let w = 0, h = 0;

    const resize = () => {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // 3 balls only — lighter on mobile 4G
    const balls: Ball[] = [
      { x: w * 0.10, y: h * 0.18, z: 0.8, r: 72, vx:  0.15, vy:  0.10, spin: 0,   spinSpeed: 0.008, tiltX: 0.3, tiltY: 0.2 },
      { x: w * 0.85, y: h * 0.20, z: 0.6, r: 56, vx: -0.12, vy:  0.13, spin: 1.5, spinSpeed: 0.011, tiltX: 0.5, tiltY: 0.4 },
      { x: w * 0.65, y: h * 0.78, z: 0.5, r: 44, vx:  0.09, vy: -0.11, spin: 2.8, spinSpeed: 0.007, tiltX: 0.1, tiltY: 0.6 },
    ];

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // Sort by depth (far first)
      balls.sort((a, b) => a.z - b.z);

      for (const b of balls) {
        b.spin += b.spinSpeed;
        b.x    += b.vx;
        b.y    += b.vy;

        // Bounce off walls with padding
        const pad = b.r * 1.5;
        if (b.x < pad || b.x > w - pad) { b.vx *= -1; b.x = Math.max(pad, Math.min(w - pad, b.x)); }
        if (b.y < pad || b.y > h - pad) { b.vy *= -1; b.y = Math.max(pad, Math.min(h - pad, b.y)); }

        // Depth-based alpha
        ctx.globalAlpha = 0.3 + b.z * 0.65;
        drawBall(ctx, b);
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <>
      {/* Deep dark base */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "radial-gradient(ellipse 110% 70% at 50% 0%, #0a1f10 0%, #050e08 45%, #030810 100%)",
        }}
      />

      {/* 3D Football pitch in perspective */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 1,
          bottom: "-8%",
          left: "50%",
          transform: "translateX(-50%) perspective(520px) rotateX(72deg)",
          transformOrigin: "50% 100%",
          width: "min(1100px, 140vw)",
          opacity: 0.75,
        }}
      >
        <canvas
          ref={pitchRef}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* Pitch glow floor */}
      <div
        className="fixed bottom-0 left-0 right-0 pointer-events-none"
        style={{
          zIndex: 1,
          height: "45%",
          background: "linear-gradient(to top, rgba(16,232,138,0.06) 0%, transparent 100%)",
        }}
      />

      {/* Floating 3D footballs */}
      <canvas
        ref={ballsRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 3 }}
      />

      {/* Top vignette to keep content readable */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 4,
          background: "radial-gradient(ellipse 80% 60% at 50% 30%, transparent 0%, rgba(3,8,10,0.45) 100%)",
        }}
      />

      {/* Drifting emerald orb — top */}
      <div
        className="fixed pointer-events-none"
        style={{
          zIndex: 2,
          top: "-5%", left: "50%",
          transform: "translateX(-50%)",
          width: 600, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(16,232,138,0.09) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "orbF1 20s ease-in-out infinite alternate",
        }}
      />

      <style>{`
        @keyframes orbF1 {
          from { transform: translateX(-50%) translateY(0px) scale(1); }
          to   { transform: translateX(-48%) translateY(30px) scale(1.08); }
        }
      `}</style>
    </>
  );
}
