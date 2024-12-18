import React, { useState } from 'react';
import { useTonConnect } from '@/hooks/useTonConnect';
import { useTonClient, mintGameTokens } from '@/utils/ton-utils';

function TonIntegrationComponent() {
  const [isMinting, setIsMinting] = useState(false);
  const [mintingError, setMintingError] = useState(null);
  const { connected, wallet } = useTonConnect();
  const tonClient = useTonClient();

  const handleMintTokens = async () => {
    if (!connected || !wallet) {
      setMintingError('Please connect your wallet first');
      return;
    }

    setIsMinting(true);
    setMintingError(null);

    try {
      await mintGameTokens(tonClient, wallet.address, 100);
      // You might want to update the user's token balance here
    } catch (error) {
      console.error('Minting failed', error);
      setMintingError('Failed to mint tokens. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div>
      <button onClick={handleMintTokens} disabled={isMinting || !connected}>
        {isMinting ? 'Minting...' : 'Mint Tokens'}
      </button>
      {mintingError && <p style={{ color: 'red' }}>{mintingError}</p>}
    </div>
  );
}

export default TonIntegrationComponent;
