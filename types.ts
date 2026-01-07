
export enum DungeonTheme {
  STONE = 'STONE',
  FOREST = 'FOREST',
  FROZEN = 'FROZEN',
  DESERT = 'DESERT',
  LAVA = 'LAVA'
}

export interface Position {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  type: 'player' | 'slime' | 'elite-slime' | 'chest' | 'golden-chest' | 'wall' | 'torch' | 'crate' | 'key' | 'exit';
  pos: Position;
  health?: number;
  maxHealth?: number;
  isOpened?: boolean;
}

export interface DungeonMap {
  theme: DungeonTheme;
  grid: string[][]; // 'W' for wall, 'F' for floor, 'P' for player start
  width: number;
  height: number;
}
