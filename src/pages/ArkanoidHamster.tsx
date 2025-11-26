import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { saveScore, getScores } from "@/lib/leaderboard";

const GAME_KEY = "arkanoid-hamster";

interface Ball {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
}

interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
}

const STAGES = [
  // Stage 1: Simple pattern
  { rows: 3, cols: 8, brickWidth: 60, brickHeight: 30 },
  // Stage 2: More bricks
  { rows: 4, cols: 9, brickWidth: 55, brickHeight: 28 },
  // Stage 3: Dense pattern
  { rows: 5, cols: 10, brickWidth: 50, brickHeight: 26 },
];

const ArkanoidHamster = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<"ready" | "playing" | "stageClear" | "gameOver" | "gameWon">("ready");
  const [stage, setStage] = useState(0);
  const [lives, setLives] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [leaderboard, setLeaderboard] = useState(getScores(GAME_KEY));
  
  const gameLoopRef = useRef<number>();
  const paddleXRef = useRef(250);
  const ballRef = useRef<Ball>({ x: 300, y: 450, dx: 3, dy: -3, radius: 8 });
  const bricksRef = useRef<Brick[]>([]);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const CANVAS_WIDTH = 600;
  const CANVAS_HEIGHT = 500;
  const PADDLE_WIDTH = 100;
  const PADDLE_HEIGHT = 20;

  const initBricks = (stageIndex: number) => {
    const config = STAGES[stageIndex];
    const bricks: Brick[] = [];
    const offsetX = (CANVAS_WIDTH - config.cols * config.brickWidth) / 2;
    const offsetY = 50;

    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        bricks.push({
          x: offsetX + col * config.brickWidth,
          y: offsetY + row * config.brickHeight,
          width: config.brickWidth,
          height: config.brickHeight,
          visible: true,
        });
      }
    }
    bricksRef.current = bricks;
  };

  const resetBall = () => {
    ballRef.current = { 
      x: CANVAS_WIDTH / 2, 
      y: 450, 
      dx: 3 * (Math.random() > 0.5 ? 1 : -1), 
      dy: -3, 
      radius: 8 
    };
  };

  const startGame = () => {
    setGameState("playing");
    setStage(0);
    setLives(3);
    setElapsedTime(0);
    paddleXRef.current = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;
    initBricks(0);
    resetBall();
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  };

  const nextStage = () => {
    const nextStageIndex = stage + 1;
    if (nextStageIndex < STAGES.length) {
      setStage(nextStageIndex);
      setGameState("playing");
      initBricks(nextStageIndex);
      resetBall();
    } else {
      // Game won
      const finalTime = Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000);
      saveScore(GAME_KEY, finalTime);
      setLeaderboard(getScores(GAME_KEY));
      setGameState("gameWon");
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      paddleXRef.current = Math.max(0, Math.min(CANVAS_WIDTH - PADDLE_WIDTH, mouseX - PADDLE_WIDTH / 2));
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    if (gameState !== "playing") {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const gameLoop = () => {
      // Clear canvas
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bricks (sunflower seeds)
      ctx.font = "20px Arial";
      bricksRef.current.forEach((brick) => {
        if (brick.visible) {
          ctx.fillText("🌻", brick.x, brick.y + brick.height - 5);
        }
      });

      // Draw cheese platform (wider than hamsters)
      ctx.font = "50px Arial";
      ctx.fillText("🧀", paddleXRef.current - 15, CANVAS_HEIGHT - 5);
      ctx.fillText("🧀", paddleXRef.current + 35, CANVAS_HEIGHT - 5);
      ctx.fillText("🧀", paddleXRef.current + 85, CANVAS_HEIGHT - 5);
      
      // Draw 3 hamsters on top of cheese
      ctx.font = "35px Arial";
      ctx.fillText("🐹", paddleXRef.current + 5, CANVAS_HEIGHT - 25);
      ctx.fillText("🐹", paddleXRef.current + 40, CANVAS_HEIGHT - 25);
      ctx.fillText("🐹", paddleXRef.current + 75, CANVAS_HEIGHT - 25);

      // Draw ball (sunflower seed)
      ctx.font = "16px Arial";
      ctx.fillText("🌻", ballRef.current.x - ballRef.current.radius, ballRef.current.y + ballRef.current.radius);

      // Move ball
      ballRef.current.x += ballRef.current.dx;
      ballRef.current.y += ballRef.current.dy;

      // Wall collision
      if (ballRef.current.x + ballRef.current.radius > CANVAS_WIDTH || ballRef.current.x - ballRef.current.radius < 0) {
        ballRef.current.dx *= -1;
      }
      if (ballRef.current.y - ballRef.current.radius < 0) {
        ballRef.current.dy *= -1;
      }

      // Hamster collision (success - ball bounces off hamsters)
      const hamsterY = CANVAS_HEIGHT - 25;
      const hamsterSize = 35;
      const hamsterPositions = [
        paddleXRef.current + 5,
        paddleXRef.current + 40,
        paddleXRef.current + 75
      ];
      
      let hitHamster = false;
      for (const hamsterX of hamsterPositions) {
        if (
          ballRef.current.y + ballRef.current.radius > hamsterY - hamsterSize / 2 &&
          ballRef.current.y - ballRef.current.radius < hamsterY + hamsterSize / 2 &&
          ballRef.current.x > hamsterX - hamsterSize / 2 &&
          ballRef.current.x < hamsterX + hamsterSize / 2
        ) {
          ballRef.current.dy = Math.abs(ballRef.current.dy) * -1; // Bounce up
          // Add angle based on which hamster was hit
          const hitPos = (ballRef.current.x - paddleXRef.current) / PADDLE_WIDTH;
          ballRef.current.dx = (hitPos - 0.5) * 6;
          hitHamster = true;
          break;
        }
      }

      // Cheese collision (failure - ball hits cheese instead of hamsters)
      if (!hitHamster && ballRef.current.y + ballRef.current.radius > CANVAS_HEIGHT - PADDLE_HEIGHT) {
        const cheeseZoneStart = paddleXRef.current - 15;
        const cheeseZoneEnd = paddleXRef.current + PADDLE_WIDTH + 15;
        
        if (ballRef.current.x > cheeseZoneStart && ballRef.current.x < cheeseZoneEnd) {
          // Hit cheese - lose life
          const newLives = lives - 1;
          setLives(newLives);
          if (newLives <= 0) {
            setGameState("gameOver");
            return;
          } else {
            resetBall();
          }
        }
      }

      // Ball falls off
      if (ballRef.current.y - ballRef.current.radius > CANVAS_HEIGHT) {
        const newLives = lives - 1;
        setLives(newLives);
        if (newLives <= 0) {
          setGameState("gameOver");
          return;
        } else {
          resetBall();
        }
      }

      // Brick collision
      let allBricksCleared = true;
      bricksRef.current.forEach((brick) => {
        if (brick.visible) {
          allBricksCleared = false;
          if (
            ballRef.current.x > brick.x &&
            ballRef.current.x < brick.x + brick.width &&
            ballRef.current.y > brick.y &&
            ballRef.current.y < brick.y + brick.height
          ) {
            brick.visible = false;
            ballRef.current.dy *= -1;
          }
        }
      });

      if (allBricksCleared) {
        const pauseStart = Date.now();
        pausedTimeRef.current += Date.now() - pauseStart;
        setGameState("stageClear");
        return;
      }

      // Update elapsed time
      setElapsedTime(Math.floor((Date.now() - startTimeRef.current - pausedTimeRef.current) / 1000));

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, lives]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            ← 홈으로
          </Button>
          <h1 className="text-3xl font-bold text-primary">🐹 햄스터 블록깨기</h1>
          <div className="w-24" />
        </div>

        <div className="grid md:grid-cols-[1fr,250px] gap-4">
          <Card className="p-6 bg-card/80 backdrop-blur">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-6 text-lg">
                <div>스테이지: <span className="font-bold text-primary">{stage + 1}/3</span></div>
                <div>생명: <span className="font-bold text-destructive">{"❤️".repeat(lives)}</span></div>
                <div>시간: <span className="font-bold text-accent">{formatTime(elapsedTime)}</span></div>
              </div>
              {gameState === "playing" && (
                <Button variant="outline" size="sm" onClick={startGame}>
                  다시하기
                </Button>
              )}
            </div>

            <div className="relative">
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                className="border-4 border-primary/20 rounded-lg bg-background/50 w-full"
                style={{ maxWidth: "600px", aspectRatio: "600/500" }}
              />

              {gameState === "ready" && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
                  <div className="text-center space-y-4">
                    <p className="text-xl text-muted-foreground">마우스로 햄스터를 움직여</p>
                    <p className="text-xl text-muted-foreground">해바라기씨를 모두 깨세요!</p>
                    <Button size="lg" onClick={startGame} className="mt-4">
                      게임 시작
                    </Button>
                  </div>
                </div>
              )}

              {gameState === "stageClear" && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
                  <div className="text-center space-y-4">
                    <p className="text-2xl font-bold text-primary">스테이지 {stage + 1} 클리어! 🎉</p>
                    <p className="text-lg text-muted-foreground">경과 시간: {formatTime(elapsedTime)}</p>
                    <Button size="lg" onClick={nextStage}>
                      {stage < STAGES.length - 1 ? "다음 스테이지" : "완료"}
                    </Button>
                  </div>
                </div>
              )}

              {gameState === "gameOver" && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
                  <div className="text-center space-y-4">
                    <p className="text-2xl font-bold text-destructive">게임 오버</p>
                    <p className="text-lg text-muted-foreground">스테이지 {stage + 1}에서 실패</p>
                    <p className="text-lg text-muted-foreground">경과 시간: {formatTime(elapsedTime)}</p>
                    <Button size="lg" onClick={startGame}>
                      다시 도전
                    </Button>
                  </div>
                </div>
              )}

              {gameState === "gameWon" && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/90 rounded-lg">
                  <div className="text-center space-y-4">
                    <p className="text-3xl font-bold text-primary">전체 클리어! 🎊</p>
                    <p className="text-xl text-accent">완료 시간: {formatTime(elapsedTime)}</p>
                    <Button size="lg" onClick={startGame}>
                      다시 도전
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur">
            <h2 className="text-xl font-bold mb-4 text-center text-primary">🏆 순위</h2>
            <div className="space-y-2">
              {leaderboard.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">아직 기록이 없습니다</p>
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">#{index + 1}</span>
                      <div className="text-sm">
                        <div className="font-semibold text-accent">{formatTime(entry.score)}</div>
                        <div className="text-xs text-muted-foreground">{formatDate(entry.date)}</div>
                      </div>
                    </div>
                    {index === 0 && <span className="text-xl">👑</span>}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ArkanoidHamster;