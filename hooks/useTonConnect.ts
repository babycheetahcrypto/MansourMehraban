'use client';

import { useState, useEffect } from 'react';
import { TonConnectUI } from '@tonconnect/ui';

let tonConnectUI: TonConnectUI | null = null;

export function useTonConnect() {
  const [connected, setConnected] = useState(false);
  const [wallet, setWallet] = useState<any>(null);
  const [network, setNetwork] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined' && !tonConnectUI) {
      tonConnectUI = new TonConnectUI({
        manifestUrl: 'https://babycheetah.vercel.app/tonconnect-manifest.json',
        buttonRootId: 'ton-connect-button',
      });

      tonConnectUI.onStatusChange((wallet) => {
        setConnected(!!wallet);
        setWallet(wallet);
        setNetwork(wallet?.account.chain || '');
      });
    }
  }, []);

  return {
    connected,
    wallet,
    network,
    tonConnectUI,
  };
}
