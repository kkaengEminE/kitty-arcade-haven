import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

type Position = { x: number; y: number };
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT" | null;

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_GHOST_COUNT = 4;

const PacmanHamster = () => {
  const navigate = useNavigate();
  const [hamster, setHamster] = useState<Position>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Direction>(null);
  const [seeds, setSeeds] = useState<Position[]>([]);
  const [ghosts, setGhosts] = useState<Position[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  const initializeGame = useCallback(() => {
    const newSeeds: Position[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      for (let y = 0; y < GRID_SIZE; y++) {
        if (Math.random() > 0.7 && !(x === 10 && y === 10)) {
          newSeeds.push({ x, y });
        }
      }
    }
    setSeeds(newSeeds);

    const newGhosts: Position[] = [];
    const corners = [
      { x: 1, y: 1 },
      { x: GRID_SIZE - 2, y: 1 },
      { x: 1, y: GRID_SIZE - 2 },
      { x: GRID_SIZE - 2, y: GRID_SIZE - 2 }
    ];
    for (let i = 0; i < INITIAL_GHOST_COUNT; i++) {
      newGhosts.push(corners[i]);
    }
    setGhosts(newGhosts);

    setHamster({ x: 10, y: 10 });
    setDirection(null);
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;
      
      switch (e.key) {
        case "ArrowUp":
        case "w":
          setDirection("UP");
          break;
        case "ArrowDown":
        case "s":
          setDirection("DOWN");
          break;
        case "ArrowLeft":
        case "a":
          setDirection("LEFT");
          break;
        case "ArrowRight":
        case "d":
          setDirection("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver]);

  useEffect(() => {
    if (!gameStarted || gameOver || !direction) return;

    const gameLoop = setInterval(() => {
      setHamster((prev) => {
        let newX = prev.x;
        let newY = prev.y;

        switch (direction) {
          case "UP":
            newY = Math.max(0, prev.y - 1);
            break;
          case "DOWN":
            newY = Math.min(GRID_SIZE - 1, prev.y + 1);
            break;
          case "LEFT":
            newX = Math.max(0, prev.x - 1);
            break;
          case "RIGHT":
            newX = Math.min(GRID_SIZE - 1, prev.x + 1);
            break;
        }

        return { x: newX, y: newY };
      });

      setGhosts((prevGhosts) => {
        return prevGhosts.map((ghost) => {
          const dx = hamster.x - ghost.x;
          const dy = hamster.y - ghost.y;
          
          let newX = ghost.x;
          let newY = ghost.y;

          if (Math.abs(dx) > Math.abs(dy)) {
            newX = ghost.x + Math.sign(dx);
          } else {
            newY = ghost.y + Math.sign(dy);
          }

          newX = Math.max(0, Math.min(GRID_SIZE - 1, newX));
          newY = Math.max(0, Math.min(GRID_SIZE - 1, newY));

          return { x: newX, y: newY };
        });
      });
    }, 150);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, direction, hamster.x, hamster.y]);

  useEffect(() => {
    if (!gameStarted) return;

    setSeeds((prevSeeds) => {
      const remaining = prevSeeds.filter(
        (seed) => seed.x !== hamster.x || seed.y !== hamster.y
      );
      
      if (remaining.length < prevSeeds.length) {
        setScore((s) => s + 10);
      }

      if (remaining.length === 0) {
        setGameOver(true);
      }

      return remaining;
    });

    const collision = ghosts.some(
      (ghost) => ghost.x === hamster.x && ghost.y === hamster.y
    );
    if (collision) {
      setGameOver(true);
    }
  }, [hamster, ghosts, gameStarted]);

  const handleRestart = () => {
    initializeGame();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 p-4 flex flex-col items-center justify-center">
      <Button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 bg-primary/80 hover:bg-primary"
      >
        🏠 메인으로
      </Button>

      <Card className="p-8 bg-card/90 backdrop-blur-sm">
        <h1 className="text-4xl font-bold text-center mb-6 text-primary">
          🐹 팩맨 햄스터
        </h1>
        
        <div className="mb-4 text-center">
          <p className="text-2xl font-bold text-foreground">점수: {score}</p>
        </div>

        {!gameStarted && !gameOver && (
          <div className="text-center mb-4">
            <Button onClick={initializeGame} className="text-lg px-8 py-6">
              게임 시작하기 🎮
            </Button>
            <p className="mt-4 text-muted-foreground">
              화살표 키 또는 WASD로 이동하세요!
            </p>
          </div>
        )}

        {gameStarted && (
          <div
            className="relative bg-game-dark border-4 border-game-border mx-auto"
            style={{
              width: GRID_SIZE * CELL_SIZE,
              height: GRID_SIZE * CELL_SIZE,
            }}
          >
            {seeds.map((seed, idx) => (
              <div
                key={`seed-${idx}`}
                className="absolute flex items-center justify-center"
                style={{
                  left: seed.x * CELL_SIZE,
                  top: seed.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              >
                <span className="text-sm">🌻</span>
              </div>
            ))}

            {ghosts.map((ghost, idx) => (
              <div
                key={`ghost-${idx}`}
                className="absolute flex items-center justify-center animate-pulse"
                style={{
                  left: ghost.x * CELL_SIZE,
                  top: ghost.y * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                }}
              >
                <span className="text-lg">
                  {["😾", "😿", "🙀", "😼"][idx % 4]}
                </span>
              </div>
            ))}

            <div
              className="absolute flex items-center justify-center transition-all duration-150"
              style={{
                left: hamster.x * CELL_SIZE,
                top: hamster.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            >
              <span className="text-lg">🐹</span>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="text-center mt-6 space-y-4">
            <h2 className="text-3xl font-bold text-primary">
              {seeds.length === 0 ? "🎉 승리!" : "💥 게임 오버!"}
            </h2>
            <p className="text-xl text-foreground">최종 점수: {score}</p>
            <Button onClick={handleRestart} className="text-lg px-8 py-6">
              다시 시작하기 🔄
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default PacmanHamster;
