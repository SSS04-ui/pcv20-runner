
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Play, BarChart3, ChevronLeft, Trash2, Trophy, Star, Terminal, Pause, RefreshCcw, Home, FastForward, CheckCircle2, AlertTriangle, HelpCircle, X, ShieldCheck, Info, Zap } from 'lucide-react';
import { useStore, MAX_VACCINES, MILESTONE_VACCINE_COUNT } from './store';
import { GameStatus } from './types';
import { audio } from './components/System/Audio';

export const HUD: React.FC = () => {
  const { 
    score, vaccineCount, status, level, speed, setStatus, timeLeft,
    totalScore, highestLevelReached, showLevelUpPopup, resetPersistentStats,
    startGame, restartGame, togglePause, dismissMilestone
  } = useStore();
  
  const [showTutorial, setShowTutorial] = useState(false);

  const VersionFooter = () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30 pointer-events-none">
        <div className="flex items-center space-x-2 font-mono text-[9px] tracking-[0.2em] text-cyan-800 uppercase">
            <Terminal className="w-2.5 h-2.5" />
            <span>20價大冒險 v1.7.2 | 臨床協議</span>
        </div>
    </div>
  );

  const PauseOverlay = () => (
    <div className="absolute inset-0 z-[800] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300 pointer-events-auto">
      <div className="w-full max-sm:w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl border-b-8 border-cyan-500 relative overflow-hidden flex flex-col items-center">
        <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600 mb-6 shadow-inner">
          <Pause className="w-8 h-8 fill-current" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">任務暫停</h2>
        <div className="w-full grid grid-cols-2 gap-3 mb-10">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">積分累計</p>
            <p className="text-xl font-black text-slate-800">{score.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">疫苗進度</p>
            <p className="text-xl font-black text-slate-800">{vaccineCount}/{MAX_VACCINES}</p>
          </div>
        </div>
        <button 
          onClick={() => { audio.init(); togglePause(); }}
          className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-3xl hover:bg-black transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3 group"
        >
          <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
          <span className="tracking-widest">繼續任務</span>
        </button>
      </div>
    </div>
  );

  if (status === GameStatus.STATS) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[120] bg-slate-950/60 backdrop-blur-xl p-4 pointer-events-auto">
        <div className="w-full max-w-xl bg-white border-2 border-cyan-100 rounded-[2.5rem] p-8 md:p-12 shadow-2xl flex flex-col animate-in zoom-in-95 fade-in duration-300">
          <div className="flex items-center justify-between mb-8">
            <button onClick={() => setStatus(GameStatus.MENU)} className="p-3 hover:bg-cyan-50 rounded-full transition-colors text-cyan-600">
              <ChevronLeft className="w-7 h-7" />
            </button>
            <h2 className="text-3xl font-black text-slate-800 tracking-tighter text-center uppercase">任務日誌</h2>
            <button onClick={resetPersistentStats} className="p-3 hover:bg-red-50 rounded-full transition-colors text-red-400">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center space-x-5">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 shadow-sm"><Trophy className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">總得分</p>
                <p className="text-2xl font-black text-slate-800">{totalScore.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 flex items-center space-x-5">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shadow-sm"><Star className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">最高等級</p>
                <p className="text-2xl font-black text-slate-800">LVL {highestLevelReached}</p>
              </div>
            </div>
          </div>
          <button onClick={() => setStatus(GameStatus.MENU)} className="w-full py-5 bg-slate-900 text-white font-black text-lg rounded-2xl hover:bg-black transition-all shadow-xl active:scale-[0.98] uppercase tracking-widest">返回基地</button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
    const isVictory = status === GameStatus.VICTORY;
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[500] bg-slate-950/80 backdrop-blur-xl p-4 pointer-events-auto animate-in fade-in duration-500">
        <div className={`relative w-full max-w-sm bg-white border-t-8 ${isVictory ? 'border-emerald-500' : 'border-rose-500'} rounded-[3rem] p-10 flex flex-col items-center shadow-2xl animate-in slide-in-from-bottom-12 duration-700`}>
          <div className={`w-24 h-24 rounded-3xl ${isVictory ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} flex items-center justify-center mb-6 shadow-sm rotate-3 animate-bounce`}>
            {isVictory ? <CheckCircle2 className="w-14 h-14" /> : <AlertTriangle className="w-14 h-14" />}
          </div>
          <div className="text-center mb-10">
            <h2 className={`text-4xl font-black ${isVictory ? 'text-emerald-600' : 'text-rose-600'} tracking-tighter uppercase leading-none`}>
              {isVictory ? '任務成功' : '任務失敗'}
            </h2>
            <div className="text-sm font-bold text-slate-500 mt-4 leading-relaxed bg-slate-50 px-6 py-4 rounded-2xl border border-slate-100 shadow-inner">
              {isVictory ? `成功獲得 ${MAX_VACCINES} 劑疫苗 最廣泛保護get！` : `獲取 ${MAX_VACCINES} 劑失敗，請重新嘗試`}
            </div>
          </div>
          <div className="w-full space-y-4">
            <button onClick={() => { audio.init(); restartGame(); }} className={`w-full group py-6 ${isVictory ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-black'} text-white font-black rounded-3xl transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3`}>
              <RefreshCcw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-xl tracking-widest uppercase">{isVictory ? '重新開始' : '重新部署'}</span>
            </button>
            <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="w-full py-4 bg-white border-2 border-slate-100 text-slate-400 font-bold rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center space-x-3 active:scale-95">
              <Home className="w-5 h-5" />
              <span className="tracking-widest uppercase text-xs font-black">返回主頁</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-slate-50 p-4 pointer-events-auto overflow-hidden">
              <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-[3.5rem] p-8 md:p-14 shadow-2xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[90vh]">
                 <div className="flex flex-col items-center">
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-none tracking-tighter">20價大冒險</h1>
                        <div className="h-2 w-24 bg-cyan-500 mx-auto mt-6 rounded-full shadow-[0_0_15px_rgba(8,165,233,0.5)]"></div>
                    </div>
                    <div className="w-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-3xl p-6 border border-cyan-100 mb-8 text-center shadow-sm">
                        <div className="text-cyan-900 text-sm font-black leading-relaxed mb-4">
                          <p>20價肺炎球菌疫苗是現時全港覆蓋最廣泛的結合疫苗，1針長效保護</p>
                        </div>
                        <p className="text-cyan-600 text-[10px] md:text-[11px] font-bold tracking-widest uppercase bg-white/50 py-3 rounded-2xl border border-cyan-200/50">
                          在游戲中收集 {MAX_VACCINES} 支疫苗，保護自己及家人吧！
                        </p>
                    </div>
                    <div className="w-full space-y-3">
                        <button onClick={() => { audio.init(); startGame(); }} className="w-full group relative py-6 bg-slate-900 text-white font-black text-xl rounded-3xl hover:bg-black transition-all shadow-xl active:scale-[0.98] flex items-center justify-center tracking-widest uppercase overflow-hidden">
                           啟動任務 <Play className="ml-3 w-6 h-6 fill-white group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button onClick={() => { audio.init(); setStatus(GameStatus.STATS); }} className="w-full py-4 bg-white border border-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-all flex items-center justify-center tracking-widest uppercase text-xs group">
                           任務日誌
                        </button>
                    </div>
                 </div>
                 <VersionFooter />
              </div>
          </div>
      );
  }

  const progressPercent = Math.min(100, (vaccineCount / MAX_VACCINES) * 100);
  const isUltimateStage = vaccineCount >= MILESTONE_VACCINE_COUNT;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-12 z-50">
        {status === GameStatus.PAUSED && <PauseOverlay />}
        {showLevelUpPopup && (
          <div className="absolute inset-0 flex items-center justify-center z-[600] pointer-events-auto bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
             <div className="w-full max-sm:w-full max-w-sm bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-orange-500 shadow-2xl text-center transform animate-in zoom-in slide-in-from-bottom-8 duration-500">
                <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner animate-pulse">
                   <ShieldCheck className="w-12 h-12 text-orange-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">初步目標達成</h3>
                <p className="text-slate-700 font-bold text-lg leading-relaxed mb-8">
                  20價比15價多30%血清型覆蓋，保護更全面，努力取得最後 {MAX_VACCINES - MILESTONE_VACCINE_COUNT} 支達成升級防禦
                </p>
                <button onClick={() => { audio.init(); dismissMilestone(); }} className="w-full py-5 bg-orange-500 hover:bg-orange-600 text-white font-black text-xl rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center space-x-3 group">
                  <span>繼續前進</span>
                  <FastForward className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
        )}

        <div className="flex justify-between items-start w-full">
            <div className="flex flex-col animate-in slide-in-from-left-4 duration-500">
                <div className={`text-3xl md:text-7xl font-black tracking-tighter transition-colors ${isUltimateStage ? 'text-red-500' : 'text-slate-900'}`}>
                    {score.toLocaleString()}
                </div>
            </div>
            <div className="flex items-center space-x-3 pointer-events-auto animate-in slide-in-from-right-4 duration-500">
                <div className={`text-3xl md:text-6xl font-black transition-colors ${timeLeft < 10 ? 'text-red-500 animate-pulse' : (isUltimateStage ? 'text-orange-500' : 'text-slate-900')}`}>
                    {timeLeft.toFixed(1)}<span className="text-sm md:text-2xl ml-1 text-slate-400 font-bold">秒</span>
                </div>
                <button onClick={() => { audio.init(); togglePause(); }} className={`p-3 md:p-5 bg-white/80 backdrop-blur-md border rounded-[1rem] md:rounded-[1.5rem] transition-all active:scale-90 shadow-xl group ${status === GameStatus.PAUSED ? 'bg-cyan-500 border-cyan-500 text-white' : (isUltimateStage ? 'text-red-600 border-red-100' : 'text-slate-800 hover:text-cyan-600 border-slate-200')}`}>
                    {status === GameStatus.PAUSED ? <Play className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" />}
                </button>
            </div>
        </div>
        
        <div className="absolute top-[35%] md:top-64 left-1/2 transform -translate-x-1/2 flex flex-col items-center w-full max-w-sm px-8 animate-in fade-in duration-700">
             <div className="w-full h-2.5 md:h-3 bg-slate-200/50 rounded-full overflow-hidden shadow-inner relative border border-white">
                 <div className={`h-full rounded-full transition-all duration-1000 ease-out shadow-lg ${isUltimateStage ? 'bg-red-500 shadow-red-300' : 'bg-cyan-500 shadow-cyan-300'}`} style={{ width: `${progressPercent}%` }} />
             </div>
             <div className="flex justify-between w-full mt-2 px-1">
                <span className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">疫苗進度</span>
                <span className={`text-[9px] md:text-[11px] font-black uppercase tracking-[0.2em] transition-colors ${isUltimateStage ? 'text-red-600' : 'text-cyan-600'}`}>{vaccineCount} / {MAX_VACCINES}</span>
             </div>
        </div>

        <div className="w-full flex justify-between items-end animate-in slide-in-from-bottom-4 duration-500 pb-safe">
             <div className="bg-white/90 backdrop-blur-sm border border-slate-100 px-4 py-2 rounded-xl md:rounded-2xl shadow-xl flex flex-col">
                <span className={`text-xs md:text-base font-black transition-colors ${isUltimateStage ? 'text-red-600' : 'text-slate-900'}`}>LEVEL {level}</span>
             </div>
             <div className="bg-white/90 backdrop-blur-sm border border-slate-100 px-4 py-2 rounded-xl md:rounded-2xl shadow-xl flex items-center space-x-2">
                 <div className="w-8 h-8 rounded-lg flex items-center justify-center ${isUltimateStage ? 'bg-red-50' : 'bg-cyan-50'}">
                    <Zap className={`w-4 h-4 ${isUltimateStage ? 'text-red-500' : 'text-cyan-500'} ${speed > 35 ? 'animate-bounce' : 'animate-pulse'}`} />
                 </div>
             </div>
        </div>
    </div>
  );
};
