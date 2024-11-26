declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      NODE_ENV: 'development' | 'production';
    }
  }
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  initDataUnsafe: {
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
      language_code?: string;
    };
    query_id?: string;
    auth_date?: string;
    hash?: string;
  };
}

interface Window {
  Telegram: {
    WebApp: TelegramWebApp;
  };
}

export {};
