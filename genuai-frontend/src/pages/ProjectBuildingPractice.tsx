import { useState } from 'react';

interface Props { user: any; onBack: () => void; }

export default function ProjectBuildingPractice({ user, onBack }: Props) {
  const [activeTab, setActiveTab] = useState('server.js');
  const [rightPanel, setRightPanel] = useState('tests');

  return (
    <div style={{ height:'100vh', background:'#F8FAFC', display:'flex', flexDirection:'column', fontFamily:"'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background:'#fff', color:'#0F172A', padding:'0 32px', height:"64px", display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0, borderBottom:'1px solid #E2E8F0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontWeight:"900", fontSize:"18px", display:"flex", alignItems:"center", gap:"12px" }}>
            <span>🚀</span> AI Project Builder Practice
          </div>
          <div style={{ background:"#F1F5F9", padding:"4px 12px", borderRadius:"6px", fontSize:"12px", fontWeight:"700", color:"#475569" }}>
            Task: Build RESTful API
          </div>
        </div>
        <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
          <button style={{ background:'#10B981', color:'#fff', border:'none', padding:'6px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'700', fontSize:"13px" }}>
            ▶ Run Tests
          </button>
          <button onClick={onBack} style={{ background:'transparent', border:'1px solid #E2E8F0', color:'#64748B', padding:'6px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:"13px" }}>
            Exit Session
          </button>
        </div>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        
        {/* Left Side: File Explorer */}
        <div style={{ width:'240px', background:'#F8FAFC', borderRight:'1px solid #E2E8F0', display:'flex', flexDirection:'column' }}>
          <div style={{ padding:'16px', borderBottom:'1px solid #E2E8F0', fontWeight:'800', fontSize:'12px', color:'#64748B', textTransform:'uppercase', letterSpacing:'1px' }}>
            Explorer
          </div>
          <div style={{ padding:'8px 0', flex:1, overflowY:'auto' }}>
            {/* Folder: src */}
            <div style={{ display:'flex', flexDirection:'column' }}>
              <div style={{ padding:'6px 16px', display:'flex', alignItems:'center', gap:'8px', color:'#0F172A', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                <span>📁</span> src
              </div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                <div 
                  onClick={() => setActiveTab('server.js')}
                  style={{ padding:'6px 16px 6px 36px', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', background: activeTab === 'server.js' ? '#EFF6FF' : 'transparent', color: activeTab === 'server.js' ? '#2563EB' : '#475569', fontWeight: activeTab === 'server.js' ? '600' : '400' }}
                >
                  <span style={{ color:'#F59E0B' }}>JS</span> server.js
                </div>
                <div 
                  onClick={() => setActiveTab('auth.js')}
                  style={{ padding:'6px 16px 6px 36px', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', background: activeTab === 'auth.js' ? '#EFF6FF' : 'transparent', color: activeTab === 'auth.js' ? '#2563EB' : '#475569', fontWeight: activeTab === 'auth.js' ? '600' : '400' }}
                >
                  <span style={{ color:'#F59E0B' }}>JS</span> auth.controller.js
                </div>
              </div>
            </div>
            {/* Folder: tests */}
            <div style={{ display:'flex', flexDirection:'column', marginTop:'8px' }}>
              <div style={{ padding:'6px 16px', display:'flex', alignItems:'center', gap:'8px', color:'#0F172A', fontSize:'13px', fontWeight:'700', cursor:'pointer' }}>
                <span>📁</span> tests
              </div>
              <div style={{ display:'flex', flexDirection:'column' }}>
                <div style={{ padding:'6px 16px 6px 36px', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', color:'#475569' }}>
                  <span style={{ color:'#F59E0B' }}>JS</span> api.test.js
                </div>
              </div>
            </div>
            {/* Root files */}
            <div style={{ padding:'6px 16px', display:'flex', alignItems:'center', gap:'8px', fontSize:'13px', cursor:'pointer', color:'#475569', marginTop:'8px' }}>
              <span style={{ color:'#EF4444' }}>{}</span> package.json
            </div>
          </div>
        </div>

        {/* Center: IDE Space */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', background:'#1E293B' }}>
          <div style={{ display:'flex', background:'#0F172A', borderBottom:'1px solid #334155' }}>
             <div onClick={() => setActiveTab('server.js')} style={{ background: activeTab === 'server.js' ? '#1E293B' : 'transparent', color: activeTab === 'server.js' ? '#E2E8F0' : '#94A3B8', padding:'12px 24px', fontSize:'13px', fontWeight:'600', cursor:'pointer', borderTop: activeTab === 'server.js' ? '2px solid #38BDF8' : '2px solid transparent' }}>server.js</div>
             <div onClick={() => setActiveTab('auth.js')} style={{ background: activeTab === 'auth.js' ? '#1E293B' : 'transparent', color: activeTab === 'auth.js' ? '#E2E8F0' : '#94A3B8', padding:'12px 24px', fontSize:'13px', fontWeight:'600', cursor:'pointer', borderTop: activeTab === 'auth.js' ? '2px solid #38BDF8' : '2px solid transparent' }}>auth.controller.js</div>
          </div>
          
          <div style={{ flex:1, padding:'24px', color:'#A5B4FC', fontFamily:'monospace', fontSize:'14px', lineHeight:'1.6', overflowY:'auto' }}>
            {activeTab === 'server.js' ? (
              <>
                <div><span style={{ color:'#C586C0' }}>const</span> express <span style={{ color:'#C586C0' }}>=</span> <span style={{ color:'#DCDCAA' }}>require</span>(<span style={{ color:'#CE9178' }}>'express'</span>);</div>
                <div><span style={{ color:'#C586C0' }}>const</span> authController <span style={{ color:'#C586C0' }}>=</span> <span style={{ color:'#DCDCAA' }}>require</span>(<span style={{ color:'#CE9178' }}>'./auth.controller'</span>);</div>
                <div><span style={{ color:'#C586C0' }}>const</span> app <span style={{ color:'#C586C0' }}>=</span> <span style={{ color:'#DCDCAA' }}>express</span>();</div>
                <br/>
                <div>app.<span style={{ color:'#DCDCAA' }}>use</span>(express.<span style={{ color:'#DCDCAA' }}>json</span>());</div>
                <br/>
                <div><span style={{ color:'#6A9955' }}>// Initialize routes</span></div>
                <div>app.<span style={{ color:'#DCDCAA' }}>post</span>(<span style={{ color:'#CE9178' }}>'/api/login'</span>, authController.<span style={{ color:'#DCDCAA' }}>login</span>);</div>
                <div>app.<span style={{ color:'#DCDCAA' }}>post</span>(<span style={{ color:'#CE9178' }}>'/api/register'</span>, authController.<span style={{ color:'#DCDCAA' }}>register</span>);</div>
                <br/>
                <div><span style={{ color:'#C586C0' }}>module</span>.<span style={{ color:'#9CDCFE' }}>exports</span> <span style={{ color:'#C586C0' }}>=</span> app;</div>
              </>
            ) : (
              <>
                <div><span style={{ color:'#C586C0' }}>const</span> jwt <span style={{ color:'#C586C0' }}>=</span> <span style={{ color:'#DCDCAA' }}>require</span>(<span style={{ color:'#CE9178' }}>'jsonwebtoken'</span>);</div>
                <br/>
                <div><span style={{ color:'#569CD6' }}>exports</span>.<span style={{ color:'#DCDCAA' }}>login</span> <span style={{ color:'#C586C0' }}>=</span> <span style={{ color:'#569CD6' }}>async</span> (req, res) <span style={{ color:'#569CD6' }}>=&gt;</span> {'{'}</div>
                <div>&nbsp;&nbsp;<span style={{ color:'#6A9955' }}>// TODO: Add database validation here</span></div>
                <div>&nbsp;&nbsp;<span style={{ color:'#C586C0' }}>const</span> token <span style={{ color:'#C586C0' }}>=</span> jwt.<span style={{ color:'#DCDCAA' }}>sign</span>({'{'} <span style={{ color:'#9CDCFE' }}>id</span>: <span style={{ color:'#B5CEA8' }}>1</span> {'}'}, <span style={{ color:'#CE9178' }}>'secret'</span>);</div>
                <div>&nbsp;&nbsp;<span style={{ color:'#C586C0' }}>return</span> res.<span style={{ color:'#DCDCAA' }}>json</span>({'{'} <span style={{ color:'#9CDCFE' }}>token</span> {'}'});</div>
                <div>{'}'};</div>
              </>
            )}
          </div>

          {/* Terminal */}
          <div style={{ height:'200px', borderTop:'1px solid #334155', background:'#0F172A', padding:'16px', color:'#E2E8F0', fontFamily:'monospace', fontSize:'13px', overflowY:'auto' }}>
            <div style={{ color:'#10B981', marginBottom:'8px', fontWeight:'700' }}>Terminal</div>
            <div>$ npm run test</div>
            <div style={{ color:'#94A3B8' }}>&gt; api-challenge@1.0.0 test</div>
            <div style={{ color:'#94A3B8' }}>&gt; jest</div>
            <div style={{ marginTop:'8px' }}>
              <span style={{ color:'#10B981' }}>PASS</span> tests/api.test.js
            </div>
            <div style={{ display:'flex', marginTop:'8px' }}>
              <span style={{ color:'#38BDF8', marginRight:'8px' }}>$</span>
              <input type="text" style={{ background:'transparent', border:'none', color:'#E2E8F0', outline:'none', flex:1, fontFamily:'monospace' }} />
            </div>
          </div>
        </div>

        {/* Right Side: Tests & AI Review */}
        <div style={{ width:'350px', background:'#fff', borderLeft:'1px solid #E2E8F0', display:'flex', flexDirection:'column' }}>
          <div style={{ display:'flex', borderBottom:'1px solid #E2E8F0' }}>
            <button onClick={() => setRightPanel('tests')} style={{ flex:1, padding:'16px', background:'none', border:'none', borderBottom: rightPanel === 'tests' ? '2px solid #2563EB' : '2px solid transparent', color: rightPanel === 'tests' ? '#2563EB' : '#64748B', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Test Suite</button>
            <button onClick={() => setRightPanel('ai')} style={{ flex:1, padding:'16px', background:'none', border:'none', borderBottom: rightPanel === 'ai' ? '2px solid #2563EB' : '2px solid transparent', color: rightPanel === 'ai' ? '#2563EB' : '#64748B', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>AI Review</button>
          </div>

          <div style={{ flex:1, padding:'20px', overflowY:'auto' }}>
            {rightPanel === 'tests' ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ fontSize:'14px', fontWeight:'800', color:'#0F172A' }}>Automated Tests</div>
                  <div style={{ background:'#ECFDF5', color:'#059669', padding:'4px 8px', borderRadius:'12px', fontSize:'12px', fontWeight:'700' }}>2/4 Passed</div>
                </div>
                
                <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'12px', padding:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#059669', fontWeight:'700', fontSize:'13px', marginBottom:'4px' }}>
                    <span>✓</span> /api/register creates user
                  </div>
                  <div style={{ color:'#64748B', fontSize:'12px' }}>24ms</div>
                </div>

                <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'12px', padding:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#059669', fontWeight:'700', fontSize:'13px', marginBottom:'4px' }}>
                    <span>✓</span> /api/login returns JWT
                  </div>
                  <div style={{ color:'#64748B', fontSize:'12px' }}>12ms</div>
                </div>

                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'12px', padding:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#DC2626', fontWeight:'700', fontSize:'13px', marginBottom:'4px' }}>
                    <span>✗</span> Passwords are hashed in DB
                  </div>
                  <div style={{ color:'#EF4444', fontSize:'12px', fontFamily:'monospace', background:'#FEE2E2', padding:'8px', borderRadius:'8px', marginTop:'8px' }}>
                    Expected bcrypt hash length &gt; 0
                  </div>
                </div>

                <div style={{ background:'#FEF2F2', border:'1px solid #FECACA', borderRadius:'12px', padding:'12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', color:'#DC2626', fontWeight:'700', fontSize:'13px', marginBottom:'4px' }}>
                    <span>✗</span> /api/protected rejects empty token
                  </div>
                  <div style={{ color:'#EF4444', fontSize:'12px', fontFamily:'monospace', background:'#FEE2E2', padding:'8px', borderRadius:'8px', marginTop:'8px' }}>
                    Expected 401 Unauthorized, got 404
                  </div>
                </div>

              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                <div style={{ display:'flex', gap:'12px' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'8px', background:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px' }}>🤖</div>
                  <div>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A', marginBottom:'4px' }}>GenuAI Code Reviewer</div>
                    <div style={{ fontSize:'13px', color:'#475569', lineHeight:'1.5' }}>
                      I noticed you are saving passwords in plain text inside <code>auth.controller.js</code>. This is failing test #3.
                      <br/><br/>
                      <strong>Recommendation:</strong> Use <code>bcrypt.hash()</code> before inserting the user into the database.
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
