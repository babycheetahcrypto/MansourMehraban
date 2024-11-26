// utils/authMiddleware.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { validateTelegramWebAppData } from './telegramAuth';

export function withTelegramAuth(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const initData = req.headers['x-telegram-init-data'] as string;

      if (!initData || !validateTelegramWebAppData(initData)) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return await handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
