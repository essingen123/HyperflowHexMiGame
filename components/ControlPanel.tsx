import React, { useCallback, useState } from 'react';
import type { GameSettings } from '../types';
import { HeartIcon } from './icons/HeartIcon';

interface ControlPanelProps {
  isOpen: boolean;
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onSave: () => void;
  onRandomize: () => void;
  onClose: () => void;
}

const Fieldset: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <fieldset className="border-t-2 border-cyan-400/50 pt-3 pb-1 mb-4">
      <legend className="text-lg font-bold text-cyan-400 px-2 cursor-pointer" onClick={() => setIsOpen(!isOpen)} style={{ textShadow: '0 0 8px #0ff' }}>
        {title} {isOpen ? '▾' : '▸'}
      </legend>
      {isOpen && <div className="p-2">{children}</div>}
    </fieldset>
  );
};

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, ...props }) => (
    <div className="mb-3 text-sm">
        <label className="block text-gray-300 mb-1">{label}: <span className="font-mono text-cyan-300">{props.value}</span></label>
        <input type="range" {...props} className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
    </div>
);

const Checkbox: React.FC<{ label: string; checked: boolean; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, ...props }) => (
    <div className="flex items-center justify-between mb-3 text-sm">
        <label className="text-gray-300">{label}</label>
        <input type="checkbox" {...props} className="w-5 h-5 text-cyan-400 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 accent-cyan-500" />
    </div>
);

const ColorInput: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, ...props }) => (
    <div className="flex items-center justify-between mb-3 text-sm">
      <label className="text-gray-300">{label}</label>
      <input type="color" {...props} className="p-0 h-8 w-14 bg-transparent border-none rounded cursor-pointer" />
    </div>
);


