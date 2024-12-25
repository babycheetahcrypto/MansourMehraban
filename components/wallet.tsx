'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTonConnect } from '@/hooks/useTonConnect';
import { formatNumber } from '../utils/formatNumber';
import { TonConnectButton } from '@tonconnect/ui-react';

const StarryBackground: React.FC = () => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
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
      speed: Math.random() * 0.2 + 0.1,
    }));

    let animationFrameId: number;

    const animate = () => {
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

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`;
        ctx.fill();

        star.y += star.speed;
        if (star.y > canvas.height) {
          star.y = 0;
        }
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      resizeCanvas();
      stars.forEach((star) => {
        star.x = Math.random() * canvas.width;
        star.y = Math.random() * canvas.height;
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
};

const Wallet: React.FC<{ coins: number; onWalletConnect: (address: string) => void }> = ({
  coins,
  onWalletConnect,
}) => {
  const { connected, wallet, connect } = useTonConnect();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (connected && wallet?.address) {
      onWalletConnect(wallet.address);
    }
  }, [connected, wallet, onWalletConnect]);

  return (
    <div className="flex-grow flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <StarryBackground />
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-2xl overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-gray-700/30">
          <CardHeader className="relative">
            <CardTitle className="z-10 text-2xl flex items-center justify-between">
              <span className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x">
                Airdrop Soon!
              </span>
              <div className="relative ml-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 rounded-full blur-md animate-pulse"></div>
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Airdrop%203D%20ICON-Tsx2ineRiNDjyKpWujizmUcch7ghwr.png"
                  alt="Airdrop"
                  width={150}
                  height={150}
                  className="relative z-10 transition-all duration-300 transform hover:scale-110"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
              </div>
            </CardTitle>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="bg-gray-800/50 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-2 text-white">Earned Coins</h3>
              <div className="flex items-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-Jx43bOKm7s99NARIa6gjgHp3gQ7RP1.png"
                  alt="Game Logo"
                  width={32}
                  height={32}
                  className="mr-2"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <p className="text-2xl font-extrabold text-green-400">
                  {formatNumber(coins, false)}
                </p>
              </div>
            </div>
            {error && (
              <div className="bg-red-500/50 p-4 rounded-lg">
                <p className="text-white">{error}</p>
              </div>
            )}
            <TonConnectButton className="w-full py-3 text-lg font-bold" />
          </CardContent>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
