import express from "express";
import pool from "../db";

const router = express.Router();

// Get random questions for a section
router.get("/question/:role/:level", async (req, res) => {
  try {
    const { role, level } = req.params;
    const klevel = parseInt(level.replace("K","").replace("k",""));
    const result = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, k_level, marks
       FROM questions
       WHERE role=$1 AND k_level=$2
       ORDER BY RANDOM() LIMIT 1`,
      [role, klevel]
    );
    res.json(result.rows[0] || null);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get batch of questions for AMCAT test
router.get("/amcat/:role", async (req, res) => {
  try {
    const { role } = req.params;
    const { category } = req.query;

    let roleFilter = role;
    // Map category to role for aptitude/english/automata
    if (category === "aptitude") roleFilter = "Aptitude";
    if (category === "english") roleFilter = "English";
    if (category === "automata") roleFilter = "Automata";

    // Get 10 random questions across all k_levels
    const result = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, k_level, marks, explanation
       FROM questions
       WHERE role=$1
       ORDER BY RANDOM() LIMIT 10`,
      [roleFilter]
    );

    // If no category-specific questions, fall back to role questions
    if (result.rows.length === 0 && category) {
      const fallback = await pool.query(
        `SELECT id, question_text, option_a, option_b, option_c, option_d, k_level, marks, explanation
         FROM questions
         WHERE role=$1
         ORDER BY RANDOM() LIMIT 10`,
        [role]
      );
      return res.json(fallback.rows);
    }

    res.json(result.rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Evaluate answers and return score
router.post("/evaluate", async (req, res) => {
  try {
    const { answers } = req.body;
    let score = 0;
    let total = 0;
    const results = [];

    for (const a of answers) {
      const q = await pool.query(
        `SELECT correct_answer, marks, explanation FROM questions WHERE id=$1`,
        [a.id]
      );
      if (!q.rows[0]) continue;
      const correct = q.rows[0].correct_answer === a.answer;
      score += correct ? q.rows[0].marks : 0;
      total += q.rows[0].marks;
      results.push({
        id: a.id,
        correct,
        correct_answer: q.rows[0].correct_answer,
        your_answer: a.answer,
        explanation: q.rows[0].explanation,
        marks: q.rows[0].marks
      });
    }

    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    res.json({ score, total, percentage, results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Report violation - auto notify
router.post("/violation", async (req, res) => {
  try {
    const { user_id, assessment_id, violation_type, count, auto_terminated } = req.body;
    await pool.query(
      `INSERT INTO cheat_logs (user_id, assessment_id, violation_type, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [user_id, assessment_id, violation_type]
    );
    res.json({ logged: true, auto_terminated });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
