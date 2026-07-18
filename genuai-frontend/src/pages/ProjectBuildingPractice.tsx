import { useState } from 'react';

interface Props { user: any; onBack: () => void; }

export default function ProjectBuildingPractice({ user, onBack }: Props) {
  const [activeTab, setActiveTab] = useState('server.js');
  const [rightPanel, setRightPanel] = useState('tests');

  return (
    <div className="h-screen bg-background font-body-base text-on-background flex flex-col overflow-hidden relative">
      {/* Decorative */}
      <div className="absolute inset-0 quantum-gradient opacity-50 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 glass border-b border-surface-container/50 px-xl h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-md">
          <div className="font-black text-lg text-on-surface flex items-center gap-xs tracking-tight">
             <span className="material-symbols-outlined text-info">architecture</span> 
             AI Project Builder Practice
          </div>
          <div className="bg-surface-container-high/50 px-sm py-0.5 rounded-md text-xs font-bold text-on-surface-variant flex items-center gap-xs">
            <span className="w-2 h-2 rounded-full bg-info animate-pulse"></span>
            Task: Build RESTful API
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="px-sm py-1 bg-success/10 text-success border border-success/20 rounded-lg text-xs font-bold hover:bg-success/20 transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">play_arrow</span> Run Tests
          </button>
          <button onClick={onBack} className="px-sm py-1 border border-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">close</span> Exit Session
          </button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex overflow-hidden">
        
        {/* Left Side: File Explorer */}
        <div className="w-60 glass border-r border-surface-container/50 flex flex-col">
          <div className="p-md border-b border-surface-container/50 font-black text-xs text-on-surface-variant uppercase tracking-widest flex items-center gap-xs">
            <span className="material-symbols-outlined text-[16px]">folder_open</span> Explorer
          </div>
          <div className="py-sm flex-1 overflow-y-auto">
            {/* Folder: src */}
            <div className="flex flex-col">
              <div className="px-md py-1 flex items-center gap-xs text-on-surface text-sm font-bold cursor-pointer hover:bg-surface-container/30">
                <span className="material-symbols-outlined text-warning-dark text-[18px]">folder</span> src
              </div>
              <div className="flex flex-col">
                <div 
                  onClick={() => setActiveTab('server.js')}
                  className={`pl-xl pr-md py-1 flex items-center gap-xs text-sm cursor-pointer transition-colors ${activeTab === 'server.js' ? 'bg-info/10 text-info font-bold border-r-2 border-info' : 'text-on-surface-variant font-medium hover:bg-surface-container/30'}`}
                >
                  <span className="material-symbols-outlined text-warning-dark text-[16px]">javascript</span> server.js
                </div>
                <div 
                  onClick={() => setActiveTab('auth.js')}
                  className={`pl-xl pr-md py-1 flex items-center gap-xs text-sm cursor-pointer transition-colors ${activeTab === 'auth.js' ? 'bg-info/10 text-info font-bold border-r-2 border-info' : 'text-on-surface-variant font-medium hover:bg-surface-container/30'}`}
                >
                  <span className="material-symbols-outlined text-warning-dark text-[16px]">javascript</span> auth.controller.js
                </div>
              </div>
            </div>
            {/* Folder: tests */}
            <div className="flex flex-col mt-sm">
              <div className="px-md py-1 flex items-center gap-xs text-on-surface text-sm font-bold cursor-pointer hover:bg-surface-container/30">
                <span className="material-symbols-outlined text-warning-dark text-[18px]">folder</span> tests
              </div>
              <div className="flex flex-col">
                <div className="pl-xl pr-md py-1 flex items-center gap-xs text-sm cursor-pointer text-on-surface-variant font-medium hover:bg-surface-container/30">
                  <span className="material-symbols-outlined text-warning-dark text-[16px]">javascript</span> api.test.js
                </div>
              </div>
            </div>
            {/* Root files */}
            <div className="px-md py-1 flex items-center gap-xs text-sm cursor-pointer text-on-surface-variant font-medium hover:bg-surface-container/30 mt-sm">
              <span className="material-symbols-outlined text-error text-[16px]">data_object</span> package.json
            </div>
          </div>
        </div>

        {/* Center: IDE Space */}
        <div className="flex-1 flex flex-col bg-[#0B1120]">
          <div className="flex bg-[#0F172A] border-b border-[#1E293B]">
             <div onClick={() => setActiveTab('server.js')} className={`px-lg py-sm text-sm font-bold cursor-pointer border-t-2 transition-colors flex items-center gap-xs ${activeTab === 'server.js' ? 'bg-[#0B1120] text-info border-info' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800'}`}>
                <span className="material-symbols-outlined text-warning text-[16px]">javascript</span> server.js
             </div>
             <div onClick={() => setActiveTab('auth.js')} className={`px-lg py-sm text-sm font-bold cursor-pointer border-t-2 transition-colors flex items-center gap-xs ${activeTab === 'auth.js' ? 'bg-[#0B1120] text-info border-info' : 'bg-transparent text-slate-500 border-transparent hover:bg-slate-800'}`}>
                <span className="material-symbols-outlined text-warning text-[16px]">javascript</span> auth.controller.js
             </div>
          </div>
          
          <div className="flex-1 p-lg text-[#A5B4FC] font-mono text-sm leading-relaxed overflow-y-auto">
            {activeTab === 'server.js' ? (
              <>
                <div><span className="text-[#C586C0]">const</span> express <span className="text-[#C586C0]">=</span> <span className="text-[#DCDCAA]">require</span>(<span className="text-[#CE9178]">'express'</span>);</div>
                <div><span className="text-[#C586C0]">const</span> authController <span className="text-[#C586C0]">=</span> <span className="text-[#DCDCAA]">require</span>(<span className="text-[#CE9178]">'./auth.controller'</span>);</div>
                <div><span className="text-[#C586C0]">const</span> app <span className="text-[#C586C0]">=</span> <span className="text-[#DCDCAA]">express</span>();</div>
                <br/>
                <div>app.<span className="text-[#DCDCAA]">use</span>(express.<span className="text-[#DCDCAA]">json</span>());</div>
                <br/>
                <div><span className="text-[#6A9955]">// Initialize routes</span></div>
                <div>app.<span className="text-[#DCDCAA]">post</span>(<span className="text-[#CE9178]">'/api/login'</span>, authController.<span className="text-[#DCDCAA]">login</span>);</div>
                <div>app.<span className="text-[#DCDCAA]">post</span>(<span className="text-[#CE9178]">'/api/register'</span>, authController.<span className="text-[#DCDCAA]">register</span>);</div>
                <br/>
                <div><span className="text-[#C586C0]">module</span>.<span className="text-[#9CDCFE]">exports</span> <span className="text-[#C586C0]">=</span> app;</div>
              </>
            ) : (
              <>
                <div><span className="text-[#C586C0]">const</span> jwt <span className="text-[#C586C0]">=</span> <span className="text-[#DCDCAA]">require</span>(<span className="text-[#CE9178]">'jsonwebtoken'</span>);</div>
                <br/>
                <div><span className="text-[#569CD6]">exports</span>.<span className="text-[#DCDCAA]">login</span> <span className="text-[#C586C0]">=</span> <span className="text-[#569CD6]">async</span> (req, res) <span className="text-[#569CD6]">=&gt;</span> {'{'}</div>
                <div>&nbsp;&nbsp;<span className="text-[#6A9955]">// TODO: Add database validation here</span></div>
                <div>&nbsp;&nbsp;<span className="text-[#C586C0]">const</span> token <span className="text-[#C586C0]">=</span> jwt.<span className="text-[#DCDCAA]">sign</span>({'{'} <span className="text-[#9CDCFE]">id</span>: <span className="text-[#B5CEA8]">1</span> {'}'}, <span className="text-[#CE9178]">'secret'</span>);</div>
                <div>&nbsp;&nbsp;<span className="text-[#C586C0]">return</span> res.<span className="text-[#DCDCAA]">json</span>({'{'} <span className="text-[#9CDCFE]">token</span> {'}'});</div>
                <div>{'}'};</div>
              </>
            )}
          </div>

          {/* Terminal */}
          <div className="h-48 border-t border-[#1E293B] bg-[#0F172A] p-md text-slate-300 font-mono text-xs overflow-y-auto shadow-inner">
            <div className="text-success font-bold mb-sm flex items-center gap-xs"><span className="material-symbols-outlined text-[14px]">terminal</span> Terminal</div>
            <div>$ npm run test</div>
            <div className="text-slate-500">&gt; api-challenge@1.0.0 test</div>
            <div className="text-slate-500">&gt; jest</div>
            <div className="mt-sm flex items-center gap-xs">
              <span className="bg-success/20 text-success px-1 rounded font-bold">PASS</span> tests/api.test.js
            </div>
            <div className="flex mt-sm items-center">
              <span className="text-info mr-sm">$</span>
              <input type="text" className="bg-transparent border-none text-slate-300 outline-none flex-1 font-mono placeholder:text-slate-600" placeholder="Type command..." />
            </div>
          </div>
        </div>

        {/* Right Side: Tests & AI Review */}
        <div className="w-[350px] glass border-l border-surface-container/50 flex flex-col">
          <div className="flex border-b border-surface-container/50">
            <button 
              onClick={() => setRightPanel('tests')} 
              className={`flex-1 py-md font-bold text-sm transition-colors flex justify-center items-center gap-xs border-b-2 ${rightPanel === 'tests' ? 'border-info text-info bg-info/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container/30'}`}
            >
              <span className="material-symbols-outlined text-[18px]">fact_check</span> Test Suite
            </button>
            <button 
              onClick={() => setRightPanel('ai')} 
              className={`flex-1 py-md font-bold text-sm transition-colors flex justify-center items-center gap-xs border-b-2 ${rightPanel === 'ai' ? 'border-info text-info bg-info/5' : 'border-transparent text-on-surface-variant hover:bg-surface-container/30'}`}
            >
              <span className="material-symbols-outlined text-[18px]">psychology</span> AI Review
            </button>
          </div>

          <div className="flex-1 p-lg overflow-y-auto">
            {rightPanel === 'tests' ? (
              <div className="flex flex-col gap-md">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-black text-on-surface uppercase tracking-widest">Automated Tests</div>
                  <div className="bg-success/10 text-success px-sm py-0.5 rounded-md text-xs font-bold border border-success/20">2/4 Passed</div>
                </div>
                
                <div className="bg-surface-bright/80 border border-surface-container rounded-xl p-sm shadow-sm">
                  <div className="flex items-center gap-xs text-success font-bold text-sm mb-xs">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> /api/register creates user
                  </div>
                  <div className="text-on-surface-variant text-xs font-medium ml-md pl-1">24ms</div>
                </div>

                <div className="bg-surface-bright/80 border border-surface-container rounded-xl p-sm shadow-sm">
                  <div className="flex items-center gap-xs text-success font-bold text-sm mb-xs">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span> /api/login returns JWT
                  </div>
                  <div className="text-on-surface-variant text-xs font-medium ml-md pl-1">12ms</div>
                </div>

                <div className="bg-error/5 border border-error/20 rounded-xl p-sm shadow-sm">
                  <div className="flex items-center gap-xs text-error font-bold text-sm mb-xs">
                    <span className="material-symbols-outlined text-[16px]">cancel</span> Passwords are hashed in DB
                  </div>
                  <div className="text-error/90 text-xs font-mono bg-error/10 p-sm rounded-lg mt-xs ml-md">
                    Expected bcrypt hash length &gt; 0
                  </div>
                </div>

                <div className="bg-error/5 border border-error/20 rounded-xl p-sm shadow-sm">
                  <div className="flex items-center gap-xs text-error font-bold text-sm mb-xs">
                    <span className="material-symbols-outlined text-[16px]">cancel</span> /api/protected rejects empty token
                  </div>
                  <div className="text-error/90 text-xs font-mono bg-error/10 p-sm rounded-lg mt-xs ml-md">
                    Expected 401 Unauthorized, got 404
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-md animate-[fadeIn_0.3s_ease-out]">
                <div className="flex gap-md">
                  <div className="w-10 h-10 rounded-xl bg-info/10 text-info flex items-center justify-center shrink-0 border border-info/20 shadow-sm">
                     <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <div>
                    <div className="text-sm font-black text-on-surface mb-xs flex items-center gap-xs">GenuAI Code Reviewer</div>
                    <div className="text-sm font-medium text-on-surface-variant leading-relaxed">
                      I noticed you are saving passwords in plain text inside <code className="bg-surface-container px-1 py-0.5 rounded text-on-surface text-xs font-mono">auth.controller.js</code>. This is failing test #3.
                      <br/><br/>
                      <strong className="text-info font-bold flex items-center gap-xs mt-sm"><span className="material-symbols-outlined text-[16px]">lightbulb</span> Recommendation:</strong> Use <code className="bg-info/10 text-info px-1 py-0.5 rounded text-xs font-mono border border-info/20">bcrypt.hash()</code> before inserting the user into the database.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
