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
    <div className="h-screen bg-background quantum-gradient flex flex-col overflow-hidden">
      <style>{`
        .markdown-body { font-size: 14px; line-height: 1.6; color: var(--color-on-surface); }
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { color: var(--color-on-surface); margin-top: 1.5em; margin-bottom: 0.5em; font-weight: 800; }
        .markdown-body ul { padding-left: 20px; }
        .markdown-body li { margin-bottom: 8px; }
        .markdown-body strong { color: var(--color-on-surface); }
      `}</style>
      
      {/* Header */}
      <div className="glass border-b border-surface-container px-lg md:px-xl h-16 flex items-center justify-between shrink-0 sticky top-0 z-40">
        <div className="flex items-center gap-md">
          <div className="font-black text-title-sm text-on-surface flex items-center gap-sm">
            <span>🎯</span> ATS Optimization Scanner
          </div>
        </div>
        <button onClick={onBack} className="bg-surface-bright border border-surface-container text-on-surface-variant px-md py-xs rounded-lg font-bold text-xs hover:text-on-surface hover:border-surface-container-high transition-colors">
          Exit to Hub
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden flex-col md:flex-row">
        
        {/* Left Side: Input */}
        <div className="w-full md:w-[45%] md:min-w-[400px] glass border-r border-surface-container flex flex-col p-lg md:p-xl overflow-y-auto">
          <h2 className="text-title-md font-black text-on-surface mb-xs">Input Details</h2>
          <p className="text-sm font-medium text-on-surface-variant mb-xl">Paste your resume content and the target job description to see how an ATS will score you.</p>
          
          <label className="text-xs font-bold text-on-surface-variant mb-xs">Target Job Description *</label>
          <textarea 
            value={jobDescription} 
            onChange={e => setJobDescription(e.target.value)} 
            placeholder="Paste the requirements and description from the job posting..."
            className="w-full min-h-[180px] p-md bg-background border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y mb-lg focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all"
          />

          <div className="flex justify-between items-center mb-xs">
            <label className="text-xs font-bold text-on-surface-variant">Your Resume Content *</label>
            <div>
              <input type="file" id="cv-upload" accept=".pdf" onChange={handleFileUpload} className="hidden" />
              <label htmlFor="cv-upload" className="bg-info/10 text-info-dark px-sm py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-xs border border-info/20 hover:bg-info/20 transition-colors">
                {parsingPdf ? 'Parsing...' : '📎 Upload PDF'}
              </label>
            </div>
          </div>
          
          <textarea 
            value={resumeText} 
            onChange={e => setResumeText(e.target.value)} 
            placeholder="Upload your PDF CV above, or paste your plain-text resume here..."
            className={`w-full min-h-[300px] p-md border border-surface-container rounded-xl text-sm font-medium text-on-surface outline-none resize-y mb-lg focus:border-indigo-brand focus:ring-1 focus:ring-indigo-brand transition-all ${parsingPdf ? 'bg-surface-bright/50' : 'bg-background'}`}
            disabled={parsingPdf}
          />

          {error && <div className="text-error-crimson text-xs font-bold mb-md p-sm bg-error-crimson/10 border border-error-crimson/20 rounded-lg">{error}</div>}

          <button 
            onClick={analyze}
            disabled={loading}
            className={`w-full p-md rounded-xl font-black text-sm transition-all ${loading ? 'bg-surface-container text-on-surface-variant cursor-not-allowed' : 'bg-gradient-to-r from-success to-[#10B981] text-white hover:shadow-lg hover:shadow-success/20 cursor-pointer'}`}
          >
            {loading ? 'Analyzing with GenuAI...' : 'Scan Resume Compatibility'}
          </button>
        </div>

        {/* Right Side: Results */}
        <div className="flex-1 p-lg md:p-xl overflow-y-auto relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-on-surface-variant">
              <div className="text-display-sm animate-pulse mb-md">🤖</div>
              <h2 className="text-title-md font-black text-on-surface mb-xs">Scanning Resume...</h2>
              <p className="text-sm font-medium">Simulating ATS parsing and semantic keyword matching.</p>
            </div>
          ) : result ? (
            <div className="glass p-xl rounded-3xl shadow-lg border border-surface-container">
              <h2 className="text-headline-sm font-black text-on-surface mb-lg pb-md border-b border-surface-container">ATS Analysis Results</h2>
              <div className="markdown-body">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-display-sm mb-md opacity-50">📊</span>
              <h2 className="text-title-md font-black text-on-surface-variant mb-xs">No Data Analyzed</h2>
              <p className="text-sm font-medium text-on-surface-variant/70 max-w-[300px]">Provide your resume and a job description on the left to generate an ATS compatibility report.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
