
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import { Direction, Position, SnakeSegment, GRID_SIZE, CELL_SIZE, GAME_SPEED, CANVAS_SIZE, COLORS } from './types';
import { TouchControls } from './TouchControls';
import SwipeHandler from './SwipeHandler';

interface SnakeGameProps {
  onClose: () => void;
}

const SnakeGame: React.FC<SnakeGameProps> = ({ onClose }) => {
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
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const scoreRef = useRef(score);

  // Prevent default scroll behavior for arrow keys when the game is active
  useEffect(() => {
    const preventScroll = (e: Event) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes((e as KeyboardEvent).key) &&
          (gameStartedRef.current && !gameOverRef.current)) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventScroll, { capture: true });
    return () => {
      window.removeEventListener('keydown', preventScroll, { capture: true });
    };
  }, []);

  const generateFood = useCallback((): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Make sure food doesn't spawn on snake
    } while (snakeRef.current.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    
    return newFood;
  }, []);

  const resetGame = useCallback(() => {
    const initialSnake = [{ x: 5, y: 5 }];
    const initialFood = generateFood();
    
    setSnake(initialSnake);
    setFood(initialFood);
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    
    snakeRef.current = initialSnake;
    foodRef.current = initialFood;
    directionRef.current = 'RIGHT';
    gameOverRef.current = false;
    scoreRef.current = 0;
  }, [generateFood]);

  const startGame = () => {
    resetGame();
    setGameStarted(true);
    gameStartedRef.current = true;
  };

  // Handle direction change from touch controls
  const handleDirectionChange = (newDirection: Direction) => {
    if (
      (newDirection === 'UP' && directionRef.current !== 'DOWN') ||
      (newDirection === 'DOWN' && directionRef.current !== 'UP') ||
      (newDirection === 'LEFT' && directionRef.current !== 'RIGHT') ||
      (newDirection === 'RIGHT' && directionRef.current !== 'LEFT')
    ) {
      setDirection(newDirection);
      directionRef.current = newDirection;
    }
  };

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

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
      foodRef.current.x * CELL_SIZE, 
      foodRef.current.y * CELL_SIZE, 
      CELL_SIZE, 
      CELL_SIZE
    );
    
    // Draw snake
    snakeRef.current.forEach((segment, index) => {
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
    ctx.fillText(`Score: ${scoreRef.current}`, 10, 30);

    // Draw game over or start message
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
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOverRef.current || !gameStartedRef.current) return;
    
    const head = { ...snakeRef.current[0] };
    
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
    
    // Check for collision with self (except when just starting)
    if (snakeRef.current.length > 1 && 
        snakeRef.current.some(segment => segment.x === head.x && segment.y === head.y)) {
      setGameOver(true);
      gameOverRef.current = true;
      return;
    }
    
    const newSnake = [head, ...snakeRef.current];
    
    // Check if snake ate food
    if (head.x === foodRef.current.x && head.y === foodRef.current.y) {
      // Update score
      const newScore = scoreRef.current + 10;
      setScore(newScore);
      scoreRef.current = newScore;
      
      // Generate new food
      const newFood = generateFood();
      setFood(newFood);
      foodRef.current = newFood;
    } else {
      // Remove tail if no food was eaten
      newSnake.pop();
    }
    
    setSnake(newSnake);
    snakeRef.current = newSnake;
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
      
      if (gameOverRef.current || !gameStartedRef.current) return;
      
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
        
        {/* Add touch controls for mobile devices */}
        <TouchControls 
          onDirectionChange={handleDirectionChange}
          onStart={!gameStarted || gameOver ? startGame : undefined}
        />
        
        {/* Add swipe handler */}
        <SwipeHandler 
          onSwipe={handleDirectionChange}
          disabled={!gameStarted || gameOver}
        />
        
        <div className="mt-2 text-sm text-gray-600">
          <p>Use arrow keys, touch controls, or swipe gestures to play. Press SPACE to restart.</p>
          <p>Press ESC to close the game.</p>
        </div>
      </div>
    </div>
  );
};

export default SnakeGame;
