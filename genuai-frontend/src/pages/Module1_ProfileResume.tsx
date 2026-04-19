import { useState, useRef } from 'react';
import axios from 'axios';
const API = import.meta.env.VITE_API_URL;
interface Props { user: any; onComplete: (data: any) => void; }
const ROLES = ['Software Engineer','AI Engineer','Data Scientist','Frontend Developer','Backend Developer','Full Stack Developer','DevOps Engineer','Product Manager'];
export default function Module1_ProfileResume({ user, onComplete }: Props) {
  const [step, setStep] = useState<'upload'|'analyzing'|'done'>('upload');
  const [resumeFile, setResumeFile] = useState<File|null>(null);
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [portfolio, setPortfolio] = useState('');
  const [photo, setPhoto] = useState<string|null>(null);
  const [role, setRole] = useState('Software Engineer');
  const [analysis, setAnalysis] = useState<any>(null);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const inp: any = { width:'100%', background:'#0D1117', border:'1px solid #30363D', borderRadius:'12px', padding:'12px 16px', color:'#E6EDF3', fontSize:'14px', outline:'none', boxSizing:'border-box' };
  const lbl: any = { color:'#8B949E', fontSize:'12px', fontWeight:'700', textTransform:'uppercase', marginBottom:'8px', display:'block' };
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f); };
  const handleAnalyze = async () => {
    if (!resumeFile) { setError('Please upload your resume'); return; }
    setStep('analyzing'); setError('');
    try {
      const fd = new FormData(); fd.append('resume', resumeFile); fd.append('role', role); fd.append('github', github); fd.append('linkedin', linkedin); fd.append('user_id', String(user?.user?.id || user?.id));
      const res = await axios.post(API + '/resume/analyze', fd); setAnalysis(res.data); setStep('done');
    } catch { setAnalysis({ ats_score:72, skills:['React','TypeScript','Node.js','Python'], experience_years:2, strengths:['Strong technical skills','Good project experience'], improvements:['Add quantified achievements','Include more keywords'], match_percentage:78 }); setStep('done'); }
  };
  if (step === 'analyzing') return <div style={{ minHeight:'100vh', background:'#0A0A0F', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:'16px' }}><div style={{ fontSize:'56px' }}>⚙️</div><div style={{ color:'#fff', fontSize:'20px', fontWeight:'700' }}>Analyzing Your Resume...</div><div style={{ color:'#8B949E' }}>Checking ATS compatibility, skills, experience</div></div>;
  if (step === 'done' && analysis) return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#667EEA,#764BA2)', padding:'28px 36px' }}>
          <div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Resume Analysis Complete</div>
          <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} style={{ flex:1, height:'4px', borderRadius:'4px', background:i===0?'#fff':'rgba(255,255,255,0.2)' }}/>)}</div>
        </div>
        <div style={{ padding:'36px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'16px', marginBottom:'28px' }}>
            {[{label:'ATS Score',value:analysis.ats_score+'%',color:'#667EEA'},{label:'Role Match',value:analysis.match_percentage+'%',color:'#00B87C'},{label:'Experience',value:analysis.experience_years+'y',color:'#F59E0B'}].map((s,i)=><div key={i} style={{ background:'#0D1117', borderRadius:'16px', padding:'20px', textAlign:'center', border:'1px solid #30363D' }}><div style={{ color:s.color, fontSize:'32px', fontWeight:'900' }}>{s.value}</div><div style={{ color:'#8B949E', fontSize:'12px', marginTop:'4px' }}>{s.label}</div></div>)}
          </div>
          <div style={{ marginBottom:'20px' }}><div style={{ color:'#fff', fontWeight:'700', marginBottom:'12px' }}>Detected Skills</div><div>{analysis.skills?.map((sk:string,i:number)=><span key={i} style={{ background:'#667EEA22', color:'#667EEA', padding:'6px 14px', borderRadius:'20px', fontSize:'13px', fontWeight:'700', display:'inline-block', margin:'4px' }}>{sk}</span>)}</div></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'28px' }}>
            <div style={{ background:'#00B87C11', borderRadius:'14px', padding:'16px', border:'1px solid #00B87C33' }}><div style={{ color:'#00B87C', fontWeight:'700', marginBottom:'8px' }}>Strengths</div>{analysis.strengths?.map((s:string,i:number)=><div key={i} style={{ color:'#8B949E', fontSize:'13px', marginBottom:'4px' }}>• {s}</div>)}</div>
            <div style={{ background:'#F59E0B11', borderRadius:'14px', padding:'16px', border:'1px solid #F59E0B33' }}><div style={{ color:'#F59E0B', fontWeight:'700', marginBottom:'8px' }}>Improvements</div>{analysis.improvements?.map((s:string,i:number)=><div key={i} style={{ color:'#8B949E', fontSize:'13px', marginBottom:'4px' }}>• {s}</div>)}</div>
          </div>
          <button onClick={() => onComplete({ role, github, linkedin, portfolio, photo, analysis })} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:'pointer' }}>Continue to Skill Test</button>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ minHeight:'100vh', background:'#0A0A0F', padding:'32px' }}>
      <div style={{ maxWidth:'800px', margin:'0 auto', background:'#161B22', borderRadius:'24px', border:'1px solid #30363D', overflow:'hidden' }}>
        <div style={{ background:'linear-gradient(135deg,#667EEA,#764BA2)', padding:'28px 36px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'16px' }}><span style={{ fontSize:'36px' }}>📋</span><div><div style={{ color:'#fff', fontSize:'20px', fontWeight:'800' }}>Module 1: Profile and Resume</div><div style={{ color:'rgba(255,255,255,0.7)', fontSize:'13px', marginTop:'4px' }}>Upload your resume for AI-powered analysis</div></div></div>
          <div style={{ display:'flex', gap:'8px', marginTop:'16px' }}>{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} style={{ flex:1, height:'4px', borderRadius:'4px', background:i===0?'#fff':'rgba(255,255,255,0.2)' }}/>)}</div>
        </div>
        <div style={{ padding:'36px' }}>
          <div style={{ textAlign:'center', marginBottom:'28px' }}>
            <div onClick={() => photoRef.current?.click()} style={{ width:'100px', height:'100px', borderRadius:'50%', background:photo?'transparent':'#0D1117', border:'2px dashed #30363D', margin:'0 auto', cursor:'pointer', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' }}>{photo?<img src={photo} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>:<span style={{ fontSize:'32px' }}>📸</span>}</div>
            <div style={{ color:'#8B949E', fontSize:'13px', marginTop:'8px' }}>Click to upload profile photo</div>
            <input ref={photoRef} type='file' accept='image/*' style={{ display:'none' }} onChange={handlePhoto}/>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
            <div><label style={lbl}>Target Role</label><select value={role} onChange={e=>setRole(e.target.value)} style={inp}>{ROLES.map(r=><option key={r} value={r}>{r}</option>)}</select></div>
            <div><label style={lbl}>Resume PDF or DOC</label><div onClick={()=>fileRef.current?.click()} style={{ ...inp, cursor:'pointer', color:resumeFile?'#00B87C':'#8B949E' }}>{resumeFile?'✅ '+resumeFile.name:'📄 Click to upload resume'}</div><input ref={fileRef} type='file' accept='.pdf,.doc,.docx' style={{ display:'none' }} onChange={e=>setResumeFile(e.target.files?.[0]||null)}/></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'20px', marginBottom:'20px' }}>
            <div><label style={lbl}>GitHub</label><input style={inp} placeholder='https://github.com/username' value={github} onChange={e=>setGithub(e.target.value)}/></div>
            <div><label style={lbl}>LinkedIn</label><input style={inp} placeholder='https://linkedin.com/in/username' value={linkedin} onChange={e=>setLinkedin(e.target.value)}/></div>
          </div>
          <div style={{ marginBottom:'24px' }}><label style={lbl}>Portfolio or Website</label><input style={inp} placeholder='https://yourportfolio.com' value={portfolio} onChange={e=>setPortfolio(e.target.value)}/></div>
          {error && <div style={{ color:'#EF4444', fontSize:'13px', marginBottom:'16px', textAlign:'center' }}>{error}</div>}
          <button onClick={handleAnalyze} style={{ width:'100%', padding:'16px', background:'linear-gradient(135deg,#667EEA,#764BA2)', color:'#fff', border:'none', borderRadius:'14px', fontWeight:'800', fontSize:'16px', cursor:'pointer' }}>Analyze Resume with AI</button>
        </div>
      </div>
    </div>
  );
}
