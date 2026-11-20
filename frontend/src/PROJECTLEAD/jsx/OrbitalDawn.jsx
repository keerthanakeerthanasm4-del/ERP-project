import { useEffect, useRef } from "react";

function makeStars() {
  let seed = 947;
  function random() {
    seed = (seed * 16807) % 2147483647;
    return seed / 2147483647;
  }
  return Array.from({ length: 950 }, () => ({
    x: random(), y: random(), depth: random(), phase: random() * Math.PI * 2,
  }));
}

const stars = makeStars();

export default function OrbitalDawn() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    let elapsed = 0;
    let previous = 0;
    let width, height;
    let x = 0, y = 0, targetX = 0, targetY = 0;

    function draw(now) {
      const dt = previous ? Math.min((now - previous) / 1000, 0.08) : 0;
      previous = now;
      elapsed += dt;
      const still = motion.matches;
      const intro = still ? 1 : 1 - Math.pow(1 - Math.min(elapsed / 2.8, 1), 3);
      const follow = still ? 1 : 1 - Math.exp(-5 * dt);
      x += ((still ? 0 : targetX) - x) * follow;
      y += ((still ? 0 : targetY) - y) * follow;
      const apex = height * (0.72 + 0.19 * (1 - intro)) + y * 9;
      const center = width * 0.5 + x * 15;
      const radiusX = width * (0.84 + intro * 0.025);
      const radiusY = height * 1.15;
      const sunX = center + width * (0.068 + (still ? 0 : 0.011 * Math.sin(elapsed * 0.13)));
      const sunY = apex + radiusY * (1 - Math.sqrt(1 - ((sunX - center) / radiusX) ** 2));
      ctx.fillStyle = "#0a0a0a";
      ctx.fillRect(0, 0, width, height);
      for (const star of stars) {
        ctx.globalAlpha = (0.05 + star.depth ** 3 * 0.48) *
          (still ? 1 : 0.85 + 0.15 * Math.sin(elapsed * 0.55 + star.phase));
        ctx.fillStyle = star.phase > 3 ? "#ded3ff" : "#fff0df";
        const size = 0.45 + star.depth * 0.85;
        ctx.fillRect(star.x * width + x * star.depth * 4, star.y * height + y * star.depth * 2, size, size);
      }
      ctx.globalAlpha = 1;

      function glow(cx, cy, rx, ry, stops) {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.scale(rx, ry);
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
        for (const [at, color] of stops) gradient.addColorStop(at, color);
        ctx.fillStyle = gradient;
        ctx.fillRect(-1, -1, 2, 2);
        ctx.restore();
      }

      ctx.globalAlpha = 0.15 + 0.85 * intro;
      glow(sunX, sunY, width * 0.77, height * 0.74, [
        [0, "#ca78ec"], [0.17, "#853fa6"], [0.52, "#713aff42"], [1, "#5227ff00"],
      ]);
      const limb = new Path2D();
      limb.ellipse(center, apex + radiusY, radiusX, radiusY, 0, 0, Math.PI * 2);
      for (const [thickness, color] of [[56, "#ab57ff0d"], [27, "#bd70ff20"], [12, "#d889ff36"], [5, "#efadff88"], [2, "#fff1ff"]]) {
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness * Math.max(0.7, height / 650);
        ctx.stroke(limb);
      }
      const flareY = sunY + (1 - intro) * height * 0.08;
      glow(sunX, flareY, width * 0.18, height * 0.17, [
        [0, "#fffaff"], [0.09, "#fff2ff"], [0.22, "#ffcdffee"], [0.55, "#ff71f952"], [1, "#ff71f900"],
      ]);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#0c090d";
      ctx.fill(limb);
      ctx.save();
      ctx.clip(limb);
      glow(sunX, sunY, width * 0.42, height * 0.23, [
        [0, "#c990c9"], [0.06, "#6f476b"], [0.24, "#40233c"], [0.64, "#211120"], [1, "#21112000"],
      ]);
      ctx.restore();
      if (!still) frame = requestAnimationFrame(draw);
    }

    function refresh() {
      cancelAnimationFrame(frame);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height || document.hidden) return;
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
      previous = 0;
      frame = requestAnimationFrame(draw);
    }

    function move(event) {
      targetX = event.clientX / width - 0.5;
      targetY = event.clientY / height - 0.5;
    }
    const observer = new ResizeObserver(refresh);
    observer.observe(canvas);
    window.addEventListener("pointermove", move, { passive: true });
    motion.addEventListener("change", refresh);
    document.addEventListener("visibilitychange", refresh);
    refresh();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      motion.removeEventListener("change", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  return <canvas ref={ref} className="pl-orbital-dawn" aria-hidden="true" />;
}
