// app/TonConnectUIWrapper.tsx
'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function TonConnectUIWrapper({ children }: { children: React.ReactNode }) {
  return (
    <TonConnectUIProvider manifestUrl="https://babycheetah.vercel.app/tonconnect-manifest.json">
      {children}
    </TonConnectUIProvider>
  );
}
