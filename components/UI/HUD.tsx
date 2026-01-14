
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
    score, vaccineCount, status, level, setStatus, timeLeft,
    totalScore, highestLevelReached, showLevelUpPopup, countdownValue, isMilestonePaused,
    resetPersistentStats, startGame, restartGame, togglePause, dismissMilestone
  } = useStore();
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const VersionFooter = () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30 pointer-events-none text-center px-4">
        <div className="flex items-center space-x-2 font-mono text-[8px] md:text-[9px] tracking-[0.2em] text-cyan-800 uppercase">
            <Terminal className="w-2 h-2 md:w-2.5 md:h-2.5" />
            <span>20價大冒險 v5.4.5 | 任務控制</span>
        </div>
    </div>
  );

  const ModalContainer = ({ children, onClose }: { children: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl border-t-8 border-cyan-500 overflow-hidden flex flex-col max-h-[92vh]">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-6 h-6" /></button>
        {children}
      </div>
    </div>
  );

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-slate-900/10 p-4 pointer-events-auto backdrop-blur-[2px]">
              {showTutorial && (
                  <ModalContainer onClose={() => setShowTutorial(false)}>
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600"><HelpCircle className="w-6 h-6" /></div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">操作說明</h3>
                    </div>
                    <div className="space-y-4">
                        {[
                          { key: 'W', label: '跳躍 / 二段跳', desc: '避開地面細菌障礙' },
                          { key: 'S', label: '滑行', desc: '穿過空中雷射門' },
                          { key: 'AD', label: '移動', desc: '收集 20 價疫苗' }
                        ].map(item => (
                          <div key={item.key} className="flex items-center space-x-5 group">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-xl text-slate-800 font-cyber shadow-sm">{item.key}</div>
                            <div><p className="font-bold text-lg text-slate-900">{item.label}</p><p className="text-sm text-slate-500 leading-none">{item.desc}</p></div>
                          </div>
                        ))}
                    </div>
                    <button onClick={() => setShowTutorial(false)} className="w-full mt-10 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase text-lg tracking-widest">確認接收</button>
                  </ModalContainer>
              )}

              {showDisclaimer && (
                  <ModalContainer onClose={() => setShowDisclaimer(false)}>
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="w-10 h-10 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600"><Info className="w-6 h-6" /></div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">重要聲明</h3>
                    </div>
                    <div className="overflow-y-auto pr-2 space-y-6 text-slate-600 scrollbar-hide text-sm">
                        <p className="text-base font-bold text-slate-800 bg-cyan-50 p-6 rounded-2xl border border-cyan-100">
                           肺炎球菌疫苗均乃醫生處方藥物。詳情請向醫生或藥劑師查詢。
                        </p>
                        <ul className="space-y-2 opacity-80 list-disc ml-4">
                           <li>CHP: https://www.chp.gov.hk/en/features/100770.html</li>
                           <li>PCV20 Prescribing Info: July 2024</li>
                        </ul>
                    </div>
                    <button onClick={() => setShowDisclaimer(false)} className="w-full mt-8 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest">我已了解</button>
                  </ModalContainer>
              )}
              
              <div className="relative w-full max-w-lg md:max-w-4xl bg-white/95 border border-white/50 rounded-[3.5rem] p-8 md:p-16 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.2)] animate-in zoom-in-95 duration-700 overflow-y-auto max-h-[96vh] text-center flex flex-col items-center scrollbar-hide">
                 <div className="relative mb-6 md:mb-10 cursor-default w-full">
                    <div className="flex items-baseline justify-center">
                        <span className="text-[9rem] sm:text-[12rem] md:text-[18rem] font-black text-gradient leading-none tracking-tighter font-cyber">20</span>
                        <span className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 ml-4">價</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-[0.2em] uppercase mt-[-1.5rem] md:mt-[-3.5rem] font-cyber">大冒險</h1>
                 </div>

                 <div className="w-full bg-gradient-to-br from-cyan-50 to-indigo-50/50 rounded-[2.5rem] p-8 md:p-12 border border-blue-100 mb-8 md:mb-12 flex flex-col items-center space-y-6 md:space-y-10">
                    <p className="text-slate-900 text-2xl sm:text-3xl md:text-5xl font-black leading-tight text-center">
                        20價是現時全港覆蓋<br/><span className="text-blue-600 underline decoration-4 md:decoration-8 underline-offset-8">最廣泛</span>的肺炎球菌結合疫苗
                    </p>
                    <div className="flex items-center space-x-6 bg-slate-900 text-white px-10 py-5 md:px-14 md:py-8 rounded-3xl shadow-xl transition-all hover:scale-105 active:scale-95">
                        <ShieldCheck className="w-8 h-8 md:w-14 md:h-14 text-cyan-400" />
                        <p className="text-2xl sm:text-4xl md:text-6xl font-black font-cyber tracking-wide whitespace-nowrap">1針長效保護</p>
                    </div>
                    <p className="text-cyan-800 text-lg md:text-3xl font-bold tracking-widest uppercase">
                       收集20價疫苗 守護自己及家人健康
                    </p>
                 </div>

                 <div className="w-full space-y-4 md:space-y-6 max-w-xl">
                    <button onClick={() => { audio.init(); startGame(); }} className="group w-full py-7 md:py-9 bg-slate-900 text-white font-black text-3xl md:text-4xl rounded-3xl hover:bg-black transition-all shadow-2xl flex items-center justify-center uppercase tracking-widest active:scale-95 font-cyber">
                        啟動任務 <Play className="ml-5 w-8 h-8 md:w-10 md:h-10 fill-white" />
                    </button>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setShowTutorial(true)} className="py-4 md:py-6 bg-white border border-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] md:text-sm tracking-widest flex items-center justify-center group hover:bg-slate-50 active:scale-95 transition-all"><HelpCircle className="w-5 h-5 mr-2 text-cyan-500" /> 操作說明</button>
                        <button onClick={() => setShowDisclaimer(true)} className="py-4 md:py-6 bg-white border border-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] md:text-sm tracking-widest flex items-center justify-center group hover:bg-slate-50 active:scale-95 transition-all"><Info className="w-5 h-5 mr-2 text-slate-400" /> 參考聲明</button>
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
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-50">
        {status === GameStatus.PAUSED && (
           <div className="absolute inset-0 z-[800] bg-slate-950/40 backdrop-blur-lg flex items-center justify-center p-6 pointer-events-auto animate-in fade-in duration-300">
             <div className="w-full max-sm:w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl border-b-[10px] border-cyan-500 flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-cyan-50 rounded-3xl flex items-center justify-center text-cyan-600 mb-6"><Pause className="w-8 h-8 fill-current" /></div>
               <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">任務暫停</h2>
               <div className="w-full grid grid-cols-2 gap-4 mb-10">
                 <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">目前得分</p>
                   <p className="text-2xl font-black text-slate-800">{score.toLocaleString()}</p>
                 </div>
                 <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">疫苗進度</p>
                   <p className="text-2xl font-black text-slate-800 whitespace-nowrap">{vaccineCount}/20 價</p>
                 </div>
               </div>
               <button onClick={() => { audio.init(); togglePause(); }} className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-3xl flex items-center justify-center space-x-3 active:scale-95 transition-transform">
                 <Play className="w-6 h-6 fill-white" /><span>繼續任務</span>
               </button>
               <button onClick={() => setStatus(GameStatus.MENU)} className="w-full py-4 mt-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center space-x-2 text-xs uppercase">
                 <Home className="w-5 h-5" /><span>撤回基地</span>
               </button>
             </div>
           </div>
        )}

        {isMilestonePaused && countdownValue > 0 && (
            <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
                <div className="text-[15rem] md:text-[25rem] font-black text-white font-cyber animate-ping drop-shadow-[0_0_50px_rgba(14,165,233,0.8)]">
                    {countdownValue}
                </div>
            </div>
        )}

        {showLevelUpPopup && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-auto bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="w-full max-sm:max-w-[95%] max-w-sm md:max-w-md bg-white p-12 md:p-16 rounded-[4rem] border-t-[16px] border-orange-500 shadow-2xl text-center transform animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 bg-orange-50 rounded-[2.5rem] flex items-center justify-center text-orange-600 mx-auto mb-10"><ShieldCheck className="w-12 h-12" /></div>
                <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-8 uppercase tracking-tighter">繼續努力</h3>
                <div className="space-y-4 mb-12">
                    <p className="text-2xl md:text-3xl text-slate-700 font-black leading-none">20價比15價多<span className="text-orange-600">30%+</span>覆蓋</p>
                    <p className="text-xl md:text-2xl text-slate-600 font-bold">全面守護，守護更多！</p>
                </div>
                <button onClick={() => { audio.init(); dismissMilestone(); }} className="w-full py-8 bg-orange-500 text-white font-black rounded-3xl flex items-center justify-center space-x-6 active:scale-95 transition-all text-xl md:text-2xl uppercase tracking-widest shadow-xl">
                  <span>獲取額外5價保護</span>
                  <FastForward className="w-8 h-8" />
                </button>
             </div>
          </div>
        )}
        
        {status === GameStatus.GAME_OVER || status === GameStatus.VICTORY ? (
          <div className="absolute inset-0 flex items-center justify-center z-[500] bg-slate-950/80 backdrop-blur-2xl p-6 pointer-events-auto animate-in fade-in duration-500">
            <div className={`relative w-full max-sm:max-w-[95%] max-w-md bg-white border-t-[12px] ${status === GameStatus.VICTORY ? 'border-emerald-500' : 'border-rose-500'} rounded-[4rem] p-12 flex flex-col items-center shadow-2xl text-center`}>
              <div className={`w-24 h-24 rounded-[2rem] ${status === GameStatus.VICTORY ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} flex items-center justify-center mb-10`}>
                {status === GameStatus.VICTORY ? <CheckCircle2 className="w-14 h-14" /> : <AlertTriangle className="w-14 h-14" />}
              </div>
              <h2 className={`text-5xl font-black ${status === GameStatus.VICTORY ? 'text-emerald-600' : 'text-rose-600'} uppercase mb-8 tracking-tighter`}>
                {status === GameStatus.VICTORY ? '20價疫苗get' : '任務失敗'}
              </h2>
              <div className="text-xl font-bold text-slate-500 mb-12 bg-slate-50 px-8 py-6 rounded-[2rem] border border-slate-100 shadow-inner leading-snug">
                {status === GameStatus.VICTORY ? `成功獲得最廣泛保護` : `未能收集完整 20 價保護，重新嘗試！`}
              </div>
              <div className="w-full space-y-4">
                <button onClick={() => { audio.init(); restartGame(); }} className={`w-full py-8 ${status === GameStatus.VICTORY ? 'bg-emerald-600' : 'bg-slate-900'} text-white font-black rounded-3xl shadow-xl flex items-center justify-center space-x-4 active:scale-95 text-2xl uppercase`}>
                  <RefreshCcw className="w-8 h-8" /><span>重新嘗試</span>
                </button>
                <button onClick={() => setStatus(GameStatus.MENU)} className="w-full py-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center space-x-2 text-sm uppercase">
                  <Home className="w-6 h-6" /><span>返回大廳</span>
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* HUD In-Game Elements */}
        <div className="flex flex-col w-full space-y-8 md:space-y-12">
            <div className="flex justify-between items-start w-full">
                <div className={`text-6xl md:text-[12rem] font-black tracking-tighter transition-colors drop-shadow-lg font-cyber whitespace-nowrap ${isUltimateStage ? 'text-red-500' : 'text-sky-400'}`}>
                    {score.toLocaleString()}
                </div>
                
                <div className="flex items-center space-x-6 pointer-events-auto">
                    <div className={`text-5xl md:text-[9rem] font-black transition-colors drop-shadow-md text-white font-cyber whitespace-nowrap ${timeLeft < 10 ? 'animate-pulse text-red-500' : ''}`}>
                        {timeLeft.toFixed(1)}<span className="text-xl md:text-5xl ml-2 font-bold opacity-60">S</span>
                    </div>
                    <button onClick={() => { audio.init(); togglePause(); }} className="p-5 md:p-10 bg-white/95 rounded-[2rem] md:rounded-[4rem] shadow-2xl active:scale-90 transition-transform">
                        {status === GameStatus.PAUSED ? <Play className="w-8 h-8 md:w-16 md:h-16 fill-current text-cyan-600" /> : <Pause className="w-8 h-8 md:w-16 md:h-16 fill-current text-slate-800" />}
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-5xl h-6 md:h-10 bg-slate-200/30 rounded-full overflow-hidden shadow-inner border-[4px] border-white/20 relative backdrop-blur-md">
                    {/* The Progress Bar */}
                    <div className={`h-full transition-all duration-1000 ease-out ${isUltimateStage ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_30px_rgba(14,165,233,0.5)]'}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between items-center w-full max-w-5xl mt-4 px-4">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm md:text-3xl font-black text-white uppercase tracking-widest font-cyber whitespace-nowrap">疫苗進度</span>
                      {isUltimateStage && (
                        <div className="px-4 py-1 bg-red-600 text-white text-[10px] md:text-xl font-black rounded-lg animate-pulse uppercase tracking-tighter shadow-[0_0_20px_rgba(220,38,38,0.8)]">
                           Ultimate Stage
                        </div>
                      )}
                    </div>
                    <span className={`text-sm md:text-4xl font-black tracking-widest font-cyber whitespace-nowrap ${isUltimateStage ? 'text-red-400' : 'text-cyan-300'}`}>{vaccineCount} / 20 價</span>
                </div>
            </div>
        </div>

        {/* Bottom Bar Stats */}
        <div className="w-full flex justify-between items-end pb-safe">
             <div className={`bg-white/95 px-8 py-4 md:px-16 md:py-10 rounded-[2.5rem] text-xl md:text-6xl font-black font-cyber ${isUltimateStage ? 'text-red-600' : 'text-slate-900'} shadow-2xl tracking-widest uppercase whitespace-nowrap`}>
                LVL {level}
             </div>
             <div className="flex space-x-4 md:space-x-10">
                 <div className="bg-white/95 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-white/50">
                    <Zap className={`w-8 h-8 md:w-20 md:h-20 ${isUltimateStage ? 'text-red-500' : 'text-cyan-500'}`} />
                 </div>
                 <div className="bg-white/95 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-2xl border border-white/50">
                    <ShieldCheck className={`w-8 h-8 md:w-20 md:h-20 ${isUltimateStage ? 'text-orange-500' : 'text-slate-400'}`} />
                 </div>
             </div>
        </div>
    </div>
  );
};
