'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { GAME_MAP_LEVELS, getLevelConfig } from './game-data';
import { DIALOGUE_DATA } from './dialogue-data';
import { QUIZ_DATA } from './quiz-data';
import { BRAIN_DATA } from './brain-data';
import { MINIGAME_DATA } from './minigame-data';
import { DialogueGame } from './DialogueGame';
import { QuizGame } from './QuizGame';
import { BrainGame } from './BrainGame';
import { MiniGame } from './MiniGame';
import { LearningCards } from './LearningCards';
import { QuizChoice } from './QuizChoice';
import {
  loadTraderRoadProgress,
  saveTraderRoadProgress,
  useTraderRoadProgress,
  type TraderRoadAgentId,
} from '@/lib/trader-road-progress';
import { AGENT_TEAM } from '@/lib/mini-types';

// ===== Map area image + level marker positions =====
interface MapArea {
  id: number;
  image: string;
  levels: number[];
  markers: { levelId: number; left: number; top: number }[];
}

const MAP_AREAS: MapArea[] = [
  {
    id: 1,
    image: '/map-area-1.jpeg',
    levels: [1, 2, 3, 4],
    markers: [
      { levelId: 1, left: 14, top: 72 },
      { levelId: 2, left: 30, top: 48 },
      { levelId: 3, left: 55, top: 52 },
      { levelId: 4, left: 76, top: 24 },
    ],
  },
  {
    id: 2,
    image: '/map-area-2.jpeg',
    levels: [5, 6, 7],
    markers: [
      { levelId: 5, left: 18, top: 62 },
      { levelId: 6, left: 50, top: 42 },
      { levelId: 7, left: 76, top: 28 },
    ],
  },
  {
    id: 3,
    image: '/map-area-3.jpeg',
    levels: [8, 9, 10],
    markers: [
      { levelId: 8, left: 18, top: 56 },
      { levelId: 9, left: 50, top: 36 },
      { levelId: 10, left: 76, top: 20 },
    ],
  },
];

interface GameMapPlayerProps {
  onClose: () => void;
  initialLevelId?: number;
}

