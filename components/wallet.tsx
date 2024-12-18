'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTonConnect } from '@/hooks/useTonConnect';
import { formatNumber } from '../utils/formatNumber';
import { TonConnectButton } from '@tonconnect/ui-react';

interface WalletProps {
  coins: number;
  onWalletConnect: (address: string) => void;
}

const Wallet: React.FC<WalletProps> = ({ coins, onWalletConnect }) => {
  const { connected, wallet } = useTonConnect();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (connected && wallet?.address) {
      onWalletConnect(wallet.address);
    }
  }, [connected, wallet, onWalletConnect]);

  if (!isClient) {
    return null;
  }

  return (
    <div className="flex-grow flex flex-col items-center justify-start p-4 pb-16 relative overflow-y-auto">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black"></div>
      </div>
      <div className="w-full max-w-md relative z-10">
        <Card className="bg-gradient-to-br from-gray-900/50 to-black/50 text-white border border-gray-700/30 backdrop-blur-xl">
          <CardHeader className="relative">
            <CardTitle className="z-10 text-3xl text-center text-white flex items-center justify-center">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Wallet%203D%20ICON-lCrOq4AcdrdeSLXw6NpUohR2HzXSOw.png"
                alt="Wallet"
                width={48}
                height={48}
                className="mr-2"
                draggable="false"
                onContextMenu={(e) => e.preventDefault()}
              />
              Wallet
            </CardTitle>
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800/30 to-gray-900/30 opacity-30 transform -skew-y-3"></div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="bg-gray-800/50 p-4 rounded-lg backdrop-filter backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-2 text-white">Earned Coins</h3>
              <div className="flex items-center justify-center">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/LOGO-Jx43bOKm7s99NARIa6gjgHp3gQ7RP1.png"
                  alt="Game Logo"
                  width={32}
                  height={32}
                  className="mr-2"
                  draggable="false"
                  onContextMenu={(e) => e.preventDefault()}
                />
                <p className="text-3xl font-extrabold text-green-400">
                  {formatNumber(coins, false)}
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <TonConnectButton className="w-full max-w-xs py-4 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white rounded-full shadow-lg transform transition-all duration-300 hover:scale-105" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Wallet;
