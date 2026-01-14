
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
  isMilestonePaused: boolean;
  countdownValue: number;
  
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
  togglePause: () => void;
  dismissMilestone: () => void;
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

export const MAX_VACCINES = 20; 
export const MILESTONE_VACCINE_COUNT = 15; 
const INITIAL_TIME = 50; 
const POINTS_PER_VACCINE = 500;
const SPEED_SCALE_FACTOR_NORMAL = 1.05; 
const SPEED_SCALE_FACTOR_POST_MILESTONE = 1.03; // Tuned for 80% pass rate

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
      isMilestonePaused: false,
      countdownValue: 0,
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

      totalScore: 0,
      highestLevelReached: 1,
      totalVaccinesCollected: 0,
      totalPlayTimeSeconds: 0,

      startGame: () => set({ 
        status: GameStatus.PLAYING, 
        score: 0, 
        lives: 1, 
        speed: 21.0, 
        vaccineCount: 0,
        showLevelUpPopup: false,
        isMilestonePaused: false,
        countdownValue: 0,
        level: 1,
        timeLeft: INITIAL_TIME,
        timeBonus: 0,
        startTime: Date.now(),
        hasDoubleJump: true,
        isImmortalityActive: false,
      }),

      restartGame: () => set({ 
        status: GameStatus.PLAYING, 
        score: 0, 
        lives: 1, 
        speed: 21.0,
        vaccineCount: 0,
        showLevelUpPopup: false,
        isMilestonePaused: false,
        countdownValue: 0,
        level: 1,
        timeLeft: INITIAL_TIME,
        timeBonus: 0,
        startTime: Date.now(),
        hasDoubleJump: true,
        isImmortalityActive: false,
      }),

      togglePause: () => {
        const { status } = get();
        if (status === GameStatus.PLAYING) set({ status: GameStatus.PAUSED });
        else if (status === GameStatus.PAUSED) {
            set({ isMilestonePaused: true, countdownValue: 3 });
            const interval = setInterval(() => {
                const cv = get().countdownValue;
                if (cv > 1) {
                    set({ countdownValue: cv - 1 });
                } else {
                    clearInterval(interval);
                    set({ status: GameStatus.PLAYING, isMilestonePaused: false, countdownValue: 0 });
                }
            }, 800);
        }
      },

      dismissMilestone: () => {
        set({ showLevelUpPopup: false, isMilestonePaused: true, countdownValue: 3 });
        
        const interval = setInterval(() => {
            const cv = get().countdownValue;
            if (cv > 1) {
                set({ countdownValue: cv - 1 });
            } else {
                clearInterval(interval);
                set({ isMilestonePaused: false, countdownValue: 0 });
            }
        }, 800);
      },

      takeDamage: () => {
        const { isImmortalityActive, status, isMilestonePaused, showLevelUpPopup } = get();
        if (isImmortalityActive || status !== GameStatus.PLAYING || isMilestonePaused || showLevelUpPopup) return;

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
        const { vaccineCount, level, speed, timeLeft, score, status } = get();
        if (status !== GameStatus.PLAYING) return;
        
        const nextCount = vaccineCount + 1;
        const currentScale = nextCount > MILESTONE_VACCINE_COUNT ? SPEED_SCALE_FACTOR_POST_MILESTONE : SPEED_SCALE_FACTOR_NORMAL;
        let nextSpeed = speed * currentScale;
        let nextLevel = Math.floor(nextCount / 3) + 1;

        if (nextCount === MILESTONE_VACCINE_COUNT) {
            nextSpeed = nextSpeed * 1.13; // Fixed 13% spike
            set({ showLevelUpPopup: true });
        }

        const currentAccumulatedScore = score + POINTS_PER_VACCINE;
        
        if (nextCount >= MAX_VACCINES) {
          const endTime = Date.now();
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
        if (state.status !== GameStatus.PLAYING || state.showLevelUpPopup || state.isMilestonePaused) return;
        
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
        totalPlayTimeSeconds: 0,
        seenObstacles: []
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
