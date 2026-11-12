import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { openTry } from './TrySheet';
import { domainOf } from './verticals';
import { trackEvent } from '@/utils/analytics';

// The installed app's share target (app.webmanifest share_target → GET /share?title&text&url):
// share any company's website to DigitalCraft and the demos offer to run on it.
const SharePage = () => {
  const [q] = useSearchParams();
  const navigate = useNavigate();
  useEffect(() => {
    const site = domainOf(q.get('url')) || domainOf(q.get('text')) || domainOf(q.get('title'));
    trackEvent('v3_share_target', 'pwa', site ? 'site' : 'nosite');
    navigate('/', { replace: true });
    window.setTimeout(() => openTry({ site }), 50);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};
export default SharePage;
