import express from 'express';
import pool from '../db';

const router = express.Router();

// Auto-migrate: ensure company_ids column exists on assessments table
(async () => {
  try {
    await pool.query(`
      ALTER TABLE assessments 
      ADD COLUMN IF NOT EXISTS company_ids INTEGER[] DEFAULT '{}'
    `);
    console.log('✅ assessments.company_ids column ready');
  } catch (err: any) {
    console.warn('Migration warning (company_ids):', err.message);
  }
})();

// Submit assessment (now includes company_ids)
router.post('/submit', async (req, res) => {
  try {
    const {
      user_id, job_id, resume_text, resume_url, skills,
      ats_score, resume_score, interview_score, test_score,
      consistency_score, overall_score, authenticity_score,
      verdict, triangle_status, salary_min, salary_max,
      improvement_plan, company_ids
    } = req.body;

    const activeCompanyId = company_ids && company_ids.length > 0 ? company_ids[0] : null;

    const result = await pool.query(
      `INSERT INTO assessments (
        user_id, job_id, resume_text, resume_url, skills,
        ats_score, resume_score, interview_score, test_score,
        consistency_score, overall_score, authenticity_score,
        verdict, triangle_status, salary_min, salary_max,
        improvement_plan, company_ids, active_company_id
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19
      ) RETURNING *`,
      [
        user_id, job_id, resume_text, resume_url, skills,
        ats_score, resume_score, interview_score, test_score,
        consistency_score, overall_score, authenticity_score,
        verdict, triangle_status, salary_min, salary_max,
        improvement_plan,
        company_ids && company_ids.length > 0 ? company_ids : [],
        activeCompanyId
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
