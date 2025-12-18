/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  VICTORY = 'VICTORY',
  STATS = 'STATS'
}

export enum ObjectType {
  OBSTACLE = 'OBSTACLE', // Jumpable (Bacteria)
  HIGH_BARRIER = 'HIGH_BARRIER', // Slideable (Floating Bacteria)
  VACCINE = 'VACCINE'
}

export interface GameObject {
  id: string;
  type: ObjectType;
  position: [number, number, number]; // x, y, z
  active: boolean;
  color?: string;
  speedMultiplier?: number; 
  // For dynamic movement
  initialY?: number;
  bobPhase?: number;
  
  // Tutorial
  showTutorial?: boolean;
  
  // Final Vaccine Special Effect
  isFinalVaccine?: boolean;
}

export const LANE_WIDTH = 2.2;
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.6; // seconds
export const SLIDE_DURATION = 0.7; // seconds
export const RUN_SPEED_BASE = 21.0; // Refined for ~60% completion rate
export const SPAWN_DISTANCE = 120;
export const REMOVE_DISTANCE = 20; // Behind player