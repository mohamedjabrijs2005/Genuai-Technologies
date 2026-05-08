import express from 'express';
const router = express.Router();

const questionBank: Record<string, any[]> = {
  "Software Engineer": [
    { question: "Explain the difference between REST and GraphQL. When would you choose one over the other?", type: "Technical", difficulty: "Medium", hint: "Talk about flexibility, over-fetching, use cases", follow_up: "Have you used GraphQL in production?" },
    { question: "How would you design a URL shortener like bit.ly? Walk me through the system design.", type: "Technical", difficulty: "Hard", hint: "Cover database, hashing, caching, scalability", follow_up: "How would you handle 1 million requests per second?" },
    { question: "Explain SOLID principles with real examples from your projects.", type: "Technical", difficulty: "Medium", hint: "Give one concrete example per principle", follow_up: "Which principle do you find hardest to follow?" },
    { question: "Describe a bug that took you the longest to fix. What was your debugging process?", type: "Behavioral", difficulty: "Medium", hint: "Show systematic thinking and persistence", follow_up: "What did you learn from it?" },
    { question: "How do you ensure code quality in a team? What processes do you follow?", type: "Behavioral", difficulty: "Easy", hint: "Mention code reviews, testing, CI/CD", follow_up: "How do you handle disagreements in code review?" },
  ],
  "AI Engineer": [
    { question: "Explain the difference between supervised, unsupervised, and reinforcement learning with examples.", type: "Technical", difficulty: "Medium", hint: "Use real-world examples for each", follow_up: "Which have you implemented in production?" },
    { question: "How would you handle class imbalance in a dataset?", type: "Technical", difficulty: "Medium", hint: "SMOTE, oversampling, undersampling, class weights", follow_up: "What metric would you use to evaluate model performance?" },
    { question: "Explain how transformer architecture works and why it replaced RNNs.", type: "Technical", difficulty: "Hard", hint: "Attention mechanism, parallelization, long-range dependencies", follow_up: "What are the limitations of transformers?" },
    { question: "How do you prevent overfitting in deep learning models?", type: "Technical", difficulty: "Medium", hint: "Dropout, regularization, early stopping, data augmentation", follow_up: "How do you know when your model is overfitting?" },
    { question: "Describe an ML model you built end to end. What was the impact?", type: "Behavioral", difficulty: "Easy", hint: "Cover data, model, evaluation, deployment", follow_up: "What would you do differently now?" },
  ],
  "Data Scientist": [
    { question: "Explain the bias-variance tradeoff. How do you balance it in practice?", type: "Technical", difficulty: "Medium", hint: "Underfitting vs overfitting, model complexity", follow_up: "Give an example from your work" },
    { question: "How would you design an A/B test for a new product feature?", type: "Technical", difficulty: "Medium", hint: "Hypothesis, sample size, duration, metrics", follow_up: "How do you handle novelty effects?" },
    { question: "What statistical tests do you use most often and why?", type: "Technical", difficulty: "Medium", hint: "t-test, chi-square, ANOVA, when to use each", follow_up: "How do you check test assumptions?" },
    { question: "Describe a time your data analysis led to a significant business decision.", type: "Behavioral", difficulty: "Easy", hint: "Quantify the impact if possible", follow_up: "How did you communicate results to non-technical stakeholders?" },
    { question: "How do you handle missing data in a dataset?", type: "Technical", difficulty: "Easy", hint: "Imputation, deletion, domain knowledge", follow_up: "When would you drop rows vs impute?" },
  ],
  "Frontend Developer": [
    { question: "Explain the Virtual DOM and how React's reconciliation algorithm works.", type: "Technical", difficulty: "Medium", hint: "Diffing, keys, batching updates", follow_up: "When would you use useMemo or useCallback?" },
    { question: "How do you optimize the performance of a React application?", type: "Technical", difficulty: "Hard", hint: "Code splitting, lazy loading, memoization, bundle size", follow_up: "What tools do you use to measure performance?" },
    { question: "Explain CSS specificity and how the cascade works.", type: "Technical", difficulty: "Easy", hint: "Inline > ID > class > element, importance", follow_up: "How do you manage CSS in large applications?" },
    { question: "How do you ensure your web app is accessible?", type: "Technical", difficulty: "Medium", hint: "ARIA, semantic HTML, keyboard navigation, contrast", follow_up: "Have you used screen readers for testing?" },
    { question: "Describe your approach to responsive design.", type: "Technical", difficulty: "Easy", hint: "Mobile-first, breakpoints, flexbox, grid", follow_up: "How do you handle different device pixel ratios?" },
  ],
  "Backend Developer": [
    { question: "How would you design a rate limiter for an API?", type: "Technical", difficulty: "Hard", hint: "Token bucket, sliding window, Redis, distributed systems", follow_up: "How would you handle distributed rate limiting?" },
    { question: "Explain database indexing and when you would and wouldn't use an index.", type: "Technical", difficulty: "Medium", hint: "B-tree, hash, query performance, write overhead", follow_up: "How do you identify missing indexes?" },
    { question: "How do you handle database transactions and ensure data consistency?", type: "Technical", difficulty: "Medium", hint: "ACID, isolation levels, deadlocks", follow_up: "What is the difference between optimistic and pessimistic locking?" },
    { question: "Describe how you would implement authentication and authorization in a REST API.", type: "Technical", difficulty: "Medium", hint: "JWT, OAuth, RBAC, session management", follow_up: "How do you handle token refresh?" },
    { question: "How do you approach API versioning?", type: "Technical", difficulty: "Easy", hint: "URL versioning, header versioning, backward compatibility", follow_up: "How do you deprecate old API versions?" },
  ],
  "Full Stack Developer": [
    { question: "Walk me through how you would build a real-time chat application from scratch.", type: "Technical", difficulty: "Hard", hint: "WebSockets, database, frontend, scalability", follow_up: "How would you handle 10,000 concurrent users?" },
    { question: "How do you manage state in a large React application?", type: "Technical", difficulty: "Medium", hint: "Redux, Context, Zustand, when to use each", follow_up: "How do you avoid unnecessary re-renders?" },
    { question: "Explain the difference between SQL and NoSQL databases. When do you use each?", type: "Technical", difficulty: "Medium", hint: "ACID vs BASE, use cases, scalability", follow_up: "Have you used both in the same project?" },
    { question: "How do you approach security in a full stack application?", type: "Technical", difficulty: "Medium", hint: "XSS, CSRF, SQL injection, HTTPS, input validation", follow_up: "How do you stay updated on security vulnerabilities?" },
    { question: "Describe your CI/CD pipeline setup.", type: "Technical", difficulty: "Medium", hint: "Git flow, automated testing, deployment, rollback", follow_up: "How do you handle zero-downtime deployments?" },
  ],
  "DevOps Engineer": [
    { question: "Explain the difference between Docker and Kubernetes. When do you need Kubernetes?", type: "Technical", difficulty: "Medium", hint: "Containers vs orchestration, scaling, complexity", follow_up: "What Kubernetes components have you worked with?" },
    { question: "How would you set up monitoring and alerting for a production system?", type: "Technical", difficulty: "Medium", hint: "Metrics, logs, traces, SLOs, PagerDuty", follow_up: "How do you reduce alert fatigue?" },
    { question: "Describe your approach to infrastructure as code.", type: "Technical", difficulty: "Medium", hint: "Terraform, CloudFormation, state management, modules", follow_up: "How do you handle secrets in IaC?" },
    { question: "How do you handle a production outage? Walk me through your incident response process.", type: "Behavioral", difficulty: "Hard", hint: "Detection, communication, mitigation, postmortem", follow_up: "Tell me about a real outage you handled." },
    { question: "Explain blue-green and canary deployments.", type: "Technical", difficulty: "Medium", hint: "Risk reduction, traffic splitting, rollback", follow_up: "Which would you choose for a high-traffic service?" },
  ],
  "Product Manager": [
    { question: "How do you prioritize features when you have limited engineering resources?", type: "Behavioral", difficulty: "Medium", hint: "RICE, MoSCoW, impact vs effort, stakeholder alignment", follow_up: "How do you say no to stakeholders?" },
    { question: "Walk me through how you would launch a new product from idea to launch.", type: "Behavioral", difficulty: "Hard", hint: "Discovery, validation, roadmap, execution, metrics", follow_up: "How do you define success?" },
    { question: "How do you use data to make product decisions?", type: "Behavioral", difficulty: "Medium", hint: "Metrics, A/B testing, user research, funnel analysis", follow_up: "Tell me about a data-driven decision you made." },
    { question: "Describe a time you had to manage conflicting stakeholder priorities.", type: "Behavioral", difficulty: "Medium", hint: "Communication, alignment, compromise, escalation", follow_up: "What would you do differently?" },
    { question: "How do you gather and incorporate user feedback?", type: "Behavioral", difficulty: "Easy", hint: "Interviews, surveys, analytics, NPS, support tickets", follow_up: "How do you decide which feedback to act on?" },
  ],
};

