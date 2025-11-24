import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface Position {
  x: number;
  y: number;
}

const GRID_SIZE = 20;
const CELL_SIZE = 25;

const SnakeCat = () => {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Position>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y)
    );
    return newFood;
  }, []);

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection({ x: 1, y: 0 });
    setGameOver(false);
    setGameStarted(false);
    setScore(0);
  };

  const checkCollision = useCallback(
    (head: Position, body: Position[]) => {
      // Wall collision
      if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        return true;
      }

      // Self collision
      for (let i = 1; i < body.length; i++) {
        if (head.x === body[i].x && head.y === body[i].y) {
          return true;
        }
      }

      return false;
    },
    []
  );

  const moveSnake = useCallback(() => {
    if (gameOver || !gameStarted) return;

    setSnake((prevSnake) => {
      const newHead = {
        x: prevSnake[0].x + direction.x,
        y: prevSnake[0].y + direction.y,
      };

      if (checkCollision(newHead, prevSnake)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 1);
        setFood(generateFood(newSnake));
        
        // Check if won (filled the board)
        if (newSnake.length >= GRID_SIZE * GRID_SIZE) {
          setGameOver(true);
        }
        
        return newSnake;
      }

      newSnake.pop();
      return newSnake;
    });
  }, [direction, food, gameOver, gameStarted, checkCollision, generateFood]);

  useEffect(() => {
    const gameLoop = setInterval(moveSnake, 150);
    return () => clearInterval(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && !gameOver) {
        setGameStarted(true);
      }

      switch (e.key) {
        case "ArrowUp":
        case "w":
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case "ArrowDown":
        case "s":
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
        case "a":
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case "ArrowRight":
        case "d":
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [direction, gameStarted, gameOver]);

  const handleDirectionClick = (newDirection: Position) => {
    if (!gameStarted && !gameOver) {
      setGameStarted(true);
    }

    if (
      (newDirection.x !== 0 && direction.x === 0) ||
      (newDirection.y !== 0 && direction.y === 0)
    ) {
      setDirection(newDirection);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/">
            <Button variant="outline" className="font-bold">
              🏠 홈으로
            </Button>
          </Link>
          <div className="text-2xl font-bold text-primary">
            고양이: {score}마리 😺
          </div>
        </div>

        <Card className="p-4 md:p-8 bg-card/90 backdrop-blur-sm border-4 border-primary">
          <div className="mb-4 text-center">
            <p className="text-lg text-muted-foreground">
              방향키 또는 WASD로 이동하세요
            </p>
          </div>

          <div className="relative inline-block bg-green-100 border-4 border-green-600 rounded-lg overflow-hidden">
            <div
              style={{
                width: `${GRID_SIZE * CELL_SIZE}px`,
                height: `${GRID_SIZE * CELL_SIZE}px`,
                position: "relative",
              }}
            >
              {/* Grid */}
              {Array.from({ length: GRID_SIZE }).map((_, y) =>
                Array.from({ length: GRID_SIZE }).map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    style={{
                      position: "absolute",
                      left: `${x * CELL_SIZE}px`,
                      top: `${y * CELL_SIZE}px`,
                      width: `${CELL_SIZE}px`,
                      height: `${CELL_SIZE}px`,
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  />
                ))
              )}

              {/* Snake */}
              {snake.map((segment, index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    left: `${segment.x * CELL_SIZE}px`,
                    top: `${segment.y * CELL_SIZE}px`,
                    width: `${CELL_SIZE}px`,
                    height: `${CELL_SIZE}px`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                  }}
                >
                  {index === 0 ? "😺" : "🐱"}
                </div>
              ))}

              {/* Food */}
              <div
                style={{
                  position: "absolute",
                  left: `${food.x * CELL_SIZE}px`,
                  top: `${food.y * CELL_SIZE}px`,
                  width: `${CELL_SIZE}px`,
                  height: `${CELL_SIZE}px`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                }}
              >
                🍖
              </div>

              {/* Game Over Overlay */}
              {gameOver && (
                <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                  <div className="text-center bg-card p-8 rounded-2xl border-4 border-primary animate-bounce-in">
                    <h2 className="text-4xl font-bold mb-4 text-foreground">
                      {score >= GRID_SIZE * GRID_SIZE
                        ? "완벽한 승리! 🎉"
                        : "게임 종료! 😿"}
                    </h2>
                    <p className="text-2xl mb-6 text-muted-foreground">
                      총 {score}마리의 고양이!
                    </p>
                    <Button
                      onClick={resetGame}
                      className="bg-primary text-primary-foreground font-bold text-xl px-8 py-6"
                    >
                      다시 시작하기 🎮
                    </Button>
                  </div>
                </div>
              )}

              {/* Start Prompt */}
              {!gameStarted && !gameOver && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <div className="text-center bg-card p-8 rounded-2xl border-4 border-primary animate-bounce-in">
                    <h2 className="text-2xl font-bold mb-4 text-foreground">
                      방향키를 눌러 시작하세요!
                    </h2>
                    <p className="text-lg text-muted-foreground">
                      사료를 먹고 길어지세요 😺
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Controls */}
          <div className="mt-6 flex justify-center md:hidden">
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <Button
                onClick={() => handleDirectionClick({ x: 0, y: -1 })}
                className="bg-primary text-4xl py-8"
              >
                ⬆️
              </Button>
              <div></div>
              <Button
                onClick={() => handleDirectionClick({ x: -1, y: 0 })}
                className="bg-primary text-4xl py-8"
              >
                ⬅️
              </Button>
              <div></div>
              <Button
                onClick={() => handleDirectionClick({ x: 1, y: 0 })}
                className="bg-primary text-4xl py-8"
              >
                ➡️
              </Button>
              <div></div>
              <Button
                onClick={() => handleDirectionClick({ x: 0, y: 1 })}
                className="bg-primary text-4xl py-8"
              >
                ⬇️
              </Button>
              <div></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SnakeCat;
