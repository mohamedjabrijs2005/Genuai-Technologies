import { useState, useRef, useCallback } from "react";
import axios from "axios";
const API = import.meta.env.VITE_API_URL;
interface Props { user: any; onLogout: () => void; onBack: () => void; roomId?: string | null; autoStart?: boolean; }
export default function InterviewRoom({ user, onLogout, onBack, roomId }: Props) {
  const [phase, setPhase] = useState<"env_check"|"waiting"|"active"|"terminated">("env_check");
  const [envAnalyzing, setEnvAnalyzing] = useState(false);
  const [riskLevel, setRiskLevel] = useState<"LOW"|"MEDIUM"|"HIGH">("LOW");
  const [countdown, setCountdown] = useState(300);
  const [mobileConnected] = useState(false);
  const [cheatLog, setCheatLog] = useState<{time:string,event:string,level:string}[]>([]);
  const [cheatCount, setCheatCount] = useState(0);
  const [warning, setWarning] = useState("");
  const [warningLevel, setWarningLevel] = useState<"yellow"|"red">("yellow");
  const [timer, setTimer] = useState(0);
  const [showLog, setShowLog] = useState(false);
  const [emotion, setEmotion] = useState("Neutral");
  const [emotionColor, setEmotionColor] = useState("#00B87C");
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [motionAlert, setMotionAlert] = useState(false);
  const [mode, setMode] = useState<"interview"|"coach">("interview");
  const [coachRole, setCoachRole] = useState("Software Engineer");
  const [coachRound, setCoachRound] = useState("Technical");
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [evaluation, setEvaluation] = useState<any>(null);
  const [coachLoading, setCoachLoading] = useState(false);
  const [sessionScore, setSessionScore] = useState<number[]>([]);
  const ROLES = ["Software Engineer","AI Engineer","Data Scientist","Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Product Manager"];
  const localRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const emotionCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream|null>(null);
  const analyserRef = useRef<AnalyserNode|null>(null);
  const timerRef = useRef<any>(null);
  const noiseRef = useRef<any>(null);
  const motionRef = useRef<any>(null);
  const emotionRef = useRef<any>(null);
  const prevFrameRef = useRef<ImageData|null>(null);
  const countdownRef = useRef<any>(null);
  const userName = user?.user?.name || user?.name || "Candidate";
  const activeRoomId = roomId || "";
  const btn: any = { padding:"10px 20px", borderRadius:"10px", border:"none", cursor:"pointer", fontWeight:"700", fontSize:"13px" };
  const fmt = (s:number) => Math.floor(s/60)+":"+(s%60<10?"0":"")+s%60;
  const logViolation = useCallback((event:string, level:"yellow"|"red"="yellow") => {
    const time = new Date().toLocaleTimeString();
    setCheatLog(prev => [...prev,{time,event,level}]);
    setCheatCount(p => p+1); setWarning(event); setWarningLevel(level);
    setTimeout(() => setWarning(""), 5000);
  }, []);
  const terminateInterview = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    if (document.fullscreenElement) document.exitFullscreen();
    [timerRef,noiseRef,motionRef,emotionRef].forEach(r => clearInterval(r.current));
    setPhase("terminated");
  }, []);
  const captureEnvPhoto = async () => {
    try {
      setEnvAnalyzing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width:640, height:480 } });
      const video = document.createElement("video");
      video.srcObject = stream; await video.play();
      await new Promise(r => setTimeout(r, 900));
      const canvas = document.createElement("canvas");
      canvas.width = 640; canvas.height = 480;
      canvas.getContext("2d")!.drawImage(video, 0, 0, 640, 480);
      const photo = canvas.toDataURL("image/jpeg", 0.85);
      stream.getTracks().forEach(t => t.stop());
      analyzeEnvironment(photo);
    } catch { setEnvAnalyzing(false); alert("Camera access required."); }
  };
  const analyzeEnvironment = (photo:string) => {
    setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        const W=200, H=150;
        const canvas = document.createElement("canvas");
        canvas.width=W; canvas.height=H;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img,0,0,W,H);
        const data = ctx.getImageData(0,0,W,H).data;
        const total = W*H;
        let sumLum=0; const lums:number[]=[];
        let sumR=0,sumG=0,sumB=0;
        for(let i=0;i<data.length;i+=4){
          const r=data[i],g=data[i+1],b=data[i+2];
          const lum=0.299*r+0.587*g+0.114*b;
          sumLum+=lum; lums.push(lum); sumR+=r; sumG+=g; sumB+=b;
        }
        const avgLum=sumLum/total;
        const avgR=sumR/total,avgG=sumG/total,avgB=sumB/total;
        const variance=lums.reduce((a,v)=>a+(v-avgLum)**2,0)/total;
        const screenGlow=avgB-(avgR+avgG)/2;
        let edges=0;
        for(let y=1;y<H-1;y++) for(let x=1;x<W-1;x++){
          const c=lums[y*W+x],l=lums[y*W+x-1],u=lums[(y-1)*W+x],r2=lums[y*W+x+1],d=lums[(y+1)*W+x];
          if(Math.abs(c-l)+Math.abs(c-u)+Math.abs(c-r2)+Math.abs(c-d)>90) edges++;
        }
        const edgeDensity=edges/total;
        const brightSpots=lums.filter(v=>v>230).length/total;
        const darkRatio=lums.filter(v=>v<35).length/total;
        const satSamples:number[]=[];
        for(let i=0;i<data.length;i+=4){
          const max=Math.max(data[i],data[i+1],data[i+2]),min=Math.min(data[i],data[i+1],data[i+2]);
          satSamples.push(max-min);
        }
        const avgSat=satSamples.reduce((a,b)=>a+b,0)/total;
        let score=0;
        if(avgLum<45) score+=40; else if(avgLum<75) score+=20;
        if(variance>3000) score+=35; else if(variance>1800) score+=18;
        if(screenGlow>22) score+=32; else if(screenGlow>10) score+=14;
        if(edgeDensity>0.22) score+=28; else if(edgeDensity>0.12) score+=12;
        if(brightSpots>0.07) score+=22;
        if(darkRatio>0.28) score+=18;
        if(avgSat>55) score+=15;
        let risk:"LOW"|"MEDIUM"|"HIGH"="LOW";
        if(score>=60) risk="HIGH"; else if(score>=28) risk="MEDIUM";
        setRiskLevel(risk); setEnvAnalyzing(false);
        if(risk==="LOW"){ setPhase("active"); startInterview(); }
        else { setPhase("waiting"); startCountdown(300); }
      };
      img.src=photo;
    },1800);
  };
  const startCountdown=(seconds:number)=>{
    setCountdown(seconds);
    countdownRef.current=setInterval(()=>{
      setCountdown(p=>{ if(p<=1){clearInterval(countdownRef.current);setPhase("active");startInterview();return 0;} return p-1; });
    },1000);
  };
  const startInterview=async()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:true,audio:true});
      streamRef.current=stream;
      const audioCtx=new AudioContext();
      analyserRef.current=audioCtx.createAnalyser(); analyserRef.current.fftSize=256;
      audioCtx.createMediaStreamSource(stream).connect(analyserRef.current);
      setTimeout(()=>{if(localRef.current){localRef.current.srcObject=stream;localRef.current.play().catch(()=>{});}},300);
      document.documentElement.requestFullscreen?.();
      const onHide=()=>{if(document.hidden){logViolation("TAB SWITCH detected!","red");setCheatCount(p=>{if(p+1>=5)terminateInterview();return p+1;});}};
      const onCopy=(e:any)=>{e.preventDefault();logViolation("COPY attempt blocked!");};
      const onPaste=(e:any)=>{e.preventDefault();logViolation("PASTE attempt blocked!");};
      const onRC=(e:any)=>{e.preventDefault();logViolation("RIGHT-CLICK disabled!");};
      const onKey=(e:KeyboardEvent)=>{
        if(e.ctrlKey&&["c","v","x","a","u","s","p"].includes(e.key.toLowerCase())){e.preventDefault();logViolation("Shortcut Ctrl+"+e.key.toUpperCase()+" blocked!");}
        if(e.key==="F12"){e.preventDefault();logViolation("DevTools blocked!","red");}
        if(e.key==="Escape")e.preventDefault();
      };
      const onBlur=()=>logViolation("Window focus lost!","red");
      const onFS=()=>{if(!document.fullscreenElement){logViolation("FULLSCREEN EXIT!","red");setTimeout(()=>document.documentElement.requestFullscreen?.(),500);}};
      document.addEventListener("visibilitychange",onHide);
      document.addEventListener("copy",onCopy); document.addEventListener("paste",onPaste);
      document.addEventListener("contextmenu",onRC); document.addEventListener("keydown",onKey);
      document.addEventListener("fullscreenchange",onFS); window.addEventListener("blur",onBlur);
      document.body.style.userSelect="none";
      timerRef.current=setInterval(()=>setTimer(t=>t+1),1000);
      motionRef.current=setInterval(detectMotion,2000);
      emotionRef.current=setInterval(detectEmotion,1500);
      noiseRef.current=setInterval(()=>{
        if(analyserRef.current){const d=new Uint8Array(analyserRef.current.frequencyBinCount);analyserRef.current.getByteFrequencyData(d);const avg=d.reduce((a,b)=>a+b,0)/d.length;setNoiseLevel(Math.round(avg));if(avg>90)logViolation("EXTREME NOISE detected!");}
      },15000);
    }catch{alert("Camera and microphone access required.");}
  };
  const detectMotion=()=>{
    if(!localRef.current||!canvasRef.current)return;
    const canvas=canvasRef.current,ctx=canvas.getContext("2d");
    if(!ctx)return; canvas.width=160; canvas.height=120;
    ctx.drawImage(localRef.current,0,0,160,120);
    const cur=ctx.getImageData(0,0,160,120);
    if(prevFrameRef.current){
      const prev=prevFrameRef.current.data,c=cur.data;let diff=0;
      for(let i=0;i<c.length;i+=4)if(Math.abs(c[i]-prev[i])+Math.abs(c[i+1]-prev[i+1])+Math.abs(c[i+2]-prev[i+2])>80)diff++;
      if((diff/(160*120))*100>35){setMotionAlert(true);logViolation("SUSPICIOUS OBJECT in camera!","red");setCheatCount(p=>{if(p+1>=5)terminateInterview();return p+1;});setTimeout(()=>setMotionAlert(false),4000);}
    }
    prevFrameRef.current=cur;
  };
  const detectEmotion=()=>{
    if(!localRef.current||!emotionCanvasRef.current)return;
    const canvas=emotionCanvasRef.current,ctx=canvas.getContext("2d");
    if(!ctx)return; canvas.width=100; canvas.height=100;
    ctx.drawImage(localRef.current,0,0,100,100);
    const frame=ctx.getImageData(0,0,100,100);
    let r=0,g=0,b=0;
    for(let i=0;i<frame.data.length;i+=4){r+=frame.data[i];g+=frame.data[i+1];b+=frame.data[i+2];}
    const px=frame.data.length/4;r/=px;g/=px;b/=px;
    const bright=(r+g+b)/3,red=r-(g+b)/2;
    const emotions=[{name:"Confident",color:"#00B87C",condition:bright>120&&red<20},{name:"Nervous",color:"#F59E0B",condition:red>30&&bright>100},{name:"Stressed",color:"#FF4444",condition:red>40},{name:"Calm",color:"#00D4FF",condition:bright>140&&red<15},{name:"Focused",color:"#A78BFA",condition:bright>100&&bright<140}];
    const e=emotions.find(x=>x.condition)||{name:"Neutral",color:"#64748B"};
    setEmotion(e.name);setEmotionColor(e.color);
  };
  const loadQuestions=async()=>{
    setCoachLoading(true);
    try{const res=await axios.post(API+"/coach/interview-questions",{role:coachRole,round:coachRound});setQuestions(res.data.questions||[]);setCurrentQ(0);setUserAnswer("");setEvaluation(null);setSessionScore([]);}
    catch{alert("Failed to load questions.");}
    setCoachLoading(false);
  };
  const evaluateAnswer=async()=>{
    if(!userAnswer.trim()){alert("Please type your answer!");return;}
    setCoachLoading(true);
    try{const res=await axios.post(API+"/coach/evaluate-answer",{question:questions[currentQ]?.question,answer:userAnswer,role:coachRole});setEvaluation(res.data);setSessionScore(prev=>[...prev,res.data.score||0]);}
    catch{alert("Evaluation failed.");}
    setCoachLoading(false);
  };
  if(phase==="terminated") return(
    <div style={{minHeight:"100vh",background:"#F8FAFC",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"sans-serif"}}>
      <div style={{textAlign:"center",maxWidth:"500px",padding:"40px"}}>
        <div style={{fontSize:"64px",marginBottom:"20px"}}>🚫</div>
        <h2 style={{color:"#EF4444",marginBottom:"12px"}}>Interview Terminated</h2>
        <p style={{color:"#64748B",marginBottom:"20px"}}>Your interview was terminated due to {cheatCount} security violations.</p>
        <div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:"12px",padding:"16px",marginBottom:"20px",textAlign:"left",maxHeight:"200px",overflowY:"auto"}}>
          {cheatLog.map((l,i)=><div key={i} style={{color:"#EF4444",fontSize:"13px",marginBottom:"4px"}}>[{l.time}] {l.event}</div>)}
        </div>
        <button onClick={onBack} style={{...btn,background:"#F1F5F9",border:"1.5px solid #E2E8F0"}}>Back to Dashboard</button>
      </div>
    </div>
  );
  return(
    <div style={{minHeight:"100vh",background:"#F8FAFC",color:"#1E293B",padding:"24px",fontFamily:"-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif"}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg);}}@keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}`}</style>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"28px"}}>
        <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
          <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="GenuAI" style={{width:"40px",height:"40px",borderRadius:"10px"}}/>
          <div>
            <h1 style={{margin:0,color:"#1E293B",fontSize:"20px",fontWeight:"800"}}>Genu<span style={{color:"#00B87C"}}>AI</span> <span style={{color:"#667EEA"}}>Secure Interview Room</span></h1>
            {activeRoomId&&<div style={{fontSize:"12px",color:"#94A3B8"}}>Room: <strong style={{color:"#667EEA"}}>{activeRoomId}</strong></div>}
          </div>
        </div>
        <div style={{display:"flex",gap:"10px"}}>
          {phase==="env_check"&&<button onClick={onBack} style={{...btn,background:"#F1F5F9",border:"1.5px solid #E2E8F0",color:"#64748B"}}>← Back</button>}
          <button onClick={onLogout} style={{...btn,background:"transparent",border:"1px solid #EF4444",color:"#EF4444"}}>Logout</button>
        </div>
      </div>

      {phase==="env_check"&&(
        <div style={{maxWidth:"600px",margin:"0 auto"}}>
          <div style={{textAlign:"center",marginBottom:"28px"}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:"10px",marginBottom:"14px"}}>
              <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="GenuAI" style={{width:"52px",height:"52px",borderRadius:"14px",boxShadow:"0 4px 16px rgba(102,126,234,0.3)"}}/>
              <span style={{fontSize:"30px",fontWeight:"900",color:"#1E293B"}}>Genu<span style={{color:"#00B87C"}}>AI</span></span>
            </div>
            <h2 style={{margin:"0 0 6px",fontSize:"26px",fontWeight:"800",color:"#1E293B"}}>Environment Verification</h2>
            <p style={{color:"#64748B",fontSize:"14px",margin:"0 0 14px"}}>Required before your AI-Proctored Interview</p>
            {activeRoomId&&(
              <div style={{display:"inline-flex",alignItems:"center",gap:"6px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"20px",padding:"5px 16px"}}>
                <div style={{width:"7px",height:"7px",borderRadius:"50%",background:"#00B87C",animation:"pulse 1.5s infinite"}}/>
                <span style={{color:"#064E3B",fontSize:"12px",fontWeight:"600"}}>Room: {activeRoomId}</span>
              </div>
            )}
          </div>
          <div style={{background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"18px",padding:"26px",marginBottom:"22px",boxShadow:"0 2px 16px rgba(0,0,0,0.07)"}}>
            <div style={{display:"flex",alignItems:"center",gap:"10px",marginBottom:"22px"}}>
              <span style={{background:"#EF4444",color:"#fff",padding:"3px 12px",borderRadius:"6px",fontSize:"11px",fontWeight:"800",letterSpacing:"0.6px"}}>READ CAREFULLY</span>
              <span style={{color:"#1E293B",fontWeight:"700",fontSize:"15px"}}>Security &amp; Proctoring Rules</span>
            </div>
            {[
              {icon:"📷",text:"Live webcam captures your environment — AI verification cannot be bypassed",color:"#667EEA"},
              {icon:"🎯",text:"AI scans for prohibited objects: phone, book, laptop, second screen, notes",color:"#667EEA"},
              {icon:"🚫",text:"Remove ALL prohibited items BEFORE you proceed",color:"#EF4444",bold:true},
              {icon:"✅",text:"Sit alone in a clean, well-lit, quiet room",color:"#16A34A"},
              {icon:"🖥️",text:"Interview runs in FULLSCREEN — exiting fullscreen = instant violation",color:"#D97706"},
              {icon:"🔴",text:"Tab switching is detected INSTANTLY — logged as critical violation",color:"#EF4444"},
              {icon:"⌨️",text:"All keyboard shortcuts (Ctrl+C/V/X/A, F12, PrintScreen) are blocked",color:"#64748B"},
              {icon:"📋",text:"Copy, paste, cut, and right-click are fully disabled",color:"#64748B"},
              {icon:"🪟",text:"Window losing focus is automatically logged",color:"#64748B"},
              {icon:"📹",text:"Screen recording and screenshot attempts are flagged",color:"#64748B"},
              {icon:"🚨",text:"5 violations = interview TERMINATED + HR notified immediately",color:"#EF4444",bold:true},
            ].map((rule,i,arr)=>(
              <div key={i} style={{display:"flex",gap:"14px",padding:"11px 0",borderBottom:i<arr.length-1?"1px solid #F1F5F9":"none",alignItems:"flex-start"}}>
                <span style={{fontSize:"17px",minWidth:"22px",marginTop:"1px"}}>{rule.icon}</span>
                <span style={{color:rule.color,fontSize:"14px",lineHeight:"1.55",fontWeight:rule.bold?"700":"500"}}>{rule.text}</span>
              </div>
            ))}
          </div>
          {!envAnalyzing?(
            <button onClick={captureEnvPhoto} style={{width:"100%",padding:"18px",background:"linear-gradient(135deg,#667EEA,#764BA2)",color:"#fff",border:"none",borderRadius:"14px",fontWeight:"700",fontSize:"16px",cursor:"pointer",boxShadow:"0 4px 18px rgba(102,126,234,0.45)"}}>
              📸 &nbsp;Verify My Environment &amp; Begin Interview
            </button>
          ):(
            <div style={{background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"14px",padding:"28px",textAlign:"center"}}>
              <div style={{width:"44px",height:"44px",border:"4px solid #667EEA",borderTop:"4px solid transparent",borderRadius:"50%",margin:"0 auto 16px",animation:"spin 0.9s linear infinite"}}/>
              <p style={{color:"#667EEA",fontWeight:"700",margin:"0 0 6px",fontSize:"15px"}}>Verifying your environment…</p>
              <p style={{color:"#94A3B8",fontSize:"13px",margin:0}}>AI is analyzing your workspace. Please wait.</p>
            </div>
          )}
        </div>
      )}

      {phase==="waiting"&&(
        <div style={{maxWidth:"500px",margin:"0 auto"}}>
          <div style={{background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"20px",padding:"36px 30px",textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.09)"}}>
            <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="GenuAI" style={{width:"52px",height:"52px",borderRadius:"14px",marginBottom:"16px"}}/>
            <h2 style={{color:"#1E293B",margin:"0 0 8px",fontSize:"20px",fontWeight:"800"}}>Additional Verification Required</h2>
            <p style={{color:"#64748B",fontSize:"14px",margin:"0 0 26px",lineHeight:"1.6"}}>Scan this QR code with your smartphone and position it to show a <strong>side view</strong> of your workspace.</p>
            <div style={{position:"relative",display:"inline-block",marginBottom:"24px"}}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=210x210&data=${encodeURIComponent(window.location.origin+"/mobile-cam?room="+activeRoomId)}&bgcolor=ffffff&color=1E293B&qzone=2`}
                alt="QR Code"
                style={{width:"210px",height:"210px",borderRadius:"14px",border:"2px solid #E2E8F0",display:"block"}}
              />
              <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:"#fff",borderRadius:"10px",padding:"5px",boxShadow:"0 2px 8px rgba(0,0,0,0.15)"}}>
                <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="G" style={{width:"36px",height:"36px",borderRadius:"8px",display:"block"}}/>
              </div>
            </div>
            <div style={{background:"#FFF7ED",border:"1px solid #FED7AA",borderRadius:"14px",padding:"18px",marginBottom:"20px"}}>
              <div style={{color:"#D97706",fontWeight:"700",fontSize:"13px",marginBottom:"8px"}}>⏱️ Interview begins in</div>
              <div style={{fontSize:"56px",fontWeight:"900",color:"#F59E0B",lineHeight:1}}>{fmt(countdown)}</div>
              <p style={{color:"#92400E",fontSize:"12px",margin:"10px 0 0"}}>Scan QR &amp; position phone to show your full workspace side view</p>
            </div>
            {mobileConnected&&<div style={{background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"10px",padding:"12px",marginBottom:"16px"}}><span style={{color:"#16A34A",fontWeight:"700"}}>✅ Phone camera connected!</span></div>}
            <button onClick={()=>{clearInterval(countdownRef.current);setPhase("active");startInterview();}} style={{width:"100%",padding:"15px",background:"linear-gradient(135deg,#667EEA,#764BA2)",color:"#fff",border:"none",borderRadius:"12px",fontWeight:"700",fontSize:"15px",cursor:"pointer"}}>
              Continue to Interview →
            </button>
          </div>
        </div>
      )}

      {phase==="active"&&(
        <div>
          <div style={{display:"flex",gap:"8px",marginBottom:"16px"}}>
            <button onClick={()=>setMode("interview")} style={{...btn,background:mode==="interview"?"linear-gradient(135deg,#667EEA,#764BA2)":"#F1F5F9",color:mode==="interview"?"#fff":"#64748B",border:"1.5px solid "+(mode==="interview"?"#667EEA":"#E2E8F0")}}>🔒 Interview Room</button>
            <button onClick={()=>setMode("coach")} style={{...btn,background:mode==="coach"?"linear-gradient(135deg,#A78BFA,#7C3AED)":"#F1F5F9",color:mode==="coach"?"#fff":"#64748B",border:"1.5px solid "+(mode==="coach"?"#A78BFA":"#E2E8F0")}}>🎓 AI Coach</button>
          </div>
          {mode==="interview"&&(
            <div>
              <div style={{display:"flex",gap:"8px",marginBottom:"16px",flexWrap:"wrap",alignItems:"center"}}>
                <div style={{background:"#EF4444",borderRadius:"20px",padding:"5px 14px",fontSize:"12px",fontWeight:"700",color:"#fff"}}>🔴 LIVE</div>
                <div style={{background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"20px",padding:"5px 14px",fontSize:"12px",color:"#1E293B",fontWeight:"600"}}>⏱ {fmt(timer)}</div>
                <div style={{background:"#fff",border:"1.5px solid "+(cheatCount>2?"#EF4444":cheatCount>0?"#F59E0B":"#00B87C"),borderRadius:"20px",padding:"5px 14px",fontSize:"12px",color:cheatCount>2?"#EF4444":cheatCount>0?"#F59E0B":"#00B87C",fontWeight:"600"}}>⚠️ Violations: {cheatCount}/5</div>
                <div style={{background:"#fff",border:"1.5px solid "+emotionColor,borderRadius:"20px",padding:"5px 14px",fontSize:"12px",color:emotionColor,fontWeight:"600"}}>😊 {emotion}</div>
                <div style={{background:"#fff",border:"1.5px solid "+(noiseLevel>60?"#EF4444":"#00B87C"),borderRadius:"20px",padding:"5px 14px",fontSize:"12px",color:noiseLevel>60?"#EF4444":"#00B87C",fontWeight:"600"}}>🎙️ {noiseLevel>60?"HIGH NOISE":"Noise OK"}</div>
                {activeRoomId&&<div style={{background:"#EEF2FF",border:"1.5px solid #667EEA",borderRadius:"20px",padding:"5px 14px",fontSize:"12px",color:"#667EEA",fontWeight:"700"}}>🔑 {activeRoomId}</div>}
                <button onClick={()=>setShowLog(!showLog)} style={{...btn,background:"#F1F5F9",border:"1.5px solid #E2E8F0",color:"#64748B",fontSize:"12px",padding:"5px 14px"}}>📋 Log ({cheatLog.length})</button>
                <button onClick={terminateInterview} style={{...btn,background:"#EF4444",color:"#fff",fontSize:"12px",padding:"5px 14px",marginLeft:"auto"}}>End Interview</button>
              </div>
              {warning&&<div style={{background:warningLevel==="red"?"#FEF2F2":"#FFFBEB",border:"2px solid "+(warningLevel==="red"?"#EF4444":"#F59E0B"),borderRadius:"10px",padding:"14px 20px",marginBottom:"14px",color:warningLevel==="red"?"#EF4444":"#F59E0B",fontWeight:"700",fontSize:"15px"}}>{warningLevel==="red"?"🚨":"⚠️"} {warning}</div>}
              {motionAlert&&<div style={{background:"#FEF2F2",border:"2px solid #EF4444",borderRadius:"10px",padding:"14px 20px",marginBottom:"14px",color:"#EF4444",fontWeight:"700"}}>🚨 SUSPICIOUS OBJECT DETECTED IN CAMERA VIEW!</div>}
              {showLog&&(
                <div style={{background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"12px",padding:"16px",marginBottom:"16px",maxHeight:"150px",overflowY:"auto"}}>
                  <div style={{color:"#EF4444",fontWeight:"700",marginBottom:"8px",fontSize:"13px"}}>Violation Log:</div>
                  {cheatLog.length===0?<div style={{color:"#00B87C",fontSize:"13px"}}>No violations yet.</div>:cheatLog.map((l,i)=><div key={i} style={{color:l.level==="red"?"#EF4444":"#F59E0B",fontSize:"12px",marginBottom:"4px"}}>[{l.time}] {l.event}</div>)}
                </div>
              )}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"16px",marginBottom:"16px"}}>
                <div style={{background:"#000",border:"2px solid #00B87C",borderRadius:"14px",overflow:"hidden",position:"relative"}}>
                  <video ref={localRef} autoPlay muted playsInline style={{width:"100%",height:"280px",objectFit:"cover"}}/>
                  <canvas ref={canvasRef} style={{display:"none"}}/>
                  <canvas ref={emotionCanvasRef} style={{display:"none"}}/>
                  {motionAlert&&<div style={{position:"absolute",inset:0,background:"rgba(239,68,68,0.2)",border:"3px solid #EF4444",borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{background:"#EF4444",color:"#fff",padding:"8px 16px",borderRadius:"8px",fontWeight:"700"}}>OBJECT DETECTED</div></div>}
                  <div style={{position:"absolute",top:"10px",left:"10px",background:"rgba(0,0,0,0.7)",borderRadius:"6px",padding:"4px 10px",fontSize:"12px",color:"#fff",fontWeight:"600"}}>{userName}</div>
                  <div style={{position:"absolute",bottom:"10px",right:"10px",background:emotionColor+"dd",borderRadius:"6px",padding:"3px 10px",fontSize:"11px",fontWeight:"700",color:"#000"}}>{emotion}</div>
                </div>
                <div style={{background:"#F8FAFC",border:"1.5px solid #E2E8F0",borderRadius:"14px",display:"flex",alignItems:"center",justifyContent:"center",height:"280px",flexDirection:"column",gap:"12px"}}>
                  <img src="https://d1ssw1t0a4j2nf.cloudfront.net/logo.png" alt="GenuAI" style={{width:"52px",height:"52px",borderRadius:"14px"}}/>
                  <div style={{color:"#667EEA",fontSize:"14px",fontWeight:"700"}}>GenuAI Interviewer</div>
                  <div style={{color:"#94A3B8",fontSize:"12px"}}>AI Powered</div>
                  {activeRoomId&&<div style={{background:"#EEF2FF",borderRadius:"8px",padding:"6px 14px",fontSize:"12px",color:"#667EEA",fontWeight:"600"}}>Room: {activeRoomId}</div>}
                </div>
              </div>
              <div style={{background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"14px",padding:"20px",boxShadow:"0 2px 8px rgba(0,0,0,0.06)"}}>
                <h3 style={{color:"#1E293B",marginTop:0,marginBottom:"16px",fontSize:"15px",fontWeight:"700"}}>📝 Interview Questions — Answer verbally</h3>
                {["Tell me about yourself and your professional background.","What are your strongest technical skills? Give concrete examples.","Describe the most challenging project you have worked on.","How do you handle tight deadlines and pressure?","Where do you see yourself professionally in 5 years?","Why do you want to join our company?","Describe a time you resolved a conflict within a team."].map((q,i)=>(
                  <div key={i} style={{background:"#F8FAFC",border:"1.5px solid #E2E8F0",borderRadius:"10px",padding:"12px 16px",marginBottom:"8px",display:"flex",gap:"12px",alignItems:"flex-start"}}>
                    <span style={{color:"#667EEA",fontWeight:"700",minWidth:"28px",fontSize:"14px"}}>Q{i+1}.</span>
                    <span style={{color:"#1E293B",fontSize:"14px",lineHeight:"1.55"}}>{q}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {mode==="coach"&&(
            <div style={{maxWidth:"820px",margin:"0 auto"}}>
              <div style={{display:"flex",gap:"12px",marginBottom:"20px",flexWrap:"wrap",alignItems:"center"}}>
                <select value={coachRole} onChange={e=>setCoachRole(e.target.value)} style={{padding:"10px",background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"10px",color:"#1E293B",fontSize:"14px"}}>{ROLES.map(r=><option key={r}>{r}</option>)}</select>
                <select value={coachRound} onChange={e=>setCoachRound(e.target.value)} style={{padding:"10px",background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"10px",color:"#1E293B",fontSize:"14px"}}>{["Technical","Behavioral","HR","System Design","Case Study"].map(r=><option key={r}>{r}</option>)}</select>
                <button onClick={loadQuestions} disabled={coachLoading} style={{...btn,background:"linear-gradient(135deg,#A78BFA,#7C3AED)",color:"#fff",padding:"10px 20px"}}>{coachLoading?"Loading…":"Start Practice"}</button>
                {sessionScore.length>0&&<div style={{padding:"8px 14px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"8px",color:"#16A34A",fontWeight:"700"}}>Avg: {Math.round(sessionScore.reduce((a,b)=>a+b,0)/sessionScore.length)}%</div>}
              </div>
              {questions.length===0?(
                <div style={{textAlign:"center",padding:"60px",background:"#fff",borderRadius:"16px",border:"1.5px solid #E2E8F0"}}>
                  <div style={{fontSize:"56px",marginBottom:"16px"}}>🎓</div>
                  <h3 style={{color:"#A78BFA",margin:"0 0 8px"}}>AI Mock Interview Coach</h3>
                  <p style={{color:"#64748B"}}>Select your role and round, then click Start Practice!</p>
                </div>
              ):currentQ>=questions.length?(
                <div style={{textAlign:"center",padding:"40px",background:"#fff",borderRadius:"16px",border:"1.5px solid #00B87C"}}>
                  <div style={{fontSize:"56px",marginBottom:"16px"}}>🏆</div>
                  <h3 style={{color:"#00B87C",margin:"0 0 8px"}}>Session Complete!</h3>
                  <div style={{fontSize:"48px",fontWeight:"800",color:"#00B87C",margin:"16px 0"}}>{Math.round(sessionScore.reduce((a,b)=>a+b,0)/sessionScore.length)}%</div>
                  <button onClick={loadQuestions} style={{...btn,background:"linear-gradient(135deg,#A78BFA,#7C3AED)",color:"#fff",padding:"12px 24px"}}>Practice Again</button>
                </div>
              ):(
                <div>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:"12px",alignItems:"center"}}>
                    <span style={{color:"#64748B",fontSize:"13px"}}>Question {currentQ+1} of {questions.length}</span>
                    <div style={{display:"flex",gap:"4px"}}>{questions.map((_,i)=><div key={i} style={{width:"24px",height:"6px",borderRadius:"3px",background:i<currentQ?"#00B87C":i===currentQ?"#A78BFA":"#E2E8F0"}}/>)}</div>
                    <span style={{padding:"4px 10px",borderRadius:"10px",background:questions[currentQ]?.difficulty==="Hard"?"#FEF2F2":questions[currentQ]?.difficulty==="Medium"?"#FFFBEB":"#F0FDF4",color:questions[currentQ]?.difficulty==="Hard"?"#EF4444":questions[currentQ]?.difficulty==="Medium"?"#F59E0B":"#16A34A",fontSize:"12px",fontWeight:"700"}}>{questions[currentQ]?.difficulty}</span>
                  </div>
                  <div style={{background:"#fff",border:"1.5px solid #A78BFA",borderRadius:"14px",padding:"20px",marginBottom:"16px"}}>
                    <h3 style={{color:"#1E293B",margin:"0 0 12px",fontSize:"16px",lineHeight:"1.5"}}>{questions[currentQ]?.question}</h3>
                    <div style={{padding:"10px 14px",background:"#F8FAFC",borderRadius:"8px",color:"#64748B",fontSize:"13px"}}>💡 {questions[currentQ]?.hint}</div>
                  </div>
                  <textarea placeholder="Type your answer here… STAR method: Situation, Task, Action, Result" value={userAnswer} onChange={e=>setUserAnswer(e.target.value)} rows={6} style={{width:"100%",padding:"14px",background:"#fff",border:"1.5px solid #E2E8F0",borderRadius:"12px",color:"#1E293B",fontSize:"14px",resize:"vertical",boxSizing:"border-box",marginBottom:"8px"}}/>
                  <div style={{color:"#94A3B8",fontSize:"12px",textAlign:"right",marginBottom:"12px"}}>{userAnswer.split(/\s+/).filter(Boolean).length} words</div>
                  {!evaluation?(
                    <button onClick={evaluateAnswer} disabled={coachLoading||!userAnswer.trim()} style={{...btn,background:"linear-gradient(135deg,#A78BFA,#7C3AED)",color:"#fff",width:"100%",padding:"14px",fontSize:"15px"}}>{coachLoading?"Evaluating…":"Submit Answer & Get Feedback"}</button>
                  ):(
                    <div>
                      <div style={{background:"#fff",border:"1.5px solid "+(evaluation.score>=80?"#00B87C":evaluation.score>=60?"#F59E0B":"#EF4444"),borderRadius:"14px",padding:"20px",marginBottom:"12px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"16px"}}>
                          <h3 style={{color:"#1E293B",margin:0,fontSize:"15px"}}>AI Feedback</h3>
                          <div style={{textAlign:"center"}}><div style={{fontSize:"36px",fontWeight:"800",color:evaluation.score>=80?"#00B87C":evaluation.score>=60?"#F59E0B":"#EF4444"}}>{evaluation.score}%</div><div style={{color:"#94A3B8",fontSize:"12px"}}>{evaluation.rating}</div></div>
                        </div>
                        <p style={{color:"#64748B",fontSize:"14px",marginBottom:"12px"}}>{evaluation.feedback}</p>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"12px",marginBottom:"12px"}}>
                          <div style={{padding:"12px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:"8px"}}><div style={{color:"#16A34A",fontWeight:"700",fontSize:"12px",marginBottom:"4px"}}>What was good</div><div style={{color:"#64748B",fontSize:"13px"}}>{evaluation.what_was_good}</div></div>
                          <div style={{padding:"12px",background:"#FFFBEB",border:"1px solid #FED7AA",borderRadius:"8px"}}><div style={{color:"#D97706",fontWeight:"700",fontSize:"12px",marginBottom:"4px"}}>Improve this</div><div style={{color:"#64748B",fontSize:"13px"}}>{evaluation.what_to_improve}</div></div>
                        </div>
                        <div style={{padding:"12px",background:"#EEF2FF",border:"1px solid #C7D2FE",borderRadius:"8px"}}><div style={{color:"#667EEA",fontWeight:"700",fontSize:"12px",marginBottom:"4px"}}>Model Answer</div><div style={{color:"#64748B",fontSize:"13px"}}>{evaluation.model_answer}</div></div>
                      </div>
                      <button onClick={()=>{setCurrentQ(p=>p+1);setUserAnswer("");setEvaluation(null);}} style={{...btn,background:"linear-gradient(135deg,#00B87C,#00D4AA)",color:"#fff",width:"100%",padding:"14px",fontSize:"15px"}}>{currentQ+1>=questions.length?"Finish Session 🏆":"Next Question →"}</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      <div style={{borderTop:"1px solid #E2E8F0",marginTop:"48px",paddingTop:"20px",paddingBottom:"20px",textAlign:"center"}}>
        <p style={{color:"#CBD5E1",fontSize:"11px",margin:0}}>© 2026 GenuAI Technologies. All rights reserved. · Filtering fake candidates. Finding real talent.</p>
      </div>
    </div>
  );
}