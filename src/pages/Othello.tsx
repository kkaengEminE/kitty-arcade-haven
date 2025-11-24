import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { toast } from "sonner";

type Cell = "black" | "white" | null;
type Board = Cell[][];

const Othello = () => {
  const [board, setBoard] = useState<Board>(initializeBoard());
  const [currentPlayer, setCurrentPlayer] = useState<"black" | "white">("black");
  const [gameOver, setGameOver] = useState(false);

  function initializeBoard(): Board {
    const newBoard: Board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    newBoard[3][3] = "white";
    newBoard[3][4] = "black";
    newBoard[4][3] = "black";
    newBoard[4][4] = "white";
    return newBoard;
  }

  const directions = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1],
  ];

  const isValidMove = (row: number, col: number, player: "black" | "white"): boolean => {
    if (board[row][col] !== null) return false;

    const opponent = player === "black" ? "white" : "black";

    for (const [dx, dy] of directions) {
      let x = row + dx;
      let y = col + dy;
      let hasOpponent = false;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (board[x][y] === opponent) {
          hasOpponent = true;
        } else if (board[x][y] === player && hasOpponent) {
          return true;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }

    return false;
  };

  const flipPieces = (row: number, col: number, player: "black" | "white") => {
    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = player;

    const opponent = player === "black" ? "white" : "black";

    for (const [dx, dy] of directions) {
      const toFlip: [number, number][] = [];
      let x = row + dx;
      let y = col + dy;

      while (x >= 0 && x < 8 && y >= 0 && y < 8) {
        if (board[x][y] === opponent) {
          toFlip.push([x, y]);
        } else if (board[x][y] === player && toFlip.length > 0) {
          toFlip.forEach(([fx, fy]) => {
            newBoard[fx][fy] = player;
          });
          break;
        } else {
          break;
        }
        x += dx;
        y += dy;
      }
    }

    return newBoard;
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameOver || !isValidMove(row, col, currentPlayer)) {
      toast.error("여기에 놓을 수 없어요!");
      return;
    }

    const newBoard = flipPieces(row, col, currentPlayer);
    setBoard(newBoard);

    const nextPlayer = currentPlayer === "black" ? "white" : "black";
    setCurrentPlayer(nextPlayer);

    // Check if game is over
    checkGameOver(newBoard, nextPlayer);
  };

  const checkGameOver = (currentBoard: Board, nextPlayer: "black" | "white") => {
    let hasValidMove = false;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (currentBoard[i][j] === null && isValidMove(i, j, nextPlayer)) {
          hasValidMove = true;
          break;
        }
      }
      if (hasValidMove) break;
    }

    if (!hasValidMove) {
      setGameOver(true);
      const counts = countPieces(currentBoard);
      toast.success(
        `게임 종료! 흑: ${counts.black}, 백: ${counts.white}`,
        { duration: 5000 }
      );
    }
  };

  const countPieces = (currentBoard: Board) => {
    let black = 0;
    let white = 0;
    currentBoard.forEach((row) => {
      row.forEach((cell) => {
        if (cell === "black") black++;
        if (cell === "white") white++;
      });
    });
    return { black, white };
  };

  const resetGame = () => {
    setBoard(initializeBoard());
    setCurrentPlayer("black");
    setGameOver(false);
  };

  const counts = countPieces(board);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <Link to="/">
            <Button variant="outline" className="font-bold">
              🏠 홈으로
            </Button>
          </Link>
          <div className="flex gap-4">
            <div className="text-xl font-bold">
              😺 흑: {counts.black}
            </div>
            <div className="text-xl font-bold">
              😸 백: {counts.white}
            </div>
          </div>
          <Button onClick={resetGame} className="bg-primary font-bold">
            🔄 새 게임
          </Button>
        </div>

        <Card className="p-4 md:p-8 bg-card/90 backdrop-blur-sm border-4 border-primary">
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold">
              현재 차례: {currentPlayer === "black" ? "😺 검은 고양이" : "😸 흰 고양이"}
            </h2>
          </div>

          <div className="inline-grid grid-cols-8 gap-1 bg-green-800 p-2 rounded-lg">
            {board.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  className={`w-12 h-12 md:w-14 md:h-14 bg-green-600 border-2 border-green-700 rounded-md flex items-center justify-center text-3xl transition-all hover:bg-green-500 ${
                    isValidMove(rowIndex, colIndex, currentPlayer) && !gameOver
                      ? "ring-2 ring-game-accent"
                      : ""
                  }`}
                >
                  {cell === "black" && "😺"}
                  {cell === "white" && "😸"}
                </button>
              ))
            )}
          </div>

          {gameOver && (
            <div className="mt-6 text-center bg-card p-6 rounded-xl border-2 border-primary">
              <h3 className="text-2xl font-bold mb-2">게임 종료!</h3>
              <p className="text-xl">
                {counts.black > counts.white
                  ? "😺 검은 고양이 승리!"
                  : counts.white > counts.black
                  ? "😸 흰 고양이 승리!"
                  : "무승부!"}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Othello;
