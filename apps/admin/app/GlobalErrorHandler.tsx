'use client';

import { useEffect } from 'react';

if (typeof window !== 'undefined') {
  // Capture unhandled rejections in the capture phase before Next.js dev-overlay catches them
  window.addEventListener(
    'unhandledrejection',
    (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      // Handle Next.js ChunkLoadError after rebuild or file updates
      const isChunkLoadError =
        reason?.name === 'ChunkLoadError' ||
        (typeof reason?.message === 'string' &&
          (reason.message.includes('Loading chunk') ||
            reason.message.includes('ChunkLoadError') ||
            reason.message.includes('Failed to fetch dynamically imported module')));

      if (isChunkLoadError) {
        event.stopImmediatePropagation();
        event.preventDefault();
        const lastReload = sessionStorage.getItem('admin_chunk_reload_ts');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem('admin_chunk_reload_ts', now.toString());
          window.location.reload();
        }
        return;
      }

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

  window.addEventListener(
    'error',
    (event: ErrorEvent) => {
      const isChunkLoad =
        event.error?.name === 'ChunkLoadError' ||
        (event.filename && event.filename.includes('_next/static/chunks') && event.error?.name === 'SyntaxError') ||
        (typeof event.message === 'string' &&
          (event.message.includes('Loading chunk') ||
            event.message.includes('ChunkLoadError') ||
            (event.message.includes('SyntaxError') && (event.filename || '').includes('layout.js'))));

      if (isChunkLoad) {
        event.stopImmediatePropagation();
        event.preventDefault();
        const lastReload = sessionStorage.getItem('admin_chunk_reload_ts');
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 8000) {
          sessionStorage.setItem('admin_chunk_reload_ts', now.toString());
          window.location.reload();
        }
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

