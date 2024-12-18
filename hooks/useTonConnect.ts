// hooks/useTonConnect.ts
import { useTonConnectUI } from '@tonconnect/ui-react';
import { useEffect } from 'react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();

  useEffect(() => {
    const handleConnectionChange = () => {
      console.log('Connection state changed:', tonConnectUI.connected);
      if (tonConnectUI.account) {
        console.log('Connected wallet:', tonConnectUI.account);
      }
    };

    const unsubscribe = tonConnectUI.onStatusChange(handleConnectionChange);

    return () => {
      unsubscribe();
    };
  }, [tonConnectUI]);

  return {
    connected: tonConnectUI.connected,
    wallet: tonConnectUI.account,
    connect: tonConnectUI.connectWallet,
    disconnect: tonConnectUI.disconnect,
  };
}
