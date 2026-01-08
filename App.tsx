
import React, { useState, useEffect, useCallback } from 'react';
import { DungeonTheme, Position, Entity } from './types';
import { THEME_CONFIG, TILE_SIZE } from './constants';
import GameCanvas from './components/GameCanvas';

const INITIAL_POS: Position = { x: 1, y: 1 };
const GRID_SIZE = 15;

interface PowerUp {
  id: string;
  name: string;
  icon: string;
  description: string;
  rarity?: 'normal' | 'legendary';
}

interface PermanentUpgrades {
  baseDamage: number;
  baseMaxHealth: number;
  baseSlowdown: number;
}

const App: React.FC = () => {
  const [totalCoins, setTotalCoins] = useState<number>(() => {
    return Number(localStorage.getItem('pixel_dungeon_coins')) || 0;
  });
  const [permUpgrades, setPermUpgrades] = useState<PermanentUpgrades>(() => {
    const saved = localStorage.getItem('pixel_dungeon_upgrades');
    return saved ? JSON.parse(saved) : { baseDamage: 0, baseMaxHealth: 0, baseSlowdown: 0 };
  });

  const [theme, setTheme] = useState<DungeonTheme>(DungeonTheme.STONE);
  const [playerPos, setPlayerPos] = useState<Position>(INITIAL_POS);
  const [maxHealth, setMaxHealth] = useState<number>(100 + permUpgrades.baseMaxHealth);
  const [playerHealth, setPlayerHealth] = useState<number>(100 + permUpgrades.baseMaxHealth);
  const [playerDamage, setPlayerDamage] = useState<number>(8 + permUpgrades.baseDamage);
  const [monsterSlowdown, setMonsterSlowdown] = useState<number>(permUpgrades.baseSlowdown);
  const [floor, setFloor] = useState<number>(1);
  const [hasKey, setHasKey] = useState<boolean>(false);
  const [entities, setEntities] = useState<Entity[]>([]);
  const [lore, setLore] = useState<string>("로딩 중...");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isAttacking, setIsAttacking] = useState<boolean>(false);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [showShop, setShowShop] = useState<boolean>(false);
  const [showExitConfirm, setShowExitConfirm] = useState<boolean>(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState<boolean>(false);

  useEffect(() => {
    localStorage.setItem('pixel_dungeon_coins', totalCoins.toString());
    localStorage.setItem('pixel_dungeon_upgrades', JSON.stringify(permUpgrades));
  }, [totalCoins, permUpgrades]);

  const getMonsterStats = (f: number, isElite: boolean) => {
    const baseHp = 10 + (f - 1) * 8;
    const baseDmg = 5 + (f - 1) * 2;
    return {
      hp: isElite ? baseHp * 3 : baseHp,
      dmg: isElite ? baseDmg * 2 : baseDmg
    };
  };

  const generateLevel = useCallback((newTheme: DungeonTheme, currentFloor: number) => {
    const newEntities: Entity[] = [];
    setHasKey(false);
    const maze = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('floor'));
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (i === 0 || i === GRID_SIZE - 1 || j === 0 || j === GRID_SIZE - 1) maze[i][j] = 'wall';
      }
    }
    for (let i = 2; i < GRID_SIZE - 2; i += 2) {
      for (let j = 2; j < GRID_SIZE - 2; j += 2) {
        maze[i][j] = 'wall';
        const neighbors = [[0, 1], [0, -1], [1, 0], [-1, 0]];
        const [dx, dy] = neighbors[Math.floor(Math.random() * neighbors.length)];
        maze[i + dx][j + dy] = 'wall';
      }
    }
    maze[INITIAL_POS.x][INITIAL_POS.y] = 'floor';

    const getEmptyFloorTiles = () => {
      const tiles: Position[] = [];
      for (let x = 1; x < GRID_SIZE - 1; x++) {
        for (let y = 1; y < GRID_SIZE - 1; y++) {
          if (maze[x][y] === 'floor' && !(x === INITIAL_POS.x && y === INITIAL_POS.y)) tiles.push({ x, y });
        }
      }
      return tiles;
    };

    let floorTiles = getEmptyFloorTiles();
    const isGoldenChest = Math.random() < 0.15;
    const chestIdx = Math.floor(Math.random() * floorTiles.length);
    const chestPos = floorTiles.splice(chestIdx, 1)[0];
    newEntities.push({ id: 'chest-1', type: isGoldenChest ? 'golden-chest' : 'chest', pos: chestPos, isOpened: false });

    const exitIdx = Math.floor(Math.random() * floorTiles.length);
    const exitPos = floorTiles.splice(exitIdx, 1)[0];
    newEntities.push({ id: 'exit-1', type: 'exit', pos: exitPos });

    const keyIdx = Math.floor(Math.random() * floorTiles.length);
    const keyPos = floorTiles.splice(keyIdx, 1)[0];
    newEntities.push({ id: 'key-1', type: 'key', pos: keyPos });

    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (maze[i][j] === 'wall') newEntities.push({ id: `wall-${i}-${j}`, type: 'wall', pos: { x: i, y: j } });
      }
    }

    const monsterCount = Math.min(12, 5 + Math.floor(currentFloor / 2));
    let monstersPlaced = 0;
    while (monstersPlaced < monsterCount && floorTiles.length > 0) {
      const isElite = Math.random() < 0.2;
      const sIdx = Math.floor(Math.random() * floorTiles.length);
      const sPos = floorTiles.splice(sIdx, 1)[0];
      const stats = getMonsterStats(currentFloor, isElite);
      newEntities.push({
        id: `m-${sPos.x}-${sPos.y}`,
        type: isElite ? 'elite-slime' : 'slime',
        pos: sPos,
        health: stats.hp,
        maxHealth: stats.hp
      });
      monstersPlaced++;
    }

    const torchPositions = [{ x: 7, y: 7 }, { x: 3, y: 3 }, { x: 11, y: 3 }, { x: 3, y: 11 }, { x: 11, y: 11 }];
    torchPositions.forEach((p, idx) => newEntities.push({ id: `torch-${idx}`, type: 'torch', pos: p }));

    setEntities(newEntities);
    setPlayerPos(INITIAL_POS);
    setShowExitConfirm(false);

    // AI API 대신 로컬 상수를 사용하여 나레이션 설정
    const themeLores = THEME_CONFIG[newTheme].lores;
    const randomLore = themeLores[Math.floor(Math.random() * themeLores.length)];
    setLore(randomLore);
  }, []);

  const getRandomPowerUp = (isLegendary: boolean): PowerUp => {
    if (isLegendary) {
      const legendaryPool = [
        { id: 'l_dmg', name: '드래곤 슬레이어', icon: '🔥', description: '데미지 +12', rarity: 'legendary' as const },
        { id: 'l_hp', name: '불멸자의 성갑', icon: '✨', description: '최대 체력 +60', rarity: 'legendary' as const },
        { id: 'l_spd', name: '헤르메스의 날개', icon: '🕊️', description: '적 둔화 +30%', rarity: 'legendary' as const },
      ];
      return legendaryPool[Math.floor(Math.random() * legendaryPool.length)];
    }
    const pool = [
      { id: 'dmg', name: '날카로운 검', icon: '⚔️', description: '데미지 +4' },
      { id: 'hp', name: '강화 갑옷', icon: '🛡️', description: '최대 체력 +25' },
      { id: 'spd', name: '가벼운 장화', icon: '👟', description: '적 둔화 +12%' },
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const applyPowerUp = (item: PowerUp) => {
    setPowerUps(prev => [...prev, { ...item, id: `${item.id}-${Date.now()}` }]);
    if (item.id === 'dmg') setPlayerDamage(d => d + 4);
    if (item.id === 'l_dmg') setPlayerDamage(d => d + 12);
    if (item.id === 'hp') {
      setMaxHealth(h => h + 25);
      setPlayerHealth(h => Math.min(h + 50, maxHealth + 25));
    }
    if (item.id === 'l_hp') {
      setMaxHealth(h => h + 60);
      setPlayerHealth(h => Math.min(h + 100, maxHealth + 60));
    }
    if (item.id === 'spd') setMonsterSlowdown(s => s + 120);
    if (item.id === 'l_spd') setMonsterSlowdown(s => s + 300);
  };

  const moveMonsters = useCallback(() => {
    setEntities(prev => {
      return prev.map(ent => {
        if (ent.type !== 'slime' && ent.type !== 'elite-slime') return ent;
        const moveChance = ent.type === 'elite-slime' ? 0.6 : 0.4;
        if (Math.random() < moveChance) return ent;
        const directions = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const nextPos = { x: ent.pos.x + dir.dx, y: ent.pos.y + dir.dy };
        if (nextPos.x < 0 || nextPos.x >= GRID_SIZE || nextPos.y < 0 || nextPos.y >= GRID_SIZE) return ent;
        if (nextPos.x === playerPos.x && nextPos.y === playerPos.y) {
          const stats = getMonsterStats(floor, ent.type === 'elite-slime');
          setPlayerHealth(h => Math.max(0, h - stats.dmg));
          return ent;
        }
        const collision = prev.find(e => e.id !== ent.id && e.pos.x === nextPos.x && e.pos.y === nextPos.y);
        if (collision) return ent;
        return { ...ent, pos: nextPos };
      });
    });
  }, [playerPos, floor]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      generateLevel(theme, floor);
      setIsLoading(false);
    }, 300); // 아주 짧은 로딩 효과
    return () => clearTimeout(timer);
  }, [theme, floor, generateLevel]);

  useEffect(() => {
    if (playerHealth <= 0) {
      const earnedCoins = Math.floor(score / 10);
      if (earnedCoins > 0) setTotalCoins(c => c + earnedCoins);
      return;
    }
    const speed = Math.max(500, 1200 - (floor * 80) + monsterSlowdown);
    const interval = setInterval(() => moveMonsters(), speed);
    return () => clearInterval(interval);
  }, [moveMonsters, playerHealth, floor, monsterSlowdown, score]);

  const handleAttack = (target: Entity) => {
    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 100);
    const updatedHealth = (target.health || 0) - playerDamage;
    if (updatedHealth <= 0) {
      const isElite = target.type === 'elite-slime';
      setEntities(prev => prev.filter(e => e.id !== target.id));

      const scoreGain = isElite ? (50 + floor * 10) * 5 : (50 + floor * 10);
      setScore(s => s + scoreGain);

      if (isElite) {
        const coinGain = 20 + Math.floor(Math.random() * 30);
        setTotalCoins(c => c + coinGain);
        setLore(`강력한 적을 처치했습니다! (+${scoreGain}점, +${coinGain}코인)`);
      } else {
        setLore(`적을 물리쳤습니다! (+${scoreGain}점)`);
      }
    } else {
      setEntities(prev => prev.map(e => e.id === target.id ? { ...e, health: updatedHealth } : e));
    }
  };

  const nextFloor = () => {
    setFloor(f => f + 1);
    setPlayerHealth(h => Math.min(maxHealth, h + 15));
    setShowExitConfirm(false);
  };

  const handleMove = (dx: number, dy: number) => {
    if (playerHealth <= 0 || isLoading || showShop || showExitConfirm) return;
    if (dx === 0 && dy === 0) return;
    const newX = playerPos.x + dx;
    const newY = playerPos.y + dy;
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
    const colliders = entities.filter(ent => ent.pos.x === newX && ent.pos.y === newY);
    const wall = colliders.find(e => e.type === 'wall');
    if (wall) return;

    const target = colliders.find(e => e.type === 'slime' || e.type === 'elite-slime');
    if (target) {
      handleAttack(target);
      const stats = getMonsterStats(floor, target.type === 'elite-slime');
      setPlayerHealth(prev => Math.max(0, prev - Math.floor(stats.dmg / 3)));
      return;
    }

    colliders.forEach(collision => {
      if (collision.type === 'key') {
        setHasKey(true);
        setEntities(prev => prev.filter(e => e.id !== collision.id));
        setLore("열쇠를 획득했습니다!");
      } else if (collision.type === 'chest' || collision.type === 'golden-chest') {
        if (!collision.isOpened && hasKey) {
          const isLegendary = collision.type === 'golden-chest';
          const newItem = getRandomPowerUp(isLegendary);
          applyPowerUp(newItem);
          setLore(isLegendary ? `★전설★ [${newItem.name}] 획득!` : `[${newItem.name}] 획득!`);
          setScore(s => s + 500 + (floor * 50));
          setEntities(prev => prev.map(e => e.id === collision.id ? { ...e, isOpened: true } : e));
        }
      } else if (collision.type === 'exit') {
        setShowExitConfirm(true);
      }
    });
    setPlayerPos({ x: newX, y: newY });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (playerHealth <= 0 || isLoading || showShop || showExitConfirm) return;
      let dx = 0, dy = 0;
      const key = e.key.toLowerCase();
      if (key === 'arrowup' || key === 'w') dy = -1;
      if (key === 'arrowdown' || key === 's') dy = 1;
      if (key === 'arrowleft' || key === 'a') dx = -1;
      if (key === 'arrowright' || key === 'd') dx = 1;
      handleMove(dx, dy);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [playerPos, entities, playerHealth, hasKey, floor, isLoading, playerDamage, maxHealth, showShop, showExitConfirm]);

  const restartGame = () => {
    setMaxHealth(100 + permUpgrades.baseMaxHealth);
    setPlayerHealth(100 + permUpgrades.baseMaxHealth);
    setPlayerDamage(8 + permUpgrades.baseDamage);
    setMonsterSlowdown(permUpgrades.baseSlowdown);
    setPowerUps([]);
    setScore(0);
    setFloor(1);
    setHasKey(false);
    setPlayerPos(INITIAL_POS);
    generateLevel(theme, 1);
  };

  const buyUpgrade = (type: keyof PermanentUpgrades, cost: number, value: number) => {
    if (totalCoins >= cost) {
      setTotalCoins(c => c - cost);
      setPermUpgrades(prev => ({ ...prev, [type]: prev[type] + value }));
      if (floor === 1 && score === 0) {
        if (type === 'baseMaxHealth') { setMaxHealth(h => h + value); setPlayerHealth(h => h + value); }
        if (type === 'baseDamage') setPlayerDamage(d => d + value);
        if (type === 'baseSlowdown') setMonsterSlowdown(s => s + value);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-slate-200">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setShowMobileSidebar(!showMobileSidebar)}
        className="md:hidden fixed top-4 left-4 z-50 w-12 h-12 bg-slate-800 border-2 border-slate-600 rounded-lg flex items-center justify-center text-slate-300 shadow-lg"
      >
        {showMobileSidebar ? '✕' : '☰'}
      </button>

      {/* Sidebar */}
      <div className={`w-full md:w-80 p-6 flex flex-col gap-6 bg-slate-900 border-r border-slate-800 z-40 overflow-y-auto transition-transform md:translate-x-0 ${showMobileSidebar ? 'fixed inset-0 translate-x-0' : 'fixed -translate-x-full md:relative'}`}>
        <header>
          <div className="flex justify-between items-end mb-1">
            <h1 className="text-3xl font-bold text-amber-500 leading-none tracking-tighter">픽셀 미로</h1>
            <span className="text-xl font-bold text-slate-500">B{floor}</span>
          </div>
          <p className="text-xs text-slate-400 tracking-widest uppercase">Monster Hunter</p>
        </header>

        <div className="space-y-4">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-inner">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">모험가 정보</label>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold text-red-400">HP</span>
              <div className="flex-1 h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div className={`h-full transition-all duration-300 ${playerHealth > (maxHealth * 0.3) ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${(playerHealth / maxHealth) * 100}%` }} />
              </div>
            </div>
            <div className="flex justify-between items-center text-[10px] font-mono mt-2">
              <span className="text-slate-400">{Math.ceil(playerHealth)} / {maxHealth}</span>
              <span className="text-amber-400 font-bold">SCORE: {score}</span>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-inner">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">아티팩트</label>
            <div className="flex flex-wrap gap-2 min-h-[48px]">
              {powerUps.map((pu) => (
                <div key={pu.id} title={pu.description} className={`w-8 h-8 bg-slate-900 border rounded flex items-center justify-center text-lg ${pu.rarity === 'legendary' ? 'border-amber-400 shadow-[0_0_8px_#fbbf24]' : 'border-slate-600'}`}>
                  {pu.icon}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 shadow-inner">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <span className="text-amber-400 font-bold">{totalCoins}</span>
              </div>
              <button onClick={() => setShowShop(true)} className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-[10px] font-bold rounded uppercase">영구 강화 상점</button>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">던전 테마</label>
          <div className="grid grid-cols-1 gap-1">
            {Object.values(DungeonTheme).map((t) => (
              <button key={t} onClick={() => { setTheme(t); restartGame(); setShowMobileSidebar(false); }} className={`px-3 py-2 rounded text-left border text-sm ${theme === t ? 'bg-amber-600 border-amber-400 text-white' : 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-300'}`}>
                <div className="font-bold">{THEME_CONFIG[t].name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        <div className="absolute inset-0 opacity-20" style={{ backgroundColor: THEME_CONFIG[theme].floorColor }} />

        <div className={`relative z-10 w-full max-w-2xl flex flex-col items-center transition-transform ${isAttacking ? 'scale-95' : 'scale-100'}`}>
          <div className="relative shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-lg overflow-hidden border-2 border-slate-800 bg-slate-900">
            <GameCanvas theme={theme} playerPos={playerPos} entities={entities} />

            {playerHealth <= 0 && (
              <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center backdrop-blur-md text-center p-6 z-[60]">
                <h2 className="text-5xl font-bold text-red-600 mb-2">모험 종료</h2>
                <div className="text-slate-400 mb-4 font-bold text-xl">최종 점수: {score}</div>
                <div className="bg-amber-900/30 p-4 rounded-lg border border-amber-500/50 mb-8 animate-bounce">
                  <span className="text-amber-400 font-bold">💰 {Math.floor(score / 10)} 코인 획득!</span>
                </div>
                <button onClick={restartGame} className="px-12 py-4 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg shadow-xl">
                  다시 시작
                </button>
              </div>
            )}

            {showExitConfirm && (
              <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-md z-[55] p-6 text-center">
                <div className="text-4xl mb-4">🪜</div>
                <h2 className="text-2xl font-bold text-amber-500 mb-2">지하 계단 발견</h2>
                <p className="text-slate-300 mb-8">지하 B{floor + 1}층으로 내려가시겠습니까?<br /><span className="text-xs text-green-400">(체력이 15 회복됩니다)</span></p>
                <div className="flex gap-4 w-full max-w-xs">
                  <button onClick={nextFloor} className="flex-1 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg border border-amber-400 transition-all">내려가기</button>
                  <button onClick={() => setShowExitConfirm(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg border border-slate-700 transition-all">더 둘러보기</button>
                </div>
              </div>
            )}

            {showShop && (
              <div className="absolute inset-0 bg-slate-900/95 flex flex-col p-6 backdrop-blur-md z-[70]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-amber-500">축복받은 성소</h2>
                  <div className="flex items-center gap-2 bg-slate-800 px-4 py-1 rounded-full border border-amber-500/30">
                    <span className="text-xl">💰</span>
                    <span className="text-amber-400 font-bold">{totalCoins}</span>
                  </div>
                </div>
                <div className="grid gap-4 flex-1">
                  {[
                    { id: 'baseDamage', name: '영구 근력 강화', icon: '⚔️', val: 2, cost: 200, current: permUpgrades.baseDamage },
                    { id: 'baseMaxHealth', name: '영구 체력 훈련', icon: '🛡️', val: 10, cost: 200, current: permUpgrades.baseMaxHealth },
                    { id: 'baseSlowdown', name: '영구 신속의 가루', icon: '👟', val: 50, cost: 300, current: permUpgrades.baseSlowdown },
                  ].map(u => (
                    <div key={u.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-center group hover:border-amber-500/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">{u.icon}</span>
                        <div>
                          <div className="font-bold text-slate-100">{u.name}</div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest">현재 보너스: +{u.current}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => buyUpgrade(u.id as any, u.cost, u.val)}
                        disabled={totalCoins < u.cost}
                        className={`px-4 py-2 rounded-lg font-bold transition-all ${totalCoins >= u.cost ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-700 opacity-50 cursor-not-allowed'}`}
                      >
                        💰 {u.cost}
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowShop(false)} className="mt-6 w-full py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700">상점 나가기</button>
              </div>
            )}

            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-sm z-40">
                <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-amber-500 font-bold text-xl animate-pulse">{floor}층 생성 중...</div>
              </div>
            )}
          </div>

          <div className="mt-6 w-full p-6 bg-black/90 border-2 border-slate-800 rounded-xl shadow-2xl min-h-[120px] flex items-center justify-center">
            <p className="text-base md:text-lg leading-relaxed text-slate-100 text-center font-medium w-full italic">
              "{lore}"
            </p>
          </div>

          {/* Mobile Touch Controls */}
          <div className="mt-6 w-full flex flex-col items-center gap-2 md:hidden">
            <button
              onClick={() => handleMove(0, -1)}
              className="w-16 h-16 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 border-2 border-slate-600 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-300 transition-all shadow-lg"
            >
              ▲
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => handleMove(-1, 0)}
                className="w-16 h-16 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 border-2 border-slate-600 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-300 transition-all shadow-lg"
              >
                ◀
              </button>
              <button
                onClick={() => handleMove(0, 1)}
                className="w-16 h-16 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 border-2 border-slate-600 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-300 transition-all shadow-lg"
              >
                ▼
              </button>
              <button
                onClick={() => handleMove(1, 0)}
                className="w-16 h-16 bg-slate-800 hover:bg-slate-700 active:bg-amber-600 border-2 border-slate-600 rounded-lg flex items-center justify-center text-2xl font-bold text-slate-300 transition-all shadow-lg"
              >
                ▶
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
