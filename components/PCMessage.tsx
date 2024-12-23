'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const PCMessage = () => {
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
      radius: Math.random() * 1.5 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
    }));

    let animationFrameId: number;

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.fillStyle = 'rgba(0, 0, 0, 1)'; // Update 1: Changed background color of canvas
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = star.color;
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[rgba(0,0,0,1)] text-white"> {/* Update 2: Changed background color of main div */}
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-Jx43bOKm7s99NARIa6gjgHp3gQ7RP1.png"
              alt="Game Logo"
              width={150}
              height={150}
              className="rounded-full drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mb-8 text-center"
          >
            <h1 className="mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-5xl font-extrabold text-transparent">
              Baby Cheetah
            </h1>
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              <p className="text-xl font-medium text-gray-200">Play on your mobile</p>
              <Sparkles className="h-5 w-5 text-pink-400" />
            </div>
          </motion.div>

          {/* QR Code Section */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative mx-auto mb-8 w-80"
          >
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 opacity-75 blur-lg" />
            <div className="relative rounded-2xl bg-black p-4">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yw5nm8zqwa8SBmzRVEGZ5c4lPpa2Af.png"
                alt="Telegram QR Code"
                width={400}
                height={400}
                className="rounded-2xl"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PCMessage;

