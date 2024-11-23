import crypto from 'crypto';

export function verifyTelegramWebAppData(req, res, next) {
  const { initData } = req.body;
  if (!initData) {
    return res.status(401).json({ error: 'No init data provided' });
  }

  const secret = crypto.createHmac('sha256', 'WebAppData').update(process.env.BOT_TOKEN);
  const hash = crypto.createHmac('sha256', secret.digest()).update(initData).digest('hex');

  if (hash !== req.body.hash) {
    return res.status(401).json({ error: 'Invalid hash' });
  }

  next();
}
