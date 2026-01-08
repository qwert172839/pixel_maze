
import { DungeonTheme } from './types';

export const TILE_SIZE = 32;

export const THEME_CONFIG = {
  [DungeonTheme.STONE]: {
    name: '돌 던전',
    floorColor: '#2d3748',
    wallColor: '#1a202c',
    accentColor: '#fbbf24',
    description: '어두운 회색 석조 타일과 돌벽으로 이루어진 고전적인 던전입니다.',
    lores: [
      "차가운 돌벽 사이로 누군가의 속삭임이 들려옵니다.",
      "오래된 돌 타일들이 발걸음에 맞춰 삐걱거립니다.",
      "이곳의 공기는 수백 년 동안 갇혀 있었던 것 같습니다.",
      "벽에 걸린 횃불이 기괴한 그림자를 만들어냅니다.",
      "어둠 속에서 무언가 번뜩이는 눈빛이 느껴집니다."
    ]
  },
  [DungeonTheme.FOREST]: {
    name: '숲 던전',
    floorColor: '#1a3a3a',
    wallColor: '#064e3b',
    accentColor: '#34d399',
    description: '이끼 낀 대지와 울창한 나무가 가로막는 신비로운 숲입니다.',
    lores: [
      "축축한 흙냄새와 이끼의 향기가 코끝을 찌릅니다.",
      "신비롭게 빛나는 버섯들이 길을 안내하는 것 같습니다.",
      "나뭇잎 사이로 보이지 않는 존재들의 시선이 느껴집니다.",
      "숲의 깊은 곳에서 정체 모를 짐승의 울음소리가 들립니다.",
      "안개가 자욱하여 한 치 앞도 내다보기 힘든 숲입니다."
    ]
  },
  [DungeonTheme.FROZEN]: {
    name: '얼음 폐허',
    floorColor: '#334155',
    wallColor: '#1e293b',
    accentColor: '#38bdf8',
    description: '미끄러운 얼음 바닥과 서리가 내린 돌기둥이 가득한 추운 폐허입니다.',
    lores: [
      "살을 에이는 듯한 추위가 온몸을 감쌉니다.",
      "발밑의 얼음이 깨질 듯 위태로운 소리를 냅니다.",
      "푸른 수정들이 희미한 빛을 내뿜으며 얼어붙어 있습니다.",
      "숨을 쉴 때마다 하얀 입김이 허공으로 흩어집니다.",
      "영원히 얼어붙은 시간 속에 갇힌 고요한 폐허입니다."
    ]
  },
  [DungeonTheme.DESERT]: {
    name: '사막 폐허',
    floorColor: '#78350f',
    wallColor: '#451a03',
    accentColor: '#fcd34d',
    description: '갈라진 대지와 풍화된 사암 벽이 있는 건조한 던전입니다.',
    lores: [
      "뜨거운 모래바람이 얼굴을 거칠게 스치고 지나갑니다.",
      "갈라진 땅 사이로 고대의 먼지가 피어오릅니다.",
      "모래 속에 반쯤 파묻힌 유적들이 과거의 영광을 말해줍니다.",
      "타는 듯한 목마름이 모험가의 의지를 시험합니다.",
      "태양빛조차 닿지 않는 메마른 미로입니다."
    ]
  },
  [DungeonTheme.LAVA]: {
    name: '용암 동굴',
    floorColor: '#450a0a',
    wallColor: '#000000',
    accentColor: '#ef4444',
    description: '용암이 흐르는 검은 화산암 지대의 위험한 동굴입니다.',
    lores: [
      "숨이 막힐 듯한 열기가 폐부 깊숙이 스며듭니다.",
      "발밑으로 흐르는 용암이 붉은빛으로 길을 밝힙니다.",
      "검은 흑요석 벽이 불길을 반사하며 번뜩입니다.",
      "간헐적으로 뿜어져 나오는 화산재가 시야를 가립니다.",
      "대지가 진동하며 금방이라도 무너질 듯한 공포를 줍니다."
    ]
  }
};
