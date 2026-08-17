"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, Play, RotateCcw, Lightbulb, Pause, Volume2, VolumeX, Star, Trophy, Clock, Target } from "lucide-react";

// ===== 类型定义 =====
type Difficulty = 3 | 4 | 5 | 6;
type GameState = "idle" | "playing" | "paused" | "completed";

interface GameRecord {
  date: string;
  difficulty: Difficulty;
  time: number;
  moves: number;
  score: number;
}

interface BestScore {
  time: number;
  moves: number;
  score: number;
}

// ===== 常量 =====
const DIFFICULTY_CONFIG: Record<Difficulty, { name: string; baseScore: number; description: string }> = {
  3: { name: "3×3", baseScore: 1000, description: "初级" },
  4: { name: "4×4", baseScore: 2000, description: "进阶" },
  5: { name: "5×5", baseScore: 3000, description: "大师" },
  6: { name: "6×6", baseScore: 4000, description: "专家" },
};

const MAX_HINTS = 3;
const STORAGE_KEY_BEST = "sliding-puzzle-best";
const STORAGE_KEY_RECORDS = "sliding-puzzle-records";

// ===== 音效（使用 Web Audio API） =====
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

  playMove() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 400;
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

  playClick() {
    if (!this.enabled || !this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 600;
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.05);
  }
}

const soundManager = new SoundManager();

// ===== 工具函数 =====
function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function shuffleBoard(size: number, shuffleMoves: number = 200): number[] {
  // 从完成状态开始，通过合法移动打乱
  const board: number[] = [];
  for (let i = 1; i < size * size; i++) board.push(i);
  board.push(0); // 0 表示空格

  let emptyIdx = size * size - 1;
  let lastMove = -1;

  for (let i = 0; i < shuffleMoves; i++) {
    const neighbors: number[] = [];
    const row = Math.floor(emptyIdx / size);
    const col = emptyIdx % size;

    if (row > 0) neighbors.push(emptyIdx - size); // 上
    if (row < size - 1) neighbors.push(emptyIdx + size); // 下
    if (col > 0) neighbors.push(emptyIdx - 1); // 左
    if (col < size - 1) neighbors.push(emptyIdx + 1); // 右

    // 避免立即回退
    const validNeighbors = neighbors.filter((idx) => idx !== lastMove);
    const moveIdx = validNeighbors.length > 0 ? validNeighbors[Math.floor(Math.random() * validNeighbors.length)] : neighbors[0];

    // 交换
    [board[emptyIdx], board[moveIdx]] = [board[moveIdx], board[emptyIdx]];
    lastMove = emptyIdx;
    emptyIdx = moveIdx;
  }

  return board;
}

function isSolved(board: number[]): boolean {
  for (let i = 0; i < board.length - 1; i++) {
    if (board[i] !== i + 1) return false;
  }
  return board[board.length - 1] === 0;
}

function getMovableTiles(board: number[], size: number): number[] {
  const emptyIdx = board.indexOf(0);
  const row = Math.floor(emptyIdx / size);
  const col = emptyIdx % size;
  const movable: number[] = [];

  if (row > 0) movable.push(board[emptyIdx - size]);
  if (row < size - 1) movable.push(board[emptyIdx + size]);
  if (col > 0) movable.push(board[emptyIdx - 1]);
  if (col < size - 1) movable.push(board[emptyIdx + 1]);

  return movable;
}

function calculateScore(difficulty: Difficulty, time: number, moves: number, hintsUsed: number): number {
  const config = DIFFICULTY_CONFIG[difficulty];
  const optimalMoves = difficulty * difficulty * 3;
  const moveEfficiency = Math.max(0, 1 - (moves - optimalMoves) / (optimalMoves * 2));
  const timeBonus = Math.max(0, 300 - time) * 2;
  const hintPenalty = hintsUsed * 100;

  return Math.max(0, Math.floor(config.baseScore * moveEfficiency + timeBonus - hintPenalty));
}

