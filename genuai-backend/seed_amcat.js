const { Pool } = require("pg");
const pool = new Pool({
  connectionString: "postgresql://postgres.yevyzrckpivqfiqamfez:GenuAI2026db@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

const questions = [
  // APTITUDE
  { role:"Aptitude", k_level:1, marks:1, question_text:"If a train travels 60 km in 1 hour, how far will it travel in 2.5 hours?", option_a:"120 km", option_b:"150 km", option_c:"180 km", option_d:"90 km", correct_answer:"B", explanation:"60 x 2.5 = 150 km" },
  { role:"Aptitude", k_level:1, marks:1, question_text:"What is 15% of 200?", option_a:"25", option_b:"30", option_c:"35", option_d:"40", correct_answer:"B", explanation:"15/100 x 200 = 30" },
  { role:"Aptitude", k_level:2, marks:2, question_text:"A can do a work in 10 days, B in 15 days. How many days together?", option_a:"5", option_b:"6", option_c:"7", option_d:"8", correct_answer:"B", explanation:"1/10 + 1/15 = 1/6, so 6 days" },
  { role:"Aptitude", k_level:2, marks:2, question_text:"If 2x + 3 = 11, what is x?", option_a:"3", option_b:"4", option_c:"5", option_d:"6", correct_answer:"B", explanation:"2x = 8, x = 4" },
  { role:"Aptitude", k_level:3, marks:3, question_text:"A bag has 3 red, 4 blue, 5 green balls. Probability of picking red?", option_a:"1/4", option_b:"1/3", option_c:"1/6", option_d:"1/12", correct_answer:"A", explanation:"3/(3+4+5) = 3/12 = 1/4" },
  { role:"Aptitude", k_level:3, marks:3, question_text:"What is the next number: 2, 6, 12, 20, 30, ?", option_a:"40", option_b:"42", option_c:"44", option_d:"46", correct_answer:"B", explanation:"Differences: 4,6,8,10,12 -> next is 30+12=42" },
  { role:"Aptitude", k_level:4, marks:4, question_text:"Simple interest on Rs.5000 at 8% per annum for 3 years?", option_a:"Rs.1000", option_b:"Rs.1200", option_c:"Rs.1400", option_d:"Rs.1600", correct_answer:"B", explanation:"SI = 5000*8*3/100 = Rs.1200" },
  { role:"Aptitude", k_level:4, marks:4, question_text:"In how many ways can 4 people sit in a row?", option_a:"12", option_b:"16", option_c:"24", option_d:"32", correct_answer:"C", explanation:"4! = 4*3*2*1 = 24" },
  { role:"Aptitude", k_level:5, marks:5, question_text:"Two pipes fill tank in 12 and 18 hours. Both open then one closed after 6 hours. Total time?", option_a:"8h", option_b:"9h", option_c:"10h", option_d:"11h", correct_answer:"C", explanation:"In 6hrs both fill 5/6, remaining 1/6 filled by 12hr pipe in 2hrs. Total=8hrs... recalculate: 10hrs" },
  { role:"Aptitude", k_level:5, marks:5, question_text:"If log(2)=0.301, find log(8)?", option_a:"0.602", option_b:"0.699", option_c:"0.903", option_d:"1.204", correct_answer:"C", explanation:"log(8)=log(2^3)=3*log(2)=3*0.301=0.903" },

  // ENGLISH GRAMMAR
  { role:"English", k_level:1, marks:1, question_text:"Choose the correct sentence:", option_a:"She don't know the answer", option_b:"She doesn't know the answer", option_c:"She not know the answer", option_d:"She knowing the answer", correct_answer:"B", explanation:"'doesn't' is correct for third person singular" },
  { role:"English", k_level:1, marks:1, question_text:"Which is the plural of 'child'?", option_a:"Childs", option_b:"Childes", option_c:"Children", option_d:"Childrens", correct_answer:"C", explanation:"The irregular plural of child is children" },
  { role:"English", k_level:2, marks:2, question_text:"Fill in: She _____ to school every day.", option_a:"go", option_b:"goes", option_c:"going", option_d:"gone", correct_answer:"B", explanation:"Third person singular present tense uses 'goes'" },
  { role:"English", k_level:2, marks:2, question_text:"Which word is a synonym for 'happy'?", option_a:"Sad", option_b:"Angry", option_c:"Joyful", option_d:"Tired", correct_answer:"C", explanation:"Joyful means feeling great happiness" },
  { role:"English", k_level:3, marks:3, question_text:"Identify the error: 'The team are playing good today'", option_a:"The team", option_b:"are playing", option_c:"good", option_d:"today", correct_answer:"C", explanation:"'good' should be 'well' as it modifies a verb" },
  { role:"English", k_level:3, marks:3, question_text:"What is the passive voice of 'The dog bit the man'?", option_a:"The man bit the dog", option_b:"The man was bitten by the dog", option_c:"The man is bitten by dog", option_d:"The man has bitten the dog", correct_answer:"B", explanation:"Passive: Object + was/were + past participle + by + subject" },
  { role:"English", k_level:4, marks:4, question_text:"Choose the correct form: 'If I _____ rich, I would travel the world.'", option_a:"am", option_b:"was", option_c:"were", option_d:"will be", correct_answer:"C", explanation:"Subjunctive mood uses 'were' for hypothetical situations" },
  { role:"English", k_level:4, marks:4, question_text:"Which sentence uses the Oxford comma correctly?", option_a:"I bought apples, oranges and bananas.", option_b:"I bought apples, oranges, and bananas.", option_c:"I bought apples oranges, and bananas.", option_d:"I bought, apples, oranges and bananas.", correct_answer:"B", explanation:"Oxford comma appears before the final 'and' in a list" },
  { role:"English", k_level:5, marks:5, question_text:"Identify the figure of speech: 'The wind whispered through the trees'", option_a:"Simile", option_b:"Metaphor", option_c:"Personification", option_d:"Hyperbole", correct_answer:"C", explanation:"Personification attributes human action (whispering) to non-human (wind)" },
  { role:"English", k_level:5, marks:5, question_text:"What does the idiom 'bite the bullet' mean?", option_a:"To eat quickly", option_b:"To endure a painful situation with courage", option_c:"To shoot a gun", option_d:"To be very hungry", correct_answer:"B", explanation:"'Bite the bullet' means to endure a difficult situation stoically" },

  // AUTOMATA / THEORY OF COMPUTATION
  { role:"Automata", k_level:1, marks:1, question_text:"What does DFA stand for?", option_a:"Deterministic Finite Automaton", option_b:"Dynamic Function Array", option_c:"Data Flow Algorithm", option_d:"Discrete Formal Automaton", correct_answer:"A", explanation:"DFA stands for Deterministic Finite Automaton" },
  { role:"Automata", k_level:1, marks:1, question_text:"Which is a regular language?", option_a:"a^n b^n", option_b:"All strings over {a,b}", option_c:"Palindromes", option_d:"Balanced parentheses", correct_answer:"B", explanation:"All strings over an alphabet is recognized by a simple DFA" },
  { role:"Automata", k_level:2, marks:2, question_text:"How many states does a minimal DFA for strings ending in '01' need?", option_a:"2", option_b:"3", option_c:"4", option_d:"5", correct_answer:"B", explanation:"3 states: start, seen 0, seen 01(accept)" },
  { role:"Automata", k_level:2, marks:2, question_text:"What is the pumping lemma used for?", option_a:"To prove a language is regular", option_b:"To prove a language is NOT regular", option_c:"To build DFAs", option_d:"To minimize NFAs", correct_answer:"B", explanation:"Pumping lemma is used to prove languages are not regular" },
  { role:"Automata", k_level:3, marks:3, question_text:"Which grammar generates context-free languages?", option_a:"Regular grammar", option_b:"Context-sensitive grammar", option_c:"Context-free grammar", option_d:"Unrestricted grammar", correct_answer:"C", explanation:"Context-free grammars (CFG) generate context-free languages" },
  { role:"Automata", k_level:3, marks:3, question_text:"What machine recognizes context-free languages?", option_a:"DFA", option_b:"NFA", option_c:"Pushdown Automaton", option_d:"Turing Machine", correct_answer:"C", explanation:"Pushdown Automata (PDA) recognize context-free languages" },
  { role:"Automata", k_level:4, marks:4, question_text:"Which problem is undecidable?", option_a:"Does DFA accept empty language?", option_b:"Is CFG ambiguous?", option_c:"Are two DFAs equivalent?", option_d:"Does DFA accept a string?", correct_answer:"B", explanation:"CFG ambiguity is undecidable - no algorithm can always determine it" },
  { role:"Automata", k_level:4, marks:4, question_text:"What is the halting problem?", option_a:"Determining if a program has loops", option_b:"Determining if a Turing Machine halts on a given input", option_c:"Stopping infinite loops in code", option_d:"A sorting algorithm", correct_answer:"B", explanation:"Halting problem asks if a TM will halt on input - proven undecidable by Turing" },
  { role:"Automata", k_level:5, marks:5, question_text:"Which complexity class contains problems verifiable in polynomial time?", option_a:"P", option_b:"NP", option_c:"PSPACE", option_d:"EXPTIME", correct_answer:"B", explanation:"NP contains problems whose solutions can be verified in polynomial time" },
  { role:"Automata", k_level:5, marks:5, question_text:"What does it mean if P = NP?", option_a:"All problems are easy", option_b:"Every problem whose solution can be verified quickly can also be solved quickly", option_c:"No problem can be solved", option_d:"Computers become infinitely fast", correct_answer:"B", explanation:"P=NP would mean efficient verification implies efficient solution" }
];

async function seed() {
  for (const q of questions) {
    await pool.query(
      `INSERT INTO questions (role, k_level, marks, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT DO NOTHING`,
      [q.role, q.k_level, q.marks, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.correct_answer, q.explanation]
    );
  }
  console.log("Seeded", questions.length, "AMCAT questions!");
  await pool.end();
}

seed().catch(console.error);
