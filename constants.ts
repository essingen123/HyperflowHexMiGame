
import type { GameSettings } from './types';

export const HEX_R = 30;
export const CATCH_Z = -28;
export const SPAWN_Z = -1100;
export const SCROLL_BASE = 360;

export const STANCES = [
  { name: 'TOP', color: 0xffff00, tracks: [1, 4], lA: 5 * Math.PI / 6, rA: 1 * Math.PI / 6 },
  { name: 'MID', color: 0x00ffff, tracks: [0, 3], lA: Math.PI, rA: 0 },
  { name: 'LOW', color: 0xff00aa, tracks: [2, 5], lA: 7 * Math.PI / 6, rA: 11 * Math.PI / 6 }
];

export const DEFAULT_SETTINGS: GameSettings = {
  game: {
    speed: 1.8,
    spawnFrequency: 0.42,
    tunnelRotationSpeed: 0,
  },
  bloom: {
    enabled: true,
    strength: 3,
    radius: 0.8,
    threshold: 0.1,
  },
  shell: {
    enabled: true,
    wireframe: true,
    color: '#224c97',
    opacity: 0.51,
    rotation: { x: 0, y: 180, z: 0 },
  },
  rails: {
    enabled: true,
    baseColor: '#6f4c9a',
    glowColor: '#d039cb',
    rotation: { x: 0, y: 0, z: 0 },
  },
  paddles: {
    color: "#ffffff",
    bankAngle: 0.4,
    radius: 30,
    width: 3.9,
    height: 5,
    depth: 15,
    rotation: { x: 0, y: 0, z: 30 },
  },
  streaks: {
    enabled: true,
    count: 400,
    color: '#66d8ff',
    opacity: 0.35,
  },
  walls: {
    enabled: true,
    wireframe: true,
    opacity: 0.89,
    rotation: { x: 0, y: 0, z: 0 },
  },
  particles: {
    enabled: true,
    count: 100,
  },
  rotation: {
    x: 0,
    y: 0,
    z: -30,
  },
};
