import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface Props { user: any; onBack: () => void; }

const GROQ_KEY = import.meta.env.VITE_GROQ_KEY;

const TASKS = [
  { id:1, type:'reading', title:'Reading Fluency', instruction:'Read the passage below aloud clearly and at a natural pace.', text:'Artificial intelligence is transforming the way businesses operate. From automating routine tasks to providing deep analytical insights, AI technologies are enabling organizations to make better decisions faster.', duration: 45 },
  { id:2, type:'repeating', title:'Sentence Repetition', instruction:'Listen to the sentence and repeat it exactly as you heard it.', audioText:'The implementation of agile methodology significantly improved our team collaboration and delivery speed.', duration: 30 },
  { id:3, type:'qna', title:'Questions & Answers', instruction:'Listen to the question and speak a concise answer.', audioText:'What is your primary motivation for seeking a new opportunity at this time?', duration: 45 },
  { id:4, type:'grammar', title:'Grammar Correction', instruction:'Identify the error in the sentence below and speak the grammatically correct version.', text:'"He do not have any experience in digital marketing campaigns."', duration: 30 },
  { id:5, type:'listening', title:'Listening Comprehension', instruction:'Listen to the audio passage, then select the correct answer below.', audioText:'The meeting is scheduled for Thursday at 3 PM in Conference Room B. Please bring your project proposal and the latest financial reports.', question:'Where is the meeting scheduled?', options:['Conference Room A','Conference Room B','Online via Zoom','CEO office'], answer:'Conference Room B', duration: 45 },
  { id:6, type:'extempore', title:'Free Speech / Extempore', instruction:'Speak continuously for 45 seconds on the given topic.', text:'Describe a challenging project you worked on, how you handled the obstacles, and what the outcome was.', duration: 60 },
];

