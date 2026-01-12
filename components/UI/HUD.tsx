/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Play, BarChart3, ChevronLeft, Trash2, Trophy, Star, Terminal, Pause, RefreshCcw, Home, FastForward, CheckCircle2, AlertTriangle, HelpCircle, X, ShieldCheck, Zap, Info } from 'lucide-react';
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
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const VersionFooter = () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30 pointer-events-none text-center px-4">
        <div className="flex items-center space-x-2 font-mono text-[10px] md:text-[12px] tracking-[0.2em] text-cyan-800 uppercase">
            <Terminal className="w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
            <span className="whitespace-nowrap">20價大冒險 v3.1.0 | 臨床協議</span>
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
          <X className="w-6 h-6 md:w-8 md:h-8" />
        </button>
        
        <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
                <Info className="w-7 h-7 md:w-8 md:h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter whitespace-nowrap">參考資料及聲明</h3>
        </div>

        <div className="overflow-y-auto pr-2 space-y-6 text-slate-600 leading-relaxed text-sm md:text-base lg:text-lg scrollbar-thin">
            <section>
                <h4 className="text-[11px] md:text-[13px] font-black text-slate-400 uppercase tracking-widest mb-3">References</h4>
                <ul className="text-[12px] md:text-[14px] space-y-3 list-decimal ml-4 font-medium text-slate-600">
                    <li className="pl-1">
                      <a href="https://www.chp.gov.hk/en/features/100770.html" target="_blank" rel="noopener noreferrer" className="text-cyan-600 underline break-all">
                        https://www.chp.gov.hk/en/features/100770.html
                      </a>
                    </li>
                    <li className="pl-1">Pneumococcal polysaccharide conjugate vaccine, 20-valent adsorbed. Prescribing Information. Pfizer Corporation Hong Kong Limited: Version July 2024.</li>
                </ul>
            </section>

            <section className="bg-slate-50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-slate-100 space-y-4">
                <h4 className="text-[11px] md:text-[13px] font-black text-slate-400 uppercase tracking-widest mb-1">Disclaimer</h4>
                <p className="text-[18px] md:text-[24px] font-bold text-slate-800 leading-normal">
                    肺炎球菌疫苗均乃醫生處方藥物。藥物的成效和副作用可能因使用者的身體狀況及個別症狀而有所不同，詳情請向醫生或藥劑師查詢。
                </p>
                <p className="text-[16px] md:text-[20px] font-medium text-slate-500 leading-normal">
                    All pneumococcal vaccines are prescription medicines. Efficacy and side effects may vary among individuals due to different physical conditions and symptoms. Please consult your doctor or pharmacist for details.
                </p>
            </section>

            <section className="text-[10px] md:text-[12px] font-medium text-slate-400 pt-4 border-t border-slate-100 flex flex-col space-y-1">
                <p className="font-bold text-slate-500 uppercase tracking-wider mb-1">Contact</p>
                <p className="leading-tight">美國輝瑞科研製藥 香港鰂魚涌英皇道683號嘉里中心21樓 | 電話: (852) 2811 9711</p>
                <p className="leading-tight">網站: <a href="https://www.pfizer.com.hk" target="_blank" rel="noopener noreferrer" className="underline">www.pfizer.com.hk</a></p>
                <p className="mt-2 font-mono text-[9px] md:text-[10px] opacity-70">PP-PNR-HKG-0648 Jan 2026</p>
            </section>
        </div>

        <button 
          onClick={() => setShowDisclaimer(false)} 
          className="w-full mt-8 py-5 md:py-6 bg-slate-900 text-white font-black rounded-2xl uppercase text-lg tracking-widest active:scale-95 transition-all shadow-lg hover:bg-black whitespace-nowrap"
        >
          我已閱讀並明白
        </button>
      </div>
    </div>
  );

  const TutorialModal = () => (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="relative w-full max-sm:max-w-[95%] max-w-sm md:max-w-md bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border-b-8 border-cyan-500 overflow-hidden">
        <button onClick={() => setShowTutorial(false)} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-7 h-7" /></button>
        <div className="flex items-center space-x-3 mb-8">
            <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600">
                <HelpCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tighter whitespace-nowrap">操作說明</h3>
        </div>
        <div className="space-y-6">
            <div className="flex items-center space-x-6 group">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center font-black text-xl md:text-2xl text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">W</div>
                <div><p className="font-bold text-xl md:text-2xl text-slate-800 whitespace-nowrap">跳躍 / 二段跳</p><p className="text-base md:text-lg text-slate-500 whitespace-nowrap">避開地面障礙，空中可再跳一次</p></div>
            </div>
            <div className="flex items-center space-x-6 group">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center font-black text-xl md:text-2xl text-slate-700 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors">S</div>
                <div><p className="font-bold text-xl md:text-2xl text-slate-800 whitespace-nowrap">滑行</p><p className="text-base md:text-lg text-slate-500 whitespace-nowrap">通過雷射門，空中可快速降落</p></div>
            </div>
            <div className="flex items-center space-x-6 group">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center font-black text-xl md:text-2xl text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-colors">AD</div>
                <div><p className="font-bold text-xl md:text-2xl text-slate-800 whitespace-nowrap">移動</p><p className="text-base md:text-lg text-slate-500 whitespace-nowrap">左右移動收集 20 價疫苗</p></div>
            </div>
        </div>
        <button onClick={() => setShowTutorial(false)} className="w-full mt-12 py-6 bg-slate-900 text-white font-black rounded-2xl uppercase text-xl tracking-widest active:scale-95 transition-all shadow-xl whitespace-nowrap">開始任務</button>
      </div>
    </div>
  );

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-slate-50 p-4 pointer-events-auto">
              {showTutorial && <TutorialModal />}
              {showDisclaimer && <DisclaimerModal />}
              <div className="relative w-full max-w-md md:max-w-4xl bg-white border border-slate-100 rounded-[3.5rem] p-10 md:p-16 shadow-2xl animate-in zoom-in-95 duration-500 overflow-y-auto max-h-[95vh] text-center flex flex-col items-center">
                 <h1 className="text-6xl sm:text-7xl md:text-9xl font-black text-slate-900 leading-none tracking-tighter mb-10 md:mb-14 whitespace-nowrap">20價大冒險</h1>
                 <div className="w-full bg-gradient-to-br from-cyan-50 to-blue-50 rounded-[2.5rem] p-8 md:p-16 border border-cyan-100 mb-12 shadow-sm flex flex-col items-center space-y-4 md:space-y-8">
                    <p className="text-cyan-900 text-[22px] sm:text-[32px] md:text-4xl lg:text-5xl font-black leading-tight text-center max-w-prose">
                        20價肺炎球菌疫苗是現時全港覆蓋最廣泛的結合疫苗
                    </p>
                    <p className="text-cyan-900 text-[24px] sm:text-[36px] md:text-5xl lg:text-6xl font-black leading-none whitespace-nowrap text-center">1針長效保護</p>
                    <div className="h-4 md:h-10" />
                    <p className="text-cyan-600 text-[16px] sm:text-[24px] md:text-3xl lg:text-4xl font-bold tracking-[0.05em] uppercase bg-white/60 py-8 rounded-2xl border border-cyan-200/50 px-8 shadow-sm whitespace-nowrap w-full text-center">
                      在游戲中收集 {MAX_VACCINES} 價疫苗
                    </p>
                    <p className="text-cyan-600 text-[16px] sm:text-[24px] md:text-3xl lg:text-4xl font-bold tracking-[0.05em] uppercase bg-white/60 py-8 rounded-2xl border border-cyan-200/50 px-8 shadow-sm whitespace-nowrap w-full text-center">
                      保護自己及家人吧！
                    </p>
                 </div>
                 <div className="w-full space-y-6">
                    <button onClick={() => { audio.init(); startGame(); }} className="w-full py-8 bg-slate-900 text-white font-black text-3xl rounded-[2.5rem] hover:bg-black transition-all shadow-2xl flex items-center justify-center uppercase tracking-widest active:scale-95 whitespace-nowrap">啟動任務 <Play className="ml-5 w-8 h-8 md:w-12 md:h-12 fill-white" /></button>
                    <div className="grid grid-cols-2 gap-6">
                        <button onClick={() => setShowTutorial(true)} className="py-6 bg-white border border-slate-100 text-slate-500 font-black rounded-3xl uppercase text-[14px] md:text-base tracking-widest flex items-center justify-center group hover:bg-slate-50 active:scale-95 transition-all shadow-sm whitespace-nowrap"><HelpCircle className="w-6 h-6 mr-3 text-cyan-500 group-hover:scale-110 transition-transform" /> 操作說明</button>
                        <button onClick={() => setShowDisclaimer(true)} className="py-6 bg-white border border-slate-100 text-slate-500 font-black rounded-3xl uppercase text-[14px] md:text-base tracking-widest flex items-center justify-center group hover:bg-slate-50 active:scale-95 transition-all shadow-sm whitespace-nowrap"><Info className="w-6 h-6 mr-3 text-slate-400 group-hover:scale-110 transition-transform" /> 免責聲明</button>
                    </div>
                 </div>

                 <div className="mt-auto pt-16">
                    <VersionFooter />
                 </div>
              </div>
          </div>
      );
  }

  const progressPercent = Math.min(100, (vaccineCount / MAX_VACCINES) * 100);
  const isUltimateStage = vaccineCount >= MILESTONE_VACCINE_COUNT;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-14 z-50">
        {status === GameStatus.PAUSED && (
           <div className="absolute inset-0 z-[800] bg-slate-950/40 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in duration-300 pointer-events-auto">
             <div className="w-full max-sm:w-full max-w-sm bg-white rounded-[2.5rem] md:rounded-[3rem] p-8 md:p-12 shadow-2xl border-b-8 border-cyan-500 relative overflow-hidden flex flex-col items-center text-center">
               <div className="w-20 h-20 bg-cyan-50 rounded-3xl flex items-center justify-center text-cyan-600 mb-6 shadow-inner"><Pause className="w-10 h-10 fill-current" /></div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-8 whitespace-nowrap">任務暫停</h2>
               <div className="w-full grid grid-cols-2 gap-4 mb-12">
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[14px] font-black text-slate-400 uppercase mb-2 whitespace-nowrap">積分累計</p>
                   <p className="text-2xl md:text-3xl font-black text-slate-800">{score.toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                   <p className="text-[14px] font-black text-slate-400 uppercase mb-2 whitespace-nowrap">疫苗進度</p>
                   <p className="text-2xl md:text-3xl font-black text-slate-800 whitespace-nowrap">{vaccineCount}/{MAX_VACCINES} 價</p>
                 </div>
               </div>
               <div className="w-full space-y-4">
                   <button onClick={() => { audio.init(); togglePause(); }} className="w-full py-7 bg-slate-900 text-white font-black text-2xl rounded-3xl shadow-xl flex items-center justify-center space-x-4 group active:scale-95 transition-transform">
                     <Play className="w-8 h-8 fill-white group-hover:scale-110 transition-transform" /><span className="tracking-widest whitespace-nowrap">繼續任務</span>
                   </button>
                   <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="w-full py-5 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center space-x-3 active:scale-95 hover:bg-slate-50 transition-colors">
                     <Home className="w-6 h-6" /><span className="uppercase text-sm font-black tracking-widest whitespace-nowrap">返回基地</span>
                   </button>
               </div>
             </div>
           </div>
        )}
        
        {showLevelUpPopup && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-auto bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
             <div className="w-full max-sm:max-w-[95%] max-w-sm md:max-w-md bg-white p-10 md:p-16 rounded-[3rem] border-t-[12px] border-orange-500 shadow-2xl text-center transform animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 md:w-28 md:h-28 bg-orange-50 rounded-[2rem] flex items-center justify-center text-orange-600 mx-auto mb-8 shadow-inner"><ShieldCheck className="w-12 h-12 md:w-16 md:h-16" /></div>
                <h3 className="text-2xl md:text-4xl font-black text-slate-900 mb-8 uppercase tracking-tighter whitespace-nowrap">繼續努力</h3>
                <div className="flex flex-col items-center space-y-3 mb-12 overflow-hidden">
                    <p className="text-[20px] sm:text-[28px] md:text-3xl lg:text-4xl text-slate-700 font-bold leading-none whitespace-nowrap">20價比15價多30%血清型覆蓋</p>
                    <p className="text-[20px] sm:text-[28px] md:text-3xl lg:text-4xl text-slate-700 font-bold leading-none whitespace-nowrap">保護更全面</p>
                    <div className="h-3 md:h-6" />
                    <p className="text-[20px] sm:text-[28px] md:text-3xl lg:text-4xl text-slate-700 font-bold leading-none whitespace-nowrap pt-2">努力取得額外5價保護啦！</p>
                </div>
                <button onClick={() => { audio.init(); dismissMilestone(); }} className="w-full py-6 md:py-8 bg-orange-500 text-white font-black rounded-3xl flex items-center justify-center space-x-5 active:scale-95 transition-all shadow-xl hover:bg-orange-600 text-xl md:text-2xl whitespace-nowrap">
                  <span className="tracking-widest uppercase">繼續前進</span>
                  <FastForward className="w-8 h-8 md:w-10 md:h-10" />
                </button>
             </div>
          </div>
        )}
        
        {status === GameStatus.GAME_OVER || status === GameStatus.VICTORY ? (
          <div className="absolute inset-0 flex items-center justify-center z-[500] bg-slate-950/80 backdrop-blur-xl p-4 pointer-events-auto animate-in fade-in duration-500">
            <div className={`relative w-full max-sm:max-w-[95%] max-w-md bg-white border-t-8 ${status === GameStatus.VICTORY ? 'border-emerald-500' : 'border-rose-500'} rounded-[3rem] p-10 md:p-14 flex flex-col items-center shadow-2xl text-center`}>
              <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2rem] md:rounded-[2.5rem] ${status === GameStatus.VICTORY ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} flex items-center justify-center mb-8 shadow-inner`}>
                {status === GameStatus.VICTORY ? <CheckCircle2 className="w-14 h-14 md:w-18 md:h-18" /> : <AlertTriangle className="w-14 h-14 md:w-18 md:h-18" />}
              </div>
              <h2 className={`text-4xl md:text-5xl font-black ${status === GameStatus.VICTORY ? 'text-emerald-600' : 'text-rose-600'} uppercase mb-6 tracking-tighter whitespace-nowrap`}>{status === GameStatus.VICTORY ? '任務成功' : '任務失敗'}</h2>
              <div className="text-xl md:text-3xl font-bold text-slate-500 mb-12 bg-slate-50 px-8 py-6 rounded-[2rem] border border-slate-100 shadow-inner max-w-[280px] md:max-w-none leading-relaxed">
                {status === GameStatus.VICTORY ? `成功獲得 ${MAX_VACCINES} 價疫苗 最廣泛保護get！` : `獲取 20 價失敗，請重新嘗試`}
              </div>
              <div className="w-full space-y-4">
                <button onClick={() => { audio.init(); restartGame(); }} className={`w-full py-7 ${status === GameStatus.VICTORY ? 'bg-emerald-600' : 'bg-slate-900'} text-white font-black rounded-3xl shadow-2xl flex items-center justify-center space-x-4 active:scale-95 transition-all text-2xl`}>
                  <RefreshCcw className="w-8 h-8" /><span className="uppercase tracking-widest whitespace-nowrap">{status === GameStatus.VICTORY ? '重新開始' : '重新部署'}</span>
                </button>
                <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="w-full py-5 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center space-x-3 active:scale-95 hover:bg-slate-50 transition-colors">
                  <Home className="w-6 h-6" /><span className="uppercase text-xs font-black tracking-widest whitespace-nowrap">返回主頁</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* Top Header Section */}
        <div className="flex flex-col w-full space-y-8 md:space-y-12">
            <div className="flex justify-between items-start w-full">
                {/* Score Left - sky-400 */}
                <div className={`text-6xl md:text-9xl font-black tracking-tighter transition-colors drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] ${isUltimateStage ? 'text-red-500' : 'text-sky-400'}`}>
                    {score.toLocaleString()}
                </div>
                
                {/* Timer and Pause Right - white */}
                <div className="flex items-center space-x-5 md:space-x-8 pointer-events-auto">
                    <div className={`text-5xl md:text-8xl font-black transition-colors drop-shadow-[0_4px_4px_rgba(0,0,0,0.25)] text-white ${timeLeft < 10 ? 'animate-pulse' : ''}`}>
                        {timeLeft.toFixed(1)}<span className={`text-sm md:text-3xl ml-3 font-bold uppercase text-white/70`}>Sec</span>
                    </div>
                    <button 
                      onClick={() => { audio.init(); togglePause(); }} 
                      className="p-4 md:p-6 bg-white/90 border-2 border-slate-100 rounded-2xl md:rounded-3xl shadow-xl active:scale-90 transition-transform hover:bg-white flex items-center justify-center"
                      aria-label={status === GameStatus.PAUSED ? "Resume" : "Pause"}
                    >
                        {status === GameStatus.PAUSED ? 
                          <Play className="w-6 h-6 md:w-10 md:h-10 fill-current text-cyan-600" /> : 
                          <Pause className="w-6 h-6 md:w-10 md:h-10 fill-current text-slate-800" />
                        }
                    </button>
                </div>
            </div>

            {/* Progress Bar Centralized Top */}
            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-2xl h-4 md:h-6 bg-slate-200/60 rounded-full overflow-hidden shadow-inner border-2 border-white/50 relative">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${isUltimateStage ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-cyan-500 shadow-[0_0_15px_rgba(8,165,233,0.6)]'}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between w-full max-w-2xl mt-4 px-3">
                    <span className="text-[16px] md:text-[22px] font-black text-slate-400 uppercase tracking-[0.3em] drop-shadow-sm whitespace-nowrap">疫苗進度</span>
                    <span className={`text-[16px] md:text-[26px] font-black tracking-wider drop-shadow-sm whitespace-nowrap ${isUltimateStage ? 'text-red-600' : 'text-cyan-600'}`}>{vaccineCount} / {MAX_VACCINES} 價收集完成</span>
                </div>
            </div>
        </div>

        {/* Bottom Bar Stats */}
        <div className="w-full flex justify-between items-end pb-safe">
             <div className={`bg-white/95 border-2 border-slate-100 px-6 py-4 md:px-10 md:py-6 rounded-[1.5rem] md:rounded-[2.5rem] text-xl md:text-4xl font-black ${isUltimateStage ? 'text-red-600' : 'text-slate-900'} shadow-2xl backdrop-blur-sm tracking-widest whitespace-nowrap`}>
                LEVEL {level}
             </div>
             <div className="flex space-x-4 md:space-x-6">
                 <div className="bg-white/95 border-2 border-slate-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
                    <Zap className={`w-6 h-6 md:w-10 md:h-10 ${isUltimateStage ? 'text-red-500' : 'text-cyan-500'}`} />
                 </div>
                 <div className="bg-white/95 border-2 border-slate-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
                    <ShieldCheck className={`w-6 h-6 md:w-10 md:h-10 ${isUltimateStage ? 'text-orange-500' : 'text-slate-400'}`} />
                 </div>
             </div>
        </div>
    </div>
  );
};