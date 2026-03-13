import { ImageResponse } from '@vercel/og';
import type { VercelRequest } from '@vercel/node';

export const config = { runtime: 'edge' };

export default async function handler(req: VercelRequest) {
  const { searchParams } = new URL(req.url || '', 'https://digitalcraftai.com');
  const page = searchParams.get('page') || 'default';

  if (page === 'setupclaw') {
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
            fontFamily: 'sans-serif',
            padding: '60px',
          }}
        >
          {/* Top: Logo row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                backgroundColor: '#dc2626',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                color: 'white',
                fontWeight: 700,
              }}
            >
              SC
            </div>
            <span style={{ fontSize: '42px', fontWeight: 700, color: 'white' }}>SetupClaw</span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: 'white',
              textAlign: 'center',
              lineHeight: 1.2,
              maxWidth: '900px',
              marginBottom: '24px',
            }}
          >
            Your team's AI assistant —{' '}
            <span style={{ color: '#f87171' }}>deployed and secured</span>{' '}
            from day one.
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: '24px',
              color: '#9ca3af',
              textAlign: 'center',
              maxWidth: '700px',
              marginBottom: '40px',
              lineHeight: 1.5,
            }}
          >
            White-glove OpenClaw setup on a Mac Mini. No technical knowledge required.
          </div>

          {/* Price badges */}
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 32px',
                border: '1px solid #374151',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.05)',
              }}
            >
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>$5,000</span>
              <span style={{ fontSize: '16px', color: '#9ca3af' }}>Remote Setup</span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 32px',
                border: '1px solid #dc2626',
                borderRadius: '12px',
                backgroundColor: 'rgba(220,38,38,0.1)',
              }}
            >
              <span style={{ fontSize: '28px', fontWeight: 700, color: 'white' }}>$6,000</span>
              <span style={{ fontSize: '16px', color: '#9ca3af' }}>On-Site — DFW & Austin</span>
            </div>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px', color: '#6b7280' }}>by</span>
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#9ca3af' }}>
              Digital
            </span>
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#33C3F0' }}>
              Craft
            </span>
            <span style={{ fontSize: '20px', fontWeight: 600, color: '#9ca3af' }}>
              AI
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  }

  // Default fallback OG image
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: 700, color: 'white', marginBottom: '16px' }}>
          Digital<span style={{ color: '#33C3F0' }}>Craft</span> AI
        </div>
        <div style={{ fontSize: '24px', color: '#94a3b8' }}>
          AI Automation for Traditional Industries
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
