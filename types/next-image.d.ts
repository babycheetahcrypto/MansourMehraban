declare module 'next/config' {
  interface PublicRuntimeConfig {
    NEXT_PUBLIC_TELEGRAM_BOT_TOKEN: string;
  }

  interface ServerRuntimeConfig {
    // Add any server-side configurations
  }

  function getConfig(): {
    serverRuntimeConfig: ServerRuntimeConfig;
    publicRuntimeConfig: PublicRuntimeConfig;
  };

  export = getConfig;
}