import React from 'react';
import { useTonClient, mintGameTokens } from './ton-integration';

function TonIntegrationComponent() {
  // Initialize TON client when component mounts
  useTonClient();

  const handleMintTokens = async () => {
    try {
      // Example usage
      await mintGameTokens('wallet-address', 100);
    } catch (error) {
      console.error('Minting failed', error);
    }
  };

  return <button onClick={handleMintTokens}>Mint Tokens</button>;
}

export default TonIntegrationComponent;
