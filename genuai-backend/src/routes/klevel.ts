import express from 'express';
import pool from '../db';
const router = express.Router();

// Get first question for a role (K1)
router.post('/start', async (req, res) => {
  try {
    const { role } = req.body;
    if (!role) return res.status(400).json({ error: 'role is required' });
    const result = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, k_level, marks
       FROM questions WHERE role = $1 AND k_level = 1
       ORDER BY RANDOM() LIMIT 1`,
      [role]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'No questions found for this role' });
    res.json({ question: result.rows[0], current_level: 1, total_score: 0 });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Submit answer and get next question
router.post('/answer', async (req, res) => {
  try {
    const { question_id, selected_answer, current_level, total_score, role } = req.body;

    // Check answer
    const qResult = await pool.query(
      'SELECT correct_answer, marks, explanation FROM questions WHERE id = $1',
      [question_id]
    );
    if (qResult.rows.length === 0) return res.status(404).json({ error: 'Question not found' });

    const { correct_answer, marks, explanation } = qResult.rows[0];
    const isCorrect = selected_answer.toUpperCase() === correct_answer.toUpperCase();
    const newScore = isCorrect ? total_score + marks : total_score;
    const nextLevel = current_level + 1;

    // If wrong or reached max level
    if (!isCorrect || nextLevel > 5) {
      const tier = newScore >= 11 ? 'Expert' : newScore >= 7 ? 'Advanced' : newScore >= 4 ? 'Intermediate' : 'Beginner';
      const tierColor = newScore >= 11 ? '#FFD700' : newScore >= 7 ? '#00B87C' : newScore >= 4 ? '#F59E0B' : '#FF4444';
      return res.json({
        is_correct: isCorrect,
        correct_answer,
        explanation,
        marks_earned: isCorrect ? marks : 0,
        total_score: newScore,
        max_score: 15,
        percentage: Math.round((newScore / 15) * 100),
        completed: true,
        tier,
        tier_color: tierColor,
        next_question: null,
        message: !isCorrect ? `Wrong answer! Test stopped at K${current_level}` : 'Congratulations! You completed all 5 levels!'
      });
    }

    // Get next level question
    const nextResult = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, k_level, marks
       FROM questions WHERE role = $1 AND k_level = $2
       ORDER BY RANDOM() LIMIT 1`,
      [role, nextLevel]
    );

    if (nextResult.rows.length === 0) {
      const tier = newScore >= 11 ? 'Expert' : newScore >= 7 ? 'Advanced' : newScore >= 4 ? 'Intermediate' : 'Beginner';
      const tierColor = newScore >= 11 ? '#FFD700' : newScore >= 7 ? '#00B87C' : newScore >= 4 ? '#F59E0B' : '#FF4444';
      return res.json({
        is_correct: isCorrect,
        correct_answer,
        explanation,
        marks_earned: marks,
        total_score: newScore,
        max_score: 15,
        percentage: Math.round((newScore / 15) * 100),
        completed: true,
        tier,
        tier_color: tierColor,
        next_question: null,
        message: 'Test completed!'
      });
    }

    res.json({
      is_correct: isCorrect,
      correct_answer,
      explanation,
      marks_earned: marks,
      total_score: newScore,
      max_score: 15,
      percentage: Math.round((newScore / 15) * 100),
      completed: false,
      next_question: nextResult.rows[0],
      current_level: nextLevel,
      message: `Correct! Moving to K${nextLevel}`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get K-level stats for a role
router.get('/stats/:role', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT k_level, COUNT(*) as count, SUM(marks) as total_marks
       FROM questions WHERE role = $1
       GROUP BY k_level ORDER BY k_level`,
      [req.params.role]
    );
    res.json({ stats: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
