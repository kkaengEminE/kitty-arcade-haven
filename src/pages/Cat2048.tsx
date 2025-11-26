import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { saveScore, getScores } from "@/lib/leaderboard";

type Grid = (number | null)[][];

const CAT_EMOJIS: { [key: number]: string } = {
  2: "😺",
  4: "😸",
  8: "😹",
  16: "😻",
  32: "😼",
  64: "😽",
  128: "🙀",
  256: "😿",
  512: "😾",
  1024: "😺✨",
  2048: "👑😺",
};

const Cat2048 = () => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<Grid>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const leaderboard = getScores("cat_2048");

  const initializeGrid = useCallback(() => {
    const newGrid: Grid = Array(4)
      .fill(null)
      .map(() => Array(4).fill(null));
    addRandomTile(newGrid);
    addRandomTile(newGrid);
    return newGrid;
  }, []);

  const addRandomTile = (currentGrid: Grid) => {
    const emptyCells: { row: number; col: number }[] = [];
    currentGrid.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell === null) {
          emptyCells.push({ row: rowIndex, col: colIndex });
        }
      });
    });

    if (emptyCells.length > 0) {
      const { row, col } =
        emptyCells[Math.floor(Math.random() * emptyCells.length)];
      currentGrid[row][col] = Math.random() < 0.9 ? 2 : 4;
    }
  };

  const startGame = () => {
    setGrid(initializeGrid());
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
  };

  const checkGameOver = (currentGrid: Grid): boolean => {
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        if (currentGrid[row][col] === null) return false;
        if (col < 3 && currentGrid[row][col] === currentGrid[row][col + 1])
          return false;
        if (row < 3 && currentGrid[row][col] === currentGrid[row + 1][col])
          return false;
      }
    }
    return true;
  };

  const move = useCallback(
    (direction: "UP" | "DOWN" | "LEFT" | "RIGHT") => {
      if (gameOver || !gameStarted) return;

      let newGrid = grid.map((row) => [...row]);
      let moved = false;
      let scoreIncrease = 0;

      const compress = (line: (number | null)[]) => {
        const filtered = line.filter((cell) => cell !== null);
        const result: (number | null)[] = [];
        let i = 0;

        while (i < filtered.length) {
          if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
            const mergedValue = filtered[i]! * 2;
            result.push(mergedValue);
            scoreIncrease += mergedValue;
            i += 2;
            moved = true;
          } else {
            result.push(filtered[i]);
            i++;
          }
        }

        while (result.length < 4) {
          result.push(null);
        }

        return result;
      };

      if (direction === "LEFT") {
        for (let row = 0; row < 4; row++) {
          const originalRow = [...newGrid[row]];
          newGrid[row] = compress(newGrid[row]);
          if (!moved && JSON.stringify(originalRow) !== JSON.stringify(newGrid[row])) {
            moved = true;
          }
        }
      } else if (direction === "RIGHT") {
        for (let row = 0; row < 4; row++) {
          const originalRow = [...newGrid[row]];
          newGrid[row] = compress(newGrid[row].reverse()).reverse();
          if (!moved && JSON.stringify(originalRow) !== JSON.stringify(newGrid[row])) {
            moved = true;
          }
        }
      } else if (direction === "UP") {
        for (let col = 0; col < 4; col++) {
          const column = [
            newGrid[0][col],
            newGrid[1][col],
            newGrid[2][col],
            newGrid[3][col],
          ];
          const originalColumn = [...column];
          const compressed = compress(column);
          for (let row = 0; row < 4; row++) {
            newGrid[row][col] = compressed[row];
          }
          if (!moved && JSON.stringify(originalColumn) !== JSON.stringify(compressed)) {
            moved = true;
          }
        }
      } else if (direction === "DOWN") {
        for (let col = 0; col < 4; col++) {
          const column = [
            newGrid[0][col],
            newGrid[1][col],
            newGrid[2][col],
            newGrid[3][col],
          ];
          const originalColumn = [...column];
          const compressed = compress(column.reverse()).reverse();
          for (let row = 0; row < 4; row++) {
            newGrid[row][col] = compressed[row];
          }
          if (!moved && JSON.stringify(originalColumn) !== JSON.stringify(compressed)) {
            moved = true;
          }
        }
      }

      if (moved) {
        addRandomTile(newGrid);
        const newScore = score + scoreIncrease;
        setScore(newScore);
        if (newScore > bestScore) {
          setBestScore(newScore);
        }
        setGrid(newGrid);

        if (checkGameOver(newGrid)) {
          setGameOver(true);
          saveScore("cat_2048", newScore);
        }
      }
    },
    [grid, gameOver, gameStarted, score, bestScore]
  );

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted || gameOver) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          move("UP");
          break;
        case "ArrowDown":
          e.preventDefault();
          move("DOWN");
          break;
        case "ArrowLeft":
          e.preventDefault();
          move("LEFT");
          break;
        case "ArrowRight":
          e.preventDefault();
          move("RIGHT");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [move, gameStarted, gameOver]);

  const getTileColor = (value: number | null) => {
    if (!value) return "bg-game-dark/50";
    const colors: { [key: number]: string } = {
      2: "bg-yellow-200",
      4: "bg-yellow-300",
      8: "bg-orange-300",
      16: "bg-orange-400",
      32: "bg-red-300",
      64: "bg-red-400",
      128: "bg-purple-300",
      256: "bg-purple-400",
      512: "bg-pink-300",
      1024: "bg-pink-400",
      2048: "bg-gradient-to-br from-yellow-400 to-pink-400",
    };
    return colors[value] || "bg-primary";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/20 p-4 flex flex-col items-center justify-center">
      <Button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 bg-primary/80 hover:bg-primary"
      >
        🏠 메인으로
      </Button>

      <Card className="p-8 bg-card/90 backdrop-blur-sm max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-primary">
          😺 고양이 2048
        </h1>

        <div className="flex justify-between mb-6 items-start">
          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">점수</p>
              <p className="text-2xl font-bold text-foreground">{score}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">최고 점수</p>
              <p className="text-2xl font-bold text-primary">{bestScore}</p>
            </div>
          </div>
          {gameStarted && !gameOver && (
            <Button onClick={startGame} variant="outline" size="sm">
              🔄 다시 하기
            </Button>
          )}
        </div>

        {!gameStarted && (
          <div className="text-center mb-4">
            <Button onClick={startGame} className="text-lg px-8 py-6 mb-4">
              게임 시작하기 🎮
            </Button>
            <p className="text-muted-foreground">
              화살표 키로 고양이를 합쳐보세요!
            </p>
          </div>
        )}

        {gameStarted && (
          <div className="bg-game-dark p-4 rounded-lg">
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 mb-2 last:mb-0">
                {row.map((cell, colIndex) => (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`w-20 h-20 flex flex-col items-center justify-center rounded-lg font-bold ${getTileColor(
                      cell
                    )} transition-all duration-200`}
                  >
                    {cell && (
                      <>
                        <span className="text-3xl">{CAT_EMOJIS[cell]}</span>
                        <span className="text-xs text-foreground/80 font-semibold">{cell}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {gameOver && (
          <div className="text-center mt-6 space-y-4">
            <h2 className="text-3xl font-bold text-primary">게임 오버!</h2>
            <p className="text-xl text-foreground mb-4">최종 점수: {score}</p>
            <div className="text-left bg-muted/50 p-4 rounded-lg">
              <h3 className="text-lg font-bold mb-2 text-foreground">순위표 🏆</h3>
              <div className="space-y-1">
                {leaderboard.map((entry, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{idx + 1}위</span>
                    <span className="font-bold text-foreground">{entry.score}점</span>
                  </div>
                ))}
                {leaderboard.length === 0 && (
                  <p className="text-sm text-muted-foreground">아직 기록이 없습니다</p>
                )}
              </div>
            </div>
            <Button onClick={startGame} className="text-lg px-8 py-6">
              다시 시작하기 🔄
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Cat2048;
