                          const restParts = rest?.split(/\s(?=\w{3}\s\d{4})/);
                          const issuer = restParts?.[0];
                          const date = restParts?.[1];
                          return (
                            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5pt", marginBottom: "2px" }}>
                              <span><span style={{ fontWeight: 700 }}>{name}</span>{issuer ? " — " + issuer : ""}</span>
                              {date && <span style={{ color: "#555", fontSize: "9pt" }}>{date}</span>}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Achievements */}
                    {form.achievements.some(a => a.title) && (
                      <div style={{ marginBottom: "8px" }}>
                        <div style={{ fontSize: "10pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "5px" }}>Achievements & Competitions</div>
                        {form.achievements.filter(a => a.title).map((a, i) => (
                          <div key={i} style={{ marginBottom: "4px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                              <span style={{ fontWeight: 700, fontSize: "9.5pt" }}>{"🎓 " + a.title}</span>
                              {a.year && <span style={{ fontSize: "9pt", color: "#555" }}>{a.year}</span>}
                            </div>
                            {a.org && <div style={{ fontSize: "9pt", color: "#555", marginBottom: "1px" }}>{a.org}</div>}
                            {a.bullet && <ul style={{ paddingLeft: "14px", margin: "1px 0" }}><li style={{ fontSize: "9.5pt" }}>{a.bullet}</li></ul>}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Core Competencies */}
                    {comps.length > 0 && (
                      <div>
                        <div style={{ fontSize: "10pt", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px", borderBottom: "1px solid #ccc", paddingBottom: "2px", marginBottom: "5px" }}>Core Competencies</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 18px", fontSize: "9.5pt" }}>
                          {comps.map((c, i) => <span key={i}>▸ {c}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1.5px solid #E2E8F0" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>📄</div>
                  <h3 style={{ color: "#1E293B", marginBottom: "8px" }}>Fill in the form and click Generate</h3>
                  <p style={{ color: "#64748B", fontSize: "14px" }}>Your resume preview will appear here in the exact format of the sample — single page, hyperlinks, ATS-optimised.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* COVER LETTER TAB */
          <div style={{ display: "flex", gap: "20px", width: "100%" }}>
            <div style={{ width: "380px", flexShrink: 0 }}>
              <div style={{ background: "#fff", borderRadius: "16px", padding: "20px", border: "1.5px solid #E2E8F0" }}>
                <div style={sech}>Cover Letter Details</div>
                <label style={lbl}>Company Name</label>
                <input style={inp} value={cover.companyName} onChange={e => setCover(p => ({ ...p, companyName: e.target.value }))} placeholder="Google, Infosys, Startup..." />
                <label style={lbl}>Job Title Applying For</label>
                <input style={inp} value={cover.jobTitle} onChange={e => setCover(p => ({ ...p, jobTitle: e.target.value }))} placeholder="Software Engineer Intern" />
                <label style={lbl}>Hiring Manager Name</label>
                <input style={inp} value={cover.hiringManager} onChange={e => setCover(p => ({ ...p, hiringManager: e.target.value }))} placeholder="Hiring Manager" />
                <label style={lbl}>Why this company? (2-3 sentences)</label>
                <textarea style={{ ...inp, height: "80px", resize: "vertical" }} value={cover.whyCompany} onChange={e => setCover(p => ({ ...p, whyCompany: e.target.value }))} placeholder="I admire your work in AI and your culture of innovation..." />
                <label style={lbl}>Your Key Strength to Highlight</label>
                <input style={inp} value={cover.keyStrength} onChange={e => setCover(p => ({ ...p, keyStrength: e.target.value }))} placeholder="Full-stack AI development with AWS" />
                <label style={lbl}>Available From</label>
                <input style={inp} value={cover.availableDate} onChange={e => setCover(p => ({ ...p, availableDate: e.target.value }))} placeholder="immediately / June 2025" />
                <button onClick={generateCoverLetter} disabled={loading || !cover.companyName || !cover.jobTitle} style={{ width: "100%", padding: "13px", background: loading ? "#E2E8F0" : "linear-gradient(135deg,#00B87C,#00D4AA)", color: loading ? "#94A3B8" : "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: loading ? "not-allowed" : "pointer", marginTop: "8px" }}>
                  {loading ? "Generating with Gemini AI..." : "✨ Generate Cover Letter"}
                </button>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {coverGenerated ? (
                <div>
                  <div style={{ display: "flex", gap: "10px", marginBottom: "14px" }}>
                    <button onClick={printCover} style={{ padding: "10px 22px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "10px", fontWeight: "700", cursor: "pointer" }}>🖨️ Print / Save as PDF</button>
                  </div>
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "40px 50px", border: "1.5px solid #E2E8F0", fontFamily: "Arial, sans-serif", fontSize: "11pt", lineHeight: 1.7, color: "#1a1a1a", whiteSpace: "pre-wrap", minHeight: "297mm" }}>
                    {coverLetter}
                  </div>
                </div>
              ) : (
                <div style={{ background: "#fff", borderRadius: "16px", padding: "40px", textAlign: "center", border: "1.5px solid #E2E8F0" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>✉️</div>
                  <h3 style={{ color: "#1E293B", marginBottom: "8px" }}>AI-Powered Cover Letter</h3>
                  <p style={{ color: "#64748B", fontSize: "14px" }}>Fill in the details and Gemini AI will write a professional, personalised cover letter using your resume data.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
TSEOF

echo "Written! Lines: $(wc -l < ~/genuai-frontend/src/pages/ResumeGenerator.tsx)"
grep GEMINI ~/genuai-frontend/.env || echo "GEMINI key not set"
npm run build 2>&1 | grep -E 'error TS|✓|Built in' && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Deployed!"
echo "VITE_GEMINI_KEY=AIzaSyCNxTguMxAJfJwE-YpF8mSspYKgE7R6pTE" >> ~/genuai-frontend/.env && npm run build 2>&1 | grep -E 'error TS|✓|Built in' && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Deployed!"
curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=$(grep GEMINI ~/genuai-frontend/.env | tail -1 | cut -d= -f2)" -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}' | python3 -m json.tool | head -20
NEW_KEY="AIzaSyBaBIwmNFHF9h2o_G0rQT4FBrl4mgOh3Ws"
sed -i "s/VITE_GEMINI_KEY=.*/VITE_GEMINI_KEY=${NEW_KEY}/" ~/genuai-frontend/.env && curl -s -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${NEW_KEY}" -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"Say hello"}]}]}' | python3 -m json.tool | head -10
npm run build 2>&1 | grep -E '✓|error TS' && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Deployed!"
# Update .env with Groq key
sed -i '/VITE_GEMINI_KEY/d' ~/genuai-frontend/.env
echo "VITE_GROQ_KEY=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" >> ~/genuai-frontend/.env
echo "Key added!" && grep GROQ ~/genuai-frontend/.env
sed -i 's/const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY || "";/const GROQ_KEY = import.meta.env.VITE_GROQ_KEY || "";/' ~/genuai-frontend/src/pages/ResumeGenerator.tsx
sed -i 's|const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + GEMINI_KEY, {|const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {|' ~/genuai-frontend/src/pages/ResumeGenerator.tsx
sed -i 's|headers: { "Content-Type": "application/json" },|headers: { "Content-Type": "application/json", "Authorization": "Bearer " + GROQ_KEY },|' ~/genuai-frontend/src/pages/ResumeGenerator.tsx
sed -i 's|body: JSON.stringify({ contents: \[{ parts: \[{ text: prompt }\] }\] })|body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], max_tokens: 1000 })|' ~/genuai-frontend/src/pages/ResumeGenerator.tsx
sed -i "s|data.candidates?.\[0\]?.content?.parts?.\[0\]?.text|data.choices?.[0]?.message?.content|" ~/genuai-frontend/src/pages/ResumeGenerator.tsx
echo "Updated! Testing key..."
curl -s -X POST "https://api.groq.com/openai/v1/chat/completions" -H "Content-Type: application/json" -H "Authorization: Bearer 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" -d '{"model":"llama-3.3-70b-versatile","messages":[{"role":"user","content":"Say hello in one word"}],"max_tokens":10}' | python3 -m json.tool | head -15
npm run build 2>&1 | grep -E '✓|error TS' && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Deployed!"
grep -n 'klevelVideoRef\|startKlevelCamera\|stopKlevelCamera\|klevelCamWarning' ~/genuai-frontend/src/pages/CandidateDashboard.tsx | head -20
cd ~/genuai-frontend && python3 /tmp/add_cam.py
npm run build 2>&1 | grep -E 'error TS|✓|Built in'
aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Camera deployed! Starting Score History..."
# Create history integration
aws apigatewayv2 create-integration --api-id kmm7bw0f50 --region ap-south-1 --integration-type HTTP_PROXY --integration-method ANY --integration-uri "http://3.110.115.79/history/{proxy}" --payload-format-version "1.0" --output json | grep IntegrationId
# Wire API Gateway routes
aws apigatewayv2 create-route --api-id kmm7bw0f50 --region ap-south-1 --route-key "GET /history/{proxy+}" --target "integrations/7nwfafe" --output json | grep RouteId
aws apigatewayv2 create-route --api-id kmm7bw0f50 --region ap-south-1 --route-key "POST /history/{proxy+}" --target "integrations/7nwfafe" --output json | grep RouteId
# Deploy
aws apigatewayv2 create-deployment --api-id kmm7bw0f50 --region ap-south-1 --stage-name '$default' --output json | grep DeploymentId
# Test it
curl -s "https://kmm7bw0f50.execute-api.ap-south-1.amazonaws.com/history/1" | python3 -m json.tool
echo "✅ History API live! Now building Score History UI..."
cd ~/genuai-backend && npm run build 2>&1 | tail -3 && pm2 restart genuai-api && sleep 3 && curl -s "https://kmm7bw0f50.execute-api.ap-south-1.amazonaws.com/history/1" | python3 -m json.tool
curl -s "http://localhost:3000/history/1" | python3 -m json.tool
grep -n 'history' ~/genuai-backend/src/index.ts
echo "---"
grep -n 'history' ~/genuai-backend/dist/index.js 2>/dev/null | head -5
echo "---"
pm2 logs genuai-api --lines 20 --nostream
cat ~/genuai-backend/src/routes/jobs.ts
cat ~/genuai-backend/src/index.ts
ls ~/genuai-backend/src/routes/
# Add history import and route to index.ts
sed -i "s/import klevelRoutes from '.\/routes\/klevel';/import klevelRoutes from '.\/routes\/klevel';\nimport historyRoutes from '.\/routes\/history';/" ~/genuai-backend/src/index.ts
sed -i "s/app.use('\/klevel', klevelRoutes);/app.use('\/klevel', klevelRoutes);\napp.use('\/history', historyRoutes);/" ~/genuai-backend/src/index.ts
# Verify
grep -n 'history' ~/genuai-backend/src/index.ts
# Build and restart
npm run build 2>&1 | tail -3 && pm2 restart genuai-api && sleep 3 && curl -s "http://localhost:3000/history/1" | python3 -m json.tool
cat > ~/genuai-backend/src/routes/history.ts << 'EOF'
import express from 'express';
import pool from '../db';
const router = express.Router();

router.get('/:user_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, overall_score, ats_score, test_score, interview_score,
       authenticity_score, consistency_score, verdict, triangle_status,
       salary_min, salary_max, created_at
       FROM assessments WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 10`,
      [req.params.user_id]
    );
    res.json({ history: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:user_id/best', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, overall_score, ats_score, test_score, interview_score,
       authenticity_score, verdict, created_at
       FROM assessments WHERE user_id = $1
       ORDER BY overall_score DESC LIMIT 1`,
      [req.params.user_id]
    );
    res.json({ best: result.rows[0] || null });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
EOF

# Verify file created
ls ~/genuai-backend/src/routes/history.ts
# Build and restart
npm run build 2>&1 | tail -3 && pm2 restart genuai-api && sleep 3 && curl -s "http://localhost:3000/history/1" | python3 -m json.tool
npm run build 2>&1 | tail -3 && pm2 restart genuai-api && sleep 3 && curl -s "http://localhost:3000/history/1" | python3 -m json.tool
pm2 logs genuai-api --lines 10 --nostream 2>&1 | grep -E 'error|Error|running|Connected'
curl -s "http://localhost:3000/history/1"
echo "---"
curl -v "http://3.110.115.79/history/1" 2>&1 | grep -E 'HTTP|location|history'
curl -s "https://kmm7bw0f50.execute-api.ap-south-1.amazonaws.com/history/1" | python3 -m json.tool
cd ~/genuai-frontend && cat > /tmp/add_history.py << 'PYEOF'
with open("src/pages/CandidateDashboard.tsx", "r") as f:
    content = f.read()

# 1. Add history state after klevelCamReady state
old = '  const [klevelCamReady, setKlevelCamReady] = useState(false);'
new = '''  const [klevelCamReady, setKlevelCamReady] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [bestScore, setBestScore] = useState<any>(null);'''

if old in content:
    content = content.replace(old, new)
    print("Step 1: state OK")
else:
    print("Step 1: FAILED")

# 2. Add fetchHistory function before handleStep1
old = '  const handleStep1 = async () => {'
new = '''  const fetchHistory = async () => {
    setHistoryLoading(true);
    try {
      const [histRes, bestRes] = await Promise.all([
        axios.get(API + "/history/" + userId),
        axios.get(API + "/history/" + userId + "/best")
      ]);
      setHistory(histRes.data.history || []);
      setBestScore(bestRes.data.best || null);
      setShowHistory(true);
    } catch { alert("Failed to load history"); }
    setHistoryLoading(false);
  };

  const handleStep1 = async () => {'''

if '  const handleStep1 = async () => {' in content:
    content = content.replace('  const handleStep1 = async () => {', new)
    print("Step 2: fetchHistory OK")
else:
    print("Step 2: FAILED")

# 3. Add History button in header next to Resume Generator button
old = '{onResume && <button onClick={onResume} style={{ padding: "8px 16px", background: "#A78BFA", color: "#000", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Resume Generator</button>}'
new = '''{onResume && <button onClick={onResume} style={{ padding: "8px 16px", background: "#A78BFA", color: "#000", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>Resume Generator</button>}
          <button onClick={fetchHistory} disabled={historyLoading} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#F59E0B,#F97316)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>
            {historyLoading ? "Loading..." : "📊 My History"}
          </button>'''

if old in content:
    content = content.replace(old, new)
    print("Step 3: History button OK")
else:
    print("Step 3: FAILED - trying alternate")
    idx = content.find('Resume Generator</button>}')
    print("Context:", repr(content[idx:idx+100]))

# 4. Add History modal before the main return closes
old = '  if (!user) return <Auth onLogin={handleLogin} />;'
# Find closing of main return and add modal before step 1 block
old2 = '      {step === 1 && ('
new2 = '''      {/* Score History Modal */}
      {showHistory && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "800px", width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#1E293B", margin: 0 }}>📊 My Score History</h2>
              <button onClick={() => setShowHistory(false)} style={{ padding: "8px 16px", background: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", color: "#64748B" }}>✕ Close</button>
            </div>

            {bestScore && (
              <div style={{ background: "linear-gradient(135deg,#667EEA11,#764BA211)", border: "1.5px solid #667EEA33", borderRadius: "16px", padding: "20px", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "12px", color: "#94A3B8", marginBottom: "4px" }}>🏆 Personal Best</div>
                  <div style={{ fontSize: "36px", fontWeight: "800", color: "#667EEA" }}>{bestScore.overall_score}%</div>
                  <div style={{ fontSize: "13px", color: "#64748B" }}>{new Date(bestScore.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                {[["ATS", bestScore.ats_score, "#00B87C"], ["Test", bestScore.test_score, "#F59E0B"], ["Interview", bestScore.interview_score, "#A78BFA"], ["Authenticity", bestScore.authenticity_score, "#00D4FF"]].map(([l, v, c]: any) => (
                  <div key={l} style={{ textAlign: "center", minWidth: "80px" }}>
                    <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px" }}>{l}</div>
                    <div style={{ fontSize: "22px", fontWeight: "800", color: c }}>{v}%</div>
                  </div>
                ))}
                <div style={{ textAlign: "center", minWidth: "100px" }}>
                  <div style={{ fontSize: "11px", color: "#94A3B8", marginBottom: "4px" }}>Verdict</div>
                  <span style={{ padding: "4px 12px", borderRadius: "20px", background: bestScore.verdict === "HIRE" ? "#F0FDF4" : bestScore.verdict === "REVIEW" ? "#FFFBEB" : "#FEF2F2", color: bestScore.verdict === "HIRE" ? "#16A34A" : bestScore.verdict === "REVIEW" ? "#D97706" : "#DC2626", fontWeight: "700", fontSize: "13px" }}>{bestScore.verdict}</span>
                </div>
              </div>
            )}

            {history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                <div>No assessments yet. Complete your first assessment to see history.</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "12px", fontWeight: "600" }}>Last {history.length} assessments</div>
                {history.map((h, i) => (
                  <div key={h.id} style={{ background: i === 0 ? "#F8FAFC" : "#fff", border: "1.5px solid #E2E8F0", borderRadius: "14px", padding: "16px", marginBottom: "10px", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                    <div style={{ minWidth: "50px", textAlign: "center" }}>
                      <div style={{ fontSize: "22px", fontWeight: "800", color: h.overall_score >= 75 ? "#16A34A" : h.overall_score >= 50 ? "#D97706" : "#DC2626" }}>{h.overall_score}%</div>
                      <div style={{ fontSize: "10px", color: "#94A3B8" }}>Overall</div>
                    </div>
                    <div style={{ flex: 1, display: "flex", gap: "12px", flexWrap: "wrap" }}>
                      {[["ATS", h.ats_score, "#00B87C"], ["Test", h.test_score, "#F59E0B"], ["Interview", h.interview_score, "#A78BFA"], ["Auth", h.authenticity_score, "#00D4FF"]].map(([l, v, c]: any) => (
                        <div key={l} style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "15px", fontWeight: "700", color: c }}>{v}%</div>
                          <div style={{ fontSize: "10px", color: "#94A3B8" }}>{l}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span style={{ padding: "4px 12px", borderRadius: "20px", background: h.verdict === "HIRE" ? "#F0FDF4" : h.verdict === "REVIEW" ? "#FFFBEB" : "#FEF2F2", color: h.verdict === "HIRE" ? "#16A34A" : h.verdict === "REVIEW" ? "#D97706" : "#DC2626", fontWeight: "700", fontSize: "12px" }}>{h.verdict}</span>
                      <div style={{ fontSize: "10px", color: "#94A3B8", marginTop: "4px" }}>{h.triangle_status}</div>
                    </div>
                    <div style={{ fontSize: "11px", color: "#94A3B8", textAlign: "right" }}>
                      {new Date(h.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      <div>{new Date(h.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {step === 1 && ('''

if old2 in content:
    content = content.replace(old2, new2)
    print("Step 4: History modal OK")
else:
    print("Step 4: FAILED")

with open("src/pages/CandidateDashboard.tsx", "w") as f:
    f.write(content)
print("Done! Lines:", len(content.splitlines()))
PYEOF

python3 /tmp/add_history.py
npm run build 2>&1 | grep -E 'error TS|✓|Built in' && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Score History deployed! Starting Job Board..."
cd ~/genuai-frontend && cat > /tmp/add_jobboard.py << 'PYEOF'
with open("src/pages/CandidateDashboard.tsx", "r") as f:
    content = f.read()

# 1. Add job board state after bestScore state
old = '  const [bestScore, setBestScore] = useState<any>(null);'
new = '''  const [bestScore, setBestScore] = useState<any>(null);
  const [showJobs, setShowJobs] = useState(false);
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [appliedJobs, setAppliedJobs] = useState<number[]>([]);
  const [jobSearch, setJobSearch] = useState("");'''

if old in content:
    content = content.replace(old, new)
    print("Step 1: state OK")
else:
    print("Step 1: FAILED")

# 2. Add fetchJobs function after fetchHistory
old = '  const handleStep1 = async () => {'
new = '''  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await axios.get(API + "/jobs/list");
      setJobs(res.data.jobs || []);
      setShowJobs(true);
    } catch { alert("Failed to load jobs"); }
    setJobsLoading(false);
  };

  const applyJob = async (jobId: number) => {
    if (appliedJobs.includes(jobId)) return;
    try {
      await axios.post(API + "/interviews/schedule", {
        candidate_id: userId,
        job_id: jobId,
        scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        notes: "Applied via Job Board"
      });
      setAppliedJobs(p => [...p, jobId]);
    } catch { setAppliedJobs(p => [...p, jobId]); }
  };

  const handleStep1 = async () => {'''

if '  const handleStep1 = async () => {' in content:
    content = content.replace('  const handleStep1 = async () => {', new)
    print("Step 2: fetchJobs OK")
else:
    print("Step 2: FAILED")

# 3. Add Jobs button in header
old = '''{historyLoading ? "Loading..." : "📊 My History"}
          </button>'''
new = '''{historyLoading ? "Loading..." : "📊 My History"}
          </button>
          <button onClick={fetchJobs} disabled={jobsLoading} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>
            {jobsLoading ? "Loading..." : "💼 Job Board"}
          </button>'''

if old in content:
    content = content.replace(old, new)
    print("Step 3: Jobs button OK")
else:
    print("Step 3: FAILED")

# 4. Add Job Board modal before step 1
old = '      {/* Score History Modal */}'
new = '''      {/* Job Board Modal */}
      {showJobs && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "860px", width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ color: "#1E293B", margin: 0 }}>💼 Job Board</h2>
              <button onClick={() => setShowJobs(false)} style={{ padding: "8px 16px", background: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", color: "#64748B" }}>✕ Close</button>
            </div>
            <input value={jobSearch} onChange={e => setJobSearch(e.target.value)} placeholder="🔍 Search jobs by title or skills..." style={{ width: "100%", padding: "12px 16px", border: "1.5px solid #E2E8F0", borderRadius: "12px", fontSize: "14px", marginBottom: "20px", boxSizing: "border-box", outline: "none" }} />
            {jobs.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#94A3B8" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>📭</div>
                <div>No jobs posted yet. Check back soon!</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: "13px", color: "#64748B", marginBottom: "12px", fontWeight: "600" }}>{jobs.filter(j => !jobSearch || j.title?.toLowerCase().includes(jobSearch.toLowerCase()) || j.skills?.toLowerCase().includes(jobSearch.toLowerCase())).length} jobs available</div>
                {jobs.filter(j => !jobSearch || j.title?.toLowerCase().includes(jobSearch.toLowerCase()) || j.skills?.toLowerCase().includes(jobSearch.toLowerCase())).map((job) => (
                  <div key={job.id} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "16px", padding: "20px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <h3 style={{ color: "#1E293B", margin: "0 0 4px", fontSize: "16px" }}>{job.title}</h3>
                        <div style={{ fontSize: "13px", color: "#64748B" }}>{job.company_name || "Company"} {job.location ? "· " + job.location : ""}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {job.salary_min > 0 && <div style={{ fontSize: "13px", fontWeight: "700", color: "#00B87C" }}>₹{job.salary_min}L – ₹{job.salary_max}L/yr</div>}
                        <div style={{ fontSize: "11px", color: "#94A3B8" }}>{new Date(job.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                    {job.description && <p style={{ color: "#475569", fontSize: "13px", margin: "0 0 10px", lineHeight: "1.5" }}>{job.description.substring(0, 150)}{job.description.length > 150 ? "..." : ""}</p>}
                    {job.skills && (
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "12px" }}>
                        {job.skills.split(",").map((s: string) => s.trim()).filter(Boolean).map((skill: string, i: number) => (
                          <span key={i} style={{ padding: "3px 10px", background: "#EEF2FF", borderRadius: "20px", color: "#667EEA", fontSize: "11px", fontWeight: "600" }}>{skill}</span>
                        ))}
                      </div>
                    )}
                    <button onClick={() => applyJob(job.id)} style={{ padding: "9px 24px", background: appliedJobs.includes(job.id) ? "#F0FDF4" : "linear-gradient(135deg,#00B87C,#00D4AA)", color: appliedJobs.includes(job.id) ? "#16A34A" : "#fff", border: appliedJobs.includes(job.id) ? "1.5px solid #BBF7D0" : "none", borderRadius: "10px", fontWeight: "700", cursor: appliedJobs.includes(job.id) ? "default" : "pointer", fontSize: "13px" }}>
                      {appliedJobs.includes(job.id) ? "✅ Applied!" : "Apply Now →"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Score History Modal */}'''

if old in content:
    content = content.replace(old, new)
    print("Step 4: Job Board modal OK")
else:
    print("Step 4: FAILED")

with open("src/pages/CandidateDashboard.tsx", "w") as f:
    f.write(content)
print("Done! Lines:", len(content.splitlines()))
PYEOF

python3 /tmp/add_jobboard.py
npm run build 2>&1 | grep -E 'error TS|✓|Built in' && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Job Board deployed! Building Practice Mode..."
cat > /tmp/add_practice.py << 'PYEOF'
with open("src/pages/CandidateDashboard.tsx", "r") as f:
    content = f.read()

# 1. Add practice state
old = '  const [jobSearch, setJobSearch] = useState("");'
new = '''  const [jobSearch, setJobSearch] = useState("");
  const [showPractice, setShowPractice] = useState(false);
  const [practiceRole, setPracticeRole] = useState("Software Engineer");
  const [practiceLevel, setPracticeLevel] = useState(1);
  const [practiceQuestion, setPracticeQuestion] = useState<any>(null);
  const [practiceSelected, setPracticeSelected] = useState("");
  const [practiceFeedback, setPracticeFeedback] = useState<any>(null);
  const [practiceScore, setPracticeScore] = useState(0);
  const [practiceLoading, setPracticeLoading] = useState(false);
  const [practiceStats, setPracticeStats] = useState({ attempted: 0, correct: 0 });
  const [practiceStarted, setPracticeStarted] = useState(false);'''

if old in content:
    content = content.replace(old, new)
    print("Step 1: state OK")
else:
    print("Step 1: FAILED")

# 2. Add practice functions
old = '  const handleStep1 = async () => {'
new = '''  const startPractice = async () => {
    setPracticeLoading(true);
    setPracticeFeedback(null);
    setPracticeSelected("");
    setPracticeScore(0);
    setPracticeLevel(1);
    setPracticeStats({ attempted: 0, correct: 0 });
    try {
      const res = await axios.post(API + "/klevel/start", { role: practiceRole });
      setPracticeQuestion(res.data.question);
      setPracticeLevel(1);
      setPracticeStarted(true);
    } catch { alert("Failed to load practice question"); }
    setPracticeLoading(false);
  };

  const submitPracticeAnswer = async () => {
    if (!practiceSelected) return;
    setPracticeLoading(true);
    try {
      const res = await axios.post(API + "/klevel/answer", {
        question_id: practiceQuestion.id,
        selected_answer: practiceSelected,
        current_level: practiceLevel,
        total_score: practiceScore,
        role: practiceRole
      });
      setPracticeFeedback(res.data);
      setPracticeScore(res.data.total_score);
      setPracticeStats(p => ({ attempted: p.attempted + 1, correct: p.correct + (res.data.is_correct ? 1 : 0) }));
    } catch { alert("Failed to submit"); }
    setPracticeLoading(false);
  };

  const nextPracticeQuestion = async () => {
    setPracticeLoading(true);
    setPracticeFeedback(null);
    setPracticeSelected("");
    try {
      const nextLevel = practiceFeedback?.is_correct ? Math.min(practiceLevel + 1, 5) : Math.max(practiceLevel - 1, 1);
      setPracticeLevel(nextLevel);
      const res = await axios.post(API + "/klevel/start", { role: practiceRole });
      setPracticeQuestion({ ...res.data.question, k_level: nextLevel });
      const res2 = await axios.post(API + "/klevel/start", { role: practiceRole });
      setPracticeQuestion(res2.data.question);
    } catch { alert("Failed to load next question"); }
    setPracticeLoading(false);
  };

  const handleStep1 = async () => {'''

if '  const handleStep1 = async () => {' in content:
    content = content.replace('  const handleStep1 = async () => {', new)
    print("Step 2: practice functions OK")
else:
    print("Step 2: FAILED")

# 3. Add Practice button in header
old = '''{jobsLoading ? "Loading..." : "💼 Job Board"}
          </button>'''
new = '''{jobsLoading ? "Loading..." : "💼 Job Board"}
          </button>
          <button onClick={() => { setShowPractice(true); setPracticeStarted(false); setPracticeFeedback(null); setPracticeSelected(""); }} style={{ padding: "8px 16px", background: "linear-gradient(135deg,#A78BFA,#7C3AED)", color: "#fff", border: "none", borderRadius: "10px", cursor: "pointer", fontWeight: "bold" }}>
            🎯 Practice
          </button>'''

if old in content:
    content = content.replace(old, new)
    print("Step 3: Practice button OK")
else:
    print("Step 3: FAILED")

# 4. Add Practice modal before Job Board modal
old = '      {/* Job Board Modal */}'
new = '''      {/* Practice Mode Modal */}
      {showPractice && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "20px", padding: "28px", maxWidth: "680px", width: "100%", maxHeight: "85vh", overflowY: "auto", boxShadow: "0 25px 50px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h2 style={{ color: "#1E293B", margin: "0 0 4px" }}>🎯 Practice Mode</h2>
                <div style={{ fontSize: "12px", color: "#94A3B8" }}>Unlimited practice — scores do NOT affect your assessment</div>
              </div>
              <button onClick={() => { setShowPractice(false); setPracticeStarted(false); }} style={{ padding: "8px 16px", background: "#F1F5F9", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "700", color: "#64748B" }}>✕ Close</button>
            </div>

            {!practiceStarted ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>🧠</div>
                <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "24px" }}>Practice K-Level questions for any role. Get instant feedback with explanations. No pressure — this never affects your real score.</p>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ color: "#64748B", fontSize: "13px", fontWeight: "600", display: "block", marginBottom: "8px" }}>Select Role to Practice</label>
                  <select value={practiceRole} onChange={e => setPracticeRole(e.target.value)} style={{ width: "100%", padding: "12px", border: "1.5px solid #E2E8F0", borderRadius: "10px", fontSize: "14px", color: "#1E293B", background: "#F8FAFC" }}>
                    {["Software Engineer","AI Engineer","Data Scientist","Frontend Developer","Backend Developer","Full Stack Developer","DevOps Engineer","Product Manager"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px", flexWrap: "wrap" }}>
                  {[["K1","Easy","#22C55E"],["K2","Medium","#F59E0B"],["K3","Hard","#F97316"],["K4","Advanced","#EF4444"],["K5","Expert","#8B5CF6"]].map(([k,l,c]) => (
                    <div key={k} style={{ padding: "8px 14px", background: c + "15", border: "1.5px solid " + c + "44", borderRadius: "10px", fontSize: "12px", color: c, fontWeight: "700" }}>{k} {l}</div>
                  ))}
                </div>
                <button onClick={startPractice} disabled={practiceLoading} style={{ padding: "14px 40px", background: "linear-gradient(135deg,#A78BFA,#7C3AED)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "16px", cursor: "pointer" }}>
                  {practiceLoading ? "Loading..." : "🚀 Start Practice"}
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px", background: "#F8FAFC", borderRadius: "12px", padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <div><div style={{ fontSize: "11px", color: "#94A3B8" }}>Attempted</div><div style={{ fontSize: "18px", fontWeight: "800", color: "#1E293B" }}>{practiceStats.attempted}</div></div>
                    <div><div style={{ fontSize: "11px", color: "#94A3B8" }}>Correct</div><div style={{ fontSize: "18px", fontWeight: "800", color: "#22C55E" }}>{practiceStats.correct}</div></div>
                    <div><div style={{ fontSize: "11px", color: "#94A3B8" }}>Accuracy</div><div style={{ fontSize: "18px", fontWeight: "800", color: "#667EEA" }}>{practiceStats.attempted > 0 ? Math.round((practiceStats.correct / practiceStats.attempted) * 100) : 0}%</div></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: "#94A3B8" }}>Role</div>
                    <div style={{ fontSize: "13px", fontWeight: "700", color: "#A78BFA" }}>{practiceRole}</div>
                  </div>
                </div>

                {practiceQuestion && (
                  <div>
                    <div style={{ background: "linear-gradient(135deg,#A78BFA11,#7C3AED11)", border: "1.5px solid #A78BFA33", borderRadius: "14px", padding: "16px", marginBottom: "16px" }}>
                      <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                        <span style={{ padding: "3px 10px", background: "#A78BFA", borderRadius: "20px", color: "#fff", fontSize: "11px", fontWeight: "700" }}>K{practiceQuestion.k_level} — {practiceQuestion.k_level === 1 ? "Easy" : practiceQuestion.k_level === 2 ? "Medium" : practiceQuestion.k_level === 3 ? "Hard" : practiceQuestion.k_level === 4 ? "Advanced" : "Expert"}</span>
                        <span style={{ padding: "3px 10px", background: "#F1F5F9", borderRadius: "20px", color: "#64748B", fontSize: "11px" }}>{practiceQuestion.marks} mark{practiceQuestion.marks > 1 ? "s" : ""}</span>
                        <span style={{ padding: "3px 10px", background: "#F0FDF4", borderRadius: "20px", color: "#16A34A", fontSize: "11px", fontWeight: "600" }}>Practice — No Penalty</span>
                      </div>
                      <p style={{ color: "#1E293B", fontSize: "15px", fontWeight: "600", margin: 0, lineHeight: "1.6" }}>{practiceQuestion.question_text}</p>
                    </div>

                    {practiceFeedback ? (
                      <div>
                        <div style={{ padding: "14px", background: practiceFeedback.is_correct ? "#F0FDF4" : "#FEF2F2", border: "1.5px solid " + (practiceFeedback.is_correct ? "#BBF7D0" : "#FECACA"), borderRadius: "12px", marginBottom: "14px" }}>
                          <div style={{ fontWeight: "700", color: practiceFeedback.is_correct ? "#16A34A" : "#DC2626", marginBottom: "6px", fontSize: "15px" }}>
                            {practiceFeedback.is_correct ? "✅ Correct! Well done!" : "❌ Incorrect! Correct answer: " + practiceFeedback.correct_answer}
                          </div>
                          <div style={{ color: "#64748B", fontSize: "13px" }}>{practiceFeedback.explanation}</div>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button onClick={nextPracticeQuestion} disabled={practiceLoading} style={{ flex: 1, padding: "12px", background: "linear-gradient(135deg,#A78BFA,#7C3AED)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer" }}>
                            {practiceLoading ? "Loading..." : "Next Question →"}
                          </button>
                          <button onClick={() => { setPracticeStarted(false); setPracticeStats({ attempted: 0, correct: 0 }); }} style={{ padding: "12px 20px", background: "#F1F5F9", border: "none", borderRadius: "12px", fontWeight: "700", cursor: "pointer", color: "#64748B" }}>
                            Change Role
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
                          {["A","B","C","D"].map(opt => (
                            <button key={opt} onClick={() => setPracticeSelected(opt)}
                              style={{ padding: "13px 16px", borderRadius: "12px", border: "1.5px solid " + (practiceSelected === opt ? "#A78BFA" : "#E2E8F0"), background: practiceSelected === opt ? "#F5F3FF" : "#F8FAFC", color: practiceSelected === opt ? "#7C3AED" : "#1E293B", fontWeight: practiceSelected === opt ? "700" : "400", cursor: "pointer", textAlign: "left", fontSize: "14px" }}>
                              <span style={{ fontWeight: "700", marginRight: "8px" }}>{opt}.</span>
                              {practiceQuestion["option_" + opt.toLowerCase()]}
                            </button>
                          ))}
                        </div>
                        <button onClick={submitPracticeAnswer} disabled={practiceLoading || !practiceSelected}
                          style={{ width: "100%", padding: "14px", background: practiceSelected ? "linear-gradient(135deg,#A78BFA,#7C3AED)" : "#E2E8F0", color: practiceSelected ? "#fff" : "#94A3B8", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: practiceSelected ? "pointer" : "not-allowed" }}>
                          {practiceLoading ? "Checking..." : practiceSelected ? "Submit Answer →" : "Select an option"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Job Board Modal */}'''

if old in content:
    content = content.replace(old, new)
    print("Step 4: Practice modal OK")
else:
    print("Step 4: FAILED")

with open("src/pages/CandidateDashboard.tsx", "w") as f:
    f.write(content)
print("Done! Lines:", len(content.splitlines()))
PYEOF

python3 /tmp/add_practice.py
cd ~/genuai-frontend && npm run build 2>&1 | tail -3 && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude 'resumes/*' --exclude 'logo.png' && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths '/*' --output text && echo 'Deployed!'
cd ~/genuai-backend && npm run build 2>&1 | tail -3 && pm2 restart genuai-api && pm2 status
curl -X POST https://kmm7bw0f50.execute-api.ap-south-1.amazonaws.com/interviews/schedule -H "Content-Type: application/json" -d '{"candidate_id":1,"company_id":9,"job_title":"Software Engineer","scheduled_at":"2026-04-10T11:30:00","meeting_link":"https://meet.google.com/test","notes":"Please be on time"}' | python3 -m json.tool
node << 'EOF'
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://genuai_admin:GenuAI2026!db@genuai-db.c1048gqcewlj.ap-south-1.rds.amazonaws.com/genuai_db', ssl: { rejectUnauthorized: false } });
pool.query("SELECT id, name, email, role FROM users WHERE role='candidate' LIMIT 5").then(r => { r.rows.forEach(u => console.log(u)); pool.end(); }).catch(e => { console.log(e.message); pool.end(); });
EOF

curl -X POST https://kmm7bw0f50.execute-api.ap-south-1.amazonaws.com/interviews/schedule -H "Content-Type: application/json" -d '{"candidate_id":8,"company_id":9,"job_title":"Software Engineer","scheduled_at":"2026-04-10T11:30:00","meeting_link":"https://meet.google.com/test","notes":"Please be on time"}' | python3 -m json.tool
curl -X GET https://kmm7bw0f50.execute-api.ap-south-1.amazonaws.com/interviews/company/9 | python3 -m json.tool
pm2 status && curl -s http://localhost:3000/health
wc -l ~/genuai-frontend/src/pages/CandidateDashboard.tsx && grep -n 'showPractice\|practiceRole\|jobSearch' ~/genuai-frontend/src/pages/CandidateDashboard.tsx | head -10
grep -n 'suggestion\|ATS\|getAI' ~/genuai-frontend/src/pages/ResumeGenerator.tsx | head -10
grep -n 'Get AI Suggestions\|getAISuggestions\|aiLoading' ~/genuai-frontend/src/pages/ResumeGenerator.tsx | head -10
grep -n 'suggestions\|aiLoading\|ATS' ~/genuai-frontend/src/pages/ResumeGenerator.tsx | head -10
wc -l ~/genuai-frontend/src/pages/ResumeGenerator.tsx && grep -n 'useState\|function\|step' ~/genuai-frontend/src/pages/ResumeGenerator.tsx | head -20
python3 << 'PYEOF'
content = open('/home/ubuntu/genuai-frontend/src/pages/ResumeGenerator.tsx').read()

# Add axios import
old = 'import { useState } from "react";'
new = 'import { useState } from "react";\nimport axios from "axios";\nconst API = import.meta.env.VITE_API_URL;'
content = content.replace(old, new)

# Add suggestions state
old = '  const [loading, setLoading] = useState(false);'
new = '''  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);'''
content = content.replace(old, new)

# Add getAISuggestions function before return
old = '  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));'
new = '''  const set = (k: string, v: string) => setForm((p: any) => ({ ...p, [k]: v }));

  const getAISuggestions = () => {
    setAiLoading(true);
    const skillsArr = (form.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean);
    const missingSkills = ["Docker","Kubernetes","CI/CD","System Design","REST APIs","Git","Agile","Unit Testing","AWS","TypeScript"].filter(s => !skillsArr.map((x:string)=>x.toLowerCase()).includes(s.toLowerCase()));
    const atsScore = Math.min(100, Math.round(
      (form.summary ? 15 : 0) +
      (form.experience ? 25 : 0) +
      (form.education ? 15 : 0) +
      (skillsArr.length >= 5 ? 20 : skillsArr.length * 4) +
      (form.projects ? 15 : 0) +
      (form.achievements ? 10 : 0)
    ));
    setTimeout(() => {
      setSuggestions({
        atsScore,
        summaryTip: !form.summary ? "Add a professional summary — it boosts ATS score by 15 points!" : form.summary.length < 80 ? "Your summary is too short. Add 2-3 sentences about your expertise and goals." : form.summary.length > 400 ? "Your summary is too long. Keep it under 4 sentences for best results." : "Great summary length!",
        experienceTip: !form.experience ? "Add work experience or internships — worth 25 ATS points!" : form.experience.split("\\n").length < 3 ? "Add bullet points with measurable results. Example: Reduced load time by 40%" : "Good experience section!",
        skillsTip: skillsArr.length < 5 ? `Add more skills! You have ${skillsArr.length}/8 recommended skills.` : skillsArr.length > 15 ? "Too many skills. Focus on top 10-12 most relevant ones." : `Good! ${skillsArr.length} skills listed.`,
        projectsTip: !form.projects ? "Add 2-3 projects with tech stack and impact — worth 15 ATS points!" : "Good projects section!",
        achievementsTip: !form.achievements ? "Add awards and achievements — they set you apart from other candidates!" : "Great achievements section!",
        missingSkills: missingSkills.slice(0, 5),
      });
      setAiLoading(false);
    }, 800);
  };'''
content = content.replace(old, new)

open('/home/ubuntu/genuai-frontend/src/pages/ResumeGenerator.tsx', 'w').write(content)
print('Step 1 done!' if 'getAISuggestions' in content else 'FAILED')
PYEOF

sed -n '7,35p' ~/genuai-frontend/src/pages/ResumeGenerator.tsx
grep -n 'const set\|setForm\|set = ' ~/genuai-frontend/src/pages/ResumeGenerator.tsx | head -5
python3 << 'PYEOF'
content = open('/home/ubuntu/genuai-frontend/src/pages/ResumeGenerator.tsx').read()

old = '  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));'
new = '''  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));

  const getAISuggestions = () => {
    setAiLoading(true);
    const allSkills = [form.frontend, form.backend, form.database, form.cloud, form.aiml, form.tools].filter(Boolean).join(",");
    const skillsArr = allSkills.split(",").map((s: string) => s.trim()).filter(Boolean);
    const missingSkills = ["Docker","Kubernetes","CI/CD","System Design","REST APIs","Git","Agile","AWS","TypeScript","Linux"].filter(s => !allSkills.toLowerCase().includes(s.toLowerCase()));
    const atsScore = Math.min(100, Math.round(
      (form.phone ? 5 : 0) +
      (form.linkedin ? 5 : 0) +
      (form.github ? 5 : 0) +
      (form.languages ? 10 : 0) +
      (form.frontend || form.backend ? 20 : 0) +
      (form.projects[0]?.title ? 25 : 0) +
      (form.certifications ? 10 : 0) +
      (form.achievements[0]?.title ? 10 : 0) +
      (form.cgpa ? 5 : 0) +
      (form.hscPercent ? 5 : 0)
    ));
    setTimeout(() => {
      setSuggestions({
        atsScore,
        contactTip: !form.phone ? "Add phone number — required for recruiters!" : !form.linkedin ? "Add LinkedIn URL — boosts credibility!" : !form.github ? "Add GitHub URL — shows your projects!" : "Contact info looks complete!",
        skillsTip: skillsArr.length < 5 ? "Add more technical skills in Frontend/Backend/Tools sections!" : skillsArr.length > 20 ? "Too many skills listed. Focus on most relevant ones." : `Good! ${skillsArr.length} skills listed.`,
        projectsTip: !form.projects[0]?.title ? "Add at least 2-3 projects — worth 25 ATS points!" : form.projects.length < 2 ? "Add one more project to strengthen your profile!" : "Good projects section!",
        certTip: !form.certifications ? "Add certifications — AWS, Google, or any online course certificates help!" : "Good certifications section!",
        achievementTip: !form.achievements[0]?.title ? "Add achievements/awards — they set you apart from other candidates!" : "Great achievements section!",
        cgpaTip: !form.cgpa ? "Add your CGPA — many companies filter by academic score!" : parseFloat(form.cgpa) >= 8 ? "Excellent CGPA! Highlight it prominently." : parseFloat(form.cgpa) >= 7 ? "Good CGPA. You are competitive for most companies." : "Consider highlighting your projects and skills more than CGPA.",
        missingSkills: missingSkills.slice(0, 5),
      });
      setAiLoading(false);
    }, 800);
  };'''

content = content.replace(old, new)
open('/home/ubuntu/genuai-frontend/src/pages/ResumeGenerator.tsx', 'w').write(content)
print('Done!' if 'getAISuggestions' in content else 'FAILED')
PYEOF

grep -n 'Generate\|Submit\|button.*onClick\|preview\|Preview' ~/genuai-frontend/src/pages/ResumeGenerator.tsx | head -15
python3 << 'PYEOF'
content = open('/home/ubuntu/genuai-frontend/src/pages/ResumeGenerator.tsx').read()

old = '                <button onClick={() => setGenerated(true)} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#667EEA,#764BA2)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: "pointer", marginTop: "8px" }}>\n                  ✨ Generate Resume Preview'

new = '''                <button onClick={getAISuggestions} disabled={aiLoading} style={{ width: "100%", padding: "12px", background: aiLoading ? "#E2E8F0" : "linear-gradient(135deg,#00B87C,#00D4AA)", color: aiLoading ? "#94A3B8" : "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "14px", cursor: "pointer", marginBottom: "10px" }}>
                  {aiLoading ? "Analyzing..." : "🧠 Get AI Resume Suggestions"}
                </button>

                {suggestions && (
                  <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: "12px", padding: "16px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                      <span style={{ color: "#1E293B", fontWeight: "700", fontSize: "14px" }}>🧠 AI Resume Analysis</span>
                      <div style={{ textAlign: "center" }}>
                        <span style={{ fontSize: "22px", fontWeight: "800", color: suggestions.atsScore >= 80 ? "#00B87C" : suggestions.atsScore >= 60 ? "#F59E0B" : "#EF4444" }}>{suggestions.atsScore}%</span>
                        <span style={{ color: "#94A3B8", fontSize: "11px", marginLeft: "4px" }}>ATS Score</span>
                      </div>
                    </div>
                    <div style={{ background: "#E2E8F0", borderRadius: "6px", height: "6px", marginBottom: "14px" }}>
                      <div style={{ width: suggestions.atsScore + "%", background: suggestions.atsScore >= 80 ? "#00B87C" : suggestions.atsScore >= 60 ? "#F59E0B" : "#EF4444", height: "6px", borderRadius: "6px", transition: "width 1s" }}/>
                    </div>
                    {[
                      ["📞 Contact", suggestions.contactTip, "#667EEA"],
                      ["🛠️ Skills", suggestions.skillsTip, "#F59E0B"],
                      ["📁 Projects", suggestions.projectsTip, "#00B87C"],
                      ["🏅 Certifications", suggestions.certTip, "#A78BFA"],
                      ["🏆 Achievements", suggestions.achievementTip, "#EF4444"],
                      ["🎓 CGPA", suggestions.cgpaTip, "#00B87C"],
                    ].map(([label, tip, color]: any) => (
                      <div key={label} style={{ padding: "8px 12px", background: "#fff", borderRadius: "8px", marginBottom: "6px", borderLeft: "3px solid " + color }}>
                        <div style={{ color, fontWeight: "700", fontSize: "11px", marginBottom: "2px" }}>{label}</div>
                        <div style={{ color: "#64748B", fontSize: "12px" }}>{tip}</div>
                      </div>
                    ))}
                    {suggestions.missingSkills.length > 0 && (
                      <div style={{ padding: "8px 12px", background: "#FFFBEB", borderRadius: "8px", borderLeft: "3px solid #F59E0B" }}>
                        <div style={{ color: "#F59E0B", fontWeight: "700", fontSize: "11px", marginBottom: "6px" }}>⚡ In-Demand Skills to Add</div>
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {suggestions.missingSkills.map((s: string) => (
                            <span key={s} style={{ padding: "2px 8px", background: "#FEF3C7", border: "1px solid #F59E0B", borderRadius: "10px", color: "#92400E", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>+ {s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <button onClick={() => setGenerated(true)} style={{ width: "100%", padding: "13px", background: "linear-gradient(135deg,#667EEA,#764BA2)", color: "#fff", border: "none", borderRadius: "12px", fontWeight: "700", fontSize: "15px", cursor: "pointer", marginTop: "8px" }}>
                  ✨ Generate Resume Preview'''

content = content.replace(old, new)
open('/home/ubuntu/genuai-frontend/src/pages/ResumeGenerator.tsx', 'w').write(content)
print('Done!' if 'getAISuggestions' in content and 'ATS Score' in content else 'FAILED')
PYEOF

cd ~/genuai-frontend && npm run build 2>&1 | tail -3 && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude 'resumes/*' --exclude 'logo.png' && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths '/*' --output text && echo 'Deployed!'
cat > ~/genuai-backend/src/routes/email.ts << 'EOF'
import express from 'express';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import dotenv from 'dotenv';
dotenv.config();
const router = express.Router();
const ses = new SESClient({ region: process.env.AWS_REGION });

router.post('/send', async (req, res) => {
  try {
    const { candidateEmail, candidateName, overallScore, verdict, salaryMin, salaryMax } = req.body;
    const verdictColor = verdict === 'HIRE' ? '#00B87C' : verdict === 'REVIEW' ? '#F59E0B' : '#EF4444';
    const verdictBg = verdict === 'HIRE' ? '#F0FDF4' : verdict === 'REVIEW' ? '#FFFBEB' : '#FEF2F2';
    const verdictEmoji = verdict === 'HIRE' ? '🎉' : verdict === 'REVIEW' ? '⏳' : '❌';
    const verdictText = verdict === 'HIRE' ? 'Congratulations! You are selected!' : verdict === 'REVIEW' ? 'Under Review' : 'Not Selected This Time';
    const badge = overallScore >= 85 ? '🥇 GOLD' : overallScore >= 70 ? '🥈 SILVER' : overallScore >= 50 ? '🥉 BRONZE' : '⚠️ NEEDS IMPROVEMENT';
    const badgeColor = overallScore >= 85 ? '#B7791F' : overallScore >= 70 ? '#6B7280' : overallScore >= 50 ? '#92400E' : '#991B1B';

    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL!,
      Destination: { ToAddresses: [candidateEmail || 'sit24ci006@sairamtap.edu.in'] },
      Message: {
        Subject: { Data: `Your GenuAI Assessment Result — ${verdict}` },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#667EEA 0%,#764BA2 100%);padding:40px 32px;text-align:center;">
      <div style="width:70px;height:70px;background:rgba(255,255,255,0.2);border-radius:18px;margin:0 auto 16px;display:flex;align-items:center;justify-content:center;">
        <span style="font-size:32px;">🧠</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;letter-spacing:-0.5px;">GenuAI Technologies</h1>
      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:14px;">AI-Powered Recruitment Intelligence</p>
    </div>

    <!-- Greeting -->
    <div style="padding:32px 32px 0;">
      <h2 style="color:#1E293B;font-size:20px;margin:0 0 8px;">Hello, <strong>${candidateName}</strong>! 👋</h2>
      <p style="color:#64748B;font-size:14px;margin:0 0 24px;line-height:1.6;">Your GenuAI assessment has been completed. Here are your results:</p>
    </div>

    <!-- Score Card -->
    <div style="padding:0 32px;">
      <div style="background:linear-gradient(135deg,#F8FAFC,#EEF2FF);border:2px solid #E2E8F0;border-radius:16px;padding:28px;text-align:center;margin-bottom:20px;">
        <div style="font-size:64px;font-weight:900;color:#667EEA;line-height:1;margin-bottom:8px;">${overallScore}%</div>
        <div style="display:inline-block;background:${verdictBg};border:2px solid ${verdictColor};border-radius:10px;padding:6px 20px;margin-bottom:12px;">
          <span style="color:${verdictColor};font-weight:800;font-size:16px;">${verdictEmoji} ${verdictText}</span>
        </div>
        <div style="display:inline-block;background:#FEF3C7;border-radius:20px;padding:4px 16px;margin-left:8px;">
          <span style="color:${badgeColor};font-weight:700;font-size:13px;">${badge}</span>
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div style="padding:0 32px;margin-bottom:20px;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#16A34A;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Verdict</div>
          <div style="font-size:18px;font-weight:800;color:#15803D;">${verdict}</div>
        </div>
        <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:16px;text-align:center;">
          <div style="font-size:11px;color:#667EEA;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Salary Range</div>
          <div style="font-size:16px;font-weight:800;color:#4338CA;">₹${salaryMin}L – ₹${salaryMax}L</div>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div style="padding:0 32px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
        <span style="font-size:12px;color:#64748B;font-weight:600;">Overall Performance</span>
        <span style="font-size:12px;color:#667EEA;font-weight:700;">${overallScore}%</span>
      </div>
      <div style="background:#E2E8F0;border-radius:10px;height:10px;overflow:hidden;">
        <div style="width:${overallScore}%;background:linear-gradient(90deg,#667EEA,#764BA2);height:10px;border-radius:10px;"></div>
      </div>
    </div>

    <!-- Message -->
    <div style="padding:0 32px;margin-bottom:24px;">
      <div style="background:${verdictBg};border-left:4px solid ${verdictColor};border-radius:8px;padding:16px 20px;">
        <p style="color:#1E293B;font-size:14px;margin:0;line-height:1.6;">
          ${verdict === 'HIRE'
            ? `<strong>Amazing work!</strong> Your performance was outstanding across all assessment stages. Our team will contact you shortly with next steps. Keep your documents ready!`
            : verdict === 'REVIEW'
            ? `<strong>Good effort!</strong> Your profile is under review by our team. We will get back to you within 2-3 business days with our decision.`
            : `<strong>Thank you for participating!</strong> While this opportunity didn't work out, we encourage you to keep improving your skills and apply again in the future.`
          }
        </p>
      </div>
    </div>

    <!-- Tips -->
    <div style="padding:0 32px;margin-bottom:28px;">
      <h3 style="color:#1E293B;font-size:14px;font-weight:700;margin:0 0 12px;">💡 Next Steps</h3>
      <div style="background:#F8FAFC;border-radius:12px;padding:16px;">
        ${verdict === 'HIRE'
          ? `<p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Check your email for onboarding details</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Prepare your original documents</p><p style="color:#64748B;font-size:13px;margin:0;">✅ Our HR team will call you within 2 days</p>`
          : verdict === 'REVIEW'
          ? `<p style="color:#64748B;font-size:13px;margin:0 0 6px;">⏳ Wait for our decision within 2-3 days</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">📱 Keep your phone accessible</p><p style="color:#64748B;font-size:13px;margin:0;">🔍 Review your skill gaps in your report</p>`
          : `<p style="color:#64748B;font-size:13px;margin:0 0 6px;">📚 Review your skill gaps from your report</p><p style="color:#64748B;font-size:13px;margin:0 0 6px;">🎯 Practice with our AI Mock Interview Coach</p><p style="color:#64748B;font-size:13px;margin:0;">🚀 Apply again after improving your skills</p>`
        }
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#F8FAFC;padding:24px 32px;text-align:center;border-top:1px solid #E2E8F0;">
      <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;">
        <div style="width:28px;height:28px;background:linear-gradient(135deg,#667EEA,#764BA2);border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#fff;font-size:14px;">G</div>
        <span style="color:#1E293B;font-weight:700;font-size:15px;">GenuAI Technologies</span>
      </div>
      <p style="color:#94A3B8;font-size:12px;margin:0 0 4px;font-style:italic;">Filtering fake candidates. Finding real talent.</p>
      <p style="color:#CBD5E1;font-size:11px;margin:0;">© 2026 GenuAI Technologies. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`
          }
        }
      }
    }));
    res.json({ sent: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/verdict', async (req, res) => {
  try {
    const { candidateEmail, candidateName, verdict, companyName, jobTitle } = req.body;
    if (!candidateEmail || !candidateName || !verdict) {
      return res.status(400).json({ error: 'candidateEmail, candidateName and verdict are required' });
    }
    const isHired = verdict === 'HIRE';
    const subject = isHired ? `Congratulations! You have been selected — ${companyName}` : `Application Update — ${companyName}`;
    const htmlBody = isHired ? `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#00B87C,#00D4AA);padding:40px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">🎉</div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">Congratulations!</h1>
      <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:15px;">You have been selected!</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1E293B;font-size:16px;">Dear <strong>${candidateName}</strong>,</p>
      <p style="color:#64748B;font-size:14px;line-height:1.6;">We are thrilled to inform you that you have been <strong style="color:#00B87C;">selected</strong> for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
      <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px;padding:20px;margin:20px 0;">
        <h3 style="color:#16A34A;margin:0 0 12px;font-size:15px;">🎯 Next Steps</h3>
        <p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Our HR team will contact you within 2-3 business days</p>
        <p style="color:#64748B;font-size:13px;margin:0 0 6px;">✅ Keep your phone and email accessible</p>
        <p style="color:#64748B;font-size:13px;margin:0;">✅ Prepare your original documents for verification</p>
      </div>
      <p style="color:#64748B;font-size:14px;">Welcome to the team! 🚀</p>
    </div>
    <div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">
      <p style="color:#94A3B8;font-size:12px;margin:0;font-style:italic;">GenuAI Technologies — Filtering fake candidates. Finding real talent.</p>
    </div>
  </div>
</body>
</html>` : `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#667EEA,#764BA2);padding:40px 32px;text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">📋</div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">Application Update</h1>
    </div>
    <div style="padding:32px;">
      <p style="color:#1E293B;font-size:16px;">Dear <strong>${candidateName}</strong>,</p>
      <p style="color:#64748B;font-size:14px;line-height:1.6;">Thank you for applying for <strong>${jobTitle}</strong> at <strong>${companyName}</strong>. After careful consideration, we will not be moving forward with your application at this time.</p>
      <div style="background:#EEF2FF;border:1px solid #C7D2FE;border-radius:12px;padding:20px;margin:20px 0;">
        <h3 style="color:#667EEA;margin:0 0 12px;font-size:15px;">💡 Tips to Improve</h3>
        <p style="color:#64748B;font-size:13px;margin:0 0 6px;">📚 Review your skill gaps from your GenuAI report</p>
        <p style="color:#64748B;font-size:13px;margin:0 0 6px;">🎯 Practice with our AI Mock Interview Coach</p>
        <p style="color:#64748B;font-size:13px;margin:0;">🚀 Apply again after improving your skills</p>
      </div>
      <p style="color:#64748B;font-size:14px;">Best of luck in your career journey!</p>
    </div>
    <div style="background:#F8FAFC;padding:20px 32px;text-align:center;border-top:1px solid #E2E8F0;">
      <p style="color:#94A3B8;font-size:12px;margin:0;font-style:italic;">GenuAI Technologies — Filtering fake candidates. Finding real talent.</p>
    </div>
  </div>
</body>
</html>`;

    await ses.send(new SendEmailCommand({
      Source: process.env.SES_FROM_EMAIL!,
      Destination: { ToAddresses: ['sit24ci006@sairamtap.edu.in'] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: htmlBody } }
      }
    }));
    res.json({ sent: true, verdict, candidateName });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
EOF

cd ~/genuai-backend && npm run build 2>&1 | tail -3 && pm2 restart genuai-api && pm2 status
cd ~/genuai-frontend && npm run build 2>&1 | tail -3 && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude 'resumes/*' --exclude 'logo.png' && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths '/*' --output text && echo 'Deployed!'
cd ~/genuai-backend && node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://genuai_admin:GenuAI2026!db@genuai-db.c1048gqcewlj.ap-south-1.rds.amazonaws.com/genuai_db', ssl: { rejectUnauthorized: false } });
pool.query('ALTER TABLE interviews ADD COLUMN IF NOT EXISTS room_id VARCHAR(50), ADD COLUMN IF NOT EXISTS room_status VARCHAR(20) DEFAULT \'waiting\'')
  .then(() => { console.log('Columns added!'); pool.end(); })
  .catch(e => { console.log(e.message); pool.end(); });
"
cat > ~/genuai-backend/src/routes/interviews.ts << 'ENDOFFILE'
import express from 'express';
import pool from '../db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const router = express.Router();
const ses = new SESClient({ region: 'ap-south-1' });

// Generate unique room ID
function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GEN-';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Schedule interview
router.post('/schedule', async (req, res) => {
  try {
    const { candidate_id, company_id, job_title, scheduled_at, notes } = req.body;
    if (!candidate_id || !company_id || !scheduled_at) {
      return res.status(400).json({ error: 'candidate_id, company_id and scheduled_at are required' });
    }

    const room_id = generateRoomId();
    const result = await pool.query(
      `INSERT INTO interviews (candidate_id, company_id, job_title, scheduled_at, notes, room_id, room_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'waiting') RETURNING *`,
      [candidate_id, company_id, job_title || '', scheduled_at, notes || '', room_id]
    );

    const candidate = await pool.query('SELECT name, email FROM users WHERE id=$1', [candidate_id]);
    const company = await pool.query('SELECT name FROM users WHERE id=$1', [company_id]);

    const candidateEmail = candidate.rows[0]?.email;
    const candidateName = candidate.rows[0]?.name || 'Candidate';
    const companyName = company.rows[0]?.name || 'Company';

    const rawDate = new Date(scheduled_at);
    const day = rawDate.getDate().toString().padStart(2,'0');
    const month = (rawDate.getMonth()+1).toString().padStart(2,'0');
    const year = rawDate.getFullYear();
    let hours = rawDate.getHours();
    const minutes = rawDate.getMinutes().toString().padStart(2,'0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const interviewDate = day + '/' + month + '/' + year + ' at ' + hours + ':' + minutes + ' ' + ampm + ' IST';

    const roomLink = 'https://d1ssw1t0a4j2nf.cloudfront.net';

    if (candidateEmail) {
      await ses.send(new SendEmailCommand({
        Source: 'sit24ci006@sairamtap.edu.in',
        Destination: { ToAddresses: [candidateEmail] },
        Message: {
          Subject: { Data: `GenuAI Interview Scheduled — ${job_title} at ${companyName}` },
          Body: {
            Html: {
              Data: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#fff;padding:0;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#00B87C,#00D4FF);padding:32px;text-align:center;">
                  <h1 style="margin:0;font-size:28px;color:#000;">GenuAI Technologies</h1>
                  <p style="color:#000;margin:8px 0 0;font-size:15px;">Your interview has been confirmed</p>
                </div>
                <div style="padding:32px;">
                  <p style="color:#94A3B8;font-size:14px;margin:0 0 24px;line-height:1.6;">Hello <strong style="color:#fff;">${candidateName}</strong>, your interview for <strong style="color:#00B87C;">${job_title}</strong> at <strong style="color:#00B87C;">${companyName}</strong> has been scheduled.</p>

                  <div style="background:#0D1117;border:1px solid #30363D;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Date & Time</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;font-weight:600;">${interviewDate}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Position</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;">${job_title}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Company</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;">${companyName}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Room ID</td><td style="padding:10px;border:1px solid #30363D;color:#00B87C;font-size:14px;font-weight:bold;">${room_id}</td></tr>
                      ${notes ? `<tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Notes</td><td style="padding:10px;border:1px solid #30363D;color:#94A3B8;font-size:13px;">${notes}</td></tr>` : ''}
                    </table>
                  </div>

                  <div style="background:#0D1117;border:2px solid #00B87C;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                    <p style="color:#94A3B8;font-size:13px;margin:0 0 12px;">Join your interview using the GenuAI Interview Room</p>
                    <a href="${roomLink}" style="display:inline-block;background:linear-gradient(135deg,#00B87C,#00D4FF);color:#000;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">Join Interview Room</a>
                    <p style="color:#64748B;font-size:12px;margin:12px 0 0;">Your Room ID: <strong style="color:#00B87C;">${room_id}</strong></p>
                    <p style="color:#64748B;font-size:11px;margin:4px 0 0;">Login to GenuAI → Dashboard → Join Interview</p>
                  </div>

                  <div style="background:#1a1a2e;border:1px solid #30363D;border-radius:10px;padding:16px;">
                    <p style="color:#F59E0B;font-weight:bold;margin:0 0 8px;font-size:13px;">Important Instructions:</p>
                    <ul style="color:#94A3B8;font-size:13px;margin:0;padding-left:20px;line-height:1.8;">
                      <li>Join the GenuAI Interview Room — do NOT use any external video app</li>
                      <li>Test your camera and microphone before the interview</li>
                      <li>Anti-cheat monitoring will be active throughout</li>
                      <li>Tab switching and screen sharing are prohibited</li>
                      <li>Join 5 minutes before the scheduled time</li>
                    </ul>
                  </div>
                </div>
                <div style="padding:20px;text-align:center;border-top:1px solid #30363D;">
                  <p style="color:#64748B;font-size:12px;margin:0;">Powered by GenuAI Technologies · AI-Powered Recruitment Intelligence</p>
                </div>
              </div>`
            }
          }
        }
      }));
    }

    res.json({ success: true, interview: result.rows[0], room_id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interviews for company
router.get('/company/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, u.email as candidate_email
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       WHERE i.company_id = $1
       ORDER BY i.scheduled_at DESC`,
      [req.params.id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interviews for candidate
router.get('/candidate/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as company_name
       FROM interviews i
       JOIN users u ON i.company_id = u.id
       WHERE i.candidate_id = $1
       ORDER BY i.scheduled_at DESC`,
      [req.params.id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update interview status
router.put('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE interviews SET room_status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interview by room_id
router.get('/room/:room_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, c.name as company_name
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       JOIN users c ON i.company_id = c.id
       WHERE i.room_id = $1`,
      [req.params.room_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ interview: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
ENDOFFILE

echo "Done!"
cd ~/genuai-backend && npm run build 2>&1 | tail -3 && pm2 restart genuai-api && pm2 status
cd ~/genuai-frontend && npm run build 2>&1 | tail -3 && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude 'resumes/*' --exclude 'logo.png' && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths '/*' --output text && echo 'Deployed!'
grep -n 'meeting_link\|room_id\|schedule\|interviewForm' ~/genuai-frontend/src/pages/CompanyDashboard.tsx | head -20
python3 << 'PYEOF'
content = open('/home/ubuntu/genuai-frontend/src/pages/CompanyDashboard.tsx').read()

# Fix interviewForm state - remove meeting_link
content = content.replace(
    'const [interviewForm, setInterviewForm] = useState({ candidate_id: "", job_title: "", scheduled_at: "", meeting_link: "", notes: "" });',
    'const [interviewForm, setInterviewForm] = useState({ candidate_id: "", job_title: "", scheduled_at: "", notes: "" });\n  const [scheduledRoomId, setScheduledRoomId] = useState("");'
)

# Fix scheduleInterview function to capture room_id
content = content.replace(
    '      await axios.post(API + "/interviews/schedule", { ...interviewForm, company_id: companyId, job_title: interviewForm.job_title }, { headers: { Authorization: "Bearer " + token } });\n      await loadData();\n      setInterviewForm({ candidate_id: "", job_title: "", scheduled_at: "", meeting_link: "", notes: "" });\n      setShowInterviewForm(false);\n      alert("Interview scheduled and email sent!");',
    '      const res = await axios.post(API + "/interviews/schedule", { ...interviewForm, company_id: companyId }, { headers: { Authorization: "Bearer " + token } });\n      setScheduledRoomId(res.data.room_id);\n      await loadData();\n      setInterviewForm({ candidate_id: "", job_title: "", scheduled_at: "", notes: "" });\n      setShowInterviewForm(false);'
)

# Remove meeting link input field
content = content.replace(
    '                  <input placeholder="Meeting Link (Google Meet / Zoom)" value={interviewForm.meeting_link} onChange={e => setInterviewForm(p => ({ ...p, meeting_link: e.target.value }))} style={inp} />',
    ''
)

# Fix reset form
content = content.replace(
    'setInterviewForm({ candidate_id: "", job_title: "", scheduled_at: "", meeting_link: "", notes: "" });',
    'setInterviewForm({ candidate_id: "", job_title: "", scheduled_at: "", notes: "" });'
)

# Add Room ID display after form closes
content = content.replace(
    '                  <button onClick={scheduleInterview} style={{ ...btn, background: "#A78BFA", color: "#000", flex: 1, padding: "12px" }}>Schedule & Send Email</button>',
    '                  <button onClick={scheduleInterview} style={{ ...btn, background: "#A78BFA", color: "#000", flex: 1, padding: "12px" }}>Schedule & Send Email</button>'
)

# Show Room ID notification
content = content.replace(
    '              <h3 style={{ color: "#A78BFA", margin: 0 }}>Scheduled Interviews ({interviews.length})</h3>',
    '''              <h3 style={{ color: "#A78BFA", margin: 0 }}>Scheduled Interviews ({interviews.length})</h3>
              </div>
              {scheduledRoomId && (
                <div style={{ background: "#F0FDF4", border: "1.5px solid #00B87C", borderRadius: "12px", padding: "16px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: "#16A34A", fontWeight: "700", fontSize: "14px", marginBottom: "4px" }}>✅ Interview Scheduled! Room ID Generated</div>
                    <div style={{ color: "#64748B", fontSize: "13px" }}>Room ID: <strong style={{ color: "#667EEA", fontSize: "16px" }}>{scheduledRoomId}</strong></div>
                    <div style={{ color: "#64748B", fontSize: "12px", marginTop: "4px" }}>Email sent to candidate with interview room link</div>
                  </div>
                  <button onClick={() => setScheduledRoomId("")} style={{ ...btn, background: "#F1F5F9", color: "#64748B", fontSize: "12px" }}>✕</button>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "none" }}>'''
)

# Fix interview display - replace meeting_link with room_id
content = content.replace(
    '{iv.meeting_link && <div style={{ marginTop: "6px" }}><a href={iv.meeting_link} target="_blank" rel="noreferrer" style={{ color: "#00D4FF", fontSize: "12px" }}>🔗 Join Meeting</a></div>}',
    '{iv.room_id && <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}><span style={{ color: "#64748B", fontSize: "12px" }}>🔑 Room ID:</span><span style={{ color: "#667EEA", fontWeight: "700", fontSize: "13px" }}>{iv.room_id}</span><a href="https://d1ssw1t0a4j2nf.cloudfront.net" target="_blank" rel="noreferrer" style={{ background: "#667EEA", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", textDecoration: "none", fontWeight: "600" }}>Join Interview Room</a></div>}'
)

open('/home/ubuntu/genuai-frontend/src/pages/CompanyDashboard.tsx', 'w').write(content)
print('Done!' if 'scheduledRoomId' in content else 'FAILED')
PYEOF

cd ~/genuai-frontend && npm run build 2>&1 | tail -3 && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude 'resumes/*' --exclude 'logo.png' && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths '/*' --output text && echo 'Deployed!'
python3 << 'PYEOF'
content = open('/home/ubuntu/genuai-backend/src/routes/interviews.ts').read()

old = "              Data: `\n              <div style=\"font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#fff;padding:0;border-radius:16px;overflow:hidden;\">"

new = '''              Data: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:600px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 8px 30px rgba(0,0,0,0.1);">
    <div style="background:linear-gradient(135deg,#1E3A5F 0%,#667EEA 100%);padding:40px 32px;text-align:center;">
      <div style="width:64px;height:64px;background:rgba(255,255,255,0.2);border-radius:16px;margin:0 auto 16px;text-align:center;line-height:64px;font-size:28px;">📅</div>
      <h1 style="color:#fff;margin:0;font-size:26px;font-weight:800;">Interview Confirmed!</h1>
      <p style="color:rgba(255,255,255,0.85);margin:8px 0 0;font-size:14px;">Your GenuAI Interview has been scheduled</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#1E293B;font-size:16px;margin:0 0 8px;">Hello, <strong>${candidateName}</strong> 👋</p>
      <p style="color:#64748B;font-size:14px;margin:0 0 24px;line-height:1.6;">Your interview for <strong style="color:#667EEA;">${job_title}</strong> at <strong style="color:#667EEA;">${companyName}</strong> has been confirmed.</p>
      <table style="width:100%;border-collapse:collapse;border-radius:12px;overflow:hidden;margin-bottom:24px;">
        <tr style="background:#F8FAFC;">
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:13px;width:35%;">📅 Date & Time</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;color:#1E293B;font-size:14px;font-weight:600;">${interviewDate}</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:13px;">💼 Position</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;color:#1E293B;font-size:14px;">${job_title}</td>
        </tr>
        <tr style="background:#F8FAFC;">
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:13px;">🏢 Company</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;color:#1E293B;font-size:14px;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:13px;">🔑 Room ID</td>
          <td style="padding:14px 16px;border:1px solid #E2E8F0;color:#667EEA;font-size:16px;font-weight:800;">${room_id}</td>
        </tr>
        ${notes ? `<tr style="background:#F8FAFC;"><td style="padding:14px 16px;border:1px solid #E2E8F0;font-weight:700;color:#374151;font-size:13px;">📝 Notes</td><td style="padding:14px 16px;border:1px solid #E2E8F0;color:#64748B;font-size:13px;">${notes}</td></tr>` : ''}
      </table>
      <div style="background:linear-gradient(135deg,#EEF2FF,#E0E7FF);border:1.5px solid #C7D2FE;border-radius:16px;padding:24px;text-align:center;margin-bottom:24px;">
        <p style="color:#4338CA;font-weight:700;font-size:15px;margin:0 0 6px;">🖥️ Join via GenuAI Interview Room</p>
        <p style="color:#6366F1;font-size:13px;margin:0 0 16px;">Use your Room ID to join at the scheduled time</p>
        <a href="${roomLink}" style="display:inline-block;background:linear-gradient(135deg,#667EEA,#764BA2);color:#fff;padding:14px 36px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;box-shadow:0 4px 15px rgba(102,126,234,0.4);">Join Interview Room →</a>
        <p style="color:#6B7280;font-size:12px;margin:12px 0 0;">Room ID: <strong style="color:#667EEA;">${room_id}</strong></p>
      </div>
      <div style="background:#FFFBEB;border:1px solid #FCD34D;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
        <p style="color:#92400E;font-weight:700;margin:0 0 10px;font-size:14px;">⚠️ Important Instructions</p>
        <ul style="color:#78350F;font-size:13px;margin:0;padding-left:18px;line-height:1.9;">
          <li>Login to GenuAI and join via Interview Room — do NOT use external video apps</li>
          <li>Test your camera and microphone beforehand</li>
          <li>Anti-cheat monitoring will be active throughout the interview</li>
          <li>Tab switching and copy-paste are strictly prohibited</li>
          <li>Join 5 minutes before the scheduled time</li>
        </ul>
      </div>
      <p style="color:#64748B;font-size:14px;margin:0;">Best of luck! 🚀</p>
    </div>
    <div style="background:#F8FAFC;padding:24px 32px;text-align:center;border-top:1px solid #E2E8F0;">
      <div style="display:inline-flex;align-items:center;gap:8px;margin-bottom:8px;">
        <div style="width:28px;height:28px;background:linear-gradient(135deg,#667EEA,#764BA2);border-radius:8px;line-height:28px;text-align:center;color:#fff;font-weight:900;font-size:14px;">G</div>
        <span style="color:#1E293B;font-weight:700;font-size:14px;">GenuAI Technologies</span>
      </div>
      <p style="color:#94A3B8;font-size:12px;margin:0;font-style:italic;">Filtering fake candidates. Finding real talent.</p>
      <p style="color:#CBD5E1;font-size:11px;margin:6px 0 0;">© 2026 GenuAI Technologies. All Rights Reserved.</p>
    </div>
  </div>
</body>
</html>`'''

content = content.replace(old, new)

# Remove old closing div structure
old2 = '''              </div>`
            }'''
new2 = '''`
            }'''
content = content.replace(old2, new2, 1)

open('/home/ubuntu/genuai-backend/src/routes/interviews.ts', 'w').write(content)
print('Done!' if 'GenuAI Technologies' in content else 'FAILED')
PYEOF

cd ~/genuai-frontend && npm run build 2>&1 | tail -3 && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude 'resumes/*' --exclude 'logo.png' && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths '/*' --output text && echo 'Deployed!'
sed -n '625,635p' ~/genuai-frontend/src/pages/CompanyDashboard.tsx
grep -n 'scheduledRoomId\|room_id\|Join Interview' ~/genuai-frontend/src/pages/CompanyDashboard.tsx | head -20
sed -n '370,395p' ~/genuai-frontend/src/pages/CompanyDashboard.tsx
sed -n '385,400p' ~/genuai-frontend/src/pages/CompanyDashboard.tsx
python3 << 'PYEOF'
with open("/home/ubuntu/genuai-frontend/src/pages/CompanyDashboard.tsx", "r") as f:
    lines = f.readlines()

# Line 388 (index 387) is the unclosed div - remove it
print(f"Line 388: {repr(lines[387])}")
print(f"Line 389: {repr(lines[388])}")
print(f"Line 390: {repr(lines[389])}")
print(f"Line 391: {repr(lines[390])}")
PYEOF

python3 << 'PYEOF'
with open("/home/ubuntu/genuai-frontend/src/pages/CompanyDashboard.tsx", "r") as f:
    lines = f.readlines()

del lines[387]

with open("/home/ubuntu/genuai-frontend/src/pages/CompanyDashboard.tsx", "w") as f:
    f.writelines(lines)
print("Done! Lines:", len(lines))
PYEOF

npm run build 2>&1 | grep -E 'error TS|✓|Built in'
aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Deployed! Now building CandidateDashboard redesign..."
grep -n 'Join Interview\|room_id\|InterviewRoom\|onInterview' ~/genuai-frontend/src/pages/CompanyDashboard.tsx | head -20
echo "---"
grep -n 'Join Interview\|room_id\|roomId\|onInterview' ~/genuai-frontend/src/pages/CandidateDashboard.tsx | head -20
echo "---"
grep -n 'room_id\|roomId\|Props\|onInterview' ~/genuai-frontend/src/pages/InterviewRoom.tsx | head -20
cat ~/genuai-frontend/src/App.tsx
cat > /tmp/fix_interview_room.py << 'PYEOF'
import re

# ── 1. Fix App.tsx ──────────────────────────────────────────
with open("/home/ubuntu/genuai-frontend/src/App.tsx", "r") as f:
    app = f.read()

old_app = '''export default function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState("dashboard");
  useEffect(() => {
    const saved = localStorage.getItem("genuai_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);
  const handleLogin = (userData: any) => { setUser(userData); setPage("dashboard"); };
  const handleLogout = () => { localStorage.removeItem("genuai_user"); setUser(null); setPage("dashboard"); };
  if (!user) return <Auth onLogin={handleLogin} />;
  const role = user.user?.role || user.role;
  if (role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (role === "company") return <CompanyDashboard user={user} onLogout={handleLogout} />;
  if (page === "interview") return <InterviewRoom user={user} onLogout={handleLogout} onBack={() => setPage("dashboard")} />;
  if (page === "resume") return <ResumeGenerator user={user} onBack={() => setPage("dashboard")} />;
  return <CandidateDashboard user={user} onLogout={handleLogout} onInterview={() => setPage("interview")} onResume={() => setPage("resume")} />;
}'''

new_app = '''export default function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState("dashboard");
  const [interviewRoomId, setInterviewRoomId] = useState("");
  useEffect(() => {
    const saved = localStorage.getItem("genuai_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);
  const handleLogin = (userData: any) => { setUser(userData); setPage("dashboard"); };
  const handleLogout = () => { localStorage.removeItem("genuai_user"); setUser(null); setPage("dashboard"); };
  const goToInterview = (roomId?: string) => { setInterviewRoomId(roomId || ""); setPage("interview"); };
  if (!user) return <Auth onLogin={handleLogin} />;
  const role = user.user?.role || user.role;
  if (role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (role === "company") return <CompanyDashboard user={user} onLogout={handleLogout} onInterview={goToInterview} />;
  if (page === "interview") return <InterviewRoom user={user} onLogout={handleLogout} onBack={() => setPage("dashboard")} roomId={interviewRoomId} />;
  if (page === "resume") return <ResumeGenerator user={user} onBack={() => setPage("dashboard")} />;
  return <CandidateDashboard user={user} onLogout={handleLogout} onInterview={() => goToInterview()} onResume={() => setPage("resume")} />;
}'''

if old_app in app:
    app = app.replace(old_app, new_app)
    print("App.tsx: OK")
else:
    print("App.tsx: FAILED")

with open("/home/ubuntu/genuai-frontend/src/App.tsx", "w") as f:
    f.write(app)

# ── 2. Fix InterviewRoom Props to accept roomId ─────────────
with open("/home/ubuntu/genuai-frontend/src/pages/InterviewRoom.tsx", "r") as f:
    ir = f.read()

old_props = '''interface Props {
  user: any;
  onLogout: () => void;
  onBack: () => void;
}'''
new_props = '''interface Props {
  user: any;
  onLogout: () => void;
  onBack: () => void;
  roomId?: string;
}'''

if old_props in ir:
    ir = ir.replace(old_props, new_props)
    print("InterviewRoom Props: OK")
else:
    print("InterviewRoom Props: FAILED")

old_fn = 'export default function InterviewRoom({ user, onLogout, onBack }: Props) {'
new_fn = 'export default function InterviewRoom({ user, onLogout, onBack, roomId }: Props) {'

if old_fn in ir:
    ir = ir.replace(old_fn, new_fn)
    print("InterviewRoom fn: OK")
else:
    print("InterviewRoom fn: FAILED")

# Add roomId display in the interview header (after userName)
old_header = '  const userName = user?.user?.name || user?.name || "Candidate";'
new_header = '''  const userName = user?.user?.name || user?.name || "Candidate";
  const activeRoomId = roomId || "";'''

if old_header in ir:
    ir = ir.replace(old_header, new_header)
    print("InterviewRoom roomId var: OK")
else:
    print("InterviewRoom roomId var: FAILED")

# Add room ID banner in the started interview UI - find the interview header
old_banner = '      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>\n        <h1 style={{ margin: 0, color: "#00B87C", fontSize: "22px" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span> <span style={{ color: "#64748B", fontSize: "16px" }}>{mode === "coach" ? "AI Mock Interview Coach" : "Secure Interview Room"}</span></h1>'
new_banner = '''      {activeRoomId && (
        <div style={{ background: "linear-gradient(135deg,#00B87C22,#00D4FF22)", border: "1.5px solid #00B87C", borderRadius: "12px", padding: "10px 20px", marginBottom: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ color: "#00B87C", fontSize: "13px", fontWeight: "700" }}>🔑 Room ID:</span>
            <span style={{ color: "#00D4FF", fontSize: "16px", fontWeight: "800", letterSpacing: "2px" }}>{activeRoomId}</span>
          </div>
          <span style={{ padding: "4px 12px", background: "#00B87C22", border: "1px solid #00B87C", borderRadius: "20px", color: "#00B87C", fontSize: "12px", fontWeight: "700" }}>SCHEDULED INTERVIEW</span>
        </div>
      )}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1 style={{ margin: 0, color: "#00B87C", fontSize: "22px" }}>Genu<span style={{ color: "#00D4FF" }}>AI</span> <span style={{ color: "#64748B", fontSize: "16px" }}>{mode === "coach" ? "AI Mock Interview Coach" : "Secure Interview Room"}</span></h1>'''

if old_banner in ir:
    ir = ir.replace(old_banner, new_banner)
    print("InterviewRoom banner: OK")
else:
    print("InterviewRoom banner: FAILED - trying alternate")
    idx = ir.find('"Secure Interview Room"}</span></h1>')
    print("Context:", repr(ir[max(0,idx-200):idx+50]))

with open("/home/ubuntu/genuai-frontend/src/pages/InterviewRoom.tsx", "w") as f:
    f.write(ir)

# ── 3. Fix CompanyDashboard ─────────────────────────────────
with open("/home/ubuntu/genuai-frontend/src/pages/CompanyDashboard.tsx", "r") as f:
    cd = f.read()

# Add onInterview prop to CompanyDashboard
old_cd_props = '''interface Props {
  user: any;
  onLogout: () => void;
}'''
new_cd_props = '''interface Props {
  user: any;
  onLogout: () => void;
  onInterview?: (roomId: string) => void;
}'''

if old_cd_props in cd:
    cd = cd.replace(old_cd_props, new_cd_props)
    print("CompanyDashboard Props: OK")
else:
    print("CompanyDashboard Props: FAILED - searching...")
    idx = cd.find('onLogout: () => void;')
    print("Context:", repr(cd[max(0,idx-50):idx+80]))

old_cd_fn = 'export default function CompanyDashboard({ user, onLogout }: Props) {'
new_cd_fn = 'export default function CompanyDashboard({ user, onLogout, onInterview }: Props) {'

if old_cd_fn in cd:
    cd = cd.replace(old_cd_fn, new_cd_fn)
    print("CompanyDashboard fn: OK")
else:
    print("CompanyDashboard fn: FAILED")

# Fix the Join Interview Room button - replace href with onClick
old_btn = '<a href="https://d1ssw1t0a4j2nf.cloudfront.net" target="_blank" rel="noreferrer" style={{ background: "#667EEA", color: "#fff", padding: "3px 10px", borderRadius: "6px", fontSize: "12px", textDecoration: "none", fontWeight: "600" }}>Join Interview Room</a>'
new_btn = '<button onClick={() => onInterview && onInterview(iv.room_id)} style={{ background: "linear-gradient(135deg,#00B87C,#00D4AA)", color: "#fff", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", border: "none", cursor: "pointer", fontWeight: "700" }}>🚀 Join Interview Room</button>'

if old_btn in cd:
    cd = cd.replace(old_btn, new_btn)
    print("CompanyDashboard button: OK")
else:
    print("CompanyDashboard button: FAILED")

with open("/home/ubuntu/genuai-frontend/src/pages/CompanyDashboard.tsx", "w") as f:
    f.write(cd)

print("All done!")
PYEOF

python3 /tmp/fix_interview_room.py
cat > /home/ubuntu/genuai-frontend/src/App.tsx << 'EOF'
import { useState, useEffect } from "react";
import Auth from "./pages/Auth";
import CandidateDashboard from "./pages/CandidateDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import CompanyDashboard from "./pages/CompanyDashboard";
import InterviewRoom from "./pages/InterviewRoom";
import ResumeGenerator from "./pages/ResumeGenerator";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState("dashboard");
  const [interviewRoomId, setInterviewRoomId] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("genuai_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData: any) => { setUser(userData); setPage("dashboard"); };
  const handleLogout = () => { localStorage.removeItem("genuai_user"); setUser(null); setPage("dashboard"); };
  const goToInterview = (roomId?: string) => { setInterviewRoomId(roomId || ""); setPage("interview"); };

  if (!user) return <Auth onLogin={handleLogin} />;
  const role = user.user?.role || user.role;

  if (role === "admin") return <AdminDashboard user={user} onLogout={handleLogout} />;
  if (role === "company") return <CompanyDashboard user={user} onLogout={handleLogout} onInterview={goToInterview} />;
  if (page === "interview") return <InterviewRoom user={user} onLogout={handleLogout} onBack={() => setPage("dashboard")} roomId={interviewRoomId} />;
  if (page === "resume") return <ResumeGenerator user={user} onBack={() => setPage("dashboard")} />;
  return <CandidateDashboard user={user} onLogout={handleLogout} onInterview={() => goToInterview()} onResume={() => setPage("resume")} />;
}
EOF

echo "Done!"
cd ~/genuai-frontend && npm run build 2>&1 | grep -E 'error TS|✓|Built in' && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude "resumes/*" --exclude "logo.png" && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths "/*" --output text && echo "✅ Deployed!"
cat > ~/genuai-backend/src/routes/interviews.ts << 'ENDOFFILE'
import express from 'express';
import pool from '../db';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const router = express.Router();
const ses = new SESClient({ region: 'ap-south-1' });

// Generate unique room ID
function generateRoomId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'GEN-';
  for (let i = 0; i < 3; i++) code += chars[Math.floor(Math.random() * chars.length)];
  code += '-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// Schedule interview
router.post('/schedule', async (req, res) => {
  try {
    const { candidate_id, company_id, job_title, scheduled_at, notes } = req.body;
    if (!candidate_id || !company_id || !scheduled_at) {
      return res.status(400).json({ error: 'candidate_id, company_id and scheduled_at are required' });
    }

    const room_id = generateRoomId();
    const result = await pool.query(
      `INSERT INTO interviews (candidate_id, company_id, job_title, scheduled_at, notes, room_id, room_status)
       VALUES ($1, $2, $3, $4, $5, $6, 'waiting') RETURNING *`,
      [candidate_id, company_id, job_title || '', scheduled_at, notes || '', room_id]
    );

    const candidate = await pool.query('SELECT name, email FROM users WHERE id=$1', [candidate_id]);
    const company = await pool.query('SELECT name FROM users WHERE id=$1', [company_id]);

    const candidateEmail = candidate.rows[0]?.email;
    const candidateName = candidate.rows[0]?.name || 'Candidate';
    const companyName = company.rows[0]?.name || 'Company';

    const rawDate = new Date(scheduled_at);
    const day = rawDate.getDate().toString().padStart(2,'0');
    const month = (rawDate.getMonth()+1).toString().padStart(2,'0');
    const year = rawDate.getFullYear();
    let hours = rawDate.getHours();
    const minutes = rawDate.getMinutes().toString().padStart(2,'0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const interviewDate = day + '/' + month + '/' + year + ' at ' + hours + ':' + minutes + ' ' + ampm + ' IST';

    const roomLink = 'https://d1ssw1t0a4j2nf.cloudfront.net';

    if (candidateEmail) {
      await ses.send(new SendEmailCommand({
        Source: 'sit24ci006@sairamtap.edu.in',
        Destination: { ToAddresses: [candidateEmail] },
        Message: {
          Subject: { Data: `GenuAI Interview Scheduled — ${job_title} at ${companyName}` },
          Body: {
            Html: {
              Data: `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0A0A0F;color:#fff;padding:0;border-radius:16px;overflow:hidden;">
                <div style="background:linear-gradient(135deg,#00B87C,#00D4FF);padding:32px;text-align:center;">
                  <h1 style="margin:0;font-size:28px;color:#000;">GenuAI Technologies</h1>
                  <p style="color:#000;margin:8px 0 0;font-size:15px;">Your interview has been confirmed</p>
                </div>
                <div style="padding:32px;">
                  <p style="color:#94A3B8;font-size:14px;margin:0 0 24px;line-height:1.6;">Hello <strong style="color:#fff;">${candidateName}</strong>, your interview for <strong style="color:#00B87C;">${job_title}</strong> at <strong style="color:#00B87C;">${companyName}</strong> has been scheduled.</p>

                  <div style="background:#0D1117;border:1px solid #30363D;border-radius:12px;padding:20px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Date & Time</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;font-weight:600;">${interviewDate}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Position</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;">${job_title}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Company</td><td style="padding:10px;border:1px solid #30363D;color:#fff;font-size:14px;">${companyName}</td></tr>
                      <tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Room ID</td><td style="padding:10px;border:1px solid #30363D;color:#00B87C;font-size:14px;font-weight:bold;">${room_id}</td></tr>
                      ${notes ? `<tr><td style="padding:10px;border:1px solid #30363D;color:#64748B;font-size:13px;">Notes</td><td style="padding:10px;border:1px solid #30363D;color:#94A3B8;font-size:13px;">${notes}</td></tr>` : ''}
                    </table>
                  </div>

                  <div style="background:#0D1117;border:2px solid #00B87C;border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
                    <p style="color:#94A3B8;font-size:13px;margin:0 0 12px;">Join your interview using the GenuAI Interview Room</p>
                    <a href="${roomLink}" style="display:inline-block;background:linear-gradient(135deg,#00B87C,#00D4FF);color:#000;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:15px;">Join Interview Room</a>
                    <p style="color:#64748B;font-size:12px;margin:12px 0 0;">Your Room ID: <strong style="color:#00B87C;">${room_id}</strong></p>
                    <p style="color:#64748B;font-size:11px;margin:4px 0 0;">Login to GenuAI → Dashboard → Join Interview</p>
                  </div>

                  <div style="background:#1a1a2e;border:1px solid #30363D;border-radius:10px;padding:16px;">
                    <p style="color:#F59E0B;font-weight:bold;margin:0 0 8px;font-size:13px;">Important Instructions:</p>
                    <ul style="color:#94A3B8;font-size:13px;margin:0;padding-left:20px;line-height:1.8;">
                      <li>Join the GenuAI Interview Room — do NOT use any external video app</li>
                      <li>Test your camera and microphone before the interview</li>
                      <li>Anti-cheat monitoring will be active throughout</li>
                      <li>Tab switching and screen sharing are prohibited</li>
                      <li>Join 5 minutes before the scheduled time</li>
                    </ul>
                  </div>
                </div>
                <div style="padding:20px;text-align:center;border-top:1px solid #30363D;">
                  <p style="color:#64748B;font-size:12px;margin:0;">Powered by GenuAI Technologies · AI-Powered Recruitment Intelligence</p>
                </div>
              </div>`
            }
          }
        }
      }));
    }

    res.json({ success: true, interview: result.rows[0], room_id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interviews for company
router.get('/company/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, u.email as candidate_email
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       WHERE i.company_id = $1
       ORDER BY i.scheduled_at DESC`,
      [req.params.id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interviews for candidate
router.get('/candidate/:id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as company_name
       FROM interviews i
       JOIN users u ON i.company_id = u.id
       WHERE i.candidate_id = $1
       ORDER BY i.scheduled_at DESC`,
      [req.params.id]
    );
    res.json({ interviews: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update interview status
router.put('/status/:id', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE interviews SET room_status = $1 WHERE id = $2', [status, req.params.id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get interview by room_id
router.get('/room/:room_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT i.*, u.name as candidate_name, c.name as company_name
       FROM interviews i
       JOIN users u ON i.candidate_id = u.id
       JOIN users c ON i.company_id = c.id
       WHERE i.room_id = $1`,
      [req.params.room_id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Room not found' });
    res.json({ interview: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
ENDOFFILE

echo "Done!"
cd ~/genuai-frontend && python3 << 'PYEOF'
with open("src/pages/CompanyDashboard.tsx", "r") as f:
    content = f.read()

# Find and remove meeting link input
old = '''                  <input placeholder="Meeting Link (Google Meet / Zoom)" value={interviewForm.meeting_link} onChange={e => setInterviewForm(p => ({ ...p, meeting_link: e.target.value }))} style={inp} />'''

if old in content:
    content = content.replace(old, "")
    print("Meeting link input: removed OK")
else:
    print("ERROR: meeting link input not found")
    for i, l in enumerate(content.splitlines()):
        if "meeting_link" in l.lower() or "google meet" in l.lower() or "zoom" in l.lower():
            print(f"Line {i}: {l}")

# Add room ID success message after schedule button
old2 = '''                    <button onClick={scheduleInterview} style={{ ...btn, background: "#A78BFA", color: "#000", flex: 1, padding: "12px" }}>Schedule & Send Email</button>'''

new2 = '''                    <button onClick={scheduleInterview} style={{ ...btn, background: "#A78BFA", color: "#000", flex: 1, padding: "12px" }}>Schedule & Send Email</button>'''

# Add room ID display after form
old3 = '''              setShowInterviewForm(!showInterviewForm)}} style={{ ...btn, background: "#A78BFA", color: "#000" }}>+ Schedule Interview</button>'''

# Find scheduled_at display in interviews list and update
for i, l in enumerate(content.splitlines()):
    if "meeting_link" in l:
        print(f"Line {i}: {l}")

with open("src/pages/CompanyDashboard.tsx", "w") as f:
    f.write(content)
print("Done!")
PYEOF

grep -n "meeting\|Meeting\|zoom\|Zoom\|google\|Google" ~/genuai-frontend/src/pages/CompanyDashboard.tsx
cd ~/genuai-frontend && python3 << 'PYEOF'
with open("src/pages/CompanyDashboard.tsx", "r") as f:
    content = f.read()

# Find interview display in list — show room_id and status
old = '                        <div style={{ color: "#F59E0B", fontWeight: "bold" }}>📅 {new Date(iv.scheduled_at).toLocaleString(\'en-IN\', { timeZone: \'Asia/Kolkata\' })}</div>'

new = '''                        <div style={{ color: "#F59E0B", fontWeight: "bold" }}>📅 {new Date(iv.scheduled_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
                        {iv.room_id && (
                          <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ background: "#1a4a3a", color: "#00B87C", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>Room: {iv.room_id}</span>
                            <span style={{ background: iv.room_status === "active" ? "#1a4a3a" : iv.room_status === "completed" ? "#1a1a3a" : "#2a1a1a", color: iv.room_status === "active" ? "#00B87C" : iv.room_status === "completed" ? "#00D4FF" : "#F59E0B", padding: "3px 10px", borderRadius: "20px", fontSize: "11px" }}>{iv.room_status || "waiting"}</span>
                            <button onClick={() => {
                              axios.put(API + "/interviews/status/" + iv.id, { status: "active" }, { headers: { Authorization: "Bearer " + token } });
                              alert("Interview room activated! Candidate can now join Room: " + iv.room_id);
                            }} style={{ padding: "4px 12px", background: "#A78BFA", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "12px" }}>
                              Start Room
                            </button>
                          </div>
                        )}'''

if old in content:
    content = content.replace(old, new)
    print("Room ID display: OK")
else:
    print("ERROR: interview display not found")
    for i, l in enumerate(content.splitlines()):
        if "scheduled_at" in l and "toLocaleString" in l:
            print(f"Line {i}: {repr(l)}")

# Add success banner after showInterviewForm section
old2 = '              {emailStatus && ('
new2 = '''              {scheduledRoomId && (
                <div style={{ background: "#0a2a1a", border: "1px solid #00B87C", borderRadius: "10px", padding: "14px", marginBottom: "16px" }}>
                  <div style={{ color: "#00B87C", fontWeight: "bold", marginBottom: "4px" }}>✅ Interview Scheduled Successfully!</div>
                  <div style={{ color: "#94A3B8", fontSize: "13px" }}>Room ID: <strong style={{ color: "#00B87C" }}>{scheduledRoomId}</strong></div>
                  <div style={{ color: "#64748B", fontSize: "12px", marginTop: "4px" }}>Email sent to candidate with GenuAI Interview Room link.</div>
                  <button onClick={() => setScheduledRoomId("")} style={{ marginTop: "8px", padding: "4px 12px", background: "transparent", border: "1px solid #30363D", color: "#64748B", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}>Dismiss</button>
                </div>
              )}
              {emailStatus && ('''

if old2 in content:
    content = content.replace(old2, new2)
    print("Success banner: OK")
else:
    print("ERROR: emailStatus not found")

with open("src/pages/CompanyDashboard.tsx", "w") as f:
    f.write(content)
print("Done!")
PYEOF

cd ~/genuai-backend && npm run build 2>&1 | tail -3 && pm2 restart genuai-api && echo "Backend done!" && cd ~/genuai-frontend && npm run build 2>&1 | tail -3 && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude 'resumes/*' --exclude 'logo.png' && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths '/*' --output text && echo 'Deployed!'
python3 << 'PYEOF'
content = open('/home/ubuntu/genuai-backend/src/routes/interviews.ts').read()

# Fix the room link to include the room ID as a query parameter
content = content.replace(
    "const roomLink = 'https://d1ssw1t0a4j2nf.cloudfront.net';",
    "const roomLink = `https://d1ssw1t0a4j2nf.cloudfront.net?room=${room_id}`;"
)

open('/home/ubuntu/genuai-backend/src/routes/interviews.ts', 'w').write(content)
print('Done!' if '?room=' in content else 'FAILED')
PYEOF

python3 << 'PYEOF'
content = open('/home/ubuntu/genuai-frontend/src/App.tsx').read()

old = 'export default function App() {\n  const [user, setUser] = useState<any>(null);\n  const [page, setPage] = useState("dashboard");'
new = '''export default function App() {
  const [user, setUser] = useState<any>(null);
  const [page, setPage] = useState("dashboard");
  const [roomId, setRoomId] = useState<string | null>(null);

  // Check for room parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomId(room);
      setPage("interview");
    }
  }, []);'''

content = content.replace(old, new)

# Update interview room rendering to pass roomId
old2 = '  if (page === "interview") return <InterviewRoom user={user} onLogout={handleLogout} onBack={() => setPage("dashboard")} />;'
new2 = '  if (page === "interview") return <InterviewRoom user={user} onLogout={handleLogout} onBack={() => { setPage("dashboard"); setRoomId(null); window.history.replaceState({}, "", "/"); }} roomId={roomId} />;'
content = content.replace(old2, new2)

open('/home/ubuntu/genuai-frontend/src/App.tsx', 'w').write(content)
print('Done!' if 'roomId' in content else 'FAILED')
PYEOF

python3 << 'PYEOF'
content = open('/home/ubuntu/genuai-frontend/src/pages/InterviewRoom.tsx').read()

# Add roomId to Props
old = 'interface Props {\n  user: any;\n  onLogout: () => void;\n  onBack: () => void;\n}'
new = '''interface Props {
  user: any;
  onLogout: () => void;
  onBack: () => void;
  roomId?: string | null;
}'''
content = content.replace(old, new)

# Add roomId to component params
old = 'export default function InterviewRoom({ user, onLogout, onBack }: Props) {'
new = 'export default function InterviewRoom({ user, onLogout, onBack, roomId }: Props) {'
content = content.replace(old, new)

# Add room info display in the pre-start screen
old = '          <div style={{ textAlign: "center", marginBottom: "24px" }}>\n            <div style={{ fontSize: "56px", marginBottom: "12px" }}>🔒</div>\n            <h2 style={{ color: "#00B87C", margin: "0 0 8px" }}>Maximum Security Interview</h2>\n            <p style={{ color: "#64748B", margin: 0 }}>All activity is monitored and recorded.</p>\n          </div>'
new = '''          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <div style={{ fontSize: "56px", marginBottom: "12px" }}>🔒</div>
            <h2 style={{ color: "#1E293B", margin: "0 0 8px" }}>Maximum Security Interview</h2>
            <p style={{ color: "#64748B", margin: 0 }}>All activity is monitored and recorded.</p>
            {roomId && (
              <div style={{ marginTop: "16px", display: "inline-flex", alignItems: "center", gap: "10px", background: "#EEF2FF", border: "1.5px solid #667EEA", borderRadius: "12px", padding: "10px 20px" }}>
                <span style={{ color: "#64748B", fontSize: "13px" }}>Room ID:</span>
                <span style={{ color: "#667EEA", fontWeight: "800", fontSize: "18px", letterSpacing: "2px" }}>{roomId}</span>
              </div>
            )}
          </div>'''
content = content.replace(old, new)

# Show room ID in the live interview status bar
old = '            <div style={{ background: "#FF4444", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "bold" }}>🔴 LIVE</div>'
new = '''            <div style={{ background: "#FF4444", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", fontWeight: "bold" }}>🔴 LIVE</div>
            {roomId && <div style={{ background: "#EEF2FF", border: "1px solid #667EEA", borderRadius: "20px", padding: "5px 14px", fontSize: "12px", color: "#667EEA", fontWeight: "700" }}>🔑 {roomId}</div>}'''
content = content.replace(old, new)

open('/home/ubuntu/genuai-frontend/src/pages/InterviewRoom.tsx', 'w').write(content)
print('Done!' if 'roomId' in content else 'FAILED')
PYEOF

cd ~/genuai-backend && npm run build 2>&1 | tail -3 && pm2 restart genuai-api && echo "Backend done!" && cd ~/genuai-frontend && npm run build 2>&1 | tail -3 && aws s3 sync dist/ s3://genuai-resumes-2026/ --delete --exclude 'resumes/*' --exclude 'logo.png' && aws s3 cp ~/genuai-logo.png s3://genuai-resumes-2026/logo.png && aws cloudfront create-invalidation --distribution-id E2SUA3RCMZONMC --paths '/*' --output text && echo 'Deployed!'
