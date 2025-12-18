/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { GameStatus, RUN_SPEED_BASE, ObjectType } from './types';

interface GameState {
  status: GameStatus;
  score: number;
  lives: number;
  maxLives: number;
  speed: number;
  
  // Time Tracking
  startTime: number;
  endTime: number;
  timeLeft: number;
  timeBonus: number;

  // Vaccine Run Logic
  vaccineCount: number;
  showLevelUpPopup: boolean;
  
  level: number;
  laneCount: number;
  
  // Inventory / Abilities
  hasDoubleJump: boolean;
  hasImmortality: boolean;
  isImmortalityActive: boolean;

  // Tutorial State
  seenObstacles: ObjectType[];

  // --- PERSISTENT STATS ---
  totalScore: number;
  highestLevelReached: number;
  totalVaccinesCollected: number;
  totalPlayTimeSeconds: number;

  // Actions
  startGame: () => void;
  restartGame: () => void;
  takeDamage: () => void;
  addScore: (amount: number) => void;
  collectVaccine: () => void;
  setStatus: (status: GameStatus) => void;
  tick: (delta: number) => void;
  
  activateImmortality: () => void;
  markObstacleSeen: (type: ObjectType) => void;
  updateGlobalStats: () => void;
  resetPersistentStats: () => void;
}

const MAX_VACCINES = 20;
const INITIAL_TIME = 60;
const POINTS_PER_VACCINE = 500;

export const useStore = create<GameState>()(
  persist(
    (set, get) => ({
      status: GameStatus.MENU,
      score: 0,
      lives: 1,
      maxLives: 1,
      speed: 0,
      vaccineCount: 0,
      showLevelUpPopup: false,
      level: 1,
      laneCount: 3, 
      timeLeft: INITIAL_TIME,
      timeBonus: 0,
      
      startTime: 0,
      endTime: 0,
      
      hasDoubleJump: false,
      hasImmortality: false,
      isImmortalityActive: false,
      
      seenObstacles: [],

      // Stats defaults
      totalScore: 0,
      highestLevelReached: 1,
      totalVaccinesCollected: 0,
      totalPlayTimeSeconds: 0,

      startGame: () => set({ 
        status: GameStatus.PLAYING, 
        score: 0, 
        lives: 1, 
        maxLives: 1,
        speed: RUN_SPEED_BASE,
        vaccineCount: 0,
        showLevelUpPopup: false,
        level: 1,
        laneCount: 3,
        timeLeft: INITIAL_TIME,
        timeBonus: 0,
        startTime: Date.now(),
        endTime: 0,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false,
        seenObstacles: []
      }),

      restartGame: () => set({ 
        status: GameStatus.PLAYING, 
        score: 0, 
        lives: 1, 
        maxLives: 1,
        speed: RUN_SPEED_BASE,
        vaccineCount: 0,
        showLevelUpPopup: false,
        level: 1,
        laneCount: 3,
        timeLeft: INITIAL_TIME,
        timeBonus: 0,
        startTime: Date.now(),
        endTime: 0,
        hasDoubleJump: false,
        hasImmortality: false,
        isImmortalityActive: false,
        seenObstacles: []
      }),

      takeDamage: () => {
        const { isImmortalityActive } = get();
        if (isImmortalityActive) return;

        const endTime = Date.now();
        set({ 
          lives: 0, 
          status: GameStatus.GAME_OVER, 
          speed: 0,
          endTime: endTime
        });
        get().updateGlobalStats();
      },

      addScore: (amount) => set((state) => ({ score: state.score + amount })),

      collectVaccine: () => {
        const { vaccineCount, level, speed, timeLeft, score } = get();
        
        const nextCount = vaccineCount + 1;
        let nextSpeed = speed;
        let nextLevel = level;

        if (nextCount > 0 && nextCount % 3 === 0) {
            nextSpeed = speed * 1.08;
            nextLevel = level + 1;
        }

        if (nextCount === 15) {
            set({ showLevelUpPopup: true });
            setTimeout(() => {
                set({ showLevelUpPopup: false });
            }, 3000);
            nextSpeed = nextSpeed * 1.10;
        }

        const currentAccumulatedScore = score + POINTS_PER_VACCINE;
        
        if (nextCount >= MAX_VACCINES) {
          const endTime = Date.now();
          // Final score is accumulated vaccine points + remaining time bonus
          const finalTimeBonus = Math.floor(timeLeft * 100);
          set({
              vaccineCount: nextCount,
              score: currentAccumulatedScore + finalTimeBonus,
              timeBonus: finalTimeBonus,
              status: GameStatus.VICTORY,
              endTime: endTime
          });
          get().updateGlobalStats();
        } else {
          set({ 
            vaccineCount: nextCount,
            speed: nextSpeed,
            level: nextLevel,
            score: currentAccumulatedScore
          });
        }
      },

      tick: (delta) => {
        const state = get();
        if (state.status !== GameStatus.PLAYING) return;
        
        const nextTime = Math.max(0, state.timeLeft - delta);
        if (nextTime <= 0) {
            const endTime = Date.now();
            set({ status: GameStatus.GAME_OVER, timeLeft: 0, speed: 0, endTime });
            state.updateGlobalStats();
        } else {
            set({ timeLeft: nextTime });
        }
      },

      activateImmortality: () => {
          const { hasImmortality, isImmortalityActive } = get();
          if (hasImmortality && !isImmortalityActive) {
              set({ isImmortalityActive: true });
              setTimeout(() => {
                  set({ isImmortalityActive: false });
              }, 5000);
          }
      },

      markObstacleSeen: (type) => set((state) => {
          if (state.seenObstacles.includes(type)) return state;
          return { seenObstacles: [...state.seenObstacles, type] };
      }),

      setStatus: (status) => set({ status }),

      updateGlobalStats: () => {
        const state = get();
        const sessionTimeSeconds = Math.max(0, Math.floor((state.endTime - state.startTime) / 1000));
        
        set((prev) => ({
            totalScore: prev.totalScore + state.score,
            highestLevelReached: Math.max(prev.highestLevelReached, state.level),
            totalVaccinesCollected: prev.totalVaccinesCollected + state.vaccineCount,
            totalPlayTimeSeconds: prev.totalPlayTimeSeconds + sessionTimeSeconds
        }));
      },

      resetPersistentStats: () => set({
        totalScore: 0,
        highestLevelReached: 1,
        totalVaccinesCollected: 0,
        totalPlayTimeSeconds: 0
      })
    }),
    {
      name: 'pcv20-runner-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
          totalScore: state.totalScore,
          highestLevelReached: state.highestLevelReached,
          totalVaccinesCollected: state.totalVaccinesCollected,
          totalPlayTimeSeconds: state.totalPlayTimeSeconds,
          seenObstacles: state.seenObstacles
      }),
    }
  )
);