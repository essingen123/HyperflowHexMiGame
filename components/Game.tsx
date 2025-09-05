import React, { useRef, useState } from 'react';
import { useGame } from '../hooks/useGame';
import type { GameSettings, GameState } from '../types';
import { STANCES } from '../constants';

interface GameProps {
  settings: GameSettings;
}

const Game: React.FC<GameProps> = ({ settings }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    stance: 1,
    over: false,
  });
  
  const scoreRef = useRef<HTMLDivElement>(null);
  const comboRef = useRef<HTMLDivElement>(null);

  useGame({ mountRef, settings, setGameState, scoreRef, comboRef });

  return (
    <>
      <div ref={mountRef} className="absolute top-0 left-0 w-full h-full z-0" />
      
      {/* HUD Elements */}
      <div className="absolute top-0 left-0 p-4 text-white pointer-events-none select-none z-10" style={{ imageRendering: 'pixelated' }}>
        <div 
          ref={scoreRef} 
          id="score" 
          className="text-3xl transition-transform duration-100" 
          style={{ textShadow: '0 0 10px #0ff' }}
        >
          {String(gameState.score).padStart(5, '0')}
        </div>
        <div 
          ref={comboRef} 
          id="combo" 
          className="mt-2 text-lg text-[#f0f] transition-transform duration-100" 
          style={{ textShadow: '0 0 8px #f0f' }}
        >
          {gameState.combo > 1 ? `COMBO x${gameState.combo}` : ''}
        </div>
        <div id="stance" className="mt-2 text-sm text-[#ff0]">
          {STANCES[gameState.stance]?.name || 'MID'}
        </div>
      </div>
      
      <div id="instructions" className="absolute bottom-4 w-full text-center text-xs text-[#9ab] pointer-events-none select-none z-10">
        ↑ / ↓ to switch stance
      </div>

      {gameState.over && (
        <div id="msg" className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-10">
          <div className="text-3xl text-[#f00]" style={{ textShadow: '0 0 14px #f00, 0 0 28px #f00' }}>
            GAME OVER
          </div>
          <div className="text-sm mt-2">
            Press any key to restart
          </div>
        </div>
      )}
    </>
  );
};

export default Game;