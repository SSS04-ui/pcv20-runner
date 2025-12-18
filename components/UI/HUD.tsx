
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import React, { useState, useEffect } from 'react';
import { Heart, Zap, MapPin, Play, Target, Rocket, Shield, Syringe, Star, Clock, ArrowUp, ArrowDown, BarChart3, ChevronLeft, Trash2, Trophy } from 'lucide-react';
import { useStore } from '../../store';
import { GameStatus, RUN_SPEED_BASE } from '../../types';
import { audio } from '../System/Audio';

export const HUD: React.FC = () => {
  const { 
    score, vaccineCount, status, level, speed, showLevelUpPopup, setStatus, timeLeft, timeBonus,
    totalScore, highestLevelReached, totalVaccinesCollected, totalPlayTimeSeconds, resetPersistentStats,
    startGame, isImmortalityActive 
  } = useStore();
  
  const formatTime = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    return [hrs, mins, secs].map(v => v < 10 ? "0" + v : v).join(":");
  };

  const containerClass = "absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50";

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/80 backdrop-blur-sm p-4 pointer-events-auto">
              <div className="relative w-full max-w-md rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,255,255,0.2)] border border-white/10 animate-in zoom-in-95 duration-500 bg-[#050011]">
                 <div className="absolute inset-0 bg-gradient-to-br from-cyan-950/20 via-transparent to-purple-950/20"></div>
                 <div className="relative z-10 flex flex-col items-center p-6 pt-8 min-h-[420px]">
                    <div className="mb-6 text-center">
                        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 font-cyber drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] leading-none">PCV20</h1>
                        <h1 className="text-3xl md:text-4xl font-bold text-white font-cyber tracking-[0.2em] mt-1 drop-shadow-lg">RUNNER</h1>
                    </div>
                    <div className="w-full bg-white/5 backdrop-blur-md rounded-xl p-5 border border-white/10 mb-auto shadow-lg">
                        <h3 className="text-cyan-400 font-bold text-xs tracking-[0.2em] mb-3 border-b border-white/10 pb-2">MISSION OBJECTIVES</h3>
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-200 text-sm">
                                <div className="w-6 h-6 rounded bg-cyan-500/20 flex items-center justify-center mr-3 border border-cyan-500/30"><Syringe className="w-3.5 h-3.5 text-cyan-400" /></div>
                                <span>Collect <span className="text-cyan-300 font-bold">20 VACCINES</span> in 1 minute</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-xs">
                             <span className="text-gray-400 uppercase tracking-wider font-semibold">Controls</span>
                             <div className="flex items-center space-x-3 text-white font-mono">
                                 <span>WASD / Swipes</span>
                             </div>
                        </div>
                    </div>
                    <div className="w-full flex space-x-3 mt-6">
                        <button onClick={() => { audio.init(); setStatus(GameStatus.STATS); }} className="flex-1 px-4 py-4 bg-white/5 backdrop-blur-md text-cyan-400 font-bold rounded-xl hover:bg-white/10 transition-all border border-white/10 flex items-center justify-center"><BarChart3 className="w-5 h-5 mr-2" /> STATS</button>
                        <button onClick={() => { audio.init(); startGame(); }} className="flex-[2] group relative px-6 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black text-xl rounded-xl hover:scale-[1.02] transition-all shadow-[0_0_20px_rgba(0,255,255,0.3)] overflow-hidden border border-white/10">
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            <span className="relative z-10 flex items-center justify-center tracking-widest">START <Play className="ml-2 w-5 h-5 fill-white" /></span>
                        </button>
                    </div>
                 </div>
              </div>
          </div>
      );
  }

  if (status === GameStatus.STATS) {
    return (
        <div className="absolute inset-0 flex items-center justify-center z-[100] bg-black/90 backdrop-blur-md p-4 pointer-events-auto">
            <div className="w-full max-w-lg bg-[#0a051a] rounded-3xl border border-cyan-500/30 p-6 md:p-8 animate-in zoom-in-95 duration-300 shadow-[0_0_40px_rgba(0,255,255,0.15)]">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setStatus(GameStatus.MENU)} className="p-2 rounded-full hover:bg-white/10 text-cyan-400 transition-colors"><ChevronLeft className="w-8 h-8" /></button>
                    <h2 className="text-3xl font-black text-white font-cyber tracking-widest">STATISTICS</h2>
                    <div className="w-10"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                        <Trophy className="w-6 h-6 text-yellow-400 mb-2" /><span className="text-gray-400 text-[10px] tracking-widest uppercase mb-1">Total Score</span><span className="text-xl font-bold text-white">{totalScore.toLocaleString()}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                        <Star className="w-6 h-6 text-purple-400 mb-2" /><span className="text-gray-400 text-[10px] tracking-widest uppercase mb-1">Best Level</span><span className="text-xl font-bold text-white">{highestLevelReached}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                        <Syringe className="w-6 h-6 text-cyan-400 mb-2" /><span className="text-gray-400 text-[10px] tracking-widest uppercase mb-1">Total Vaccines</span><span className="text-xl font-bold text-white">{totalVaccinesCollected}</span>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center">
                        <Clock className="w-6 h-6 text-green-400 mb-2" /><span className="text-gray-400 text-[10px] tracking-widest uppercase mb-1">Time Played</span><span className="text-xl font-bold text-white">{formatTime(totalPlayTimeSeconds)}</span>
                    </div>
                </div>
                <div className="flex flex-col items-center">
                    <button onClick={() => { if(confirm("Permanently wipe all save data?")) resetPersistentStats(); }} className="text-red-500/50 hover:text-red-500 text-xs flex items-center transition-colors uppercase tracking-[0.2em]"><Trash2 className="w-4 h-4 mr-2" /> Reset All Data</button>
                </div>
            </div>
        </div>
    );
  }

  if (status === GameStatus.GAME_OVER) {
      return (
          <div className="absolute inset-0 bg-black/90 z-[100] text-white pointer-events-auto backdrop-blur-sm overflow-y-auto">
              <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-[0_0_10px_rgba(255,0,0,0.8)] font-cyber text-center">GAME OVER</h1>
                <div className="grid grid-cols-1 gap-3 md:gap-4 text-center mb-8 w-full max-w-md">
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-cyan-400 text-sm md:text-base"><Syringe className="mr-2 w-4 h-4 md:w-5 md:h-5"/> VACCINES</div>
                        <div className="text-xl md:text-2xl font-bold font-mono text-white">{vaccineCount} / 20</div>
                    </div>
                    <div className="bg-gray-900/80 p-3 md:p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                        <div className="flex items-center text-yellow-400 text-sm md:text-base"><Trophy className="mr-2 w-4 h-4 md:w-5 md:h-5"/> SCORE</div>
                        <div className="text-xl md:text-2xl font-bold font-mono text-white">{score.toLocaleString()}</div>
                    </div>
                </div>
                <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="px-8 md:px-10 py-3 md:py-4 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20">MAIN MENU</button>
              </div>
          </div>
      );
  }

  if (status === GameStatus.VICTORY) {
    const vaccineScore = vaccineCount * 500;
    return (
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/90 to-black/95 z-[100] text-white pointer-events-auto backdrop-blur-md overflow-y-auto">
            <div className="flex flex-col items-center justify-center min-h-full py-8 px-4">
                <Rocket className="w-16 h-16 md:w-24 md:h-24 text-yellow-400 mb-4 animate-bounce drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]" />
                <h1 className="text-3xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-500 to-pink-500 mb-2 drop-shadow-[0_0_20px_rgba(255,165,0,0.6)] font-cyber text-center leading-tight">MISSION COMPLETE</h1>
                <p className="text-cyan-300 text-sm md:text-2xl font-mono mb-8 tracking-widest text-center">PCV20 SECURED</p>
                
                <div className="flex flex-col space-y-4 w-full max-w-md mb-8">
                    <div className="bg-black/60 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                        <span className="text-gray-400 text-xs md:text-sm tracking-widest uppercase">Vaccine Score</span>
                        <span className="text-xl md:text-2xl font-bold text-white">{vaccineScore.toLocaleString()}</span>
                    </div>
                    <div className="bg-black/60 p-4 rounded-xl border border-white/10 flex justify-between items-center">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs md:text-sm tracking-widest uppercase">Time Bonus</span>
                            <span className="text-[10px] text-gray-500 font-mono">({timeLeft.toFixed(1)}s × 100)</span>
                        </div>
                        <span className="text-xl md:text-2xl font-bold text-cyan-400">+{timeBonus.toLocaleString()}</span>
                    </div>
                    <div className="bg-yellow-500/10 p-6 rounded-xl border border-yellow-500/50 shadow-[0_0_25px_rgba(255,215,0,0.2)] flex flex-col items-center">
                        <span className="text-yellow-500 text-xs font-black tracking-[0.3em] uppercase mb-2">Total Score</span>
                        <div className="text-4xl md:text-5xl font-black font-cyber text-yellow-400 drop-shadow-[0_0_10px_rgba(255,215,0,0.5)]">{score.toLocaleString()}</div>
                    </div>
                </div>

                <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="px-8 md:px-12 py-4 md:py-5 bg-white text-black font-black text-lg md:text-xl rounded hover:scale-105 transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] tracking-widest">MAIN MENU</button>
            </div>
        </div>
    );
  }

  const progressPercent = Math.min(100, (vaccineCount / 20) * 100);

  return (
    <div className={containerClass}>
        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col">
                <div className="text-3xl md:text-5xl font-bold text-white drop-shadow-[0_0_10px_#ffffff] tracking-[0.2em]">
                    {score.toLocaleString()}
                </div>
            </div>
            {/* Timer */}
            <div className={`text-2xl md:text-4xl font-black font-mono transition-colors ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                {timeLeft.toFixed(1)}s
            </div>
        </div>
        
        <div className="absolute top-36 md:top-48 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full max-w-lg px-4">
             <div className="flex items-center space-x-2 text-white mb-2 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">
                 <Syringe className="w-4 h-4 md:w-5 md:h-5" />
                 <span className="text-sm md:text-base font-bold tracking-[0.2em]">VACCINES: {vaccineCount} / 20</span>
             </div>
             <div className="w-full h-3 md:h-4 bg-gray-900/80 border border-gray-700 rounded-full overflow-hidden shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                 <div className="h-full bg-gradient-to-r from-white to-gray-400 shadow-[0_0_15px_rgba(255,255,255,0.6)] transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
             </div>
        </div>

        {showLevelUpPopup && (
            <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-[80] animate-in slide-in-from-top duration-500">
                <div className="bg-black/80 backdrop-blur-md border border-yellow-400/50 rounded-full px-8 py-3 flex items-center shadow-[0_0_30px_rgba(255,215,0,0.4)]">
                    <Star className="w-6 h-6 text-yellow-400 mr-3 animate-spin-slow" />
                    <div className="flex flex-col items-start">
                        <h2 className="text-xl font-black text-yellow-400 font-cyber leading-none">LEVEL UP</h2>
                        <span className="text-yellow-200/80 text-[10px] font-mono tracking-widest leading-none mt-1">FINAL STAGE</span>
                    </div>
                </div>
            </div>
        )}

        <div className="w-full flex justify-between items-end">
             <div className="text-white font-mono text-xs md:text-sm">LEVEL {level}</div>
             <div className="flex items-center space-x-2 text-white opacity-70">
                 <Zap className="w-4 h-4 md:w-6 md:h-6 animate-pulse" />
                 <span className="font-mono text-base md:text-xl">SPEED {Math.round((speed / RUN_SPEED_BASE) * 100)}%</span>
             </div>
        </div>
    </div>
  );
};
