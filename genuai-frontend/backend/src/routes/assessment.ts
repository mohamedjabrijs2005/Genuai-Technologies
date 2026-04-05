import express from 'express';
import pool from '../db';

const router = express.Router();

// Submit assessment
router.post('/submit', async (req, res) => {
  try {
    const {
      user_id, job_id, resume_text, resume_url, skills,
      ats_score, resume_score, interview_score, test_score,
      consistency_score, overall_score, authenticity_score,
      verdict, triangle_status, salary_min, salary_max,
      improvement_plan
    } = req.body;

    const result = await pool.query(
      `INSERT INTO assessments (
        user_id, job_id, resume_text, resume_url, skills,
        ats_score, resume_score, interview_score, test_score,
        consistency_score, overall_score, authenticity_score,
        verdict, triangle_status, salary_min, salary_max,
        improvement_plan
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      ) RETURNING *`,
      [
        user_id, job_id, resume_text, resume_url, skills,
        ats_score, resume_score, interview_score, test_score,
        consistency_score, overall_score, authenticity_score,
        verdict, triangle_status, salary_min, salary_max,
        improvement_plan
      ]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get single assessment
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM assessments WHERE id = $1',
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Log cheat event
router.post('/cheat', async (req, res) => {
  try {
    const { assessment_id, event_type, penalty_applied } = req.body;
    await pool.query(
      'INSERT INTO cheat_logs (assessment_id, event_type, penalty_applied) VALUES ($1, $2, $3)',
      [assessment_id, event_type, penalty_applied]
    );
    res.json({ logged: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
