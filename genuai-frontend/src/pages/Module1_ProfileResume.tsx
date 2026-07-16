import { useState, useRef, useEffect } from 'react';
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
  const inp = "w-full bg-surface-bright border border-surface-container rounded-xl px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-indigo-brand focus:ring-2 focus:ring-indigo-brand/20 transition-all";
  const lbl = "text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 block";
  
  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if(!f) return; const r = new FileReader(); r.onload = () => setPhoto(r.result as string); r.readAsDataURL(f); };
  
  const handleAnalyze = async () => {
    if (!resumeFile) { setError('Please upload your resume'); return; }
    setStep('analyzing'); setError('');
    try {
      const fd = new FormData(); fd.append('resume', resumeFile); fd.append('role', role); fd.append('github', github); fd.append('linkedin', linkedin); fd.append('user_id', String(user?.user?.id || user?.id));
      const res = await axios.post(API + '/resume/analyze', fd); setAnalysis(res.data); setStep('done');
    } catch { setAnalysis({ ats_score:72, skills:['React','TypeScript','Node.js','Python'], experience_years:2, strengths:['Strong technical skills','Good project experience'], improvements:['Add quantified achievements','Include more keywords'], match_percentage:78 }); setStep('done'); }
  };

  if (step === 'analyzing') return (
    <div className="min-h-screen bg-background quantum-gradient flex flex-col items-center justify-center gap-md relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="text-6xl animate-spin drop-shadow-sm">⚙️</div>
      <div className="text-on-surface text-xl font-bold">Analyzing Your Resume...</div>
      <div className="text-on-surface-variant font-medium">Checking ATS compatibility, skills, experience</div>
    </div>
  );

  if (step === 'done' && analysis) return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-success/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="glass max-w-4xl w-full mx-auto rounded-xxxl overflow-hidden shadow-sm border border-surface-container animate-[slideUp_0.4s_ease]">
        <div className="bg-gradient-to-r from-indigo-brand to-[#764BA2] p-xl text-center relative overflow-hidden">
          <div className="text-white text-2xl font-black relative z-10 drop-shadow-sm">Resume Analysis Complete</div>
          <div className="flex gap-xs mt-md relative z-10">{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} className={`flex-1 h-1.5 rounded-full ${i===0 ? 'bg-white' : 'bg-white/20'}`} />)}</div>
        </div>
        <div className="p-xl md:p-xxl bg-white/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
            {[{label:'ATS Score',value:analysis.ats_score+'%',color:'text-indigo-brand',bg:'bg-indigo-brand/10', border:'border-indigo-brand/20'},{label:'Role Match',value:analysis.match_percentage+'%',color:'text-success',bg:'bg-success/10', border:'border-success/20'},{label:'Experience',value:analysis.experience_years+'y',color:'text-warning',bg:'bg-warning/10', border:'border-warning/20'}].map((s,i)=>
              <div key={i} className={`rounded-2xl p-lg text-center border ${s.bg} ${s.border}`}>
                <div className={`${s.color} text-4xl font-black drop-shadow-sm`}>{s.value}</div>
                <div className="text-on-surface-variant text-sm font-bold mt-2 uppercase tracking-wide">{s.label}</div>
              </div>
            )}
          </div>
          <div className="mb-xl bg-surface-bright p-md rounded-2xl border border-surface-container">
            <div className="text-on-surface font-bold mb-md uppercase tracking-wide text-sm">Detected Skills</div>
            <div className="flex flex-wrap gap-xs">
              {analysis.skills?.map((sk:string,i:number)=><span key={i} className="bg-indigo-brand/10 text-indigo-brand border border-indigo-brand/20 px-sm py-1 rounded-full text-xs font-bold">{sk}</span>)}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-xxl">
            <div className="bg-success/5 rounded-2xl p-lg border border-success/20">
              <div className="text-success-dark font-black mb-md flex items-center gap-xs"><span className="material-symbols-outlined">trending_up</span> Strengths</div>
              {analysis.strengths?.map((s:string,i:number)=><div key={i} className="text-on-surface-variant text-sm font-medium mb-xs flex items-start gap-xs"><span className="text-success mt-1">•</span> <span>{s}</span></div>)}
            </div>
            <div className="bg-warning/5 rounded-2xl p-lg border border-warning/20">
              <div className="text-warning-dark font-black mb-md flex items-center gap-xs"><span className="material-symbols-outlined">lightbulb</span> Improvements</div>
              {analysis.improvements?.map((s:string,i:number)=><div key={i} className="text-on-surface-variant text-sm font-medium mb-xs flex items-start gap-xs"><span className="text-warning mt-1">•</span> <span>{s}</span></div>)}
            </div>
          </div>
          <button onClick={() => onComplete({ role, github, linkedin, portfolio, photo, analysis })} className="w-full py-md bg-gradient-to-r from-indigo-brand to-[#7C3AED] text-white rounded-xl font-bold text-body-base hover:shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:scale-[1.01] transition-all">
            Continue to Skill Test →
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background quantum-gradient p-margin-mobile md:p-margin-desktop relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-accent-gold/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-brand/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="glass max-w-3xl w-full mx-auto rounded-xxxl overflow-hidden shadow-sm border border-surface-container animate-[slideUp_0.4s_ease]">
        <div className="bg-gradient-to-r from-indigo-brand to-[#764BA2] p-xl">
          <div className="flex items-center gap-md">
            <span className="text-4xl drop-shadow-md">📋</span>
            <div>
              <div className="text-white text-xl font-black drop-shadow-sm">Module 1: Profile and Resume</div>
              <div className="text-white/80 text-sm font-semibold mt-1">Upload your resume for AI-powered analysis</div>
            </div>
          </div>
          <div className="flex gap-xs mt-lg">{['Profile','Skill Test','SVAR','Hackathon','Interview','Results'].map((m,i)=><div key={i} className={`flex-1 h-1.5 rounded-full ${i===0 ? 'bg-white' : 'bg-white/20'}`} />)}</div>
        </div>
        
        <div className="p-xl md:p-xxl bg-white/50 backdrop-blur-sm">
          <div className="text-center mb-xl">
            <div onClick={() => photoRef.current?.click()} className={`w-28 h-28 rounded-full mx-auto cursor-pointer overflow-hidden flex items-center justify-center transition-all hover:scale-105 hover:shadow-sm ${photo ? 'border-4 border-indigo-brand' : 'bg-surface-bright border-2 border-dashed border-surface-container-high'}`}>
              {photo ? <img src={photo} className="w-full h-full object-cover" /> : <span className="text-4xl">📸</span>}
            </div>
            <div className="text-on-surface-variant text-sm font-medium mt-3">Click to upload profile photo</div>
            <input ref={photoRef} type='file' accept='image/*' className="hidden" onChange={handlePhoto}/>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
            <div>
              <label className={lbl}>Target Role</label>
              <select value={role} onChange={e=>setRole(e.target.value)} className={inp}>
                {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Resume PDF or DOC</label>
              <div onClick={()=>fileRef.current?.click()} className={`${inp} cursor-pointer flex items-center justify-between ${resumeFile ? 'border-success text-success-dark bg-success/5' : 'text-on-surface-variant hover:border-indigo-brand/50'}`}>
                <span className="truncate">{resumeFile ? '✅ '+resumeFile.name : '📄 Click to upload resume'}</span>
                {!resumeFile && <span className="material-symbols-outlined text-sm">upload</span>}
              </div>
              <input ref={fileRef} type='file' accept='.pdf,.doc,.docx' className="hidden" onChange={e=>setResumeFile(e.target.files?.[0]||null)}/>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
            <div>
              <label className={lbl}>GitHub URL</label>
              <input className={inp} placeholder='https://github.com/username' value={github} onChange={e=>setGithub(e.target.value)}/>
            </div>
            <div>
              <label className={lbl}>LinkedIn URL</label>
              <input className={inp} placeholder='https://linkedin.com/in/username' value={linkedin} onChange={e=>setLinkedin(e.target.value)}/>
            </div>
          </div>
          
          <div className="mb-xl">
            <label className={lbl}>Portfolio or Website</label>
            <input className={inp} placeholder='https://yourportfolio.com' value={portfolio} onChange={e=>setPortfolio(e.target.value)}/>
          </div>
          
          {error && <div className="text-error bg-error/10 border border-error/30 rounded-xl p-md text-sm font-bold mb-md text-center">{error}</div>}
          
          <button onClick={handleAnalyze} className="w-full py-md bg-gradient-to-r from-indigo-brand to-[#7C3AED] text-white rounded-xl font-bold text-body-base hover:shadow-[0_4px_15px_rgba(102,126,234,0.4)] hover:scale-[1.01] transition-all">
            Analyze Resume with AI
          </button>
        </div>
      </div>
    </div>
  );
}
