import React from 'react';
import MobileDock from './MobileDock';
import PwaBar from './PwaBar';
import TrySheet from './TrySheet';
import BetaBadge from './BetaBadge';
import { foldState } from './fold';
import { isCTOHost } from '@/utils/hostVariant';

// The v3 chrome every route shares, mounted once inside the router: the phone dock, the installable
// app's bar and deep links, the "try it on your company" sheet, and the beta badge.
foldState(); // decide the screen's form (html[data-fold]) before first paint of the routes

const V3Chrome: React.FC = () => {
  const cto = isCTOHost();
  return (
    <>
      <MobileDock cto={cto} />
      <TrySheet />
      <PwaBar />
      <BetaBadge />
    </>
  );
};
export default V3Chrome;
