
import { DungeonTheme } from './types';

export const TILE_SIZE = 32;

export const THEME_CONFIG = {
  [DungeonTheme.STONE]: {
    name: '돌 던전',
    floorColor: '#2d3748',
    wallColor: '#1a202c',
    accentColor: '#fbbf24', // Torch glow
    description: '어두운 회색 석조 타일과 돌벽으로 이루어진 고전적인 던전입니다.',
  },
  [DungeonTheme.FOREST]: {
    name: '숲 던전',
    floorColor: '#1a3a3a',
    wallColor: '#064e3b',
    accentColor: '#34d399', // Mushroom glow
    description: '이끼 낀 대지와 울창한 나무가 가로막는 신비로운 숲입니다.',
  },
  [DungeonTheme.FROZEN]: {
    name: '얼음 폐허',
    floorColor: '#334155',
    wallColor: '#1e293b',
    accentColor: '#38bdf8', // Crystal glow
    description: '미끄러운 얼음 바닥과 서리가 내린 돌기둥이 가득한 추운 폐허입니다.',
  },
  [DungeonTheme.DESERT]: {
    name: '사막 폐허',
    floorColor: '#78350f',
    wallColor: '#451a03',
    accentColor: '#fcd34d', // Plant glow
    description: '갈라진 대지와 풍화된 사암 벽이 있는 건조한 던전입니다.',
  },
  [DungeonTheme.LAVA]: {
    name: '용암 동굴',
    floorColor: '#450a0a',
    wallColor: '#000000',
    accentColor: '#ef4444', // Lava glow
    description: '용암이 흐르는 검은 화산암 지대의 위험한 동굴입니다.',
  }
};
