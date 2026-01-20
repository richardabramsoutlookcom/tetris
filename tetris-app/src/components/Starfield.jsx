import { useEffect, useRef, memo } from 'react';

export const Starfield = memo(function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    let animationId;
    let lastTime = 0;
    const targetFPS = 30; // Limit to 30fps for background
    const frameInterval = 1000 / targetFPS;

    // Set canvas size with device pixel ratio consideration
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    // Create fewer stars
    const stars = [];
    const numStars = 150; // Reduced from 300

    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 1000,
        size: Math.random() * 1.5 + 0.5,
      });
    }

    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;

    // Animation with frame limiting
    const animate = (currentTime) => {
      animationId = requestAnimationFrame(animate);

      const deltaTime = currentTime - lastTime;
      if (deltaTime < frameInterval) return;
      lastTime = currentTime - (deltaTime % frameInterval);

      // Clear with semi-transparent for trail effect
      ctx.fillStyle = 'rgba(0, 0, 10, 0.3)';
      ctx.fillRect(0, 0, width, height);

      // Batch similar operations
      ctx.fillStyle = '#fff';

      for (let i = 0; i < numStars; i++) {
        const star = stars[i];

        // Move star toward viewer
        star.z -= 3;

        // Reset star if it goes behind the viewer
        if (star.z <= 0) {
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.z = 1000;
        }

        // Calculate screen position
        const scale = 500 / star.z;
        const screenX = (star.x - centerX) * scale + centerX;
        const screenY = (star.y - centerY) * scale + centerY;

        // Skip if off screen
        if (screenX < 0 || screenX > width || screenY < 0 || screenY > height) {
          continue;
        }

        // Calculate size and brightness
        const size = Math.min(star.size * scale, 4);
        const alpha = Math.min(1, (1000 - star.z) / 500);

        // Simple circle instead of gradient
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
    };

    // Initial fill
    ctx.fillStyle = 'rgb(0, 0, 10)';
    ctx.fillRect(0, 0, width, height);

    animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
});
