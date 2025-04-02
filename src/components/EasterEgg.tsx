import React, { useState, useEffect, useRef, useCallback } from 'react';

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type Position = { x: number; y: number };
type SnakeSegment = Position;

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const GAME_SPEED = 100;
const CANVAS_SIZE = GRID_SIZE * CELL_SIZE;

const COLORS = {
  background: '#222222',
  snake: '#33C3F0',
  snakeHead: '#0FA0CE',
  food: '#FF3E00',
  gridLine: '#333333',
  score: '#FFFFFF',
  gameOver: '#FF3E00',
};

const SnakeGame: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [snake, setSnake] = useState<SnakeSegment[]>([{ x: 5, y: 5 }]);
  const [food, setFood] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const directionRef = useRef(direction);
  const gameOverRef = useRef(gameOver);
  const gameStartedRef = useRef(gameStarted);

  const generateFood = useCallback((): Position => {
    const x = Math.floor(Math.random() * GRID_SIZE);
    const y = Math.floor(Math.random() * GRID_SIZE);
    return { x, y };
  }, []);

  const resetGame = useCallback(() => {
    setSnake([{ x: 5, y: 5 }]);
    setFood(generateFood());
    setDirection('RIGHT');
    directionRef.current = 'RIGHT';
    setGameOver(false);
    gameOverRef.current = false;
    setScore(0);
  }, [generateFood]);

  const startGame = () => {
    resetGame();
    setGameStarted(true);
    gameStartedRef.current = true;
  };

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw grid lines
    ctx.strokeStyle = COLORS.gridLine;
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= GRID_SIZE; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL_SIZE, 0);
      ctx.lineTo(i * CELL_SIZE, CANVAS_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i * CELL_SIZE);
      ctx.lineTo(CANVAS_SIZE, i * CELL_SIZE);
      ctx.stroke();
    }

    // Draw food
    ctx.fillStyle = COLORS.food;
    ctx.fillRect(
      food.x * CELL_SIZE, 
      food.y * CELL_SIZE, 
      CELL_SIZE, 
      CELL_SIZE
    );
    
    // Draw snake
    snake.forEach((segment, index) => {
      // Different color for the head
      ctx.fillStyle = index === 0 ? COLORS.snakeHead : COLORS.snake;
      ctx.fillRect(
        segment.x * CELL_SIZE,
        segment.y * CELL_SIZE,
        CELL_SIZE,
        CELL_SIZE
      );
    });

    // Draw score
    ctx.fillStyle = COLORS.score;
    ctx.font = '24px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Score: ${score}`, 10, 30);

    // Draw game over message
    if (gameOverRef.current) {
      ctx.fillStyle = COLORS.gameOver;
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 20);
      ctx.font = '20px Arial';
      ctx.fillText('Press SPACE to play again', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 20);
    } else if (!gameStartedRef.current) {
      ctx.fillStyle = COLORS.score;
      ctx.font = 'bold 30px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('SNAKE GAME', CANVAS_SIZE / 2, CANVAS_SIZE / 2 - 30);
      ctx.font = '20px Arial';
      ctx.fillText('Press SPACE to start', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 10);
      ctx.font = '16px Arial';
      ctx.fillText('Use arrow keys to move', CANVAS_SIZE / 2, CANVAS_SIZE / 2 + 40);
    }
  }, [snake, food, score]);

  const moveSnake = useCallback(() => {
    if (gameOverRef.current || !gameStartedRef.current) return;
    
    setSnake(prevSnake => {
      const head = { ...prevSnake[0] };
      
      switch (directionRef.current) {
        case 'UP':
          head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'DOWN':
          head.y = (head.y + 1) % GRID_SIZE;
          break;
        case 'LEFT':
          head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
          break;
        case 'RIGHT':
          head.x = (head.x + 1) % GRID_SIZE;
          break;
      }
      
      // Check if snake collides with itself
      if (prevSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        gameOverRef.current = true;
        return prevSnake;
      }
      
      const newSnake = [head, ...prevSnake];
      
      // Check if snake eats food
      if (head.x === food.x && head.y === food.y) {
        setFood(generateFood());
        setScore(prevScore => prevScore + 10);
      } else {
        newSnake.pop(); // Remove tail if no food eaten
      }
      
      return newSnake;
    });
  }, [generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        if (gameOverRef.current || !gameStartedRef.current) {
          startGame();
        }
        e.preventDefault();
        return;
      }
      
      if (e.code === 'Escape') {
        onClose();
        return;
      }
      
      // Skip if game is over or not started
      if (gameOverRef.current || !gameStartedRef.current) return;
      
      // Prevent direction reversal
      switch (e.key) {
        case 'ArrowUp':
          if (directionRef.current !== 'DOWN') {
            setDirection('UP');
            directionRef.current = 'UP';
          }
          break;
        case 'ArrowDown':
          if (directionRef.current !== 'UP') {
            setDirection('DOWN');
            directionRef.current = 'DOWN';
          }
          break;
        case 'ArrowLeft':
          if (directionRef.current !== 'RIGHT') {
            setDirection('LEFT');
            directionRef.current = 'LEFT';
          }
          break;
        case 'ArrowRight':
          if (directionRef.current !== 'LEFT') {
            setDirection('RIGHT');
            directionRef.current = 'RIGHT';
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, startGame]);
  
  useEffect(() => {
    const gameLoop = setInterval(() => {
      moveSnake();
      drawGame();
    }, GAME_SPEED);
    
    return () => clearInterval(gameLoop);
  }, [moveSnake, drawGame]);
  
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80">
      <div className="bg-white p-4 rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold">Snake Game</h2>
          <button 
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200"
          >
            <X size={24} />
          </button>
        </div>
        <canvas 
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="border border-gray-300"
        />
        <div className="mt-2 text-sm text-gray-600">
          <p>Use arrow keys to control the snake. Press SPACE to restart.</p>
          <p>Press ESC to close the game.</p>
        </div>
      </div>
    </div>
  );
};

const EasterEgg: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Add the key to the sequence
      const updatedCode = [...secretCode, e.key];
      
      // Keep only the last N keys where N is the length of the konami code
      if (updatedCode.length > konami.length) {
        updatedCode.shift();
      }
      
      setSecretCode(updatedCode);
      
      // Check if the secret code matches the konami code
      const isKonami = konami.every((key, index) => updatedCode[index] === key);
      
      if (isKonami) {
        setIsActive(true);
        setSecretCode([]);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [secretCode]);
  
  return isActive ? <SnakeGame onClose={() => setIsActive(false)} /> : null;
};

export default EasterEgg;
