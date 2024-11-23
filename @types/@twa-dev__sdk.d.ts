declare module '@twa-dev/sdk' {
  export interface WebAppInitData {
    query_id?: string;
    user?: {
      id: number;
      first_name?: string;
      last_name?: string;
      username?: string;
    };
  }

  export interface WebApp {
    initData: string;
    initDataUnsafe: WebAppInitData;
    version: string;
    platform: string;

    sendData: (data: Record<string, unknown>) => void;
    showAlert: (message: string) => void;
    showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
    ready: () => void;
    expand: () => void;
    close: () => void;

    MainButton: {
      text: string;
      show: () => void;
      hide: () => void;
      enable: () => void;
      disable: () => void;
      onClick: (callback: () => void) => void;
    };

    BackButton: {
      show: () => void;
      hide: () => void;
      onClick: (callback: () => void) => void;
    };

    HapticFeedback: {
      impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
    };
  }

  export const WebApp: WebApp;
}