// Get interview questions by role
router.post('/interview-questions', async (req, res) => {
  try {
    const { role, round } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });
    const questions = questionBank[role] || questionBank["Software Engineer"];
    res.json({ questions, role, round: round || 'Technical' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluate interview answer with scoring logic
router.post('/evaluate-answer', async (req, res) => {
  try {
    const { question, answer, role } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'question and answer required' });

    const wordCount = answer.trim().split(/\s+/).length;
    const hasExamples = /example|project|built|implemented|used|worked|developed/i.test(answer);
    const hasMetrics = /\d+%|\d+ years|\d+ months|increased|decreased|improved|reduced/i.test(answer);
    const hasTechnical = /api|database|server|code|algorithm|system|architecture|design/i.test(answer);

    let score = 40;
    if (wordCount > 50) score += 15;
    if (wordCount > 100) score += 10;
    if (hasExamples) score += 15;
    if (hasMetrics) score += 10;
    if (hasTechnical) score += 10;
    score = Math.min(100, score);

    const rating = score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Average" : "Poor";

    const feedback = score >= 85
      ? "Excellent answer! You provided specific examples with measurable outcomes and demonstrated deep technical knowledge."
      : score >= 70
      ? "Good answer with relevant examples. Adding more specific metrics and outcomes would make it even stronger."
      : score >= 50
      ? "Average answer. Try to include specific examples from your experience and quantify your impact."
      : "Your answer needs more depth. Use the STAR method: Situation, Task, Action, Result.";

    res.json({
      score,
      rating,
      feedback,
      what_was_good: hasExamples ? "Good use of examples from experience" : "Clear and direct response",
      what_to_improve: !hasMetrics ? "Add specific numbers and metrics to quantify your impact" : "Consider adding more technical depth",
      model_answer: "A strong answer uses the STAR method with specific examples, measurable outcomes, and demonstrates both technical knowledge and business impact."
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
