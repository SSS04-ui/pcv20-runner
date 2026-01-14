
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum GameStatus {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
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

export const LANE_WIDTH = 5.5; // Increased to 5.5 for maximum mobile visibility
export const JUMP_HEIGHT = 2.5;
export const JUMP_DURATION = 0.5;
export const SLIDE_DURATION = 0.6;
export const RUN_SPEED_BASE = 18.0;
export const SPAWN_DISTANCE = 110;
export const REMOVE_DISTANCE = 15;