function getStarRating(score: number, difficulty: Difficulty): number {
  const maxScore = DIFFICULTY_CONFIG[difficulty].baseScore * 1.5;
  const ratio = score / maxScore;
  if (ratio >= 0.8) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

// ===== 主组件 =====
interface SlidingPuzzleProps {
  onBack: () => void;
}

export function SlidingPuzzle({ onBack }: SlidingPuzzleProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>(4);
  const [board, setBoard] = useState<number[]>([]);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [hintsLeft, setHintsLeft] = useState(MAX_HINTS);
  const [hintTile, setHintTile] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bestScores, setBestScores] = useState<Record<Difficulty, BestScore | null>>({ 3: null, 4: null, 5: null, 6: null });
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [showDifficultySelect, setShowDifficultySelect] = useState(false);
  const [shakeTile, setShakeTile] = useState<number | null>(null);
  const [completedAnimation, setCompletedAnimation] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const size = difficulty;
  const totalTiles = size * size;

  // 加载最佳成绩和历史记录
  useEffect(() => {
    const savedBest = localStorage.getItem(STORAGE_KEY_BEST);
    if (savedBest) {
      try {
        setBestScores(JSON.parse(savedBest));
      } catch (e) {}
    }

    const savedRecords = localStorage.getItem(STORAGE_KEY_RECORDS);
    if (savedRecords) {
      try {
        setRecords(JSON.parse(savedRecords));
      } catch (e) {}
    }

    // 首次进入时自动显示难度选择
    setShowDifficultySelect(true);
  }, []);

  // 保存最佳成绩
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BEST, JSON.stringify(bestScores));
  }, [bestScores]);

  // 保存历史记录
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_RECORDS, JSON.stringify(records.slice(0, 10)));
  }, [records]);

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
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState]);

  // 初始化游戏
  const startGame = useCallback(() => {
    soundManager.init();
    const newBoard = shuffleBoard(size, size * size * 10);
    setBoard(newBoard);
    setMoves(0);
    setTime(0);
    setHintsLeft(MAX_HINTS);
    setHintTile(null);
    setGameState("playing");
    setCompletedAnimation(false);
    setShowDifficultySelect(false);
  }, [size]);

  // 重新开始
  const restartGame = useCallback(() => {
    if (gameState === "playing" && moves > 0) {
      if (!confirm("确定要重新开始本局吗？")) return;
    }
    startGame();
  }, [gameState, moves, startGame]);

  // 移动方块
  const moveTile = useCallback(
    (tileValue: number) => {
      if (gameState !== "playing") return;

      const tileIdx = board.indexOf(tileValue);
      const emptyIdx = board.indexOf(0);
      const row = Math.floor(tileIdx / size);
      const col = tileIdx % size;
      const emptyRow = Math.floor(emptyIdx / size);
      const emptyCol = emptyIdx % size;

      const isAdjacent =
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow);

      if (!isAdjacent) {
        // 不能移动，抖动反馈
        setShakeTile(tileValue);
        setTimeout(() => setShakeTile(null), 300);
        return;
      }

      // 执行移动
      const newBoard = [...board];
      [newBoard[tileIdx], newBoard[emptyIdx]] = [newBoard[emptyIdx], newBoard[tileIdx]];
      setBoard(newBoard);
      setMoves((m) => m + 1);
      soundManager.playMove();

      // 检查胜利
      if (isSolved(newBoard)) {
        setGameState("completed");
        setCompletedAnimation(true);
        soundManager.playSuccess();

        // 计算得分
        const score = calculateScore(difficulty, time, moves + 1, MAX_HINTS - hintsLeft);
        const currentBest = bestScores[difficulty];

        if (!currentBest || score > currentBest.score) {
          setBestScores((prev) => ({
            ...prev,
            [difficulty]: { time, moves: moves + 1, score },
          }));
        }

        // 添加历史记录
        const newRecord: GameRecord = {
          date: new Date().toLocaleDateString("zh-CN"),
          difficulty,
          time,
          moves: moves + 1,
          score,
        };
        setRecords((prev) => [newRecord, ...prev].slice(0, 10));
      }
    },
    [board, gameState, size, difficulty, time, moves, hintsLeft, bestScores]
  );

  // 提示功能
  const useHint = useCallback(() => {
    if (hintsLeft <= 0 || gameState !== "playing") return;

    const movable = getMovableTiles(board, size);
    if (movable.length > 0) {
      const hint = movable[Math.floor(Math.random() * movable.length)];
      setHintTile(hint);
      setHintsLeft((h) => h - 1);
      setTimeout(() => setHintTile(null), 1000);
      soundManager.playClick();
    }
  }, [board, size, hintsLeft, gameState]);

  // 暂停/继续
  const togglePause = useCallback(() => {
    if (gameState === "playing") {
      setGameState("paused");
    } else if (gameState === "paused") {
      setGameState("playing");
    }
    soundManager.playClick();
  }, [gameState]);

  // 切换音效
  const toggleSound = useCallback(() => {
    soundManager.setEnabled(!soundEnabled);
    setSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  // 键盘控制
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== "playing") return;

      const emptyIdx = board.indexOf(0);
      const row = Math.floor(emptyIdx / size);
      const col = emptyIdx % size;

      let targetIdx = -1;

      switch (e.key) {
        case "ArrowUp":
          if (row < size - 1) targetIdx = emptyIdx + size;
          break;
        case "ArrowDown":
          if (row > 0) targetIdx = emptyIdx - size;
          break;
        case "ArrowLeft":
          if (col < size - 1) targetIdx = emptyIdx + 1;
          break;
        case "ArrowRight":
          if (col > 0) targetIdx = emptyIdx - 1;
          break;
      }

      if (targetIdx >= 0 && targetIdx < totalTiles) {
        e.preventDefault();
        moveTile(board[targetIdx]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, gameState, size, totalTiles, moveTile]);

  // 触摸滑动支持
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || gameState !== "playing") return;

    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

    const emptyIdx = board.indexOf(0);
    const row = Math.floor(emptyIdx / size);
    const col = emptyIdx % size;
    let targetIdx = -1;

    if (Math.abs(dx) > Math.abs(dy)) {
      // 水平滑动
      if (dx > 0 && col > 0) targetIdx = emptyIdx - 1;
      else if (dx < 0 && col < size - 1) targetIdx = emptyIdx + 1;
    } else {
      // 垂直滑动
      if (dy > 0 && row > 0) targetIdx = emptyIdx - size;
      else if (dy < 0 && row < size - 1) targetIdx = emptyIdx + size;
    }

    if (targetIdx >= 0 && targetIdx < totalTiles) {
      moveTile(board[targetIdx]);
    }

    touchStartRef.current = null;
  };

  // 渲染棋盘
  const renderBoard = () => {
    if (board.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-[#8B7355] text-lg">
          点击「开始挑战」开始游戏
        </div>
      );
    }

    const cellSize = `calc((min(90vw, 500px) - ${(size - 1) * 8}px) / ${size})`;

    return (
      <div
        ref={boardRef}
        className="relative mx-auto"
        style={{
          width: `calc(${cellSize} * ${size} + ${(size - 1) * 8}px)`,
          height: `calc(${cellSize} * ${size} + ${(size - 1) * 8}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {board.map((value, idx) => {
          if (value === 0) return null;

          const row = Math.floor(idx / size);
          const col = idx % size;
          const isHint = hintTile === value;
          const isShaking = shakeTile === value;
          const isCompleted = gameState === "completed";

          return (
            <button
              key={value}
              onClick={() => moveTile(value)}
              disabled={gameState !== "playing"}
              className={`absolute flex items-center justify-center font-bold text-white rounded-lg shadow-lg transition-all duration-200 ${
                isShaking ? "animate-shake" : ""
              } ${isHint ? "ring-4 ring-yellow-400 ring-opacity-75" : ""} ${
                isCompleted ? "animate-pulse" : ""
              } hover:scale-105 active:scale-95`}
              style={{
                width: cellSize,
                height: cellSize,
                left: `calc(${col} * (${cellSize} + 8px))`,
                top: `calc(${row} * (${cellSize} + 8px))`,
                background: isHint
                  ? "linear-gradient(135deg, #F59E0B, #D97706)"
                  : "linear-gradient(135deg, #8B5CF6, #6366F1)",
                fontSize: size <= 4 ? "24px" : size === 5 ? "20px" : "16px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              }}
            >
              {value}
            </button>
          );
        })}
      </div>
    );
  };

  // 胜利弹窗
  const renderVictoryModal = () => {
    if (gameState !== "completed") return null;

    const score = calculateScore(difficulty, time, moves, MAX_HINTS - hintsLeft);
    const stars = getStarRating(score, difficulty);
    const bestScore = bestScores[difficulty];
    const isBest = bestScore && score >= bestScore.score;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl animate-bounce-in">
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-[#1E293B] mb-2">挑战成功！</h2>
            <p className="text-sm text-[#64748B] mb-6">你的大脑完成了一次精彩的空间推理</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg">
                <span className="text-sm text-[#64748B]">用时</span>
                <span className="font-bold text-[#1E293B]">{formatTime(time)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg">
                <span className="text-sm text-[#64748B]">步数</span>
                <span className="font-bold text-[#1E293B]">{moves}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#F8FAFC] rounded-lg">
                <span className="text-sm text-[#64748B]">难度</span>
                <span className="font-bold text-[#1E293B]">{DIFFICULTY_CONFIG[difficulty].name}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-lg">
                <span className="text-sm text-[#92400E]">本局得分</span>
                <span className="font-bold text-[#92400E] text-lg">{score}</span>
              </div>
            </div>

            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 ${star <= stars ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#E2E8F0]"}`}
                />
              ))}
            </div>

            {isBest && (
              <div className="mb-4 p-3 bg-gradient-to-r from-[#DBEAFE] to-[#BFDBFE] rounded-lg">
                <p className="text-sm font-bold text-[#1E40AF]">🏆 新纪录！</p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold rounded-lg hover:shadow-lg transition-all"
              >
                再来一局
              </button>
              <button
                onClick={() => setShowDifficultySelect(true)}
                className="flex-1 py-3 bg-[#F1F5F9] text-[#475569] font-bold rounded-lg hover:bg-[#E2E8F0] transition-all"
              >
                选择难度
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 难度选择
  const renderDifficultySelect = () => {
    if (!showDifficultySelect) return null;

    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
          <h3 className="text-xl font-bold text-[#1E293B] mb-4 text-center">选择难度</h3>
          <div className="space-y-3">
            {([3, 4, 5, 6] as Difficulty[]).map((diff) => {
              const best = bestScores[diff];
              return (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`w-full p-4 rounded-xl border-2 transition-all ${
                    difficulty === diff ? "border-[#8B5CF6] bg-[#F5F3FF]" : "border-[#E2E8F0] hover:border-[#8B5CF6]/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-bold text-[#1E293B]">{DIFFICULTY_CONFIG[diff].name}</p>
                      <p className="text-xs text-[#64748B]">{DIFFICULTY_CONFIG[diff].description}</p>
                    </div>
                    {best && (
                      <div className="text-right">
                        <p className="text-xs text-[#64748B]">最佳</p>
                        <p className="text-sm font-bold text-[#8B5CF6]">{formatTime(best.time)}</p>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowDifficultySelect(false)}
              className="flex-1 py-3 bg-[#F1F5F9] text-[#475569] font-bold rounded-lg hover:bg-[#E2E8F0] transition-all"
            >
              回到上一步
            </button>
            <button
              onClick={() => {
                setShowDifficultySelect(false);
                startGame();
              }}
              className="flex-1 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              开始游戏
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-[#FEF3C7] via-[#FDE68A] to-[#FEF3C7] relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#8B5CF6] rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-[#F59E0B] rounded-full blur-3xl" />
      </div>

      {/* 顶部栏 */}
      <div className="relative z-10 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1E3A5F] to-[#0F172A]">
        <button
          onClick={onBack}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="flex-1 text-center">
          <h3 className="text-base font-bold text-white">数字华容道</h3>
          <p className="text-[10px] text-white/60">滑动方块，重构秩序</p>
        </div>
        <button
          onClick={toggleSound}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-white" /> : <VolumeX className="w-4 h-4 text-white" />}
        </button>
      </div>

      {/* 游戏信息 */}
      <div className="relative z-10 px-4 py-3">
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-white/80 backdrop-blur rounded-lg p-2 text-center">
            <p className="text-[10px] text-[#64748B]">难度</p>
            <p className="font-bold text-[#1E293B]">{DIFFICULTY_CONFIG[difficulty].name}</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-2 text-center">
            <p className="text-[10px] text-[#64748B]">步数</p>
            <p className="font-bold text-[#1E293B]">{moves}</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-2 text-center">
            <p className="text-[10px] text-[#64748B]">时间</p>
            <p className="font-bold text-[#1E293B]">{formatTime(time)}</p>
          </div>
          <div className="bg-white/80 backdrop-blur rounded-lg p-2 text-center">
            <p className="text-[10px] text-[#64748B]">提示</p>
            <p className="font-bold text-[#1E293B]">{hintsLeft}/{MAX_HINTS}</p>
          </div>
        </div>

        {/* 最佳成绩 */}
        {bestScores[difficulty] && (
          <div className="bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] rounded-lg p-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-[#D97706]" />
              <span className="text-xs font-bold text-[#92400E]">最佳成绩</span>
            </div>
            <div className="flex gap-3 text-xs">
              <span className="text-[#92400E]">
                <Clock className="w-3 h-3 inline mr-1" />
                {formatTime(bestScores[difficulty]!.time)}
              </span>
              <span className="text-[#92400E]">
                <Target className="w-3 h-3 inline mr-1" />
                {bestScores[difficulty]!.moves}步
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 棋盘区域 */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-2">
        {gameState === "paused" ? (
          <div className="text-center">
            <div className="text-6xl mb-4">️</div>
            <p className="text-lg font-bold text-[#1E293B] mb-4">游戏已暂停</p>
            <button
              onClick={togglePause}
              className="px-6 py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold rounded-lg hover:shadow-lg transition-all"
            >
              继续游戏
            </button>
          </div>
        ) : (
          renderBoard()
        )}
      </div>

      {/* 控制按钮 */}
      <div className="relative z-10 px-4 py-3 space-y-2">
        {gameState === "idle" ? (
          <button
            onClick={() => setShowDifficultySelect(true)}
            className="w-full py-3 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-bold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5" />
            开始挑战
          </button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={restartGame}
              className="py-2 bg-white/80 backdrop-blur text-[#475569] font-bold rounded-lg hover:bg-white transition-all flex items-center justify-center"
              title="重新开始"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={useHint}
              disabled={hintsLeft <= 0 || gameState !== "playing"}
              className="py-2 bg-white/80 backdrop-blur text-[#475569] font-bold rounded-lg hover:bg-white transition-all flex items-center justify-center disabled:opacity-50"
              title="提示"
            >
              <Lightbulb className="w-4 h-4" />
            </button>
            <button
              onClick={togglePause}
              className="py-2 bg-white/80 backdrop-blur text-[#475569] font-bold rounded-lg hover:bg-white transition-all flex items-center justify-center"
              title={gameState === "playing" ? "暂停" : "继续"}
            >
              <Pause className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowDifficultySelect(true)}
              className="py-2 bg-white/80 backdrop-blur text-[#475569] font-bold rounded-lg hover:bg-white transition-all flex items-center justify-center"
              title="选择难度"
            >
              <Star className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 脑力训练提示 */}
      <div className="relative z-10 px-4 py-2">
        <div className="bg-white/60 backdrop-blur rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🧠</span>
            <p className="text-xs font-bold text-[#1E293B]">本关训练能力</p>
          </div>
          <div className="flex flex-wrap gap-1 mb-2">
            {["空间推理", "逻辑思维", "空间记忆", "注意力", "问题解决"].map((skill) => (
              <span key={skill} className="px-2 py-0.5 bg-[#8B5CF6]/20 text-[#6366F1] text-[10px] rounded-full">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-[#64748B] leading-relaxed">
            通过不断尝试，你的大脑正在建立更高效的空间规划能力。
          </p>
        </div>
      </div>

      {/* 胜利弹窗 */}
      {renderVictoryModal()}

      {/* 难度选择 */}
      {renderDifficultySelect()}

      {/* 自定义动画 */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
