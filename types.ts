
export interface GameSettings {
  game: {
    speed: number;
    spawnFrequency: number;
    tunnelRotationSpeed: number;
  };
  bloom: {
    enabled: boolean;
    strength: number;
    radius: number;
    threshold: number;
  };
  shell: {
    enabled: boolean;
    wireframe: boolean;
    color: string;
    opacity: number;
    rotation: { x: number; y: number; z: number };
  };
  rails: {
    enabled: boolean;
    baseColor: string;
    glowColor: string;
    rotation: { x: number; y: number; z: number };
  };
  paddles: {
    color: string;
    bankAngle: number;
    radius: number;
    width: number;
    height: number;
    depth: number;
    rotation: { x: number; y: number; z: number };
  };
  streaks: {
    enabled: boolean;
    count: number;
    color: string;
    opacity: number;
  };
  walls: {
    enabled: boolean;
    wireframe: boolean;
    opacity: number;
    rotation: { x: number; y: number; z: number };
  };
  particles: {
    enabled: boolean;
    count: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

export interface GameState {
  score: number;
  combo: number;
  stance: number;
  over: boolean;
}