export default function SVARPractice({ user, onBack }: Props) {
  const [phase, setPhase] = useState<'intro'|'test'|'result'>('intro');
  const [taskIdx, setTaskIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [evaluating, setEvaluating] = useState(false);
  const [scores, setScores] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState(''); // For listening task

  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const currentTranscriptRef = useRef('');

  const task = TASKS[taskIdx];

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        currentTranscriptRef.current = current;
      };
      
      recognitionRef.current.onerror = (e: any) => {
        console.error('Speech recognition error', e.error);
        if (e.error === 'not-allowed') {
          alert("Microphone access denied. Please allow microphone access to practice speaking.");
        }
      };
    } else {
      alert("Speech Recognition API is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, []);

  const playAudio = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.onstart = () => setIsPlaying(true);
    u.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(u);
  };

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setTranscript('');
    currentTranscriptRef.current = '';
    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
      setIsRecording(false);
    } catch(e){}
  };

  const startTest = () => {
    setPhase('test');
    setupTask(0);
  };

  const setupTask = (idx: number) => {
    setTaskIdx(idx);
    const t = TASKS[idx];
    setTimeLeft(t.duration);
    setTranscript('');
    currentTranscriptRef.current = '';
    setSelectedOption('');
    setIsPlaying(false);
    setIsRecording(false);
    
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNext(true); // Auto next on timeout
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const evaluateTaskWithAI = async (transcriptText: string, t: typeof TASKS[0]) => {
    if (!transcriptText || transcriptText.trim().length < 5) {
      return { score: 0, feedback: "No clear speech detected. Please speak louder and clearer." };
    }
    
    try {
      const prompt = `You are an expert English language evaluator scoring a candidate on an GenuAI SVAR test. 
Task Type: ${t.title}
Task Target/Prompt: ${t.text || t.audioText}
Candidate Spoken Transcript: "${transcriptText}"

Evaluate the candidate's spoken transcript. Provide a score from 0 to 100 based on accuracy, relevance, and fluency.
Return the result strictly as a JSON object: {"score": 85, "feedback": "Your 1-sentence specific feedback here."}`;

      const res = await axios.post("https://api.groq.com/openai/v1/chat/completions", {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, max_tokens: 150, response_format: { type: "json_object" }
      }, { headers: { Authorization: `Bearer ${GROQ_KEY}`, "Content-Type": "application/json" } });
      
      const data = JSON.parse(res.data.choices[0].message.content);
      return { score: data.score || 0, feedback: data.feedback || "Evaluation completed." };
    } catch (e) {
      console.error(e);
      // Fallback scoring if API fails
      return { score: 60, feedback: "Basic evaluation recorded (AI evaluation failed)." };
    }
  };

  const handleNext = async (isTimeout = false) => {
    clearInterval(timerRef.current);
    if (isRecording) stopRecording();
    
    setEvaluating(true);
    let taskScore = 0;
    let taskFeedback = "";

    // Score Listening Comprehension (Multiple Choice)
    if (task.type === 'listening') {
      if (selectedOption === task.answer) {
        taskScore = 100;
        taskFeedback = "Correct answer selected.";
      } else {
        taskScore = 0;
        taskFeedback = `Incorrect. The correct answer was: ${task.answer}`;
      }
    } 
    // Score Speech Tasks via AI
    else {
      const result = await evaluateTaskWithAI(currentTranscriptRef.current, task);
      taskScore = result.score;
      taskFeedback = result.feedback;
    }

    const newScores = [...scores, { task: task.title, type: task.type, score: taskScore, feedback: taskFeedback, transcript: currentTranscriptRef.current }];
    setScores(newScores);
    setEvaluating(false);

    if (taskIdx < TASKS.length - 1) {
      setupTask(taskIdx + 1);
    } else {
      setPhase('result');
    }
  };

  const fmt = (s: number) => String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background quantum-gradient font-body-base text-on-background relative overflow-hidden flex flex-col">
        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-error/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-warning-dark/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Header */}
        <div className="relative z-10 glass border-b border-surface-container/50 px-xl py-sm flex items-center justify-between shadow-sm">
          <button onClick={onBack} className="flex items-center gap-xs text-on-surface-variant hover:text-on-surface transition-colors font-bold text-sm">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
            Back to Practice Hub
          </button>
          <div className="font-black text-on-surface text-lg flex items-center gap-sm">
            <span className="material-symbols-outlined text-error">record_voice_over</span>
            SVAR Speaking Practice
          </div>
          <div className="w-32"></div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xxl gap-xl">
          <div className="flex-1 flex flex-col justify-center">
            <div className="mb-lg animate-[float_4s_ease-in-out_infinite]">
              <span className="material-symbols-outlined text-7xl text-error drop-shadow-md">mic_external_on</span>
            </div>
            <h1 className="text-display-lg-mobile md:text-display-lg-desktop font-black text-on-surface mb-md leading-tight tracking-tight">
              Master Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-error via-warning to-warning-dark">Voice & Accent</span>
            </h1>
            <p className="text-body-lg text-on-surface-variant/90 font-medium mb-xl max-w-xl leading-relaxed">
              Prepare for your official GenuAI SVAR assessment. This interactive practice module uses browser speech recognition and AI to instantly grade your verbal communication skills.
            </p>
            <div className="glass p-md rounded-xl border border-error/30 max-w-xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-error/5 group-hover:bg-error/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="text-error font-black text-sm flex items-center gap-xs mb-sm tracking-widest uppercase">
                  <span className="material-symbols-outlined text-[18px]">warning</span> Requirements
                </div>
                <ul className="text-on-surface-variant font-medium text-sm leading-relaxed ml-md list-disc list-outside">
                  <li>You must use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.</li>
                  <li>Allow microphone permissions when prompted.</li>
                  <li>Speak clearly and naturally at an even pace.</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-[700px] w-full mt-xl lg:mt-0">
            <div className="glass p-xxl rounded-xxxl shadow-md border border-surface-container relative">
              <h2 className="text-title-lg font-black text-on-surface mb-xl">Tasks Overview</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mb-xl">
                {TASKS.map((t,i)=>(
                  <div key={i} className="bg-surface-bright/50 p-md rounded-xl border border-surface-container shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="text-error font-black text-xs uppercase tracking-widest mb-xs flex items-center gap-xs">
                       <span className="material-symbols-outlined text-[16px]">task_alt</span> Task {i+1}
                    </div>
                    <div className="font-bold text-on-surface text-body-base leading-snug">{t.title}</div>
                    <div className="text-on-surface-variant text-xs font-medium mt-sm flex items-center gap-xs">
                      <span className="material-symbols-outlined text-[14px]">timer</span> {t.duration} seconds
                    </div>
                  </div>
                ))}
              </div>
              <button 
                onClick={startTest} 
                className="w-full py-md rounded-xl font-black text-body-base flex items-center justify-center gap-sm bg-gradient-to-r from-error to-warning-dark text-white hover:shadow-[0_8px_25px_rgba(220,38,38,0.4)] hover:-translate-y-0.5 transition-all duration-300"
              >
                Start Practice Session <span className="material-symbols-outlined text-xl">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const overall = Math.round(scores.reduce((a,s)=>a+s.score,0) / Math.max(scores.length, 1));
    const scoreColor = overall >= 70 ? "text-success" : overall >= 50 ? "text-warning" : "text-error";

    return (
      <div className="min-h-screen bg-background font-body-base text-on-background relative overflow-hidden flex flex-col">
        {/* Decorative */}
        <div className="absolute inset-0 bg-gradient-to-br from-error/5 via-background to-warning-dark/5 pointer-events-none" />
        
        <div className="relative z-10 pt-xxl pb-xl px-margin-mobile md:px-margin-desktop text-center border-b border-surface-container glass shadow-sm">
          <div className="max-w-4xl mx-auto">
            <div className="text-6xl mb-md drop-shadow-md animate-[bounce_2s_infinite]">
               <span className="material-symbols-outlined text-7xl text-error bg-clip-text text-transparent bg-gradient-to-br from-error to-warning-dark block">equalizer</span>
            </div>
            <h1 className="text-display-sm-mobile md:text-display-sm-desktop font-black text-on-surface mb-xs">SVAR Practice Complete!</h1>
            <div className="text-title-md font-bold text-on-surface-variant/80 mb-lg">Here is your AI-generated feedback and performance breakdown.</div>
            
            <div className="inline-flex items-center gap-md glass p-md rounded-xxl border border-surface-container shadow-md bg-white/50 dark:bg-black/20">
              <span className={`text-5xl font-black ${scoreColor} drop-shadow-sm`}>{overall}%</span>
              <div className="text-left border-l-2 border-surface-container pl-md">
                <div className="text-sm font-black text-on-surface uppercase tracking-widest mb-1">Overall Score</div>
                <div className={`font-bold text-sm ${scoreColor}`}>
                  {overall >= 70 ? "Excellent communication skills!" : "Keep practicing to improve clarity and accuracy."}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto w-full px-margin-mobile md:px-margin-desktop py-xl flex-1 pb-xxxl">
          <div className="flex flex-col md:flex-row justify-between items-center mb-xl gap-md">
            <h2 className="text-title-lg font-black text-on-surface flex items-center gap-sm">
              <span className="material-symbols-outlined text-error text-3xl">fact_check</span>
              Task Breakdown
            </h2>
            <div className="flex gap-sm">
              <button onClick={() => setPhase('intro')} className="px-md py-sm bg-error text-white rounded-xl font-bold text-sm hover:bg-error/90 transition-colors shadow-sm flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">refresh</span> Retake
              </button>
              <button onClick={onBack} className="px-md py-sm glass rounded-xl font-bold text-sm text-on-surface hover:bg-surface-container/50 transition-colors border border-surface-container flex items-center gap-xs">
                <span className="material-symbols-outlined text-sm">exit_to_app</span> Exit
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-lg">
            {scores.map((sc, i) => (
              <div key={i} className="glass rounded-xxl p-lg border border-surface-container shadow-sm group hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-lg pb-md border-b border-surface-container/50">
                  <div>
                    <div className="text-label-caps font-label-caps text-on-surface-variant tracking-widest uppercase flex items-center gap-xs mb-xs">
                       <span className="material-symbols-outlined text-[16px]">category</span> {sc.type}
                    </div>
                    <div className="text-title-md font-black text-on-surface">{sc.task}</div>
                  </div>
                  <div className={`text-xl font-black px-md py-1.5 rounded-lg flex items-center gap-xs shadow-sm ${sc.score>=70 ? 'bg-success/10 text-success border border-success/20' : sc.score>=50 ? 'bg-warning/10 text-warning-dark border border-warning/20' : 'bg-error/10 text-error border border-error/20'}`}>
                    {sc.score}%
                  </div>
                </div>
                
                {sc.transcript && (
                  <div className="bg-surface-bright/80 p-md rounded-xl border border-surface-container mb-lg">
                    <div className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-sm flex items-center gap-xs">
                       <span className="material-symbols-outlined text-[16px]">record_voice_over</span> Your Transcript
                    </div>
                    <div className="text-sm font-medium text-on-surface italic leading-relaxed">"{sc.transcript}"</div>
                  </div>
                )}
                
                <div className="bg-info/5 p-md rounded-xl border border-info/20">
                  <div className="text-xs font-black text-info uppercase tracking-widest mb-sm flex items-center gap-xs">
                     <span className="material-symbols-outlined text-[16px]">smart_toy</span> AI Feedback
                  </div>
                  <div className="text-sm font-medium text-info/80 leading-relaxed">{sc.feedback}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background font-body-base text-on-background flex flex-col overflow-hidden relative">
      {/* Decorative */}
      <div className="absolute inset-0 quantum-gradient opacity-50 pointer-events-none" />
      
      {/* Header */}
      <div className="relative z-10 glass border-b border-surface-container/50 px-xl h-16 flex items-center justify-between flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-md">
          <div className="font-black text-lg text-on-surface flex items-center gap-xs tracking-tight">
            <span className="material-symbols-outlined text-error text-2xl">mic</span> SVAR Assessment
          </div>
          <div className="bg-surface-container-high/50 px-sm py-0.5 rounded-md text-xs font-bold text-on-surface-variant hidden sm:flex items-center gap-xs">
             <span className="material-symbols-outlined text-[14px]">format_list_numbered</span> Task {taskIdx+1} of {TASKS.length}
          </div>
        </div>
        <div className="flex items-center gap-md">
          <div className={`px-md py-1 rounded-lg flex items-center gap-xs transition-colors border ${timeLeft < 15 ? "bg-error/10 text-error border-error/20 animate-pulse" : "bg-surface-container/50 text-on-surface border-surface-container"}`}>
            <span className="material-symbols-outlined text-sm">timer</span>
            <span className="font-black text-sm font-mono tracking-wider">{fmt(timeLeft)}</span>
          </div>
          <button onClick={onBack} className="px-sm py-1 border border-surface-container-high text-on-surface-variant rounded-lg text-xs font-bold hover:bg-surface-container-high hover:text-on-surface transition-colors flex items-center gap-xs">
            <span className="material-symbols-outlined text-sm">close</span> Exit
          </button>
        </div>
      </div>

      {/* Main Content Split Pane */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Pane - Instructions */}
        <div className="w-full lg:w-5/12 glass border-b lg:border-b-0 lg:border-r border-surface-container/50 p-xl lg:p-xxl flex flex-col overflow-y-auto">
          <div className="text-xs font-black text-error uppercase tracking-widest bg-error/10 px-sm py-1 rounded-md border border-error/20 self-start mb-lg flex items-center gap-xs">
             <span className="material-symbols-outlined text-[16px]">category</span> {task.type}
          </div>
          <h2 className="text-headline-sm font-black text-on-surface mb-lg">{task.title}</h2>
          
          <div className="bg-info/10 rounded-xl p-md mb-xl border border-info/20 flex items-start gap-md shadow-sm">
            <span className="material-symbols-outlined text-info text-2xl shrink-0 mt-0.5">lightbulb</span>
            <div className="text-info font-bold text-body-base leading-relaxed">{task.instruction}</div>
          </div>

          {task.text && (
            <div className="bg-surface-bright/50 rounded-xl p-xl border border-surface-container shadow-sm">
               <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-sm opacity-50">format_quote</span>
               <div className="text-title-md text-on-surface font-medium leading-relaxed italic m-0">"{task.text}"</div>
            </div>
          )}

          {task.audioText && (
            <div className="text-center p-xl bg-surface-bright/50 rounded-xl border-2 border-dashed border-surface-container-high shadow-sm">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant mb-md opacity-75">headphones</span>
              <div>
                <button 
                  onClick={() => playAudio(task.audioText)} 
                  disabled={isPlaying} 
                  className={`px-xl py-sm rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-xs mx-auto ${isPlaying ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' : 'bg-on-surface text-surface hover:shadow-lg hover:-translate-y-0.5'}`}
                >
                  <span className="material-symbols-outlined text-[20px]">{isPlaying ? 'volume_up' : 'play_arrow'}</span>
                  {isPlaying ? 'Playing Audio...' : 'Play Audio Prompt'}
                </button>
              </div>
              <div className="text-on-surface-variant text-xs font-medium mt-md flex items-center justify-center gap-xs">
                 <span className="material-symbols-outlined text-[16px]">info</span> Make sure your volume is turned up.
              </div>
            </div>
          )}
        </div>

        {/* Right Pane - Interaction */}
        <div className="flex-1 flex flex-col bg-surface-bright/30 overflow-hidden">
          <div className="flex-1 p-xl lg:p-xxl overflow-y-auto">
            
            {/* Listening Options */}
            {task.type === 'listening' && task.options && (
              <div className="max-w-2xl mx-auto flex flex-col gap-lg h-full justify-center">
                <div className="font-black text-title-lg text-on-surface leading-snug">{task.question}</div>
                <div className="flex flex-col gap-md">
                  {task.options.map((opt, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedOption(opt)} 
                      className={`text-left p-lg border-2 rounded-xl cursor-pointer font-bold text-body-lg flex items-center gap-md transition-all duration-200 ${selectedOption === opt ? 'border-info bg-info/5 text-info shadow-md' : 'border-surface-container bg-surface-bright text-on-surface hover:border-surface-container-high hover:bg-surface-container/50'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedOption === opt ? 'border-info bg-info' : 'border-surface-container-high bg-transparent'}`}>
                        {selectedOption === opt && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
                      </div>
                      <div className="leading-snug">{opt}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recording Controls */}
            {task.type !== 'listening' && (
              <div className="max-w-2xl mx-auto flex flex-col h-full gap-xl justify-center">
                <div className="flex justify-center w-full">
                  {!isRecording ? (
                    <button 
                      onClick={startRecording} 
                      className="w-full py-lg rounded-xxl font-black text-title-md flex items-center justify-center gap-sm bg-gradient-to-r from-error to-[#991B1B] text-white shadow-[0_8px_25px_rgba(220,38,38,0.3)] hover:-translate-y-1 transition-all duration-300"
                    >
                      <span className="material-symbols-outlined text-3xl">mic</span> Start Recording
                    </button>
                  ) : (
                    <button 
                      onClick={stopRecording} 
                      className="w-full py-lg rounded-xxl font-black text-title-md flex items-center justify-center gap-sm bg-error/10 text-error border-2 border-error/50 shadow-[0_0_30px_rgba(220,38,38,0.2)] animate-[pulse_2s_infinite] transition-all duration-300 hover:bg-error/20"
                    >
                      <span className="material-symbols-outlined text-3xl">stop_circle</span> Stop Recording
                    </button>
                  )}
                </div>
                
                {/* Live Transcript Box */}
                <div className="flex-1 min-h-[200px] glass rounded-xl border border-surface-container shadow-sm flex flex-col overflow-hidden">
                  <div className="px-md py-sm bg-surface-bright/80 border-b border-surface-container flex items-center gap-xs">
                    <span className="material-symbols-outlined text-on-surface-variant text-[18px]">graphic_eq</span>
                    <span className="text-xs font-black text-on-surface-variant uppercase tracking-widest">Live Speech Recognition</span>
                  </div>
                  <div className={`p-lg flex-1 overflow-y-auto text-title-md font-medium leading-relaxed ${transcript ? 'text-on-surface' : 'text-on-surface-variant/50'}`}>
                    {transcript || (isRecording ? "Listening carefully..." : "Click 'Start Recording' and begin speaking. Your words will appear here.")}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="glass px-xl py-md border-t border-surface-container/50 flex justify-end z-10">
            <button 
              onClick={() => handleNext(false)} 
              disabled={evaluating} 
              className={`px-xl py-sm rounded-xl font-black text-sm flex items-center gap-xs transition-all duration-300 ${evaluating ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-on-surface text-surface hover:shadow-lg hover:-translate-y-0.5'}`}
            >
              {evaluating ? (
                <><span className="material-symbols-outlined text-[20px] animate-spin">autorenew</span> AI Evaluating...</>
              ) : (
                <>{taskIdx < TASKS.length - 1 ? 'Next Task' : 'Submit Practice'} <span className="material-symbols-outlined text-[20px]">arrow_forward</span></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
