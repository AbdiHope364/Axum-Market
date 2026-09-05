'use client';

import { useEffect } from 'react';

if (typeof window !== 'undefined') {
  // Capture unhandled rejections in the capture phase before Next.js dev-overlay catches them
  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (
        reason instanceof Event ||
        (reason &&
          typeof reason === 'object' &&
          ('type' in reason || 'isTrusted' in reason) &&
          !('message' in reason))
      ) {
        // Prevent dev overlay crash while logging meaningful context
        event.stopImmediatePropagation();
        event.preventDefault();
        console.warn('AxumMarket Admin captured unhandled Event rejection:', {
          type: (reason as any)?.type,
          target: (reason as any)?.target,
        });
      }
    },
    true
  );
}

export default function GlobalErrorHandler() {
  useEffect(() => {
    // Component mount confirms handler is active
  }, []);

  return null;
}

