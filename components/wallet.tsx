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
    <div className="flex-grow flex items-center justify-center p-6 relative">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 opacity-50" />
      </div>
      <Card className="bg-gradient-to-br from-gray-900 to-black text-white w-full max-w-md overflow-hidden transform transition-all duration-300 hover:shadow-2xl border border-gray-700">
        <CardHeader className="relative">
          <CardTitle className="z-10 text-2xl flex items-center justify-between">
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Wallet
            </span>
            <div className="relative">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wallet%203D%20ICON-lCrOq4AcdrdeSLXw6NpUohR2HzXSOw.png"
                alt="Wallet"
                width={64}
                height={64}
                className="relative z-10"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </CardTitle>
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
              <p className="text-2xl font-extrabold text-green-400">{formatNumber(coins, false)}</p>
            </div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2 text-white">Wallet Connection</h3>
            {connected ? (
              <div>
                <p className="text-green-400">Connected</p>
                <p className="text-sm text-gray-300 break-all">Address: {wallet?.address}</p>
                <Button onClick={handleDisconnect} className="mt-2 bg-red-600 hover:bg-red-700">
                  Disconnect
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-red-400">Not connected</p>
                <Button onClick={handleConnect} className="mt-2 bg-blue-600 hover:bg-blue-700">
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>
          {error && (
            <div className="bg-red-500/50 p-4 rounded-lg">
              <p className="text-white">{error}</p>
            </div>
          )}
          <TonConnectButton />
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
