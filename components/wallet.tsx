'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTonConnect } from '@/hooks/useTonConnect';
import { formatNumber } from '../utils/formatNumber';
import { TonConnectButton } from '@tonconnect/ui-react';
import { Coins, WalletIcon, ArrowRight, AlertTriangle } from 'lucide-react';

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
    return null;
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
              Crypto Wallet
            </span>
            <WalletIcon className="w-8 h-8 text-purple-400" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="bg-gray-800/50 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2 text-white">Your Balance</h3>
            <div className="flex items-center">
              <Coins className="w-6 h-6 mr-2 text-yellow-400" />
              <p className="text-2xl font-extrabold text-green-400">{formatNumber(coins, false)}</p>
            </div>
          </div>
          <div className="bg-gray-800/50 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2 text-white">Wallet Connection</h3>
            {connected ? (
              <div>
                <p className="text-green-400 mb-2">Connected</p>
                <p className="text-sm text-gray-300 break-all mb-2">Address: {wallet?.address}</p>
                <Button onClick={handleDisconnect} variant="destructive" className="w-full">
                  Disconnect
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-red-400 mb-2">Not connected</p>
                <Button onClick={handleConnect} variant="default" className="w-full">
                  Connect Wallet
                </Button>
              </div>
            )}
          </div>
          {error && (
            <div className="bg-red-500/50 p-4 rounded-lg flex items-center">
              <AlertTriangle className="w-6 h-6 mr-2 text-white" />
              <p className="text-white">{error}</p>
            </div>
          )}
          <div className="mt-4">
            <TonConnectButton />
          </div>
          <div className="bg-blue-600/20 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
            <h3 className="text-xl font-bold mb-2 text-white">Airdrop Coming Soon!</h3>
            <p className="text-sm text-gray-300 mb-2">
              Get ready for an exciting airdrop event. Stay tuned for more details!
            </p>
            <Button variant="outline" className="w-full">
              <ArrowRight className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Wallet;
