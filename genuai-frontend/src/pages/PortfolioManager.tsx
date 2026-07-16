import { useState } from 'react';

interface Props { user: any; onBack: () => void; }

export default function PortfolioManager({ user, onBack }: Props) {
  const [activeTab, setActiveTab] = useState('integrations');
  const [projects, setProjects] = useState([
    { id: 1, title: 'E-Commerce Platform', tech: ['React', 'Node.js', 'MongoDB'], desc: 'A full-stack e-commerce solution with Stripe integration.', source: 'GitHub Sync' },
    { id: 2, title: 'AI Resume Analyzer', tech: ['Python', 'OpenAI', 'FastAPI'], desc: 'Semantic analysis of resumes against job descriptions.', source: 'Manual' }
  ]);

  return (
    <div style={{ height:'100vh', background:'#F8FAFC', display:'flex', flexDirection:'column', fontFamily:"'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ background:'#0F172A', color:'#fff', padding:'0 32px', height:"64px", display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontWeight:"900", fontSize:"18px", display:"flex", alignItems:"center", gap:"12px" }}>
            <span>🎨</span> AI Portfolio Manager
          </div>
        </div>
        <button onClick={onBack} style={{ background:'transparent', border:'1px solid #334155', color:'#94A3B8', padding:'6px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:"13px" }}>
          Exit to Hub
        </button>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden', maxWidth:'1200px', margin:'0 auto', width:'100%', gap:'32px', padding:'32px' }}>
        
        {/* Left Sidebar */}
        <div style={{ width:'280px', display:'flex', flexDirection:'column', gap:'8px' }}>
           <button onClick={() => setActiveTab('integrations')} style={{ padding:'16px', background: activeTab === 'integrations' ? '#EFF6FF' : 'transparent', border:'none', color: activeTab === 'integrations' ? '#2563EB' : '#64748B', fontWeight:'700', fontSize:'14px', borderRadius:'12px', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px' }}>
             <span style={{ fontSize:'18px' }}>🔗</span> Sync & Integrations
           </button>
           <button onClick={() => setActiveTab('projects')} style={{ padding:'16px', background: activeTab === 'projects' ? '#EFF6FF' : 'transparent', border:'none', color: activeTab === 'projects' ? '#2563EB' : '#64748B', fontWeight:'700', fontSize:'14px', borderRadius:'12px', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px' }}>
             <span style={{ fontSize:'18px' }}>📁</span> My Projects
           </button>
           <button onClick={() => setActiveTab('preview')} style={{ padding:'16px', background: activeTab === 'preview' ? '#EFF6FF' : 'transparent', border:'none', color: activeTab === 'preview' ? '#2563EB' : '#64748B', fontWeight:'700', fontSize:'14px', borderRadius:'12px', textAlign:'left', cursor:'pointer', display:'flex', alignItems:'center', gap:'12px' }}>
             <span style={{ fontSize:'18px' }}>👁️</span> Live Preview
           </button>
           
           <div style={{ marginTop:'auto', background:'linear-gradient(135deg,#7C3AED,#3B82F6)', borderRadius:'16px', padding:'24px', color:'#fff', boxShadow:'0 12px 24px rgba(124,58,237,0.2)' }}>
             <div style={{ fontSize:'24px', marginBottom:'8px' }}>✨</div>
             <div style={{ fontWeight:'800', fontSize:'15px', marginBottom:'4px' }}>Auto-Generate</div>
             <p style={{ fontSize:'13px', margin:'0 0 16px', opacity:0.9 }}>Let GenuAI build a stunning portfolio site from your synced data.</p>
             <button style={{ width:'100%', background:'#fff', color:'#7C3AED', border:'none', padding:'10px', borderRadius:'8px', fontWeight:'800', fontSize:'13px', cursor:'pointer' }}>Generate Site</button>
           </div>
        </div>

        {/* Main Content Area */}
        <div style={{ flex:1, background:'#fff', borderRadius:'24px', border:'1px solid #E2E8F0', padding:'40px', overflowY:'auto', boxShadow:'0 12px 32px rgba(0,0,0,0.02)' }}>
           
           {activeTab === 'integrations' && (
             <div>
               <h2 style={{ fontSize:'24px', fontWeight:'900', color:'#0F172A', margin:'0 0 8px' }}>Platform Integrations</h2>
               <p style={{ fontSize:'14px', color:'#64748B', margin:'0 0 32px' }}>Connect your external accounts to automatically sync projects, commits, and problem-solving stats.</p>
               
               <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
                 {/* GitHub */}
                 <div style={{ border:'1px solid #E2E8F0', borderRadius:'16px', padding:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                   <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                     <div style={{ width:'48px', height:'48px', background:'#F8FAFC', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>🐙</div>
                     <div>
                       <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'15px' }}>GitHub</div>
                       <div style={{ fontSize:'13px', color:'#64748B' }}>Sync repositories and commit graphs</div>
                     </div>
                   </div>
                   <button style={{ background:'#EFF6FF', color:'#2563EB', border:'none', padding:'8px 20px', borderRadius:'20px', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Connected</button>
                 </div>

                 {/* LeetCode */}
                 <div style={{ border:'1px solid #E2E8F0', borderRadius:'16px', padding:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                   <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                     <div style={{ width:'48px', height:'48px', background:'#FFFBEB', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>👨‍💻</div>
                     <div>
                       <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'15px' }}>LeetCode</div>
                       <div style={{ fontSize:'13px', color:'#64748B' }}>Showcase algorithmic problem-solving stats</div>
                     </div>
                   </div>
                   <button style={{ background:'transparent', border:'1px solid #E2E8F0', color:'#0F172A', padding:'8px 20px', borderRadius:'20px', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Connect</button>
                 </div>

                 {/* Kaggle */}
                 <div style={{ border:'1px solid #E2E8F0', borderRadius:'16px', padding:'24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                   <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
                     <div style={{ width:'48px', height:'48px', background:'#F0FDF4', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'24px' }}>📊</div>
                     <div>
                       <div style={{ fontWeight:'800', color:'#0F172A', fontSize:'15px' }}>Kaggle</div>
                       <div style={{ fontSize:'13px', color:'#64748B' }}>Sync datasets, models, and competition ranks</div>
                     </div>
                   </div>
                   <button style={{ background:'transparent', border:'1px solid #E2E8F0', color:'#0F172A', padding:'8px 20px', borderRadius:'20px', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>Connect</button>
                 </div>
               </div>
             </div>
           )}

           {activeTab === 'projects' && (
             <div>
               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
                 <div>
                   <h2 style={{ fontSize:'24px', fontWeight:'900', color:'#0F172A', margin:'0 0 8px' }}>My Projects</h2>
                   <p style={{ fontSize:'14px', color:'#64748B', margin:0 }}>Manage the projects that will appear on your public portfolio.</p>
                 </div>
                 <button style={{ background:'#0F172A', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'8px', fontWeight:'700', fontSize:'13px', cursor:'pointer' }}>+ Add Manual Project</button>
               </div>

               <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px' }}>
                 {projects.map(p => (
                   <div key={p.id} style={{ border:'1px solid #E2E8F0', borderRadius:'16px', padding:'24px', display:'flex', flexDirection:'column' }}>
                     <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                       <div style={{ fontSize:'11px', fontWeight:'800', color:'#64748B', textTransform:'uppercase', letterSpacing:'1px', background:'#F1F5F9', padding:'4px 8px', borderRadius:'6px' }}>{p.source}</div>
                       <button style={{ background:'none', border:'none', color:'#94A3B8', cursor:'pointer' }}>⚙️</button>
                     </div>
                     <h3 style={{ fontSize:'16px', fontWeight:'800', color:'#0F172A', margin:'0 0 8px' }}>{p.title}</h3>
                     <p style={{ fontSize:'13px', color:'#64748B', margin:'0 0 16px', flex:1 }}>{p.desc}</p>
                     <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                       {p.tech.map((t, i) => <span key={i} style={{ fontSize:'11px', fontWeight:'700', color:'#2563EB', background:'#EFF6FF', padding:'4px 8px', borderRadius:'6px' }}>{t}</span>)}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {activeTab === 'preview' && (
             <div style={{ height:'100%', display:'flex', flexDirection:'column' }}>
               <h2 style={{ fontSize:'24px', fontWeight:'900', color:'#0F172A', margin:'0 0 8px' }}>Live Portfolio Preview</h2>
               <p style={{ fontSize:'14px', color:'#64748B', margin:'0 0 24px' }}>This is how recruiters will see your AI-generated portfolio.</p>
               
               <div style={{ flex:1, border:'4px solid #E2E8F0', borderRadius:'16px', overflow:'hidden', background:'#0F172A', color:'#fff', display:'flex', flexDirection:'column' }}>
                 <div style={{ padding:'8px 16px', background:'#1E293B', display:'flex', gap:'8px' }}>
                   <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#EF4444' }}></div>
                   <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#F59E0B' }}></div>
                   <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#10B981' }}></div>
                 </div>
                 <div style={{ flex:1, padding:'64px 40px', textAlign:'center', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center' }}>
                   <div style={{ width:'100px', height:'100px', borderRadius:'50%', background:'linear-gradient(135deg,#2563EB,#7C3AED)', marginBottom:'24px' }}></div>
                   <h1 style={{ fontSize:'36px', fontWeight:'900', margin:'0 0 16px' }}>Jane Doe</h1>
                   <p style={{ fontSize:'18px', color:'#94A3B8', maxWidth:'400px', lineHeight:'1.6', margin:'0 0 32px' }}>Full Stack Engineer bridging the gap between design and scalable backend systems.</p>
                   <div style={{ display:'flex', gap:'16px' }}>
                     <button style={{ background:'#fff', color:'#0F172A', border:'none', padding:'12px 24px', borderRadius:'24px', fontWeight:'800', fontSize:'14px' }}>View Projects</button>
                     <button style={{ background:'transparent', color:'#fff', border:'2px solid #334155', padding:'12px 24px', borderRadius:'24px', fontWeight:'800', fontSize:'14px' }}>Download Resume</button>
                   </div>
                 </div>
               </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
}
