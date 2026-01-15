
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
    showLevelUpPopup, countdownValue, isMilestonePaused,
    startGame, restartGame, togglePause, dismissMilestone
  } = useStore();
  
  const [showTutorial, setShowTutorial] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const VersionFooter = () => (
    <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-30 pointer-events-none text-center px-4">
        <div className="flex items-center space-x-2 font-mono text-[8px] md:text-[9px] tracking-[0.2em] text-cyan-800 uppercase">
            <Terminal className="w-2 h-2 md:w-2.5 md:h-2.5" />
            <span>20價大冒險 v6.6.0 | 任務控制</span>
        </div>
    </div>
  );

  const ModalContainer = ({ children, onClose, title, icon: Icon }: any) => (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
      <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl border-t-8 border-cyan-500 overflow-hidden flex flex-col max-h-[92vh]">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-6 h-6" /></button>
        <div className="flex items-center space-x-4 mb-8">
            <div className="w-12 h-12 bg-cyan-50 rounded-2xl flex items-center justify-center text-cyan-600"><Icon className="w-6 h-6" /></div>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tighter">{title}</h3>
        </div>
        {children}
        <button onClick={onClose} className="w-full mt-8 py-5 bg-slate-900 text-white font-black rounded-2xl uppercase tracking-widest active:scale-95 shadow-lg">確認接收</button>
      </div>
    </div>
  );

  if (status === GameStatus.MENU) {
      return (
          <div className="absolute inset-0 flex items-center justify-center z-[100] bg-slate-900/10 p-4 pointer-events-auto backdrop-blur-[2px]">
              {showTutorial && (
                  <ModalContainer title="操作說明" icon={HelpCircle} onClose={() => setShowTutorial(false)}>
                    <div className="space-y-4">
                        {[
                          { key: 'W', label: '跳躍 / 二段跳', desc: '避開地面細菌障礙' },
                          { key: 'S', label: '滑行', desc: '穿過空中雷射門' },
                          { key: 'AD', label: '移動', desc: '收集 20 價疫苗' }
                        ].map(item => (
                          <div key={item.key} className="flex items-center space-x-5">
                            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center font-black text-xl text-slate-800 font-cyber">{item.key}</div>
                            <div><p className="font-bold text-lg text-slate-900">{item.label}</p><p className="text-sm text-slate-500">{item.desc}</p></div>
                          </div>
                        ))}
                    </div>
                  </ModalContainer>
              )}

              {showDisclaimer && (
                  <ModalContainer title="參考資料及聲明" icon={Info} onClose={() => setShowDisclaimer(false)}>
                    <div className="overflow-y-auto pr-2 space-y-6 text-slate-600 scrollbar-hide text-xs md:text-sm">
                        <div className="space-y-6">
                            <div className="bg-cyan-50 p-6 rounded-2xl border border-cyan-100 space-y-4">
                                <p className="font-bold text-slate-800 leading-relaxed">
                                   肺炎球菌疫苗均乃醫生處方藥物。藥物的成效和副作用可能因使用者的身體狀況及個別症狀而有所不同，詳情請向醫生或藥劑師查詢。
                                </p>
                                <p className="font-medium text-slate-600 text-xs md:text-[13px] leading-relaxed italic border-t border-cyan-200/50 pt-4">
                                   All pneumococcal vaccines are prescription medicines. Efficacy and side effects may vary among individuals due to different physical conditions and symptoms. Please consult your doctor or pharmacist for details.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px]">參考資料:</h4>
                                <ol className="list-decimal ml-4 space-y-3 text-[11px] md:text-xs font-medium text-slate-500">
                                    <li><a href="https://www.chp.gov.hk/en/features/100770.html" target="_blank" className="text-cyan-600 underline">https://www.chp.gov.hk/en/features/100770.html</a> Accessed Jan 2026</li>
                                    <li>Pneumococcal polysaccharide conjugate vaccine, 20-valent adsorbed. Prescribing Information. Pfizer Corporation Hong Kong Limited: Version July 2024</li>
                                </ol>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex flex-col space-y-2">
                                <p className="text-[10px] md:text-[11px] font-bold text-slate-400 leading-tight">
                                    美國輝瑞科研製藥 香港鰂魚涌英皇道683號嘉里中心21樓 | 電話: (852) 2811 9711 | 網站: <a href="https://www.pfizer.com.hk" target="_blank" className="underline">www.pfizer.com.hk</a>
                                </p>
                                <p className="text-[9px] md:text-[10px] font-mono text-slate-300">
                                    PP-PNR-HKG-0648 Jan 2026
                                </p>
                            </div>
                        </div>
                    </div>
                  </ModalContainer>
              )}
              
              <div className="relative w-full max-w-lg md:max-w-4xl bg-white/95 border border-white/50 rounded-[3.5rem] p-8 md:p-16 shadow-2xl animate-in zoom-in-95 duration-700 overflow-y-auto max-h-[96vh] text-center flex flex-col items-center scrollbar-hide">
                 <div className="relative mb-6 md:mb-10 cursor-default w-full">
                    <div className="flex items-baseline justify-center">
                        <span className="text-[7rem] sm:text-[12rem] md:text-[18rem] font-black text-gradient leading-none tracking-tighter font-cyber">20</span>
                        <span className="text-3xl sm:text-6xl md:text-8xl font-black text-slate-900 ml-4">價</span>
                    </div>
                    <h1 className="text-2xl sm:text-5xl md:text-7xl font-black text-slate-900 leading-none tracking-[0.2em] uppercase mt-[-1.5rem] md:mt-[-3.5rem] font-cyber">大冒險</h1>
                 </div>

                 <div className="w-full bg-gradient-to-br from-cyan-50 to-indigo-50/50 rounded-[2.5rem] p-8 md:p-12 border border-blue-100 mb-8 md:mb-12 flex flex-col items-center space-y-6 md:space-y-10">
                    <p className="text-slate-900 text-xl sm:text-3xl md:text-5xl font-black leading-tight">
                        20價是現時全港覆蓋<br/><span className="text-blue-600 underline decoration-4 md:decoration-8 underline-offset-8">最廣泛</span>的肺炎球菌結合疫苗
                    </p>
                    <div className="flex items-center space-x-6 bg-slate-900 text-white px-8 py-4 md:px-14 md:py-8 rounded-3xl shadow-xl transition-all hover:scale-105 active:scale-95">
                        <ShieldCheck className="w-6 h-6 md:w-14 md:h-14 text-cyan-400" />
                        <p className="text-xl sm:text-4xl md:text-6xl font-black font-cyber tracking-wide">1針長效保護</p>
                    </div>
                    <p className="text-cyan-800 text-base md:text-3xl font-bold tracking-widest uppercase">
                       收集20價疫苗 守護自己及家人健康
                    </p>
                 </div>

                 <div className="w-full space-y-4 md:space-y-6 max-w-xl">
                    <button onClick={() => { audio.init(); startGame(); }} className="w-full py-6 md:py-9 bg-slate-900 text-white font-black text-2xl md:text-4xl rounded-3xl hover:bg-black transition-all shadow-2xl flex items-center justify-center uppercase tracking-widest active:scale-95 font-cyber">啟動任務 <Play className="ml-5 w-6 h-6 md:w-10 md:h-10 fill-white" /></button>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setShowTutorial(true)} className="py-4 md:py-6 bg-white border border-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] md:text-sm tracking-widest flex items-center justify-center hover:bg-slate-50 active:scale-95 shadow-sm"><HelpCircle className="w-5 h-5 mr-3 text-cyan-500" /> 操作說明</button>
                        <button onClick={() => setShowDisclaimer(true)} className="py-4 md:py-6 bg-white border border-slate-100 text-slate-500 font-black rounded-2xl uppercase text-[10px] md:text-sm tracking-widest flex items-center justify-center hover:bg-slate-50 active:scale-95 shadow-sm"><Info className="w-5 h-5 mr-3 text-slate-400" /> 參考聲明</button>
                    </div>
                 </div>
                 <VersionFooter />
              </div>
          </div>
      );
  }

  const progressPercent = Math.min(100, (vaccineCount / MAX_VACCINES) * 100);
  const isUltimateStage = vaccineCount >= MILESTONE_VACCINE_COUNT;

  if (status === GameStatus.GAME_OVER || status === GameStatus.VICTORY) {
    const isVictory = status === GameStatus.VICTORY;
    const isTimeUp = !isVictory && timeLeft <= 0;
    
    return (
      <div className="absolute inset-0 flex items-center justify-center z-[2000] bg-slate-950/80 backdrop-blur-xl p-4 pointer-events-auto animate-in fade-in duration-500">
        <div className={`relative w-full max-sm:max-w-[95%] max-w-md bg-white border-t-[16px] ${isVictory ? 'border-emerald-500' : 'border-rose-500'} rounded-[3rem] p-8 md:p-14 flex flex-col items-center shadow-2xl text-center`}>
          <div className={`w-24 h-24 md:w-32 md:h-32 rounded-[2.5rem] md:rounded-[3.5rem] ${isVictory ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} flex items-center justify-center mb-10 shadow-inner`}>
            {isVictory ? <CheckCircle2 className="w-16 h-16" /> : <AlertTriangle className="w-16 h-16" />}
          </div>
          
          <h2 className={`text-4xl md:text-5xl font-black ${isVictory ? 'text-emerald-600' : 'text-rose-600'} uppercase mb-6 tracking-tighter font-cyber`}>
            {isVictory ? '任務成功' : (isTimeUp ? '時間到' : '任務失敗')}
          </h2>

          <div className="text-base md:text-xl font-bold text-slate-600 mb-12 bg-slate-50 px-8 py-6 rounded-[2rem] border border-slate-100 shadow-inner w-full">
            {isVictory 
              ? `成功獲得 ${MAX_VACCINES} 價疫苗 最廣泛保護get！` 
              : '未能獲取20價。防護力不足，請重新挑戰！'}
          </div>

          <div className="w-full space-y-4">
            <button onClick={() => { audio.init(); restartGame(); }} className={`w-full py-7 ${isVictory ? 'bg-emerald-600' : 'bg-slate-900'} text-white font-black rounded-3xl shadow-2xl flex items-center justify-center space-x-4 active:scale-95 transition-all text-xl md:text-2xl`}>
              <RefreshCcw className="w-8 h-8" />
              <span className="uppercase tracking-widest">{isVictory ? '重新開始' : '重新部署'}</span>
            </button>
            <button onClick={() => { audio.init(); setStatus(GameStatus.MENU); }} className="w-full py-5 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center space-x-3 active:scale-95 hover:bg-slate-50 transition-colors">
              <Home className="w-6 h-6" />
              <span className="uppercase text-xs font-black tracking-widest">返回主頁</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 md:p-12 z-50">
        {status === GameStatus.PAUSED && (
           <div className="absolute inset-0 z-[800] bg-slate-950/40 backdrop-blur-lg flex items-center justify-center p-6 pointer-events-auto">
             <div className="w-full max-w-sm bg-white rounded-[3rem] p-10 shadow-2xl border-b-[10px] border-cyan-500 flex flex-col items-center text-center">
               <div className="w-16 h-16 bg-cyan-50 rounded-3xl flex items-center justify-center text-cyan-600 mb-6"><Pause className="w-8 h-8 fill-current" /></div>
               <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">任務暫停</h2>
               <button onClick={togglePause} className="w-full py-6 bg-slate-900 text-white font-black text-xl rounded-3xl flex items-center justify-center space-x-3 active:scale-95"><Play className="w-6 h-6 fill-white" /><span>繼續任務</span></button>
               <button onClick={() => setStatus(GameStatus.MENU)} className="w-full py-4 mt-4 bg-white border border-slate-200 text-slate-500 font-bold rounded-2xl flex items-center justify-center space-x-2 text-xs uppercase"><span>撤回基地</span></button>
             </div>
           </div>
        )}

        {isMilestonePaused && countdownValue > 0 && (
            <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-slate-900/10 backdrop-blur-[1px]">
                <div className="text-[10rem] md:text-[25rem] font-black text-white font-cyber animate-ping drop-shadow-[0_0_50px_rgba(14,165,233,0.8)]">{countdownValue}</div>
            </div>
        )}

        {showLevelUpPopup && (
          <div className="absolute inset-0 flex items-center justify-center z-[1000] pointer-events-auto bg-slate-950/70 backdrop-blur-xl animate-in fade-in duration-300">
             <div className="w-full max-sm:max-w-[90%] max-w-sm md:max-w-md bg-white p-10 md:p-16 rounded-[4rem] border-t-[16px] border-orange-500 shadow-2xl text-center transform animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 md:w-24 md:h-24 bg-orange-50 rounded-[2.5rem] flex items-center justify-center text-orange-600 mx-auto mb-10"><ShieldCheck className="w-12 h-12" /></div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 uppercase tracking-tighter">繼續努力</h3>
                <p className="text-base md:text-xl text-slate-700 font-bold mb-10 px-2 leading-tight">
                  20價比15價多30%血清型覆蓋，保護更全面，努力取得額外5價保護啦！
                </p>
                <button onClick={dismissMilestone} className="w-full py-6 bg-orange-500 text-white font-black rounded-3xl flex items-center justify-center space-x-6 active:scale-95 text-xl md:text-2xl uppercase tracking-widest shadow-xl">
                  <span>繼續前進</span>
                  <FastForward className="w-8 h-8" />
                </button>
             </div>
          </div>
        )}
        
        <div className="flex flex-col w-full space-y-4 md:space-y-12">
            <div className="flex justify-between items-start w-full">
                <div className={`text-2xl md:text-[12rem] font-black tracking-tighter transition-colors drop-shadow-lg font-cyber whitespace-nowrap ${isUltimateStage ? 'text-red-500 glitch-text' : 'text-sky-400'}`}>
                    {score.toLocaleString()}
                </div>
                
                <div className="flex items-center space-x-3 md:space-x-6 pointer-events-auto">
                    <div className={`text-xl md:text-[9rem] font-black transition-colors drop-shadow-md text-white font-cyber whitespace-nowrap ${timeLeft < 10 ? 'animate-pulse text-red-500' : ''}`}>
                        {timeLeft.toFixed(1)}<span className="text-[10px] md:text-5xl ml-1 font-bold opacity-60">S</span>
                    </div>
                    <button onClick={togglePause} className="p-2 md:p-10 bg-white/95 rounded-xl md:rounded-[4rem] shadow-2xl active:scale-90 transition-transform">
                        {status === GameStatus.PAUSED ? <Play className="w-5 h-5 md:w-16 md:h-16 fill-current text-cyan-600" /> : <Pause className="w-5 h-5 md:w-16 md:h-16 fill-current text-slate-800" />}
                    </button>
                </div>
            </div>

            <div className="w-full flex flex-col items-center">
                <div className="w-full max-w-5xl h-3 md:h-10 bg-slate-200/30 rounded-full overflow-hidden shadow-inner border-[2px] md:border-[4px] border-white/20 relative backdrop-blur-md">
                    <div className={`h-full transition-all duration-1000 ease-out ${isUltimateStage ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)]' : 'bg-cyan-500 shadow-[0_0_30px_rgba(14,165,233,0.5)]'}`} style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="flex justify-between items-center w-full max-w-5xl mt-2 md:mt-4 px-2">
                    <div className="flex items-center space-x-2 md:space-x-4">
                      <span className="text-[8px] md:text-3xl font-black text-white uppercase tracking-widest font-cyber">疫苗進度</span>
                      {isUltimateStage && <div className="px-2 py-0.5 bg-red-600 text-white text-[7px] md:text-xl font-black rounded md:rounded-lg animate-pulse uppercase shadow-[0_0_20px_rgba(220,38,38,0.8)]">CRISIS</div>}
                    </div>
                    <span className={`text-[9px] md:text-4xl font-black font-cyber ${isUltimateStage ? 'text-red-400' : 'text-cyan-300'}`}>{vaccineCount} / {MAX_VACCINES} 價</span>
                </div>
            </div>
        </div>

        <div className="w-full flex justify-between items-end pb-safe">
             <div className={`bg-white/95 px-6 py-3 md:px-16 md:py-10 rounded-2xl md:rounded-[2.5rem] text-xs md:text-6xl font-black font-cyber ${isUltimateStage ? 'text-red-600' : 'text-slate-900'} shadow-2xl tracking-widest uppercase`}>
                LVL {level}
             </div>
             <div className="flex space-x-3 md:space-x-10">
                 <div className="bg-white/95 p-3 md:p-12 rounded-2xl md:rounded-[4rem] shadow-2xl border border-white/50">
                    <Zap className={`w-5 h-5 md:w-20 md:h-20 ${isUltimateStage ? 'text-red-500 animate-pulse' : 'text-cyan-500'}`} />
                 </div>
                 <div className="bg-white/95 p-3 md:p-12 rounded-2xl md:rounded-[4rem] shadow-2xl border border-white/50">
                    <ShieldCheck className={`w-5 h-5 md:w-20 md:h-20 ${isUltimateStage ? 'text-orange-500' : 'text-slate-400'}`} />
                 </div>
             </div>
        </div>
    </div>
  );
};
