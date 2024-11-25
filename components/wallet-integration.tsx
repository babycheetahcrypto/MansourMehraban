import TonConnect, { type WalletInfo } from '@tonconnect/sdk';

export async function connectWallet(): Promise<string | null> {
  try {
    // Initialize TonConnect with manifest URL
    const tonConnect = new TonConnect({
      manifestUrl:
        process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ||
        'https://babycheetah.vercel.app/tonconnect-manifest.json',
    });

    // Get available wallets
    const wallets: WalletInfo[] = await tonConnect.getWallets();

    // If no wallets are available, return null
    if (!wallets.length) {
      console.warn('No wallets found');
      return null;
    }

    // Select the first wallet (you might want to add more sophisticated wallet selection logic)
    const selectedWallet = wallets[0];

    // Attempt to connect to the wallet
    return new Promise((resolve, reject) => {
      const unsubscribe = tonConnect.onStatusChange(
        (wallet) => {
          if (wallet?.account) {
            // Resolve with the wallet address
            resolve(wallet.account.address);
            unsubscribe();
          }
        },
        (error) => {
          console.error('Wallet connection error:', error);
          reject(null);
        }
      );

      // Initiate wallet connection
      tonConnect.connect({
        jsBridgeKey: selectedWallet.name.toLowerCase(),
      });
    });
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    return null;
  }
}
