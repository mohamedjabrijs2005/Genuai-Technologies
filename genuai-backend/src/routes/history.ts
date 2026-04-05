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
