import { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: 'Missing initData' });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: 'Bot token not configured' });
    }

    // Parse the initData string
    const parsedInitData = new URLSearchParams(initData);
    const hash = parsedInitData.get('hash');
    parsedInitData.delete('hash');
    const dataCheckString = Array.from(parsedInitData.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Validate the hash
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return res.status(401).json({ error: 'Invalid hash' });
    }

    // If hash is valid, you can now trust the data
    const userData = parsedInitData.get('user');
    const userId = userData ? JSON.parse(userData).id : null;

    // Here you would typically fetch the user data from your database
    // and return it to the client

    res.status(200).json({ message: 'WebApp initialized successfully', userId });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

