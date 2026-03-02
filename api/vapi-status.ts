import type { VercelRequest, VercelResponse } from '@vercel/node';

export const config = { maxDuration: 10 };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const available = Boolean(process.env.VAPI_API_KEY);
  const hasPublicKey = Boolean(process.env.VAPI_PUBLIC_KEY);
  const hasPhoneNumber = Boolean(process.env.VAPI_PHONE_NUMBER_ID);

  return res.status(200).json({
    available,
    hasPublicKey,
    hasPhoneNumber,
    publicKey: hasPublicKey ? process.env.VAPI_PUBLIC_KEY : null,
  });
}
