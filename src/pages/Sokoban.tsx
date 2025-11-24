import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type CellType = "wall" | "floor" | "goal" | "player" | "box" | "cat" | "heart";

interface Position {
  x: number;
  y: number;
}

const levels = [
  {
    name: "스테이지 1",
    map: [
      ["wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "floor", "goal", "wall"],
      ["wall", "player", "box", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    catStart: { x: 4, y: 3 },
    heartPos: { x: 3, y: 1 },
  },
  {
    name: "스테이지 2",
    map: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "goal", "floor", "floor", "wall"],
      ["wall", "player", "floor", "box", "floor", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "goal", "floor", "wall"],
      ["wall", "floor", "box", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    catStart: { x: 5, y: 2 },
    heartPos: { x: 2, y: 4 },
  },
  {
    name: "스테이지 3",
    map: [
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
      ["wall", "floor", "floor", "goal", "floor", "floor", "floor", "wall"],
      ["wall", "player", "floor", "box", "floor", "goal", "floor", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "floor", "box", "floor", "goal", "floor", "box", "wall"],
      ["wall", "floor", "floor", "floor", "floor", "floor", "floor", "wall"],
      ["wall", "wall", "wall", "wall", "wall", "wall", "wall", "wall"],
    ],
    catStart: { x: 6, y: 3 },
    heartPos: { x: 3, y: 5 },
  },
];

const Sokoban = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [map, setMap] = useState<string[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [catPos, setCatPos] = useState<Position>({ x: 0, y: 0 });
  const [heartPos, setHeartPos] = useState<Position | null>(null);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [levelComplete, setLevelComplete] = useState(false);

  const initLevel = useCallback(() => {
    const level = levels[currentLevel];
    const newMap = level.map.map((row) => [...row]);
    
    for (let y = 0; y < newMap.length; y++) {
      for (let x = 0; x < newMap[y].length; x++) {
        if (newMap[y][x] === "player") {
          setPlayerPos({ x, y });
          newMap[y][x] = "floor";
        }
      }
    }

    setMap(newMap);
    setCatPos(level.catStart);
    setHeartPos(level.heartPos);
    setGameOver(false);
    setLevelComplete(false);
  }, [currentLevel]);

  useEffect(() => {
    initLevel();
  }, [initLevel]);

  useEffect(() => {
    if (gameOver || levelComplete) return;

    const catInterval = setInterval(() => {
      setCatPos((prev) => {
        const directions = [
          { x: 0, y: -1 },
          { x: 0, y: 1 },
          { x: -1, y: 0 },
          { x: 1, y: 0 },
        ];
        
        const validMoves = directions.filter((dir) => {
          const newX = prev.x + dir.x;
          const newY = prev.y + dir.y;
          return (
            newY >= 0 &&
            newY < map.length &&
            newX >= 0 &&
            newX < map[0].length &&
            map[newY][newX] !== "wall" &&
            map[newY][newX] !== "box"
          );
        });

        if (validMoves.length === 0) return prev;
        
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        return { x: prev.x + randomMove.x, y: prev.y + randomMove.y };
      });
    }, 1500);

    return () => clearInterval(catInterval);
  }, [map, gameOver, levelComplete]);

  useEffect(() => {
    if (catPos.x === playerPos.x && catPos.y === playerPos.y) {
      const newLives = lives - 1;
      setLives(newLives);
      toast.error("고양이에게 잡혔어요! 💔");
      
      if (newLives <= 0) {
        setGameOver(true);
        toast.error("게임 오버!");
      } else {
        initLevel();
      }
    }
  }, [catPos, playerPos, lives, initLevel]);

  useEffect(() => {
    if (heartPos && playerPos.x === heartPos.x && playerPos.y === heartPos.y) {
      setLives((prev) => prev + 1);
      setHeartPos(null);
      toast.success("하트 획득! ❤️");
    }
  }, [playerPos, heartPos]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (gameOver || levelComplete) return;

      const newX = playerPos.x + dx;
      const newY = playerPos.y + dy;

      if (
        newY < 0 ||
        newY >= map.length ||
        newX < 0 ||
        newX >= map[0].length ||
        map[newY][newX] === "wall"
      ) {
        return;
      }

      if (map[newY][newX] === "box") {
        const boxNewX = newX + dx;
        const boxNewY = newY + dy;

        if (
          boxNewY < 0 ||
          boxNewY >= map.length ||
          boxNewX < 0 ||
          boxNewX >= map[0].length ||
          map[boxNewY][boxNewX] === "wall" ||
          map[boxNewY][boxNewX] === "box" ||
          (catPos.x === boxNewX && catPos.y === boxNewY)
        ) {
          return;
        }

        const newMap = map.map((row) => [...row]);
        newMap[newY][newX] = "floor";
        newMap[boxNewY][boxNewX] = "box";
        setMap(newMap);

        // Check win condition
        let allBoxesOnGoals = true;
        for (let y = 0; y < newMap.length; y++) {
          for (let x = 0; x < newMap[y].length; x++) {
            if (newMap[y][x] === "goal") {
              allBoxesOnGoals = false;
            }
          }
        }

        if (allBoxesOnGoals) {
          setLevelComplete(true);
          toast.success("스테이지 클리어! 🎉");
        }
      }

      setPlayerPos({ x: newX, y: newY });
    },
    [playerPos, map, gameOver, levelComplete, catPos]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowUp":
        case "w":
          movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
          movePlayer(1, 0);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [movePlayer]);

  const nextLevel = () => {
    if (currentLevel < levels.length - 1) {
      setCurrentLevel((prev) => prev + 1);
      setLives(3);
    } else {
      toast.success("모든 스테이지를 클리어했습니다! 🎊");
    }
  };

  const getCellContent = (x: number, y: number) => {
    if (playerPos.x === x && playerPos.y === y) return "🐹";
    if (catPos.x === x && catPos.y === y) return "😼";
    if (heartPos && heartPos.x === x && heartPos.y === y) return "❤️";
    
    const cell = map[y][x];
    switch (cell) {
      case "wall":
        return "🧱";
      case "box":
        return "🌻";
      case "goal":
        return "🕳️";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Link to="/">
            <Button variant="outline" className="font-bold">
              🏠 홈으로
            </Button>
          </Link>
          <div className="text-xl font-bold">
            {levels[currentLevel].name} | ❤️ x {lives}
          </div>
          <Button onClick={initLevel} className="bg-primary font-bold">
            🔄 재시작
          </Button>
        </div>

        <Card className="p-4 md:p-8 bg-card/90 backdrop-blur-sm border-4 border-primary">
          <div className="mb-4 text-center">
            <p className="text-lg text-muted-foreground">
              방향키 또는 WASD로 이동하세요
            </p>
          </div>

          <div className="inline-block bg-amber-100 p-4 rounded-lg">
            {map.map((row, y) => (
              <div key={y} className="flex">
                {row.map((_, x) => (
                  <div
                    key={`${x}-${y}`}
                    className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl border border-amber-200 ${
                      map[y][x] === "wall" ? "bg-gray-600" : map[y][x] === "goal" ? "bg-amber-300" : "bg-amber-50"
                    }`}
                  >
                    {getCellContent(x, y)}
                  </div>
                ))}
              </div>
            ))}
          </div>

          {gameOver && (
            <div className="mt-6 text-center bg-card p-6 rounded-xl border-2 border-primary">
              <h3 className="text-2xl font-bold mb-2">게임 오버! 😿</h3>
              <Button onClick={initLevel} className="bg-primary font-bold mt-4">
                다시 시작하기
              </Button>
            </div>
          )}

          {levelComplete && (
            <div className="mt-6 text-center bg-card p-6 rounded-xl border-2 border-primary">
              <h3 className="text-2xl font-bold mb-2">클리어! 🎉</h3>
              {currentLevel < levels.length - 1 ? (
                <Button onClick={nextLevel} className="bg-primary font-bold mt-4">
                  다음 스테이지
                </Button>
              ) : (
                <Button onClick={() => setCurrentLevel(0)} className="bg-primary font-bold mt-4">
                  처음부터 다시
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Sokoban;
