"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, RotateCcw, Lightbulb, Undo2, Redo2, Volume2, VolumeX, Star } from "lucide-react";

// ===== 类型定义 =====
type CellState = "empty" | "piece" | "invalid";
type GameState = "intro" | "playing" | "completed" | "failed";

interface Position {
  row: number;
  col: number;
}

interface MoveRecord {
  from: Position;
  over: Position;
  to: Position;
  board: CellState[][];
  piecesLeft: number;
}

// ===== 常量 =====
const BOARD_SIZE = 7;
const INITIAL_PIECES = 32;

// 经典英式孔明棋棋盘布局 (7x7)
// 0 = 无效位置, 1 = 有效位置
const BOARD_LAYOUT = [
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1],
  [0, 0, 1, 1, 1, 0, 0],
  [0, 0, 1, 1, 1, 0, 0],
];

// 初始棋盘状态（中央为空）
function createInitialBoard(): CellState[][] {
  const board: CellState[][] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const rowCells: CellState[] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (BOARD_LAYOUT[row][col] === 0) {
        rowCells.push("invalid");
      } else if (row === 3 && col === 3) {
        rowCells.push("empty"); // 中央为空
      } else {
        rowCells.push("piece");
      }
    }
    board.push(rowCells);
  }
  return board;
}

// ===== 音效管理 =====
class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled = true;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  playClick() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 500;
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playMove() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.15);
  }

  playCapture() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 400;
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playInvalid() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 200;
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.1);
  }

  playSuccess() {
    if (!this.enabled || !this.ctx) return;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, this.ctx!.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx!.currentTime + i * 0.15 + 0.3);
      osc.start(this.ctx!.currentTime + i * 0.15);
      osc.stop(this.ctx!.currentTime + i * 0.15 + 0.3);
    });
  }
}

const soundManager = new SoundManager();

// ===== 工具函数 =====
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function getRating(piecesLeft: number): { stars: number; text: string; color: string } {
  if (piecesLeft === 1) return { stars: 5, text: "大师级！完美通关", color: "#F59E0B" };
  if (piecesLeft === 2) return { stars: 4, text: "非常优秀！", color: "#8B5CF6" };
  if (piecesLeft <= 4) return { stars: 3, text: "不错，再挑战一次！", color: "#3B82F6" };
  return { stars: 2, text: "继续思考，你一定可以！", color: "#64748B" };
}

// ===== 主组件 =====
interface PegSolitaireProps {
  onBack: () => void;
}

