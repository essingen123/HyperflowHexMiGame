import React, { useState, useEffect } from 'react';
import type { GameSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, settings, onClose }) => {
  const [copyButtonText, setCopyButtonText] = useState('Copy to Clipboard');
  const settingsString = JSON.stringify(settings, null, 2);

  useEffect(() => {
    if (isOpen) {
      // Reset button text whenever modal opens
      const timer = setTimeout(() => setCopyButtonText('Copy to Clipboard'), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(settingsString).then(() => {
      setCopyButtonText('Copied!');
    }, () => {
      setCopyButtonText('Failed to copy');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-[#0A0F1E] border-2 border-cyan-400/50 rounded-lg p-6 w-full max-w-2xl text-white shadow-lg shadow-cyan-500/20">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-cyan-400" style={{ textShadow: '0 0 10px #0ff' }}>
            Settings JSON
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 text-3xl leading-none">&times;</button>
        </div>
        <p className="text-sm text-gray-400 mb-4">Copy these settings and share them to reproduce this visual style.</p>
        <textarea
          readOnly
          value={settingsString}
          className="w-full h-80 bg-[#030611] border border-purple-500 rounded p-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="mt-4 flex flex-col sm:flex-row gap-4">
          <button onClick={handleCopy} className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 rounded transition-colors font-bold">
            {copyButtonText}
          </button>
           <button onClick={onClose} className="w-full py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors font-bold">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
