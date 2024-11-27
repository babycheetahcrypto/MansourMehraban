import './globals.css';
import Script from 'next/script';
import TelegramInitializer from './TelegramInitializer';

export const metadata = {
  title: 'Baby Cheetah Crypto',
  description: 'Baby Cheetah Crypto Game',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body>
        <TelegramInitializer />
        {children}
      </body>
    </html>
  );
}
