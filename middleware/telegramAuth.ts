import crypto from 'crypto';

export function validateTelegramInitData(initData: string): boolean {
  if (!initData) return false;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Telegram Bot Token is not configured');
  }

  try {
    const params = new URLSearchParams(initData);
    const dataToCheck: Record<string, string> = {};

    params.forEach((value, key) => {
      if (key !== 'hash') {
        dataToCheck[key] = value;
      }
    });

    const dataString = Object.entries(dataToCheck)
      .sort()
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataString).digest('hex');

    return calculatedHash === params.get('hash');
  } catch (error) {
    console.error('Telegram Init Data Validation Error:', error);
    return false;
  }
}
