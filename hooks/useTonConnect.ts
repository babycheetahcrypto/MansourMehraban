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
      if (address) {
        console.log('Connected wallet address:', address);
      }
    };

    handleConnectionChange(); // Check initial state
    const unsubscribe = tonConnectUI.onStatusChange(handleConnectionChange);

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI, address]);

  return {
    connected: isConnected,
    wallet: address ? { address } : null,
    connect: tonConnectUI.connectWallet,
    disconnect: tonConnectUI.disconnect,
  };
}