export function PegSolitaire({ onBack }: PegSolitaireProps) {
  const [board, setBoard] = useState<CellState[][]>(createInitialBoard());
  const [gameState, setGameState] = useState<GameState>("intro");
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [validMoves, setValidMoves] = useState<Position[]>([]);
  const [piecesLeft, setPiecesLeft] = useState(INITIAL_PIECES);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [history, setHistory] = useState<MoveRecord[]>([]);
  const [redoStack, setRedoStack] = useState<MoveRecord[]>([]);
  const [hintMove, setHintMove] = useState<{ from: Position; to: Position } | null>(null);
  const [shakeCell, setShakeCell] = useState<Position | null>(null);
  const [animatingMove, setAnimatingMove] = useState<{ from: Position; to: Position } | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 计时器
  useEffect(() => {
    if (gameState === "playing") {
      timerRef.current = setInterval(() => {
        setTime((t) => t + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // 开始游戏
  const startGame = useCallback(() => {
    soundManager.init();
    setBoard(createInitialBoard());
    setGameState("playing");
    setSelectedPiece(null);
    setValidMoves([]);
    setPiecesLeft(INITIAL_PIECES);
    setMoves(0);
    setTime(0);
    setHistory([]);
    setRedoStack([]);
    setHintMove(null);
  }, []);

  // 检查游戏状态
  const checkGameState = useCallback((currentBoard: CellState[][], currentPieces: number) => {
    // 检查是否胜利
    if (currentPieces === 1) {
      setGameState("completed");
      soundManager.playSuccess();
      return;
    }

    // 检查是否还有合法移动
    let hasValidMove = false;
    for (let row = 0; row < BOARD_SIZE && !hasValidMove; row++) {
      for (let col = 0; col < BOARD_SIZE && !hasValidMove; col++) {
        if (currentBoard[row][col] === "piece") {
          const moves = getValidMovesForPiece(currentBoard, row, col);
          if (moves.length > 0) hasValidMove = true;
        }
      }
    }

    if (!hasValidMove && currentPieces > 1) {
      setGameState("failed");
    }
  }, []);

  // 获取某枚棋子的合法移动
  const getValidMovesForPiece = (currentBoard: CellState[][], row: number, col: number): Position[] => {
    const moves: Position[] = [];
    const directions = [
      { dr: -2, dc: 0, overR: -1, overC: 0 }, // 上
      { dr: 2, dc: 0, overR: 1, overC: 0 },   // 下
      { dr: 0, dc: -2, overR: 0, overC: -1 }, // 左
      { dr: 0, dc: 2, overR: 0, overC: 1 },   // 右
    ];

    for (const dir of directions) {
      const toRow = row + dir.dr;
      const toCol = col + dir.dc;
      const overRow = row + dir.overR;
      const overCol = col + dir.overC;

      if (
        toRow >= 0 && toRow < BOARD_SIZE &&
        toCol >= 0 && toCol < BOARD_SIZE &&
        currentBoard[toRow][toCol] === "empty" &&
        currentBoard[overRow][overCol] === "piece"
      ) {
        moves.push({ row: toRow, col: toCol });
      }
    }

    return moves;
  };

  // 选择棋子
  const handlePieceClick = useCallback((row: number, col: number) => {
    if (gameState !== "playing") return;
    if (board[row][col] !== "piece") return;

    soundManager.playClick();
    const moves = getValidMovesForPiece(board, row, col);
    setSelectedPiece({ row, col });
    setValidMoves(moves);
    setHintMove(null);
  }, [board, gameState]);

  // 点击目标位置
  const handleCellClick = useCallback((row: number, col: number) => {
    if (gameState !== "playing") return;
    if (!selectedPiece) return;

    // 检查是否是合法移动
    const isValidMove = validMoves.some((m) => m.row === row && m.col === col);

    if (!isValidMove) {
      // 如果点击的是另一枚棋子，选择它
      if (board[row][col] === "piece") {
        handlePieceClick(row, col);
      } else {
        // 非法移动反馈
        setShakeCell({ row, col });
        soundManager.playInvalid();
        setTimeout(() => setShakeCell(null), 300);
      }
      return;
    }

    // 执行移动
    const overRow = (selectedPiece.row + row) / 2;
    const overCol = (selectedPiece.col + col) / 2;

    // 保存历史记录
    const record: MoveRecord = {
      from: selectedPiece,
      over: { row: overRow, col: overCol },
      to: { row, col },
      board: board.map((r) => [...r]),
      piecesLeft,
    };
    setHistory((prev) => [...prev, record]);
    setRedoStack([]);

    // 更新棋盘
    const newBoard = board.map((r) => [...r]);
    newBoard[selectedPiece.row][selectedPiece.col] = "empty";
    newBoard[overRow][overCol] = "empty";
    newBoard[row][col] = "piece";

    setAnimatingMove({ from: selectedPiece, to: { row, col } });
    setTimeout(() => setAnimatingMove(null), 300);

    setBoard(newBoard);
    setPiecesLeft((p) => p - 1);
    setMoves((m) => m + 1);
    setSelectedPiece(null);
    setValidMoves([]);
    setHintMove(null);

    soundManager.playMove();
    setTimeout(() => soundManager.playCapture(), 100);

    // 检查游戏状态
    setTimeout(() => {
      checkGameState(newBoard, piecesLeft - 1);
    }, 350);
  }, [board, gameState, selectedPiece, validMoves, piecesLeft, checkGameState, handlePieceClick]);

  // 撤销
  const handleUndo = useCallback(() => {
    if (history.length === 0 || gameState !== "playing") return;

    const lastMove = history[history.length - 1];
    setBoard(lastMove.board);
    setPiecesLeft(lastMove.piecesLeft);
    setMoves((m) => m - 1);
    setHistory((prev) => prev.slice(0, -1));
    setRedoStack((prev) => [lastMove, ...prev]);
    setSelectedPiece(null);
    setValidMoves([]);
    setHintMove(null);
    soundManager.playClick();
  }, [history, gameState]);

  // 重做
  const handleRedo = useCallback(() => {
    if (redoStack.length === 0 || gameState !== "playing") return;

    const nextMove = redoStack[0];
    const newBoard = board.map((r) => [...r]);
    newBoard[nextMove.from.row][nextMove.from.col] = "empty";
    newBoard[nextMove.over.row][nextMove.over.col] = "empty";
    newBoard[nextMove.to.row][nextMove.to.col] = "piece";

    setBoard(newBoard);
    setPiecesLeft((p) => p - 1);
    setMoves((m) => m + 1);
    setHistory((prev) => [...prev, nextMove]);
    setRedoStack((prev) => prev.slice(1));
    setSelectedPiece(null);
    setValidMoves([]);
    setHintMove(null);
    soundManager.playClick();
  }, [redoStack, board, gameState]);

  // 提示
  const handleHint = useCallback(() => {
    if (gameState !== "playing") return;

    // 寻找一个合法移动
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === "piece") {
          const moves = getValidMovesForPiece(board, row, col);
          if (moves.length > 0) {
            setHintMove({ from: { row, col }, to: moves[0] });
            setSelectedPiece(null);
            setValidMoves([]);
            soundManager.playClick();
            return;
          }
        }
      }
    }
  }, [board, gameState]);

  // 重新开始
  const handleRestart = useCallback(() => {
    if (gameState === "playing" && moves > 0) {
      if (!confirm("确定要重新开始本局吗？")) return;
    }
    startGame();
  }, [gameState, moves, startGame]);

  // 切换音效
  const toggleSound = useCallback(() => {
    soundManager.setEnabled(!soundEnabled);
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  // 渲染棋盘
  const renderBoard = () => {
    const cellSize = "min(11vw, 48px)";
    const gap = "4px";

    return (
      <div className="flex justify-center items-center py-4">
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(7, ${cellSize})`,
            gap,
          }}
        >
          {board.map((row, rowIdx) =>
            row.map((cell, colIdx) => {
              if (cell === "invalid") {
                return <div key={`${rowIdx}-${colIdx}`} style={{ width: cellSize, height: cellSize }} />;
              }

              const isSelected = selectedPiece?.row === rowIdx && selectedPiece?.col === colIdx;
              const isValidMove = validMoves.some((m) => m.row === rowIdx && m.col === colIdx);
              const isHintFrom = hintMove?.from.row === rowIdx && hintMove?.from.col === colIdx;
              const isHintTo = hintMove?.to.row === rowIdx && hintMove?.to.col === colIdx;
              const isShaking = shakeCell?.row === rowIdx && shakeCell?.col === colIdx;
              const isAnimating =
                animatingMove &&
                ((animatingMove.from.row === rowIdx && animatingMove.from.col === colIdx) ||
                  (animatingMove.to.row === rowIdx && animatingMove.to.col === colIdx));

              return (
                <button
                  key={`${rowIdx}-${colIdx}`}
                  onClick={() => {
                    if (cell === "piece") {
                      handlePieceClick(rowIdx, colIdx);
                    } else {
                      handleCellClick(rowIdx, colIdx);
                    }
                  }}
                  disabled={gameState !== "playing"}
                  className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
                    isShaking ? "animate-shake" : ""
                  } ${isAnimating ? "animate-pulse" : ""}`}
                  style={{
                    width: cellSize,
                    height: cellSize,
                    background:
                      cell === "piece"
                        ? isSelected
                          ? "linear-gradient(135deg, #F59E0B, #D97706)"
                          : "linear-gradient(135deg, #8B5CF6, #6366F1)"
                        : "rgba(255,255,255,0.3)",
                    boxShadow:
                      cell === "piece"
                        ? isSelected
                          ? "0 0 20px rgba(245, 158, 11, 0.6), 0 4px 12px rgba(0,0,0,0.2)"
                          : "0 4px 12px rgba(0,0,0,0.2)"
                        : "inset 0 2px 4px rgba(0,0,0,0.1)",
                    border: isValidMove
                      ? "3px solid #10B981"
                      : isHintFrom
                      ? "3px solid #F59E0B"
                      : isHintTo
                      ? "3px dashed #10B981"
                      : "none",
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                  }}
                >
                  {cell === "piece" && (
                    <div
                      className="w-3/4 h-3/4 rounded-full"
                      style={{
                        background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.4), transparent)",
                      }}
                    />
                  )}
                  {isValidMove && (
                    <div className="absolute inset-0 rounded-full bg-[#10B981]/20 animate-pulse" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // 介绍页面
  if (gameState === "intro") {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FEF3C7] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-[#8B5CF6] rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#F59E0B] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#0F172A]">
          <button onClick={onBack} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <div className="flex-1 text-center">
            <h3 className="text-base font-bold text-white">孔明棋</h3>
            <p className="text-[10px] text-white/60">Peg Solitaire</p>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <div className="text-6xl mb-6">♟️</div>
          <h2 className="text-2xl font-bold text-[#1E293B] mb-3">孔明棋</h2>
          <p className="text-sm text-[#64748B] mb-6 text-center leading-relaxed">
            跳过棋子，吃掉棋子。
            <br />
            想办法让棋盘最后只剩下一枚棋子。
          </p>

          <div className="bg-white/60 backdrop-blur rounded-xl p-4 mb-6 max-w-sm">
            <p className="text-xs text-[#475569] leading-relaxed">
              💡 点击棋子，再点击目标位置即可移动。棋子必须跳过相邻的棋子落到空位，被跳过的棋子会被吃掉。
            </p>
          </div>

          <button
            onClick={startGame}
            className="px-8 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Star className="w-5 h-5" />
            开始挑战
          </button>
        </div>

        <style>{`
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          .animate-shake { animation: shake 0.3s ease-in-out; }
        `}</style>
      </div>
    );
  }

  // 胜利/失败弹窗
  const renderEndModal = () => {
    if (gameState !== "completed" && gameState !== "failed") return null;

    const rating = getRating(piecesLeft);
    const isVictory = gameState === "completed";

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-bounce-in">
          <div className="text-center">
            <div className="text-6xl mb-4">{isVictory ? "🎉" : "😔"}</div>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">
              {isVictory ? "挑战成功！" : "挑战结束"}
            </h2>
            <p className="text-sm text-[#64748B] mb-6">
              {isVictory ? "恭喜你，只剩下 1 枚棋子！" : "棋盘已经没有可以进行的移动了。"}
            </p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg">
                <span className="text-sm text-[#64748B]">剩余棋子</span>
                <span className="font-bold text-[#1E293B]">{piecesLeft}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg">
                <span className="text-sm text-[#64748B]">移动次数</span>
                <span className="font-bold text-[#1E293B]">{moves}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg">
                <span className="text-sm text-[#64748B]">用时</span>
                <span className="font-bold text-[#1E293B]">{formatTime(time)}</span>
              </div>
              <div
                className="p-3 rounded-lg"
                style={{ background: `${rating.color}20` }}
              >
                <p className="text-sm font-bold" style={{ color: rating.color }}>
                  {rating.text}
                </p>
              </div>
            </div>

            <div className="flex justify-center gap-1 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${star <= rating.stars ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E2E8F0]"}`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                {isVictory ? "再来一局" : "重新挑战"}
              </button>
              <button
                onClick={onBack}
                className="flex-1 py-3 bg-[#F1F5F9] text-[#475569] font-bold rounded-lg hover:bg-[#E2E8F0] transition-all"
              >
                返回训练场
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FEF3C7] relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#8B5CF6] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#F59E0B] rounded-full blur-3xl" />
      </div>

      {/* 顶部栏 */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#0F172A]">
        <button onClick={onBack} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex-1 text-center">
          <h3 className="text-base font-bold text-white">孔明棋</h3>
          <p className="text-[10px] text-white/60">Peg Solitaire</p>
        </div>
        <button
          onClick={handleRestart}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          title="重新开始"
        >
          <RotateCcw className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={toggleSound}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* 游戏数据 */}
      <div className="relative z-10 px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/80 backdrop-blur rounded-lg p-2 text-center">
            <p className="text-[10px] text-[#64748B]">剩余棋子</p>
            <p className="font-bold text-[#1E293B] text-lg">{piecesLeft}</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-2 text-center">
            <p className="text-[10px] text-[#64748B]">移动</p>
            <p className="font-bold text-[#1E293B] text-lg">{moves}</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-2 text-center">
            <p className="text-[10px] text-[#64748B]">用时</p>
            <p className="font-bold text-[#1E293B] text-lg">{formatTime(time)}</p>
          </div>
        </div>
      </div>

      {/* 棋盘 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-2">
        {renderBoard()}
      </div>

      {/* 功能按钮 */}
      <div className="relative z-10 px-4 py-3">
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="py-2.5 bg-white/80 backdrop-blur text-[#475569] font-bold rounded-lg hover:bg-white transition-all flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Undo2 className="w-4 h-4" />
            <span className="text-xs">撤销</span>
          </button>
          <button
            onClick={handleHint}
            className="py-2.5 bg-white/80 backdrop-blur text-[#475569] font-bold rounded-lg hover:bg-white transition-all flex items-center justify-center gap-1"
          >
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs">提示</span>
          </button>
          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="py-2.5 bg-white/80 backdrop-blur text-[#475569] font-bold rounded-lg hover:bg-white transition-all flex items-center justify-center gap-1 disabled:opacity-50"
          >
            <Redo2 className="w-4 h-4" />
            <span className="text-xs">重做</span>
          </button>
        </div>
      </div>

      {/* 提示文案 */}
      {hintMove && (
        <div className="relative z-10 px-4 pb-3">
          <div className="bg-[#F59E0B]/20 border border-[#F59E0B]/40 rounded-lg p-3 text-center">
            <p className="text-xs text-[#92400E] font-bold">
               试试看，把这枚棋子跳到这里。
            </p>
          </div>
        </div>
      )}

      {/* 胜利/失败弹窗 */}
      {renderEndModal()}

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in { animation: bounce-in 0.5s ease-out; }
      `}</style>
    </div>
  );
}
