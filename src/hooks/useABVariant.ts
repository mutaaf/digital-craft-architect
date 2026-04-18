import { useEffect, useState } from 'react';
import { resolveVariant, trackVariantExposure, Variant } from '@/utils/abTest';

export const useABVariant = (): Variant => {
  const [variant] = useState<Variant>(() => resolveVariant());

  useEffect(() => {
    trackVariantExposure(variant);
  }, [variant]);

  return variant;
};
