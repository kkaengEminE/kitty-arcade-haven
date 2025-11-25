import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { saveScore, getScores } from "@/lib/leaderboard";

const FlappyCat = () => {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [catY, setCatY] = useState(250);
  const [velocity, setVelocity] = useState(0);
  const [distance, setDistance] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; gapY: number }[]>([]);
  const leaderboard = getScores("flappy_cat");

  const GRAVITY = 0.6;
  const JUMP_STRENGTH = -10;
  const PIPE_WIDTH = 60;
  const PIPE_GAP = 180;
  const CAT_SIZE = 40;

  const jump = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
    }
    if (!gameOver) {
      setVelocity(JUMP_STRENGTH);
    }
  }, [gameStarted, gameOver]);

  const resetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setCatY(250);
    setVelocity(0);
    setDistance(0);
    setPipes([]);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [jump]);

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = setInterval(() => {
      // Update cat position
      setCatY((y) => {
        const newY = y + velocity;
        if (newY < 0 || newY > 550) {
          setGameOver(true);
          saveScore("flappy_cat", Math.floor(distance));
          return y;
        }
        return newY;
      });

      setVelocity((v) => v + GRAVITY);

      // Update pipes
      setPipes((currentPipes) => {
        let newPipes = currentPipes
          .map((pipe) => ({ ...pipe, x: pipe.x - 3 }))
          .filter((pipe) => pipe.x > -PIPE_WIDTH);

        if (newPipes.length === 0 || newPipes[newPipes.length - 1].x < 400) {
          newPipes.push({
            x: 600,
            gapY: Math.random() * 250 + 100,
          });
        }

        // Collision detection
        newPipes.forEach((pipe) => {
          if (
            pipe.x < 100 + CAT_SIZE &&
            pipe.x + PIPE_WIDTH > 100 &&
            (catY < pipe.gapY || catY + CAT_SIZE > pipe.gapY + PIPE_GAP)
          ) {
            setGameOver(true);
            saveScore("flappy_cat", Math.floor(distance));
          }
        });

        return newPipes;
      });

      setDistance((d) => d + 0.1);
    }, 1000 / 60);

    return () => clearInterval(gameLoop);
  }, [gameStarted, gameOver, velocity, catY]);

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
            거리: {Math.floor(distance)}m
          </div>
        </div>

        <Card className="relative overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 border-4 border-primary">
          <div
            className="relative w-full h-[600px] cursor-pointer"
            onClick={jump}
          >
            {/* Cat */}
            <div
              className="absolute text-4xl transition-transform"
              style={{
                left: "100px",
                top: `${catY}px`,
                transform: `rotate(${Math.min(velocity * 3, 30)}deg)`,
              }}
            >
              😺
            </div>

            {/* Pipes */}
            {pipes.map((pipe, index) => (
              <div key={index}>
                <div
                  className="absolute bg-green-600 border-4 border-green-800 rounded-lg"
                  style={{
                    left: `${pipe.x}px`,
                    top: 0,
                    width: `${PIPE_WIDTH}px`,
                    height: `${pipe.gapY}px`,
                  }}
                />
                <div
                  className="absolute bg-green-600 border-4 border-green-800 rounded-lg"
                  style={{
                    left: `${pipe.x}px`,
                    top: `${pipe.gapY + PIPE_GAP}px`,
                    width: `${PIPE_WIDTH}px`,
                    height: `${600 - pipe.gapY - PIPE_GAP}px`,
                  }}
                />
              </div>
            ))}

            {/* Game Over Overlay */}
            {gameOver && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                <div className="text-center bg-card p-8 rounded-2xl border-4 border-primary animate-bounce-in max-w-md">
                  <h2 className="text-4xl font-bold mb-4 text-foreground">
                    게임 종료! 😿
                  </h2>
                  <p className="text-2xl mb-4 text-muted-foreground">
                    총 거리: {Math.floor(distance)}m
                  </p>
                  <div className="mb-6 text-left">
                    <h3 className="text-lg font-bold mb-2 text-foreground">순위표 🏆</h3>
                    <div className="space-y-1">
                      {leaderboard.map((entry, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{idx + 1}위</span>
                          <span className="font-bold text-foreground">{entry.score}m</span>
                        </div>
                      ))}
                      {leaderboard.length === 0 && (
                        <p className="text-sm text-muted-foreground">아직 기록이 없습니다</p>
                      )}
                    </div>
                  </div>
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
                  <h2 className="text-3xl font-bold mb-4 text-foreground">
                    클릭하거나 스페이스바를 눌러
                  </h2>
                  <p className="text-xl text-muted-foreground">
                    고양이를 점프시키세요! 🐱
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default FlappyCat;
