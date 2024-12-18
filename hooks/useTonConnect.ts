// hooks/useTonConnect.ts
import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { useEffect, useState } from 'react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const address = useTonAddress();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const handleConnectionChange = () => {
      setIsConnected(tonConnectUI.connected);
      console.log('Connection state changed:', tonConnectUI.connected);
      if (tonConnectUI.account) {
        console.log('Connected wallet:', tonConnectUI.account);
      }
    };

    handleConnectionChange(); // Check initial state
    const unsubscribe = tonConnectUI.onStatusChange(handleConnectionChange);

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  return {
    connected: isConnected,
    wallet: address ? { address } : null,
    connect: tonConnectUI.connectWallet,
    disconnect: tonConnectUI.disconnect,
  };
}