export default function GameMapPlayer({ onClose, initialLevelId }: GameMapPlayerProps) {
  const { progress, completeLevel, addCoins, markCardLearned, markQuizCorrect } = useTraderRoadProgress();
  const [activeLevelId, setActiveLevelId] = useState<number | null>(initialLevelId ?? null);
  const [showAgentUnlock, setShowAgentUnlock] = useState<string | null>(null);
  const [earnedCoins, setEarnedCoins] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && initialLevelId) {
      const area = MAP_AREAS.findIndex((a) => a.levels.includes(initialLevelId));
      if (area >= 0) {
        scrollRef.current.scrollLeft = area * scrollRef.current.clientWidth;
      }
    }
  }, [initialLevelId]);

  const handleLevelComplete = useCallback(
    (levelId: number, coins: number) => {
      const config = getLevelConfig(levelId);
      if (!config) return;

      completeLevel(levelId);
      if (coins > 0) addCoins(coins);
      setEarnedCoins((prev) => prev + coins);

      if (config.unlockAgents && config.unlockAgents.length > 0) {
        setShowAgentUnlock(config.unlockAgents[0]);
      }
      setActiveLevelId(null);
    },
    [completeLevel, addCoins]
  );

  const handleLevelClick = useCallback(
    (levelId: number) => {
      if (levelId > progress.currentLevel) return;
      setActiveLevelId(levelId);
    },
    [progress.currentLevel]
  );

  const handleBackToMap = useCallback(() => {
    setActiveLevelId(null);
    setShowAgentUnlock(null);
  }, []);

  // ===== Game rendering =====
  const renderGame = () => {
    if (!activeLevelId) return null;
    const config = getLevelConfig(activeLevelId);
    if (!config) return null;

    const onDone = (coins: number) => handleLevelComplete(activeLevelId, coins);

    switch (config.type) {
      case 'dialogue':
        return (
          <DialogueGame
            data={DIALOGUE_DATA[activeLevelId]}
            onComplete={(passed: boolean) => onDone(passed ? 20 : 5)}
          />
        );
      case 'quiz':
        return (
          <QuizGame
            data={QUIZ_DATA[activeLevelId]}
            onComplete={(passed: boolean) => onDone(passed ? 20 : 5)}
          />
        );
      case 'brain':
        return (
          <BrainGame
            data={BRAIN_DATA[activeLevelId]}
            onComplete={(passed: boolean) => onDone(passed ? 20 : 5)}
          />
        );
      case 'minigame':
        return (
          <MiniGame
            data={MINIGAME_DATA[activeLevelId]}
            onComplete={(passed: boolean) => onDone(passed ? 20 : 5)}
          />
        );
      case 'learning': {
        const cardIndices = (config as any).learningCardIndices || [0,1,2,3,4,5,6,7,8,9];
        return (
          <LearningCards
            cardIndices={cardIndices}
            learnedCards={progress.learnedCards || []}
            onCardLearned={(cardId: number) => {
              markCardLearned(cardId);
              addCoins(5);
            }}
            onComplete={() => onDone(0)}
            onClose={handleBackToMap}
          />
        );
      }
      case 'quiz_choice': {
        const qIndices = (config as any).quizQuestionIndices || [0,1,2,3,4,5,6,7,8,9];
        return (
          <QuizChoice
            questionIndices={qIndices}
            correctQuizIds={progress.correctQuizIds || []}
            onQuizCorrect={(quizId: number) => {
              markQuizCorrect(quizId);
              addCoins(10);
            }}
            onComplete={() => onDone(0)}
            onClose={handleBackToMap}
          />
        );
      }
      default:
        return null;
    }
  };

  // ===== Level marker on map =====
  const renderMarker = (levelId: number, left: number, top: number) => {
    const config = getLevelConfig(levelId);
    if (!config) return null;

    const isCompleted = progress.completedLevels.includes(levelId);
    const isUnlocked = levelId <= progress.currentLevel;
    const isCurrent = levelId === progress.currentLevel;

    let markerStyle = '';
    let icon = '';

    if (isCompleted) {
      markerStyle = 'bg-[#059669] border-[#059669] shadow-[0_0_12px_rgba(5,150,105,0.5)]';
      icon = '✓';
    } else if (isUnlocked) {
      markerStyle = isCurrent
        ? 'bg-[#3B82F6] border-[#3B82F6] shadow-[0_0_16px_rgba(59,130,246,0.6)] animate-pulse'
        : 'bg-white border-[#3B82F6] shadow-[0_0_8px_rgba(59,130,246,0.3)]';
      icon = isCurrent ? '▶' : String(levelId);
    } else {
      markerStyle = 'bg-[#94A3B8] border-[#94A3B8] opacity-60';
      icon = '';
    }

    return (
      <button
        key={levelId}
        onClick={() => handleLevelClick(levelId)}
        disabled={!isUnlocked}
        className={`absolute flex items-center justify-center rounded-full border-2 font-bold transition-all duration-200 ${markerStyle} ${
          isUnlocked && !isCompleted ? 'hover:scale-125 active:scale-95 cursor-pointer' : ''
        } ${!isUnlocked ? 'cursor-not-allowed' : ''}`}
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: isCompleted ? 36 : 40,
          height: isCompleted ? 36 : 40,
          fontSize: isCompleted ? 16 : 14,
          transform: 'translate(-50%, -50%)',
          color: isCompleted ? '#fff' : isUnlocked ? '#1E293B' : '#fff',
        }}
        title={config.title}
      >
        {icon}
        <span
          className="absolute whitespace-nowrap text-[10px] font-medium"
          style={{
            top: '100%',
            marginTop: 4,
            color: isUnlocked ? '#1E293B' : '#94A3B8',
            textShadow: '0 1px 2px rgba(255,255,255,0.8)',
          }}
        >
          {config.title}
        </span>
      </button>
    );
  };

  // ===== Active game overlay =====
  if (activeLevelId) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#F5F5F7]">
        {renderGame()}
        {showAgentUnlock && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-sm rounded-xl border border-[#E2E8F0] bg-white p-6 text-center shadow-lg">
              <div className="mb-3 text-4xl"></div>
              <div className="mb-1 text-lg font-bold text-[#1E293B]">恭喜解锁新 Agent！</div>
              <div className="mb-1 text-2xl font-bold text-[#3B82F6]">
                {AGENT_TEAM.find((a) => a.role === showAgentUnlock)?.name || showAgentUnlock}
              </div>
              <div className="mb-4 text-sm text-[#64748B]">
                {AGENT_TEAM.find((a) => a.role === showAgentUnlock)?.role || ''}
              </div>
              {earnedCoins > 0 && (
                <div className="mb-4 text-sm text-[#D97706]">
                  本次获得 +{earnedCoins} 炒币 🪙
                </div>
              )}
              <button
                onClick={() => {
                  setShowAgentUnlock(null);
                  handleBackToMap();
                }}
                className="w-full rounded-lg bg-[#3B82F6] py-2.5 text-sm font-semibold text-white"
              >
                继续探索
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===== Map view with horizontal scroll =====
  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#F5F5F7]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-3">
        <button onClick={onClose} className="flex items-center gap-1 text-sm text-[#64748B]">
          <span>←</span>
          <span>返回</span>
        </button>
        <h2 className="text-base font-bold text-[#1E293B]">金融华二街</h2>
        <div className="flex items-center gap-1 text-sm text-[#D97706]">
          <span>🪙</span>
          <span className="font-mono font-bold">{progress.coins || 0}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="border-b border-[#E2E8F0] bg-white px-4 py-2">
        <div className="flex items-center justify-between text-xs text-[#64748B]">
          <span>进度 {progress.completedLevels.length}/{GAME_MAP_LEVELS.length}</span>
          <span>
            已解锁 {progress.unlockedAgents.filter((id: string) => id !== 'lead').length}/
            {GAME_MAP_LEVELS.filter((l) => l.unlockAgents && l.unlockAgents.length > 0).length} Agent
          </span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-[#E2E8F0]">
          <div
            className="h-full rounded-full bg-[#3B82F6] transition-all duration-500"
            style={{ width: `${(progress.completedLevels.length / GAME_MAP_LEVELS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Map areas - horizontal scroll */}
      <div
        ref={scrollRef}
        className="flex flex-1 overflow-x-auto"
        style={{ scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}
      >
        {MAP_AREAS.map((area, idx) => (
          <div key={area.id} className="relative flex-shrink-0 snap-center" style={{ width: '100%', height: '100%' }}>
            <img
              src={area.image}
              alt={`金融华二街 区域${area.id}`}
              className="h-full w-full object-cover"
              draggable={false}
            />
            <div className="absolute inset-0">
              {area.markers.map((m) => renderMarker(m.levelId, m.left, m.top))}
            </div>
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {MAP_AREAS.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all ${i === idx ? 'w-6 bg-[#3B82F6]' : 'w-2 bg-white/60'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="border-t border-[#E2E8F0] bg-white px-4 py-2">
        <div className="flex items-center justify-center gap-4 text-[10px] text-[#64748B]">
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-[#059669]" /> 已完成
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-[#3B82F6]" /> 可挑战
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded-full bg-[#94A3B8]" /> 未解锁
          </span>
        </div>
      </div>
    </div>
  );
}
