const fs = require('fs');
const path = require('path');

const replacements = {
  'ðŸ¤–': '🤖',
  'ðŸ’¡': '💡',
  'ðŸ“„': '📄',
  'âœ‰ï¸ ': '✉️ ',
  'ðŸŽ™ï¸ ': '🎙️ ',
  'ðŸ§\xa0': '🧠',
  'â€”': '—',
  'â†’': '→',
  'â† ': '←',
  'ðŸš€': '🚀',
  'ðŸŒ ': '🌍',
  'âœ“': '✓',
  'â ±ï¸ ': '⏱️ ',
  'âœ…': '✅',
  'ðŸ”’': '🔒',
  'ðŸ§©': '🧩',
  'ðŸ“ ': '📐',
  'ðŸ“–': '📖',
  'ðŸ ›': '🐛',
  'ðŸ’»': '💻',
  'ðŸ–¥ï¸ ': '🖥️ ',
  'âš\xa0ï¸ ': '⚠️ ',
  'ðŸ”„': '🔄',
  'ðŸ †': '🏆',
  'ðŸŽ¯': '🎯',
  'ðŸ“£': '📣',
  'ðŸ‘€': '👀',
  'ðŸ”Š': '🔊',
  'âœ‰ï¸': '✉️ '
};

const files = [
  "AMCATTest.tsx",
  "CandidatePipeline.tsx",
  "CompanyOverview.tsx",
  "PathSelection.tsx",
  "PracticeDashboard.tsx",
  "SkillTestPractice.tsx",
  "SVARPractice.tsx"
];

for (const file of files) {
  const filePath = path.join(__dirname, 'src', 'pages', file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const [bad, good] of Object.entries(replacements)) {
    content = content.split(bad).join(good);
  }
  
  // also fix some common mojibake manually
  content = content.replace(/âœ‰ï¸/g, '✉️');
  content = content.replace(/ðŸ§ /g, '🧠');
  content = content.replace(/ðŸŽ™ï¸/g, '🎙️');
  content = content.replace(/â ±ï¸/g, '⏱️');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
}
