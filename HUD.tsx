
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Play, BarChart3, ChevronLeft, Trash2, Trophy, Star, Terminal, Pause, RefreshCcw, Home, FastForward, CheckCircle2, AlertTriangle, HelpCircle, X, ShieldCheck, Zap, Info } from 'lucide-react';
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
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const VersionFooter = () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30 pointer-events-none text-center px-4">
        <div className="flex items-center space-x-2 font-mono text-[8px] md:text-[9px] tracking-[0.2em] text-cyan-800 uppercase">
            <Terminal className="w-2 h-2 md:w-2.5 md:h-2.5" />
            <span>20價大冒險 v1.8.6 | 臨床協議</span>
        </div>
    </div>
  );

  const DisclaimerModal = () => (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="relative w-full max-w-sm md:max-w-md lg:max-w-lg bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl border-t-8 border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        <button 
          onClick={() => setShowDisclaimer(false)} 
          className="absolute top-4 right-4 md:top-8 md:right-8 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        
        <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
                <Info className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">參考資料及聲明</h3>
        </div>

        <div className="overflow-y-auto pr-2 space-y-6 text-slate-600 leading-relaxed text-sm md:text-base scrollbar-thin">
            <section>
                <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">References</h4>
                <ul className="text-[11px] md:text-[13px] space-y-3 list-decimal ml-4 font-medium text-slate-600">
                    <li className="pl-1">
                      <a href="https://www.chp.gov.hk/en/features/100770.html" target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline break-all">
                        https://www.chp.gov.hk/en/features/100770.html
                      </a>
                    </li>
                    <li className="pl-1">Pneumococcal polysaccharide conjugate vaccine, 20-valent adsorbed. Prescribing Information. Pfizer Corporation Hong Kong Limited: Version July 2024.</li>
                </ul>
            </section>

            <section className="bg-slate-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 space-y-4">
                <h4 className="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Disclaimer</h4>
                <p className="text-[13px] md:text-[14px] font-bold text-slate-800">
                    肺炎球菌疫苗均乃醫生處方藥物。藥物的成效和副作用可能因使用者的身體狀況及個別症狀而有所不同，詳情請向醫生或藥劑師查詢。
                </p>
                <p className="text-[12px] md:text-[13px] font-medium text-slate-500">
                    All pneumococcal vaccines are prescription medicines. Efficacy and side effects may vary among individuals due to different physical conditions and symptoms. Please consult your doctor or pharmacist for details.
                </p>
            </section>

            <section className="text-[10px] md:text-[11px] font-medium text-slate-400 pt-4 border-t border-slate-100 flex flex-col space-y-1">
                <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                <p>美國輝瑞科研製藥 香港鰂魚涌英皇道683號嘉里中心21樓 | 電話: (852) 2811 9711 | 網站: <a href="https://www.pfizer.com.hk" target="_blank" rel="noopener noreferrer" className="underline">www.pfizer.com.hk</a></p>
                <p className="mt-2 font-mono text-[9px] opacity-70">PP-PNR-HKG-0648 Jan 2026</p>
            </section>
        </div>

        <button 
          onClick={() => setShowDisclaimer(false)} 
          className="w-full mt-8 py-4 md:py-5 bg-slate-900 text-white font-black rounded-2xl uppercase text-sm tracking-widest active:scale-95 transition-all shadow-lg hover:bg-black"
        >
          我已閱讀並明白
        </button>
      </div>
    </div>
  );

  const TutorialModal = () => (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="relative w-full max-w-sm md:max-w-md bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border-b-8 border-cyan-500 overflow-hidden">
        <button onClick={() => setShowTutorial(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-5 h-5" /></button>
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
                <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">操作說明</h3>
        </div>
        <div className="space-y-6">
            <div className="flex items-center space-x-5 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center font-black text-xl text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">W</div>
                <div><p className="font-bold text-lg text-slate-800">跳躍 / 二段跳</p><p className="text-sm text-slate-500">避開地面障礙，空中可再跳一次</p></div>
            </div>
            <div className="flex items-center space-x-5 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center font-black text-xl text-slate-700 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">S</div>
                <div><p className="font-bold text-lg text-slate-800">滑行</p><p className="text-sm text-slate-500">通過雷射門，空中可快速降落</p></div>
            </div>
            <div className="flex items-center space-x-5 group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center font-black text-xl text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">AD</div>
                <div><p className="font-bold text-lg text-slate-800">移動</p><p className="text-sm text-slate-500">左右移動收集 20 價疫苗</p></div>
            </div>
        </div>
        <button onClick={() => setShowTutorial(false)} className="w-full mt-12 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase text-lg tracking-widest active:scale-95 transition-all shadow-xl">開始任務</button>
      </div>
    </div>
  );

  const PauseOverlay = () => (
    <div className="absolute inset-0 z-[800] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300 pointer-events-auto">
      <div className="w-full max-sm:w-full max-w-sm bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border-b-8 border-cyan-500 relative overflow-hidden flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-cyan-50 rounded-3xl flex items-center justify-center text-cyan-600 mb-6 shadow-inner"><Pause className="w-8 h-8 fill-current" /></div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-8">任務暫停</h2>
        <div className="w-full grid grid-cols-2 gap-3 mb-12">
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">積分累計</p>
            <p className="text-2xl font-black text-slate-800">{score.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase mb-1">疫苗進度</p>
            <p className="text-2xl font-black text-slate-800">{vaccineCount}/{MAX_VACCINES} 價</p>
          </div>
        </div>
        <div className="w-full space-y-4">
            <button onClick={() => { audio.init(); togglePause(); }} className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-3xl shadow-xl flex items-center justify-center space-x-3 group active:scale-95 transition-transform">
              <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" /><span className="tracking-widest">繼續任務</span>
            </button>
            <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center space-x-3 active:scale-95 hover:bg-slate-50 transition-colors">
              <Home className="w-5 h-5" /><span className="uppercase text-xs font-black tracking-widest">返回基地</span>
            </button>
        </div>
      </div>
    </div>
  );

  if (status === GameStatus.STATS) {
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[120] bg-slate-950/60 backdrop-blur-xl p-4 pointer-events-auto">
        <div className="w-full max-w-xl bg-white border-2 border-cyan-100 rounded-[2.5rem] p-8 md:p-14 shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between mb-10">
            <button onClick={() => setStatus(GameStatus.MENU)} className="p-3 hover:bg-cyan-50 rounded-full transition-colors text-cyan-600"><ChevronLeft className="w-8 h-8" /></button>
            <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tighter uppercase">任務日誌</h2>
            <button onClick={resetPersistentStats} className="p-3 hover:bg-red-50 rounded-full transition-colors text-red-400"><Trash2 className="w-6 h-6" /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex items-center space-x-6">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500"><Trophy className="w-8 h-8" /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">總得分</p><p className="text-3xl font-black text-slate-800">{totalScore.toLocaleString()}</p></div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 flex items-center space-x-6">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500"><Star className="w-8 h-8" /></div>
              <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">最高等級</p><p className="text-3xl font-black text-slate-800">LVL {highestLevelReached}</p></div>
            </div>
          </div>
          <button onClick={() => setStatus(GameStatus.MENU)} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl hover:bg-black transition-all uppercase text-lg tracking-widest active:scale-95 shadow-xl">返回基地</button>
        </div>
      </div>
    );
  }

  if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
    const isVictory = status === GameStatus.VICTORY;
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[500] bg-slate-950/80 backdrop-blur-xl p-4 pointer-events-auto animate-in fade-in duration-500">
        <div className={`relative w-full max-sm:max-w-[95%] max-w-md bg-white border-t-8 ${isVictory ? 'border-emerald-500' : 'border-rose-500'} rounded-[3rem] p-8 md:p-14 flex flex-col items-center shadow-2xl text-center`}>
          <div className={`w-24 h-24 md:w-28 md:h-28 rounded-[2rem] md:rounded-[2.5rem] ${isVictory ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} flex items-center justify-center mb-8 shadow-inner`}>
            {isVictory ? <CheckCircle2 className="w-14 h-14" /> : <AlertTriangle className="w-14 h-14" />}
          </div>
          <h2 className={`text-4xl font-black ${isVictory ? 'text-emerald-600' : 'text-rose-600'} uppercase mb-6 tracking-tighter`}>{isVictory ? '任務成功' : '任務失敗'}</h2>
          <div className="text-sm md:text-base font-bold text-slate-500 mb-12 bg-slate-50 px-8 py-6 rounded-[2rem] border border-slate-100 shadow-inner max-w-[280px] md:max-w-none">
            {isVictory ? `成功獲得 ${MAX_VACCINES} 價疫苗 最廣泛保護get！` : `獲取 20 價失敗，請重新嘗試`}
          </div>
          <div className="w-full space-y-4">
            <button onClick={() => { audio.init(); restartGame(); }} className={`w-full py-6 ${isVictory ? 'bg-emerald-600' : 'bg-slate-900'} text-white font-black rounded-3xl shadow-2xl flex items-center justify-center space-x-3 active:scale-95 transition-all text-xl`}>
              <RefreshCcw className="w-7 h-7" /><span className="uppercase tracking-widest">{isVictory ? '重新開始' : '重新部署'}</span>
            </button>
            <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="w-full py-5 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center space-x-3 active:scale-95 hover:bg-slate-50 transition-colors">
              <Home className="w-6 h-6" /><span className="uppercase text-xs font-black tracking-widest">返回主頁</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-slate-50 p-4 pointer-events-auto">
              {showTutorial && <TutorialModal />}
              {showDisclaimer && <DisclaimerModal />}
              <div className="relative w-full max-w-md bg-white border border-slate-100 rounded-[3.5rem] p-8 md:p-14 shadow-2xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[95vh] text-center flex flex-col items-center">
                 <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-tighter mb-10 md:mb-12">20價大冒險</h1>
                 <div className="w-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-[2.5rem] p-8 md:p-10 border border-cyan-100 mb-10 shadow-sm">
                    <p className="text-cyan-900 text-base md:text-lg font-black mb-6 leading-tight">20價肺炎球菌疫苗是現時全港覆蓋最廣泛的結合疫苗，1針長效保護</p>
                    <p className="text-cyan-600 text-[11px] md:text-[12px] font-bold tracking-[0.15em] uppercase bg-white/60 py-4 rounded-3xl border border-cyan-200/50 px-4 shadow-sm">
                      在游戲中收集 {MAX_VACCINES} 價疫苗，保護自己及家人吧！
                    </p>
                 </div>
                 <div className="w-full space-y-4">
                    <button onClick={() => { audio.init(); startGame(); }} className="w-full py-7 bg-slate-900 text-white font-black text-2xl rounded-[2.5rem] hover:bg-black transition-all shadow-2xl flex items-center justify-center uppercase tracking-widest active:scale-95">啟動任務 <Play className="ml-4 w-8 h-8 fill-white" /></button>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setShowTutorial(true)} className="py-5 bg-white border border-slate-100 text-slate-500 font-black rounded-3xl uppercase text-[11px] tracking-widest flex items-center justify-center group hover:bg-slate-50 active:scale-95 transition-all shadow-sm"><HelpCircle className="w-5 h-5 mr-3 text-cyan-500 group-hover:scale-110 transition-transform" /> 操作說明</button>
                        <button onClick={() => { audio.init(); setStatus(GameStatus.STATS); }} className="py-5 bg-white border border-slate-100 text-slate-500 font-black rounded-3xl uppercase text-[11px] tracking-widest flex items-center justify-center group hover:bg-slate-50 active:scale-95 transition-all shadow-sm"><BarChart3 className="w-5 h-5 mr-3 text-slate-400 group-hover:scale-110 transition-transform" /> 任務日誌</button>
                    </div>
                 </div>

                 {/* Reference / Disclaimer Small Button */}
                 <button 
                   onClick={() => setShowDisclaimer(true)}
                   className="mt-10 md:mt-12 flex items-center space-x-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-full text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-all active:scale-95 group shadow-sm"
                   aria-label="Reference and Disclaimer"
                 >
                    <Info className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em]">參考資料及聲明</span>
                 </button>

                 <div className="mt-auto pt-10">
                    <VersionFooter />
                 </div>
              </div>
          </div>
      );
  }

  const progressPercent = Math.min(100, (vaccineCount / MAX_VACCINES) * 100);
  const isUltimateStage = vaccineCount >= MILESTONE_VACCINE_COUNT;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-50">
        {status === GameStatus.PAUSED && <PauseOverlay />}
        {showLevelUpPopup && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-auto bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-500">
             <div className="w-full max-sm:max-w-[90%] max-w-sm md:max-w-md bg-white p-10 md:p-14 rounded-[3rem] border-t-[12px] border-orange-500 shadow-2xl text-center transform animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-600 mx-auto mb-8 shadow-inner"><ShieldCheck className="w-12 h-12" /></div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 uppercase tracking-tighter">初步目標達成</h3>
                <p className="text-base md:text-xl text-slate-700 font-bold mb-10 px-2 leading-tight">
                  20價比15價多30%血清型覆蓋，保護更全面，努力取得額外5價保護啦！
                </p>
                <button onClick={() => { audio.init(); dismissMilestone(); }} className="w-full py-6 bg-orange-500 text-white font-black rounded-3xl flex items-center justify-center space-x-4 active:scale-95 transition-all shadow-xl hover:bg-orange-600 text-xl">
                  <span className="tracking-widest uppercase">繼續前進</span>
                  <FastForward className="w-7 h-7" />
                </button>
             </div>
          </div>
        )}
        
        {/* Top Header Section */}
        <div className="flex flex-col w-full space-y-6 md:space-y-10">
            <div className="flex justify-between items-start w-full">
                {/* Score Left */}
                <div className={`text-4xl md:text-7xl font-black tracking-tighter transition-colors drop-shadow-md ${isUltimateStage ? 'text-red-500' : 'text-slate-900'}`}>
                    {score.toLocaleString()}
                </div>
                
                {/* Timer and Pause Right */}
                <div className="flex items-center space-x-4 md:space-x-6 pointer-events-auto">
                    <div className={`text-3xl md:text-6xl font-black transition-colors drop-shadow-md ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {timeLeft.toFixed(1)}<span className={`text-sm md:text-2xl ml-2 font-bold uppercase ${timeLeft < 10 ? 'text-red-400' : 'text-white/70'}`}>Sec</span>
                    </div>
                    <button 
                      onClick={() => { audio.init(); togglePause(); }} 
                      className="p-3 md:p-5 bg-white/90 border-2 border-slate-100 rounded-2xl md:rounded-3xl shadow-xl active:scale-90 transition-transform hover:bg-white flex items-center justify-center"
                      aria-label={status === GameStatus.PAUSED ? "Resume" : "Pause"}
                    >
                        {status === GameStatus.PAUSED ? 
                          <Play className="w-5 h-5 md:w-8 md:h-8 fill-current text-cyan-600" /> : 
                          <Pause className="w-5 h-5 md:w-8 md:h-8 fill-current text-slate-800" />
                        }
                    </button>
                </div>
            </div>

            {/* Progress Bar Centralized Top */}
            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-xl h-3 md:h-4 bg-slate-200/60 rounded-full overflow-hidden shadow-inner border-2 border-white/50 relative">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isUltimateStage ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-cyan-500 shadow-[0_0_15px_rgba(8,165,233,0.6)]'}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between w-full max-w-xl mt-3 px-2">
                    <span className="text-[9px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] drop-shadow-sm">疫苗進度協作</span>
                    <span className={`text-[10px] md:text-[13px] font-black tracking-wider drop-shadow-sm ${isUltimateStage ? 'text-red-600' : 'text-cyan-600'}`}>{vaccineCount} / {MAX_VACCINES} 價收集完成</span>
                </div>
            </div>
        </div>

        {/* Bottom Bar Stats */}
        <div className="w-full flex justify-between items-end pb-safe">
             <div className={`bg-white/95 border-2 border-slate-100 px-5 py-3 md:px-8 md:py-4 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-2xl font-black ${isUltimateStage ? 'text-red-600' : 'text-slate-900'} shadow-2xl backdrop-blur-sm tracking-widest`}>
                LEVEL {level}
             </div>
             <div className="flex space-x-3 md:space-x-4">
                 <div className="bg-white/95 border-2 border-slate-100 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl backdrop-blur-sm">
                    <Zap className={`w-5 h-5 md:w-8 md:h-8 ${isUltimateStage ? 'text-red-500' : 'text-cyan-500'}`} />
                 </div>
                 <div className="bg-white/95 border-2 border-slate-100 p-3 md:p-5 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl backdrop-blur-sm">
                    <ShieldCheck className={`w-5 h-5 md:w-8 md:h-8 ${isUltimateStage ? 'text-orange-500' : 'text-slate-400'}`} />
                 </div>
             </div>
        </div>
    </div>
  );
};
