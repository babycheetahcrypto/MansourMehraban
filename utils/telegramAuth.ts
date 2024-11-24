import crypto from 'crypto';

export function validateTelegramInitData(initData: string): boolean {
  if (!initData) return false;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Telegram Bot Token is not configured');
  }

  try {
    // Parse the init data
    const params = new URLSearchParams(initData);
    const dataToCheck: Record<string, string> = {};

    // Extract and sort parameters
    params.forEach((value, key) => {
      if (key !== 'hash') {
        dataToCheck[key] = value;
      }
    });

    // Create data string
    const dataString = Object.entries(dataToCheck)
      .map(([key, value]) => `${key}=${value}`)
      .sort()
      .join('\n');

    // Create secret key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // Create hash
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataString).digest('hex');

    // Compare hashes
    return calculatedHash === params.get('hash');
  } catch (error) {
    console.error('Telegram Init Data Validation Error:', error);
    return false;
  }
}
