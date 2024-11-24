// utils/telegram.ts
export function isTelegramWebAppAvailable(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.Telegram !== undefined &&
    window.Telegram.WebApp !== undefined
  );
}

export function getTelegramWebApp() {
  if (isTelegramWebAppAvailable()) {
    return window.Telegram.WebApp;
  }
  return null;
}

export function safeShowAlert(message: string) {
  const webapp = getTelegramWebApp();
  if (webapp) {
    webapp.showAlert(message);
  } else {
    console.log(message);
  }
}

export function safeExpand() {
  const webapp = getTelegramWebApp();
  if (webapp) {
    webapp.expand();
  }
}

export function safeReady() {
  const webapp = getTelegramWebApp();
  if (webapp) {
    webapp.ready();
  }
}
