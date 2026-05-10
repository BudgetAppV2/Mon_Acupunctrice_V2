'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  motion,
  useMotionValue,
  useTransform,
  useAnimation,
  AnimatePresence,
} from 'framer-motion';
import {
  XMarkIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
} from '@heroicons/react/24/solid';
import type { ProposalResult } from '@/lib/cover-generator/variations';

const SWIPE_THRESHOLD = 120;
const ROTATION_RANGE = 20;

interface TinderStackProps {
  proposals: ProposalResult[];
  onAccept: (proposalId: string) => void | Promise<void>;
  onReject: (proposalId: string) => void;
  onAllRejected: () => void;
  onRewind?: () => void;
}

function SwipeCard({
  proposal,
  isActive,
  stackIndex,
  onSwipe,
}: {
  proposal: ProposalResult;
  isActive: boolean;
  stackIndex: number;
  onSwipe: (direction: 'left' | 'right') => void;
}) {
  const controls = useAnimation();
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-ROTATION_RANGE, ROTATION_RANGE]);
  const acceptOpacity = useTransform(x, [0, 60, SWIPE_THRESHOLD], [0, 0.5, 1]);
  const rejectOpacity = useTransform(x, [-SWIPE_THRESHOLD, -60, 0], [1, 0.5, 0]);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number }; velocity: { x: number } }) => {
      const { offset, velocity } = info;
      const swipeRight = offset.x > SWIPE_THRESHOLD || velocity.x > 500;
      const swipeLeft = offset.x < -SWIPE_THRESHOLD || velocity.x < -500;

      if (swipeRight) {
        controls.start({ x: 500, rotate: ROTATION_RANGE, transition: { duration: 0.3 } })
          .then(() => onSwipe('right'));
      } else if (swipeLeft) {
        controls.start({ x: -500, rotate: -ROTATION_RANGE, transition: { duration: 0.3 } })
          .then(() => onSwipe('left'));
      } else {
        controls.start({ x: 0, rotate: 0, transition: { type: 'spring', stiffness: 500, damping: 30 } });
      }
    },
    [controls, onSwipe],
  );

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        zIndex: 10 - stackIndex,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      initial={false}
      animate={{
        scale: 1 - stackIndex * 0.05,
        y: stackIndex * 10,
      }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full h-full rounded-xl overflow-hidden bg-white shadow-lg border border-gray-200 cursor-grab active:cursor-grabbing"
        style={{ x, rotate }}
        drag={isActive ? 'x' : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={handleDragEnd}
        animate={controls}
      >
        {/* Cover image */}
        <img
          src={proposal.coverUrl}
          alt={`Proposition ${proposal.proposalId}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Accept overlay */}
        <motion.div
          className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center"
          style={{ opacity: acceptOpacity }}
        >
          <div className="bg-emerald-500 text-white rounded-full p-4">
            <CheckIcon className="w-8 h-8" />
          </div>
        </motion.div>

        {/* Reject overlay */}
        <motion.div
          className="absolute inset-0 bg-red-500/30 flex items-center justify-center"
          style={{ opacity: rejectOpacity }}
        >
          <div className="bg-red-500 text-white rounded-full p-4">
            <XMarkIcon className="w-8 h-8" />
          </div>
        </motion.div>

        {/* Proposal label */}
        <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {proposal.proposalId.toUpperCase()}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function TinderStack({
  proposals,
  onAccept,
  onReject,
  onAllRejected,
  onRewind,
}: TinderStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<number[]>([]);

  const visibleCards = useMemo(
    () => proposals.slice(currentIndex, currentIndex + 3),
    [proposals, currentIndex],
  );

  const handleSwipe = useCallback(
    (direction: 'left' | 'right') => {
      const proposal = proposals[currentIndex];
      if (!proposal) return;

      setHistory((prev) => [...prev, currentIndex]);

      if (direction === 'right') {
        onAccept(proposal.proposalId);
      } else {
        onReject(proposal.proposalId);
        if (currentIndex + 1 >= proposals.length) {
          onAllRejected();
        }
      }
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex, proposals, onAccept, onReject, onAllRejected],
  );

  const handleButtonSwipe = useCallback(
    (direction: 'left' | 'right') => {
      handleSwipe(direction);
    },
    [handleSwipe],
  );

  const handleRewind = useCallback(() => {
    if (history.length === 0) return;
    const lastIndex = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCurrentIndex(lastIndex);
    onRewind?.();
  }, [history, onRewind]);

  if (currentIndex >= proposals.length) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Card stack */}
      <div className="relative w-full aspect-[16/9] max-w-full sm:max-w-[480px]">
        <AnimatePresence mode="popLayout">
          {visibleCards.map((proposal, index) => (
            <SwipeCard
              key={proposal.proposalId}
              proposal={proposal}
              isActive={index === 0}
              stackIndex={index}
              onSwipe={handleSwipe}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Hint */}
      <div className="flex justify-between w-full max-w-full sm:max-w-[480px] text-[10px] text-gray-400 px-2">
        <span>Refuser</span>
        <span>{currentIndex + 1} / {proposals.length}</span>
        <span>Accepter</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleRewind}
          disabled={history.length === 0}
          className="p-2.5 rounded-full border border-gray-200 text-gray-400 disabled:opacity-30 hover:bg-gray-50"
          aria-label="Annuler le dernier swipe"
        >
          <ArrowUturnLeftIcon className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleButtonSwipe('left')}
          className="p-3 rounded-full bg-red-50 text-red-500 border border-red-200 hover:bg-red-100"
          aria-label="Refuser"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <button
          onClick={() => handleButtonSwipe('right')}
          className="p-3 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-200 hover:bg-emerald-100"
          aria-label="Accepter"
        >
          <CheckIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
