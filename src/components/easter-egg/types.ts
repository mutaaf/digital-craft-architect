
// Game constants and types for the Snake game
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
export type Position = { x: number; y: number };
export type SnakeSegment = Position;

export const GRID_SIZE = 20;
export const CELL_SIZE = 20;
export const GAME_SPEED = 100;
export const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

export const COLORS = {
  background: '#222222',
  snake: '#33C3F0',
  snakeHead: '#0FA0CE',
  food: '#FF3E00',
  gridLine: '#333333',
  score: '#FFFFFF',
  gameOver: '#FF3E00',
};

export const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
