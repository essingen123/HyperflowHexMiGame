import React, { useState, useCallback } from 'react';
import Game from './components/Game';
import ControlPanel from './components/ControlPanel';
import { SettingsIcon } from './components/icons/SettingsIcon';
import type { GameSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import * as THREE from 'three';
import { SettingsModal } from './components/SettingsModal';

const App: React.FC = () => {
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [isPanelOpen, setPanelOpen] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);

  const handleSave = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleRandomize = useCallback(() => {
    const randomColor = () => '#' + new THREE.Color(Math.random(), Math.random(), Math.random()).getHexString();
    
    setSettings(prev => ({
      ...prev,
      bloom: {
        ...prev.bloom,
        strength: parseFloat((Math.random() * 2.5 + 0.5).toFixed(2)),
        radius: parseFloat((Math.random() * 1.0).toFixed(2)),
        threshold: parseFloat((Math.random() * 0.5).toFixed(2)),
      },
      shell: {
        ...prev.shell,
        color: randomColor(),
        opacity: parseFloat((Math.random() * 0.4 + 0.05).toFixed(2)),
      },
      rails: {
        ...prev.rails,
        baseColor: randomColor(),
        glowColor: randomColor(),
      },
      streaks: {
        ...prev.streaks,
        color: randomColor(),
        opacity: parseFloat((Math.random() * 0.6 + 0.1).toFixed(2)),
      },
      particles: {
        ...prev.particles,
        enabled: true,
      },
       walls: {
        ...prev.walls,
        opacity: parseFloat((Math.random() * 0.8 + 0.2).toFixed(2)),
      }
    }));
  }, []);


  return (
    <div className="relative w-screen h-screen overflow-hidden bg-gradient-to-b from-[#081026] via-[#040816] to-[#02050d] cursor-none">
      <Game settings={settings} />

      <button
        onClick={() => setPanelOpen(!isPanelOpen)}
        className="absolute top-4 right-4 z-20 p-2 bg-gray-800 bg-opacity-50 rounded-full text-white hover:bg-opacity-75 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-400"
        aria-label="Toggle settings panel"
      >
        <SettingsIcon />
      </button>

      <ControlPanel
        isOpen={isPanelOpen}
        settings={settings}
        onSettingsChange={setSettings}
        onSave={handleSave}
        onRandomize={handleRandomize}
        onClose={() => setPanelOpen(false)}
      />

      <SettingsModal
        isOpen={isModalOpen}
        settings={settings}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};

export default App;