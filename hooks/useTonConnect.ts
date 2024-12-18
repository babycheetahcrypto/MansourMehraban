import { useTonConnectUI } from '@tonconnect/ui-react';

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();

  return {
    connected: tonConnectUI.connected,
    wallet: tonConnectUI.account,
    // Remove the network property as it doesn't exist on TonConnectUI
  };
}
