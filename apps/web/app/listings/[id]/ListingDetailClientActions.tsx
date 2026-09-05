'use client';

import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import ReportModal from '@/components/ReportModal';

export default function ListingDetailClientActions({
  listingId,
  listingTitle,
}: {
  listingId: string;
  listingTitle: string;
}) {
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setReportOpen(true)}
        className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-red-600 transition py-1"
      >
        <Flag className="w-3.5 h-3.5" />
        <span>Report this listing</span>
      </button>

      <ReportModal
        listingId={listingId}
        listingTitle={listingTitle}
        isOpen={reportOpen}
        onClose={() => setReportOpen(false)}
      />
    </>
  );
}

