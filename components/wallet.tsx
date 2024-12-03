import { useState, useCallback } from 'react';
import { TonConnect, WalletInfo } from '@tonconnect/sdk';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const WalletPage = () => {
  const [wallet, setWallet] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);

      const manifestUrl = 'https://babycheetah.vercel.app/tonconnect-manifest.json';
      const tonConnect = new TonConnect({ manifestUrl });

      const walletConnectionSource = {
        jsBridgeKey: 'tonkeeper',
      };
      await tonConnect.connect(walletConnectionSource);

      const wallets = await tonConnect.getWallets();
      if (wallets && wallets.length > 0) {
        const walletInfo = wallets[0] as WalletInfo;
        if (
          'account' in walletInfo &&
          typeof walletInfo.account === 'object' &&
          walletInfo.account &&
          'address' in walletInfo.account
        ) {
          setWallet(walletInfo.account.address as string);
          window.Telegram.WebApp.showAlert('Wallet connected successfully with Tonkeeper!');
        } else {
          throw new Error('Failed to get wallet address');
        }
      } else {
        throw new Error('Failed to get wallet address');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      window.Telegram.WebApp.showAlert('Failed to connect wallet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="flex-grow flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-gray-900 to-black text-white p-8 rounded-3xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Connect Wallet</h2>
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              <span className="ml-2">Connecting...</span>
            </div>
          ) : !wallet ? (
            <Button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl text-lg font-bold transform transition-all duration-200 hover:scale-105 hover:from-purple-700 hover:to-pink-700 backdrop-blur-md flex items-center justify-center"
            >
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tonkeeper-logo-Rl9Uy5Zy7Ue5Ue5Ue5Ue5Ue5Ue5Ue5Ue5Ue5.png"
                alt="Tonkeeper"
                width={24}
                height={24}
                className="mr-2"
              />
              <span className="text-base">Connect Tonkeeper</span>
            </Button>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-gray-800 p-4 rounded-lg">
                <span className="text-green-400 flex items-center text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Connected
                </span>
                <span className="text-xs bg-gray-700 px-3 py-1 rounded-full">
                  {wallet.slice(0, 6)}...{wallet.slice(-4)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletPage;
