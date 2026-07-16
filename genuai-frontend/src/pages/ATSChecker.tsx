import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import * as pdfjsLib from 'pdfjs-dist';

// Set up PDF.js worker using CDN to avoid Vite build issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

interface Props { user: any; onBack: () => void; }

export default function ATSChecker({ user, onBack }: Props) {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file.');
      return;
    }

    setError('');
    setParsingPdf(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      
      setResumeText(fullText);
    } catch (err: any) {
      console.error(err);
      setError('Failed to parse the PDF. You can try pasting the text manually.');
    } finally {
      setParsingPdf(false);
    }
  };

  const analyze = async () => {
    if (!resumeText || !jobDescription) {
      setError('Please provide both your resume and the job description.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GROQ_KEY;
      if (!apiKey) throw new Error("Missing VITE_GROQ_KEY in environment");

      const prompt = `You are an expert ATS (Applicant Tracking System) software.
Analyze the following resume against the job description.
Provide:
1. An overall match score (X/100) prominently at the top.
2. A list of exactly matched keywords.
3. A list of missing keywords or skills from the job description.
4. Actionable recommendations to improve the resume for this specific role.

Resume:
${resumeText}

Job Description:
${jobDescription}
`;

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3
        })
      });

      if (!res.ok) throw new Error("Failed to analyze ATS compatibility");
      const data = await res.json();
      setResult(data.choices[0].message.content);
    } catch (err: any) {
      setError(err.message || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height:'100vh', background:'#F8FAFC', display:'flex', flexDirection:'column', fontFamily:"'Inter', sans-serif" }}>
      <style>{`
        .markdown-body { font-size: 14px; line-height: 1.6; color: #334155; }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: #0F172A; margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 800; }
        .markdown-body ul { padding-left: 20px; }
        .markdown-body li { margin-bottom: 8px; }
        .markdown-body strong { color: #0F172A; }
      `}</style>
      
      {/* Header */}
      <div style={{ background:'#0F172A', color:'#fff', padding:'0 32px', height:"64px", display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ fontWeight:"900", fontSize:"18px", display:"flex", alignItems:"center", gap:"12px" }}>
            <span>🎯</span> ATS Optimization Scanner
          </div>
        </div>
        <button onClick={onBack} style={{ background:'transparent', border:'1px solid #334155', color:'#94A3B8', padding:'6px 16px', borderRadius:'8px', cursor:'pointer', fontWeight:'600', fontSize:"13px" }}>
          Exit to Hub
        </button>
      </div>

      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        
        {/* Left Side: Input */}
        <div style={{ width:'45%', minWidth:'400px', background:'#fff', borderRight:'1px solid #E2E8F0', display:'flex', flexDirection:'column', padding:'32px', overflowY:'auto' }}>
          <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#0F172A', margin:'0 0 8px' }}>Input Details</h2>
          <p style={{ fontSize:'14px', color:'#64748B', margin:'0 0 24px' }}>Paste your resume content and the target job description to see how an ATS will score you.</p>
          
          <label style={{ fontSize:'13px', fontWeight:'700', color:'#475569', marginBottom:'8px' }}>Target Job Description *</label>
          <textarea 
            value={jobDescription} 
            onChange={e => setJobDescription(e.target.value)} 
            placeholder="Paste the requirements and description from the job posting..."
            style={{ width:'100%', minHeight:'180px', padding:'16px', border:'1px solid #E2E8F0', borderRadius:'12px', fontSize:'14px', fontFamily:'inherit', resize:'vertical', outline:'none', marginBottom:'24px', boxSizing:'border-box' }}
          />

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
            <label style={{ fontSize:'13px', fontWeight:'700', color:'#475569' }}>Your Resume Content *</label>
            <div>
              <input type="file" id="cv-upload" accept=".pdf" onChange={handleFileUpload} style={{ display:'none' }} />
              <label htmlFor="cv-upload" style={{ background:'#EFF6FF', color:'#2563EB', padding:'6px 12px', borderRadius:'6px', fontSize:'12px', fontWeight:'700', cursor:'pointer', display:'flex', alignItems:'center', gap:'6px' }}>
                {parsingPdf ? 'Parsing...' : '📎 Upload PDF'}
              </label>
            </div>
          </div>
          
          <textarea 
            value={resumeText} 
            onChange={e => setResumeText(e.target.value)} 
            placeholder="Upload your PDF CV above, or paste your plain-text resume here..."
            style={{ width:'100%', minHeight:'300px', padding:'16px', border:'1px solid #E2E8F0', borderRadius:'12px', fontSize:'14px', fontFamily:'inherit', resize:'vertical', outline:'none', marginBottom:'24px', boxSizing:'border-box', background: parsingPdf ? '#F8FAFC' : '#fff' }}
            disabled={parsingPdf}
          />

          {error && <div style={{ color:'#EF4444', fontSize:'13px', fontWeight:'600', marginBottom:'16px', padding:'12px', background:'#FEF2F2', borderRadius:'8px' }}>{error}</div>}

          <button 
            onClick={analyze}
            disabled={loading}
            style={{ width:'100%', padding:'16px', background:loading ? '#E2E8F0' : 'linear-gradient(135deg,#059669,#10B981)', color:loading ? '#94A3B8' : '#fff', border:'none', borderRadius:'12px', fontWeight:'800', fontSize:'15px', cursor:loading ? 'not-allowed' : 'pointer', boxShadow:loading ? 'none' : '0 8px 24px rgba(5,150,105,0.2)' }}
          >
            {loading ? 'Analyzing with GenuAI...' : 'Scan Resume Compatibility'}
          </button>
        </div>

        {/* Right Side: Results */}
        <div style={{ flex:1, background:'#F8FAFC', padding:'40px', overflowY:'auto' }}>
          {loading ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#64748B' }}>
              <div style={{ fontSize:'48px', animation:'pulse 2s infinite', marginBottom:'16px' }}>🤖</div>
              <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#0F172A', margin:'0 0 8px' }}>Scanning Resume...</h2>
              <p>Simulating ATS parsing and semantic keyword matching.</p>
            </div>
          ) : result ? (
            <div style={{ background:'#fff', padding:'40px', borderRadius:'24px', boxShadow:'0 12px 32px rgba(0,0,0,0.05)' }}>
              <h2 style={{ fontSize:'24px', fontWeight:'900', color:'#0F172A', margin:'0 0 24px', borderBottom:'1px solid #E2E8F0', paddingBottom:'16px' }}>ATS Analysis Results</h2>
              <div className="markdown-body">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:'#94A3B8', textAlign:'center' }}>
              <span style={{ fontSize:'48px', marginBottom:'16px', opacity:0.5 }}>📊</span>
              <h2 style={{ fontSize:'20px', fontWeight:'800', color:'#475569', margin:'0 0 8px' }}>No Data Analyzed</h2>
              <p style={{ maxWidth:'300px' }}>Provide your resume and a job description on the left to generate an ATS compatibility report.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
