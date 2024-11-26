import crypto from 'crypto';

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export function validateTelegramWebAppData(telegramInitData: string): boolean {
  try {
    const searchParams = new URLSearchParams(telegramInitData);
    const hash = searchParams.get('hash');
    if (!hash) return false;

    // Remove hash from the check string
    searchParams.delete('hash');

    // Convert params to array and sort alphabetically
    const params = Array.from(searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Get your bot token from environment variable
    const botToken = process.env.BOT_TOKEN;
    if (!botToken) {
      throw new Error('BOT_TOKEN environment variable is not set');
    }

    // Create a secret key using SHA256
    const secretKey = crypto.createHash('sha256').update(botToken).digest();

    // Convert Buffer to Uint8Array explicitly
    const secretKeyUint8Array = new Uint8Array(secretKey);

    // Calculate HMAC-SHA256 signature using Uint8Array
    const hmac = crypto.createHmac('sha256', secretKeyUint8Array).update(params).digest('hex');

    return hmac === hash;
  } catch (error) {
    console.error('Telegram auth validation error:', error);
    return false;
  }
}

export function parseTelegramInitData(telegramInitData: string): TelegramUser | null {
  try {
    const searchParams = new URLSearchParams(telegramInitData);
    const user = JSON.parse(searchParams.get('user') || '');

    if (!validateTelegramWebAppData(telegramInitData)) {
      throw new Error('Invalid Telegram Web App data');
    }

    return {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      username: user.username,
      photo_url: user.photo_url,
      auth_date: parseInt(searchParams.get('auth_date') || '0'),
      hash: searchParams.get('hash') || '',
    };
  } catch (error) {
    console.error('Error parsing Telegram init data:', error);
    return null;
  }
}

export function isRecentAuth(authDate: number, maxAgeSeconds = 3600): boolean {
  const currentTime = Math.floor(Date.now() / 1000);
  return currentTime - authDate <= maxAgeSeconds;
}
