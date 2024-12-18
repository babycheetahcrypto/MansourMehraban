'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTonConnect } from '@/hooks/useTonConnect';
import { formatNumber } from '../utils/formatNumber';
import { TonConnectButton } from '@tonconnect/ui-react';

interface WalletProps {
  coins: number;
  onWalletConnect: (address: string) => void;
}

const StarryBackground: React.FC = () => {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      width={width}
      height={height}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  );
};

const Wallet: React.FC<WalletProps> = ({ coins, onWalletConnect }) => {
  const { connected, wallet, connect, disconnect } = useTonConnect();
  const [isClient, setIsClient] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (connected && wallet?.address) {
      onWalletConnect(wallet.address);
    }
  }, [connected, wallet, onWalletConnect]);

  const handleConnect = async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Disconnection error:', err);
      setError('Failed to disconnect wallet. Please try again.');
    }
  };

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-start p-4 pb-16 relative overflow-y-auto">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <StarryBackground />
      </div>
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 text-white border border-gray-700/30 backdrop-blur-xl">
          <CardHeader className="relative">
            <CardTitle className="z-10 text-3xl text-center text-white">Wallet</CardTitle>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 opacity-30 transform -skew-y-3"></div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
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
            <TonConnectButton className="w-full py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full shadow-lg transform transition-all duration-300 hover:scale-105" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
