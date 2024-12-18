import React, { useRef, useEffect } from 'react';

const StarryBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2 + 1,
      speed: Math.random() * 0.5 + 0.1,
      color: `rgba(${Math.random() * 200 + 55}, ${Math.random() * 200 + 55}, ${
        Math.random() * 200 + 55
      }, ${Math.random() * 0.5 + 0.5})`,
    }));

    let animationFrameId: number;
    let lastScrollY = window.scrollY;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const gradient = ctx.createRadialGradient(
        canvas.width / 2,
        canvas.height / 2,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 25, 1)');
      gradient.addColorStop(1, 'rgba(0, 0, 25, 1)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
        } else if (star.y < 0) {
          star.y = canvas.height;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', () => {
      lastScrollY = window.scrollY;
    });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('scroll', () => {});
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
};

export default StarryBackground;