const ControlPanel: React.FC<ControlPanelProps> = ({ isOpen, settings, onSettingsChange, onSave, onRandomize, onClose }) => {
  const handleNestedChange = useCallback((section: keyof GameSettings, field: string, value: any) => {
    onSettingsChange({ ...settings, [section]: { ...settings[section], [field]: value } });
  }, [settings, onSettingsChange]);

  const handleDeepChange = useCallback((section: keyof GameSettings, field: string, subField: string, value: any) => {
    onSettingsChange({
      ...settings,
      [section]: {
        ...settings[section],
        // @ts-ignore
        [field]: { ...settings[section][field], [subField]: value },
      },
    });
  }, [settings, onSettingsChange]);

  const renderRotationControls = (section: 'shell' | 'rails' | 'paddles' | 'walls' | 'rotation') => (
    <>
      <Slider label="Rotate X" min={-180} max={180} step={1} value={section === 'rotation' ? settings[section].x : settings[section].rotation.x} onChange={e => section === 'rotation' ? handleNestedChange('rotation', 'x', parseInt(e.target.value)) : handleDeepChange(section, 'rotation', 'x', parseInt(e.target.value))} />
      <Slider label="Rotate Y" min={-180} max={180} step={1} value={section === 'rotation' ? settings[section].y : settings[section].rotation.y} onChange={e => section === 'rotation' ? handleNestedChange('rotation', 'y', parseInt(e.target.value)) : handleDeepChange(section, 'rotation', 'y', parseInt(e.target.value))} />
      <Slider label="Rotate Z" min={-180} max={180} step={1} value={section === 'rotation' ? settings[section].z : settings[section].rotation.z} onChange={e => section === 'rotation' ? handleNestedChange('rotation', 'z', parseInt(e.target.value)) : handleDeepChange(section, 'rotation', 'z', parseInt(e.target.value))} />
    </>
  );

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#0A0F1E]/90 backdrop-blur-sm text-white p-4 z-30 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center mb-4 border-b-2 border-purple-500/50 pb-3">
            <h2 className="text-2xl font-bold text-purple-400" style={{ textShadow: '0 0 8px #f0f' }}>Settings</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-700 text-3xl leading-none">&times;</button>
        </div>

        <div className="overflow-y-auto h-[calc(100vh-160px)] pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-700">
            <Fieldset title="Game">
              <Slider label="Speed" min={0.5} max={5} step={0.1} value={settings.game.speed} onChange={e => handleNestedChange('game', 'speed', parseFloat(e.target.value))} />
              <Slider label="Spawn Freq" min={0.1} max={2} step={0.01} value={settings.game.spawnFrequency} onChange={e => handleNestedChange('game', 'spawnFrequency', parseFloat(e.target.value))} />
              <Slider label="Tunnel Spin" min={-1} max={1} step={0.01} value={settings.game.tunnelRotationSpeed} onChange={e => handleNestedChange('game', 'tunnelRotationSpeed', parseFloat(e.target.value))} />
            </Fieldset>
            <Fieldset title="Bloom">
              <Checkbox label="Enabled" checked={settings.bloom.enabled} onChange={e => handleNestedChange('bloom', 'enabled', e.target.checked)} />
              <Slider label="Strength" min={0} max={5} step={0.1} value={settings.bloom.strength} onChange={e => handleNestedChange('bloom', 'strength', parseFloat(e.target.value))} />
              <Slider label="Radius" min={0} max={2} step={0.01} value={settings.bloom.radius} onChange={e => handleNestedChange('bloom', 'radius', parseFloat(e.target.value))} />
              <Slider label="Threshold" min={0} max={1} step={0.01} value={settings.bloom.threshold} onChange={e => handleNestedChange('bloom', 'threshold', parseFloat(e.target.value))} />
            </Fieldset>
             <Fieldset title="Static Rotations">{renderRotationControls('rotation')}</Fieldset>
            <Fieldset title="Tunnel Shell">
                <Checkbox label="Enabled" checked={settings.shell.enabled} onChange={e => handleNestedChange('shell', 'enabled', e.target.checked)} />
                <Checkbox label="Wireframe" checked={settings.shell.wireframe} onChange={e => handleNestedChange('shell', 'wireframe', e.target.checked)} />
                <ColorInput label="Color" value={settings.shell.color} onChange={e => handleNestedChange('shell', 'color', e.target.value)} />
                <Slider label="Opacity" min={0} max={1} step={0.01} value={settings.shell.opacity} onChange={e => handleNestedChange('shell', 'opacity', parseFloat(e.target.value))} />
                {renderRotationControls('shell')}
            </Fieldset>
            <Fieldset title="Rails">
                <Checkbox label="Enabled" checked={settings.rails.enabled} onChange={e => handleNestedChange('rails', 'enabled', e.target.checked)} />
                <ColorInput label="Base Color" value={settings.rails.baseColor} onChange={e => handleNestedChange('rails', 'baseColor', e.target.value)} />
                <ColorInput label="Glow Color" value={settings.rails.glowColor} onChange={e => handleNestedChange('rails', 'glowColor', e.target.value)} />
                {renderRotationControls('rails')}
            </Fieldset>
            <Fieldset title="Paddles">
                <ColorInput label="Base Color" value={settings.paddles.color} onChange={e => handleNestedChange('paddles', 'color', e.target.value)} />
                <Slider label="Bank Angle" min={-2} max={2} step={0.1} value={settings.paddles.bankAngle} onChange={e => handleNestedChange('paddles', 'bankAngle', parseFloat(e.target.value))} />
                <Slider label="Radius" min={10} max={50} step={0.5} value={settings.paddles.radius} onChange={e => handleNestedChange('paddles', 'radius', parseFloat(e.target.value))} />
                <Slider label="Width" min={1} max={10} step={0.1} value={settings.paddles.width} onChange={e => handleNestedChange('paddles', 'width', parseFloat(e.target.value))} />
                <Slider label="Height" min={1} max={10} step={0.1} value={settings.paddles.height} onChange={e => handleNestedChange('paddles', 'height', parseFloat(e.target.value))} />
                <Slider label="Depth" min={1} max={20} step={0.1} value={settings.paddles.depth} onChange={e => handleNestedChange('paddles', 'depth', parseFloat(e.target.value))} />
                {renderRotationControls('paddles')}
            </Fieldset>
            <Fieldset title="Streaks">
                <Checkbox label="Enabled" checked={settings.streaks.enabled} onChange={e => handleNestedChange('streaks', 'enabled', e.target.checked)} />
                <Slider label="Count" min={0} max={1000} step={10} value={settings.streaks.count} onChange={e => handleNestedChange('streaks', 'count', parseInt(e.target.value))} />
                <ColorInput label="Color" value={settings.streaks.color} onChange={e => handleNestedChange('streaks', 'color', e.target.value)} />
                <Slider label="Opacity" min={0} max={1} step={0.01} value={settings.streaks.opacity} onChange={e => handleNestedChange('streaks', 'opacity', parseFloat(e.target.value))} />
            </Fieldset>
            <Fieldset title="Walls">
                <Checkbox label="Enabled" checked={settings.walls.enabled} onChange={e => handleNestedChange('walls', 'enabled', e.target.checked)} />
                <Checkbox label="Wireframe" checked={settings.walls.wireframe} onChange={e => handleNestedChange('walls', 'wireframe', e.target.checked)} />
                <Slider label="Opacity" min={0} max={1} step={0.01} value={settings.walls.opacity} onChange={e => handleNestedChange('walls', 'opacity', parseFloat(e.target.value))} />
                {renderRotationControls('walls')}
            </Fieldset>
            <Fieldset title="Particles">
                <Checkbox label="Enabled" checked={settings.particles.enabled} onChange={e => handleNestedChange('particles', 'enabled', e.target.checked)} />
                <Slider label="Count" min={0} max={200} step={1} value={settings.particles.count} onChange={e => handleNestedChange('particles', 'count', parseInt(e.target.value))} />
            </Fieldset>
        </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0A0F1E] flex flex-col gap-2">
        <button onClick={onSave} className="w-full py-2 bg-cyan-500 hover:bg-cyan-600 rounded transition-colors font-bold text-black">
          Save Settings
        </button>
        <button onClick={onRandomize} className="w-full py-2 bg-purple-500 hover:bg-purple-600 rounded transition-colors font-bold text-white">
          Randomize Visuals
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
