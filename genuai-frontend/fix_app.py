import re

c = open('src/App.tsx', 'r', encoding='utf-8').read()

old = 'import CandidateDashboard from "./pages/CandidateDashboard";'
new = 'import CandidateDashboard from "./pages/CandidateDashboard";\nimport CandidatePipeline from "./pages/CandidatePipeline";'
c = c.replace(old, new)

c = re.sub(
    r'return <CandidateDashboard[\s\S]*?\/>;',
    'return <CandidatePipeline user={user} onLogout={handleLogout} onInterview={() => goToInterview()}/>;',
    c
)

open('src/App.tsx', 'w', encoding='utf-8').write(c)
print('App.tsx updated')
print('Pipeline import added:', 'CandidatePipeline' in c)
