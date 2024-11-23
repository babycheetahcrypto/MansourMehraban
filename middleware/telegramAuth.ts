// middleware/telegramAuth.ts
import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

// Prefix with underscore to indicate intentionally unused interface
interface _TelegramAuthResult {
  isValid: boolean;
  user?: _TelegramInitData;
  error?: string;
}

// Define interfaces for better type safety
interface _TelegramInitData {
  query_id?: string;
  user?: string;
  auth_date?: string;
  hash?: string;
  [key: string]: string | undefined;
}

export function _validateTelegramInitData(initData: string): boolean {
  if (!initData) return false;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    throw new Error('Telegram Bot Token is not configured');
  }

  try {
    // Parse the init data
    const params = new URLSearchParams(initData);
    const dataToCheck: _TelegramInitData = {};

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

export function telegramAuthMiddleware(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      // Check for Telegram init data
      const initData = req.headers['x-telegram-init-data'] as string;

      if (!initData) {
        return res.status(401).json({
          error: 'No Telegram authentication data provided',
        });
      }

      // Validate Telegram data
      const isValid = _validateTelegramInitData(initData);

      if (!isValid) {
        return res.status(401).json({
          error: 'Authentication failed',
        });
      }

      // Continue to route handler
      return handler(req, res);
    } catch (error) {
      console.error('Middleware error:', error);
      res.status(500).json({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}