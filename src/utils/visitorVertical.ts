// Ticket 0117 - which trade's story the CTO hero should tell first.
import { getUtmParams } from '@/utils/utmTracker';
import { getRecentVerticals } from '@/utils/recentVerticalsStore';
import { TRADE_BY_VERTICAL } from '../../api/_scene/board';

// the visitor's trade, if we can tell: an ad's utm_campaign, else the last vertical page they read
export function visitorVertical(): string | null {
  const campaign = (getUtmParams().utm_campaign || '').toLowerCase().replace(/[^a-z]/g, '');   // pool_service_fall -> poolservicefall
  if (campaign) for (const k of Object.keys(TRADE_BY_VERTICAL)) if (campaign.includes(k.replace(/s$/, '').replace(/-/g, ''))) return k;
  const recent = getRecentVerticals()[0];
  return recent ? recent.path.replace(/^\/ai-for-/, '') : null;
}
