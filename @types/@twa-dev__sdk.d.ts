declare module '@twa-dev/sdk' {
  export interface WebAppUser {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    language_code?: string;
  }

  export interface WebAppInitData {
    user?: WebAppUser;
    // Add other properties as needed
  }

  export interface WebAppInterface {
    initDataUnsafe: WebAppInitData;
    ready(): void;
    expand(): void;
  }

  export const WebApp: WebAppInterface;
}
