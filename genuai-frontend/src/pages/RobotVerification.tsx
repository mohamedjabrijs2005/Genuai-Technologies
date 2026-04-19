
import { useState, useEffect } from 'react';

interface Props { onVerified: () => void; }

const GRID_IMAGES = [
  { emoji:'🚦', label:'traffic light', isTarget:true },
  { emoji:'🌳', label:'tree', isTarget:false },
  { emoji:'🚦', label:'traffic light', isTarget:true },
  { emoji:'🚗', label:'car', isTarget:false },
  { emoji:'🚦', label:'traffic light', isTarget:true },
  { emoji:'🏠', label:'house', isTarget:false },
  { emoji:'🌸', label:'flower', isTarget:false },
  { emoji:'🚦', label:'traffic light', isTarget:true },
  { emoji:'⛅', label:'cloud', isTarget:false },
];

export default function RobotVerification({ onVerified }: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [status, setStatus] = useState<'idle'|'checking'|'pass'|'fail'>('idle');
  const [attempts, setAttempts] = useState(0);

  const toggle = (i: number) => {
    setSelected(prev => { const n = new Set(prev); n.has(i)?n.delete(i):n.add(i); return n; });
    setStatus('idle');
  };

  const verify = () => {
    setStatus('checking');
    setTimeout(() => {
      const correct = GRID_IMAGES.every((img,i)=> img.isTarget===selected.has(i));
      if(correct) { setStatus('pass'); setTimeout(onVerified, 1200); }
      else { setStatus('fail'); setSelected(new Set()); setAttempts(a=>a+1); setTimeout(()=>setStatus('idle'),1500); }
    }, 800);
  };

  return (
    <div style={{ minHeight:'100vh', background:'#F8FAFC', fontFamily:"'Inter','Segoe UI',sans-serif", display:'flex', flexDirection:'column' }}>
      {/* Navbar */}
      <nav style={{ background:'#fff', borderBottom:'1px solid #E5E7EB', padding:'0 40px', height:'64px', display:'flex', alignItems:'center', justifyContent:'space-between', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <div style={{ width:'38px', height:'38px', borderRadius:'10px', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'900', fontSize:'16px' }}>G</div>
          <div>
            <div style={{ fontWeight:'800', fontSize:'16px', color:'#0F172A' }}>GenuAI Technologies</div>
            <div style={{ fontSize:'11px', color:'#64748B' }}>Identity Verification</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px', background:'#FEF9C3', border:'1px solid #FDE047', borderRadius:'8px', padding:'6px 14px' }}>
          <span style={{ fontSize:'14px' }}>🔐</span>
          <span style={{ fontSize:'13px', color:'#854D0E', fontWeight:'600' }}>Secure Session</span>
        </div>
      </nav>

      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px' }}>
        <div style={{ width:'100%', maxWidth:'420px' }}>
          {/* CAPTCHA Card */}
          <div style={{ background:'#fff', borderRadius:'24px', border:'1px solid #E5E7EB', boxShadow:'0 8px 40px rgba(0,0,0,0.08)', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ background:'linear-gradient(135deg,#2563EB,#7C3AED)', padding:'20px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ color:'#fff', fontWeight:'800', fontSize:'15px' }}>Human Verification</div>
                <div style={{ color:'rgba(255,255,255,0.75)', fontSize:'12px', marginTop:'2px' }}>GenuAI Assessment Security</div>
              </div>
              <div style={{ fontSize:'28px' }}>🛡️</div>
            </div>

            <div style={{ padding:'28px' }}>
              <div style={{ background:'#F1F5F9', borderRadius:'12px', padding:'14px 16px', marginBottom:'20px', border:'1px solid #E2E8F0' }}>
                <div style={{ fontSize:'13px', fontWeight:'700', color:'#0F172A', marginBottom:'4px' }}>Select all images with a</div>
                <div style={{ fontSize:'18px', fontWeight:'900', color:'#2563EB' }}>Traffic Light 🚦</div>
                <div style={{ fontSize:'12px', color:'#64748B', marginTop:'4px' }}>Click all matching squares, then verify</div>
              </div>

              {/* Grid */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px', marginBottom:'20px' }}>
                {GRID_IMAGES.map((img,i)=>(
                  <div
                    key={i}
                    onClick={()=>toggle(i)}
                    style={{ aspectRatio:'1', borderRadius:'12px', border:selected.has(i)?'3px solid #2563EB':'2px solid #E5E7EB', background:selected.has(i)?'#EFF6FF':'#F8FAFC', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'36px', cursor:'pointer', transition:'all 0.15s', position:'relative', userSelect:'none' as any }}
                  >
                    {img.emoji}
                    {selected.has(i) && <div style={{ position:'absolute', top:'4px', right:'4px', width:'18px', height:'18px', borderRadius:'50%', background:'#2563EB', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', color:'#fff' }}>✓</div>}
                  </div>
                ))}
              </div>

              {/* Status */}
              {status==='pass' && <div style={{ background:'#DCFCE7', border:'1px solid #86EFAC', borderRadius:'10px', padding:'12px', textAlign:'center', color:'#166534', fontWeight:'700', fontSize:'14px', marginBottom:'16px' }}>✅ Verified! Proceeding...</div>}
              {status==='fail' && <div style={{ background:'#FEE2E2', border:'1px solid #FCA5A5', borderRadius:'10px', padding:'12px', textAlign:'center', color:'#7F1D1D', fontWeight:'700', fontSize:'14px', marginBottom:'16px' }}>❌ Incorrect — try again (Attempt {attempts})</div>}
              {status==='checking' && <div style={{ background:'#DBEAFE', border:'1px solid #93C5FD', borderRadius:'10px', padding:'12px', textAlign:'center', color:'#1E3A8A', fontWeight:'700', fontSize:'14px', marginBottom:'16px' }}>⏳ Verifying...</div>}

              <button
                onClick={verify}
                disabled={status==='checking'||status==='pass'||selected.size===0}
                style={{ width:'100%', padding:'13px', background:selected.size>0&&status==='idle'?'linear-gradient(135deg,#2563EB,#7C3AED)':'#E5E7EB', color:selected.size>0&&status==='idle'?'#fff':'#9CA3AF', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'14px', cursor:selected.size>0&&status==='idle'?'pointer':'not-allowed', transition:'all 0.2s' }}
              >
                {status==='checking'?'Verifying...':'Verify — I\'m Not a Robot'}
              </button>
            </div>

            {/* Footer */}
            <div style={{ borderTop:'1px solid #F1F5F9', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div style={{ fontSize:'11px', color:'#94A3B8' }}>Protected by GenuAI Security</div>
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <div style={{ width:'20px', height:'20px', borderRadius:'4px', background:'linear-gradient(135deg,#2563EB,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:'900', fontSize:'9px' }}>G</div>
                <span style={{ fontSize:'11px', fontWeight:'700', color:'#374151' }}>GenuAI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
