
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Play, BarChart3, ChevronLeft, Trash2, Trophy, Star, Terminal, Pause, RefreshCcw, Home, FastForward, CheckCircle2, AlertTriangle, HelpCircle, X, ShieldCheck, Zap } from 'lucide-react';
import { useStore, MAX_VACCINES, MILESTONE_VACCINE_COUNT } from '../../store';
import { GameStatus } from '../../types';
import { audio } from '../System/Audio';

export const HUD: React.FC = () => {
  const { 
    score, vaccineCount, status, level, speed, setStatus, timeLeft,
    totalScore, highestLevelReached, showLevelUpPopup, resetPersistentStats,
    startGame, restartGame, togglePause, dismissMilestone
  } = useStore();
  
  const [showTutorial, setShowTutorial] = useState(false);

  const VersionFooter = () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30 pointer-events-none text-center">
        <div className="flex items-center space-x-2 font-mono text-[9px] tracking-[0.2em] text-cyan-800 uppercase">
            <Terminal className="w-2.5 h-2.5" />
            <span>20價大冒險 v1.7.4 | 臨床協議</span>
        </div>
    </div>
  );

  const PauseOverlay = () => (
    <div className="absolute inset-0 z-[800] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in pointer-events-auto">
      <div className="w-full max-sm:w-full max-w-sm bg-white rounded-[3rem] p-8 md:p-10 shadow-2xl text-center">
        <Pause className="w-12 h-12 text-cyan-600 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">任務暫停</h2>
        <div className="grid grid-cols-2 gap-3 mb-10 text-center">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">積分</p>
            <p className="text-xl font-black text-slate-800">{score.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <p className="text-[9px] font-black text-slate-400 uppercase mb-1">疫苗</p>
            <p className="text-xl font-black text-slate-800">{vaccineCount}/{MAX_VACCINES}</p>
          </div>
        </div>
        <button 
          onClick={() => { audio.init(); togglePause(); }}
          className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-3xl shadow-xl active:scale-95 flex items-center justify-center space-x-3"
        >
          <Play className="w-6 h-6 fill-white" />
          <span className="tracking-widest">繼續任務</span>
        </button>
      </div>
    </div>
  );

  if (status === GameStatus.STATS) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[120] bg-slate-950/60 backdrop-blur-xl p-4 pointer-events-auto">
        <div className="w-full max-w-xl bg-white border-2 border-cyan-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStatus(GameStatus.MENU)} className="p-3 text-cyan-600"><ChevronLeft className="w-7 h-7" /></button>
            <h2 className="text-2xl md:text-3xl font-black text-slate-800 uppercase">任務日誌</h2>
            <button onClick={resetPersistentStats} className="p-3 text-red-400"><Trash2 className="w-5 h-5" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center space-x-5">
              <Trophy className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">總得分</p>
                <p className="text-2xl font-black text-slate-800">{totalScore.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center space-x-5">
              <Star className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">最高等級</p>
                <p className="text-2xl font-black text-slate-800">LVL {highestLevelReached}</p>
              </div>
            </div>
          </div>
          <button onClick={() => setStatus(GameStatus.MENU)} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl uppercase">返回基地</button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
    const isVictory = status === GameStatus.VICTORY;
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[500] bg-slate-950/80 backdrop-blur-xl p-4 pointer-events-auto animate-in fade-in duration-500">
        <div className={`relative w-full max-sm:max-w-[90%] max-w-sm bg-white border-t-8 ${isVictory ? 'border-emerald-500' : 'border-rose-500'} rounded-[3rem] p-8 md:p-10 flex flex-col items-center shadow-2xl text-center`}>
          <div className={`w-20 h-20 rounded-3xl ${isVictory ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} flex items-center justify-center mb-6`}>
            {isVictory ? <CheckCircle2 className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
          </div>
          <h2 className={`text-3xl font-black ${isVictory ? 'text-emerald-600' : 'text-rose-600'} uppercase mb-4`}>
            {isVictory ? '任務成功' : '任務失敗'}
          </h2>
          <p className="text-xs md:text-sm font-bold text-slate-500 mb-10">
            {isVictory ? `成功獲得 ${MAX_VACCINES} 劑疫苗 最廣泛保護get！` : `獲取 ${MAX_VACCINES} 劑失敗，請重新嘗試`}
          </p>
          <div className="w-full space-y-4">
            <button onClick={() => { audio.init(); restartGame(); }} className={`w-full py-6 ${isVictory ? 'bg-emerald-600' : 'bg-slate-900'} text-white font-black rounded-3xl shadow-xl flex items-center justify-center space-x-3`}>
              <RefreshCcw className="w-6 h-6" />
              <span className="text-xl uppercase">{isVictory ? '重新開始' : '重新部署'}</span>
            </button>
            <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="w-full py-4 bg-white border border-slate-100 text-slate-400 font-bold rounded-2xl flex items-center justify-center space-x-3">
              <Home className="w-5 h-5" />
              <span className="uppercase text-xs font-black">返回主頁</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-slate-50 p-4 pointer-events-auto">
              <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-[3.5rem] p-8 md:p-14 shadow-2xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh] text-center">
                 <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-none tracking-tighter mb-8">20價大冒險</h1>
                 <div className="w-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 border border-cyan-100 mb-8 shadow-sm">
                    <p className="text-cyan-900 text-sm font-black mb-4">20價肺炎球菌疫苗是現時全港覆蓋最廣泛的結合疫苗，1針長效保護</p>
                    <p className="text-cyan-600 text-[10px] md:text-[11px] font-bold tracking-widest uppercase bg-white/50 py-3 rounded-2xl border border-cyan-200/50 px-2">
                      在游戲中收集 {MAX_VACCINES} 支疫苗，保護自己及家人吧！
                    </p>
                 </div>
                 <div className="w-full space-y-3">
                    <button onClick={() => { audio.init(); startGame(); }} className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-3xl hover:bg-black transition-all shadow-xl flex items-center justify-center uppercase">
                       啟動任務 <Play className="ml-3 w-6 h-6 fill-white" />
                    </button>
                    <button onClick={() => { audio.init(); setStatus(GameStatus.STATS); }} className="w-full py-4 bg-white border border-slate-100 text-slate-500 font-black rounded-2xl uppercase text-xs">
                       任務日誌
                    </button>
                 </div>
                 <VersionFooter />
              </div>
          </div>
      );
  }

  const progressPercent = Math.min(100, (vaccineCount / MAX_VACCINES) * 100);
  const isUltimateStage = vaccineCount >= MILESTONE_VACCINE_COUNT;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-8 z-50">
        {status === GameStatus.PAUSED && <PauseOverlay />}
        {showLevelUpPopup && (
          <div className="absolute inset-0 flex items-center justify-center z-[600] pointer-events-auto bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="w-full max-sm:max-w-[90%] max-w-sm bg-white p-8 rounded-[2.5rem] border-4 border-orange-500 shadow-2xl text-center">
                <ShieldCheck className="w-16 h-16 text-orange-600 mx-auto mb-6" />
                <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-4 uppercase">初步目標達成</h3>
                <p className="text-sm md:text-lg text-slate-700 font-bold mb-8 px-2">
                  20價比15價多30%血清型覆蓋，保護更全面，努力取得最後 {MAX_VACCINES - MILESTONE_VACCINE_COUNT} 支達成升級防禦
                </p>
                <button onClick={() => { audio.init(); dismissMilestone(); }} className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl flex items-center justify-center space-x-3">
                  <span>繼續前進</span>
                  <FastForward className="w-5 h-5" />
                </button>
             </div>
          </div>
        )}
        
        {/* Top Header Section */}
        <div className="flex flex-col w-full space-y-4 md:space-y-6">
            <div className="flex justify-between items-start w-full">
                {/* Score Left */}
                <div className={`text-3xl md:text-6xl font-black tracking-tighter transition-colors ${isUltimateStage ? 'text-red-500' : 'text-slate-900'}`}>
                    {score.toLocaleString()}
                </div>
                
                {/* Timer and Pause Right */}
                <div className="flex items-center space-x-3 pointer-events-auto">
                    <div className={`text-2xl md:text-5xl font-black transition-colors ${timeLeft < 10 ? 'text-red-500 animate-pulse' : (isUltimateStage ? 'text-orange-500' : 'text-slate-900')}`}>
                        {timeLeft.toFixed(1)}<span className="text-xs md:text-xl ml-1 text-slate-400 font-bold">秒</span>
                    </div>
                    <button onClick={() => { audio.init(); togglePause(); }} className="p-2 md:p-4 bg-white/80 border rounded-xl md:rounded-2xl shadow-sm">
                        {status === GameStatus.PAUSED ? <Play className="w-4 h-4 md:w-5 md:h-5 fill-current" /> : <Pause className="w-4 h-4 md:w-5 md:h-5 fill-current" />}
                    </button>
                </div>
            </div>

            {/* Progress Bar Centralized Top */}
            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-md h-2 md:h-3 bg-slate-200/50 rounded-full overflow-hidden shadow-inner border border-white relative">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isUltimateStage ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between w-full max-w-md mt-1 px-1">
                    <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">疫苗進度</span>
                    <span className={`text-[8px] md:text-[10px] font-black ${isUltimateStage ? 'text-red-600' : 'text-cyan-600'}`}>{vaccineCount} / {MAX_VACCINES}</span>
                </div>
            </div>
        </div>

        {/* Bottom Bar Stats */}
        <div className="w-full flex justify-between items-end pb-safe">
             <div className={`bg-white/90 border border-slate-100 px-3 py-1.5 md:px-4 md:py-2 rounded-xl text-[10px] md:text-base font-black ${isUltimateStage ? 'text-red-600' : 'text-slate-900'}`}>
                LEVEL {level}
             </div>
             <div className="bg-white/90 border border-slate-100 px-3 py-1.5 md:px-4 md:py-2 rounded-xl">
                <Zap className={`w-3 h-3 md:w-4 md:h-4 ${isUltimateStage ? 'text-red-500' : 'text-cyan-500'}`} />
             </div>
        </div>
    </div>
  );
};
