'use client';

import { useState, useEffect, useCallback } from 'react';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface DeleteConfirmModalProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({ title, onConfirm, onCancel }: DeleteConfirmModalProps) {
  const [input, setInput] = useState('');
  const confirmed = input.trim() === 'SUPPRIMER';

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onCancel();
  }, [onCancel]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onCancel}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl max-w-sm w-full p-5 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-5 h-5 text-red-500 shrink-0" />
            <h2 className="text-base font-bold text-gray-900">Supprimer definitivement</h2>
          </div>
          <button onClick={onCancel} className="p-1 rounded-lg hover:bg-gray-100">
            <XMarkIcon className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-gray-700">
            Le contenu <span className="font-semibold">&laquo;{title}&raquo;</span> sera
            definitivement supprime de la base de donnees.
          </p>
          <p className="text-xs text-red-600 font-medium">
            Cette action est irreversible. Aucune restauration possible.
          </p>
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium">
            Pour confirmer, tape le mot SUPPRIMER ci-dessous
          </label>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="SUPPRIMER"
            autoFocus
            className="w-full mt-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-red-300"
          />
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={!confirmed}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
              confirmed
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Confirmer la suppression
          </button>
        </div>
      </div>
    </div>
  );
}
