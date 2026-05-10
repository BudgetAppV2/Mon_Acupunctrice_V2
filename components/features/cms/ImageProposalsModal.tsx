'use client';

import { useState, useCallback } from 'react';
import { XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import TinderStack from './TinderStack';
import type { ProposalResult } from '@/lib/cover-generator/variations';

interface ImageProposalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentRef: { type: string; slug: string; titre: string };
  proposals: ProposalResult[];
  regenerationCount: number;
  onSelected: (proposalId: string) => void;
}

export default function ImageProposalsModal({
  isOpen,
  onClose,
  contentRef,
  proposals: initialProposals,
  regenerationCount: initialRegenCount,
  onSelected,
}: ImageProposalsModalProps) {
  const [proposals, setProposals] = useState(initialProposals);
  const [regenCount, setRegenCount] = useState(initialRegenCount);
  const [allRejected, setAllRejected] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleAccept = useCallback(
    async (proposalId: string) => {
      setIsSelecting(true);
      try {
        const res = await fetch('/api/cover/select-proposal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            slug: contentRef.slug,
            type: contentRef.type,
            proposalId,
          }),
        });
        if (res.ok) {
          onSelected(proposalId);
        }
      } catch { /* silent */ }
      finally { setIsSelecting(false); }
    },
    [contentRef, onSelected],
  );

  const handleReject = useCallback(() => {
    // No-op on individual reject, handled by TinderStack internally
  }, []);

  const handleAllRejected = useCallback(() => {
    setAllRejected(true);
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (regenCount >= 2) return;
    setIsRegenerating(true);
    try {
      const res = await fetch('/api/cover/regenerate-proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: contentRef.slug,
          type: contentRef.type,
          titre: contentRef.titre,
          mode: 'all',
        }),
      });
      if (res.ok) {
        const data = await res.json() as { proposals: ProposalResult[]; regenerationCount: number };
        setProposals(data.proposals);
        setRegenCount(data.regenerationCount);
        setAllRejected(false);
      }
    } catch { /* silent */ }
    finally { setIsRegenerating(false); }
  }, [contentRef, regenCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4">
      <div className="bg-white rounded-2xl w-full max-w-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              Choisir une image
            </h3>
            <p className="text-[11px] text-gray-500 truncate">{contentRef.titre}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
            aria-label="Fermer"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 min-h-[420px]">
          {isSelecting ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
              <p className="text-xs text-gray-500">Selection en cours...</p>
            </div>
          ) : isRegenerating ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sage" />
              <p className="text-xs text-gray-500">Generation de 4 nouvelles propositions...</p>
            </div>
          ) : allRejected ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <p className="text-sm text-gray-600">
                Vous avez refuse les 4 propositions.
              </p>
              {regenCount < 2 ? (
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 px-4 py-2 bg-sage text-white rounded-lg text-xs font-medium"
                >
                  <ArrowPathIcon className="w-3.5 h-3.5" />
                  Regenerer 4 nouvelles propositions
                </button>
              ) : (
                <p className="text-[11px] text-gray-400">
                  Limite de regeneration atteinte (2/2)
                </p>
              )}
            </div>
          ) : (
            <TinderStack
              proposals={proposals}
              onAccept={handleAccept}
              onReject={handleReject}
              onAllRejected={handleAllRejected}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 flex items-center justify-between">
          {!allRejected && regenCount < 2 && (
            <button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="text-[11px] text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <ArrowPathIcon className="w-3 h-3" />
              Regenerer ({2 - regenCount} restante{2 - regenCount > 1 ? 's' : ''})
            </button>
          )}
          <span className="text-[10px] text-gray-400">
            Swipe droite = accepter
          </span>
        </div>
      </div>
    </div>
  );
}
