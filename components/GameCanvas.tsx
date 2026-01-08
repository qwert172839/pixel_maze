
import React, { useEffect, useRef } from 'react';
import { DungeonTheme, Position, Entity } from '../types';
import { TILE_SIZE, THEME_CONFIG } from '../constants';

interface GameCanvasProps {
  theme: DungeonTheme;
  playerPos: Position;
  entities: Entity[];
}

const GameCanvas: React.FC<GameCanvasProps> = ({ theme, playerPos, entities }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const config = THEME_CONFIG[theme];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#33415533';
    ctx.lineWidth = 1;
    for (let i = 0; i <= canvas.width; i += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i <= canvas.height; i += TILE_SIZE) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    entities.forEach(ent => {
      const x = ent.pos.x * TILE_SIZE;
      const y = ent.pos.y * TILE_SIZE;

      switch (ent.type) {
        case 'wall':
          ctx.fillStyle = config.wallColor;
          ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.strokeStyle = '#ffffff11';
          ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          break;
        case 'slime':
        case 'elite-slime':
          const isElite = ent.type === 'elite-slime';
          const baseColor = theme === DungeonTheme.LAVA ? '#f87171' : theme === DungeonTheme.FROZEN ? '#7dd3fc' : '#4ade80';

          if (isElite) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fbbf24';
            ctx.fillStyle = '#fbbf24'; // Gold base for elite
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2 + 2, 14, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.shadowBlur = 0;
          ctx.fillStyle = isElite ? '#f59e0b' : baseColor;
          const radius = isElite ? 12 : 10;
          ctx.beginPath();
          ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2 + (isElite ? 3 : 5), radius, 0, Math.PI * 2);
          ctx.fill();

          // Eyes
          ctx.fillStyle = 'black';
          const eyeOffset = isElite ? 4 : 4;
          ctx.fillRect(x + TILE_SIZE / 2 - eyeOffset - 1, y + TILE_SIZE / 2 + (isElite ? 0 : 4), 2, 2);
          ctx.fillRect(x + TILE_SIZE / 2 + eyeOffset - 1, y + TILE_SIZE / 2 + (isElite ? 0 : 4), 2, 2);

          if (ent.health !== undefined && ent.maxHealth !== undefined) {
            const hpWidth = Math.max(0, (ent.health / ent.maxHealth) * 24);
            ctx.fillStyle = '#1e293b';
            ctx.fillRect(x + 4, y - 2, 24, 4);
            ctx.fillStyle = isElite ? '#fbbf24' : '#ef4444';
            ctx.fillRect(x + 4, y - 2, Math.min(24, hpWidth), 4);
          }
          break;
        case 'chest':
        case 'golden-chest':
          const isGolden = ent.type === 'golden-chest';
          ctx.fillStyle = ent.isOpened ? '#451a03' : (isGolden ? '#fbbf24' : '#b45309');
          if (isGolden && !ent.isOpened) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#fbbf24';
          }
          ctx.fillRect(x + 6, y + 10, TILE_SIZE - 12, TILE_SIZE - 16);
          ctx.shadowBlur = 0;
          if (!ent.isOpened) {
            ctx.fillStyle = isGolden ? '#ffffff' : '#fbbf24';
            ctx.fillRect(x + 14, y + 14, 4, 2);
          }
          break;
        case 'key':
          ctx.fillStyle = '#fde047';
          ctx.beginPath();
          ctx.arc(x + 16, y + 12, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillRect(x + 15, y + 17, 2, 8);
          ctx.fillRect(x + 17, y + 21, 3, 2);
          break;
        case 'exit':
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(x + 8, y + 8, TILE_SIZE - 16, TILE_SIZE - 16);
          break;
        case 'torch':
          const gradient = ctx.createRadialGradient(
            x + TILE_SIZE / 2, y + TILE_SIZE / 2, 0,
            x + TILE_SIZE / 2, y + TILE_SIZE / 2, 70
          );
          gradient.addColorStop(0, config.accentColor + '44');
          gradient.addColorStop(1, 'transparent');
          ctx.fillStyle = gradient;
          ctx.fillRect(x - 50, y - 50, 132, 132);
          ctx.fillStyle = '#78350f';
          ctx.fillRect(x + 14, y + 12, 4, 10);
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(x + 13, y + 6, 6, 6);
          break;
      }
    });

    const px = playerPos.x * TILE_SIZE;
    const py = playerPos.y * TILE_SIZE;
    ctx.fillStyle = '#fff';
    ctx.fillRect(px + 8, py + 6, TILE_SIZE - 16, TILE_SIZE - 10);
    ctx.fillStyle = '#fca5a5';
    ctx.fillRect(px + 10, py + 8, TILE_SIZE - 20, 10);
    ctx.fillStyle = '#000';
    ctx.fillRect(px + 12, py + 12, 2, 2);
    ctx.fillRect(px + 18, py + 12, 2, 2);
    ctx.fillStyle = '#475569';
    ctx.fillRect(px + 8, py + 4, TILE_SIZE - 16, 4);

  }, [theme, playerPos, entities, config]);

  return (
    <div className="relative border-4 border-slate-700 rounded-lg overflow-hidden">
      <canvas
        ref={canvasRef}
        width={TILE_SIZE * 15}
        height={TILE_SIZE * 15}
        className="block bg-slate-900 w-full h-auto"
        style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain' }}
      />
    </div>
  );
};

export default GameCanvas;
