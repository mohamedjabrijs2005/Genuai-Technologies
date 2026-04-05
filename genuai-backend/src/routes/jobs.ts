import express from 'express';
import pool from '../db';

const router = express.Router();

// POST /jobs/post — Company posts a job
router.post('/post', async (req, res) => {
  try {
    const { company_id, title, description, skills, location, salary_min, salary_max } = req.body;
    if (!company_id || !title || !description) {
      return res.status(400).json({ error: 'company_id, title and description are required' });
    }
    const result = await pool.query(
      `INSERT INTO jobs (company_id, title, description, skills, skills_required, location, salary_min, salary_max, created_at)
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7, NOW()) RETURNING *`,
      [company_id, title, description, skills || '', location || '', salary_min || 0, salary_max || 0]
    );
    res.json({ success: true, job: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /jobs/list — Get all jobs
router.get('/list', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT j.*, u.name as company_name FROM jobs j
       LEFT JOIN users u ON j.company_id = u.id
       ORDER BY j.created_at DESC`
    );
    res.json({ jobs: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /jobs/company/:company_id — Get jobs by company
router.get('/company/:company_id', async (req, res) => {
  try {
    const { company_id } = req.params;
    const result = await pool.query(
      `SELECT * FROM jobs WHERE company_id = $1 ORDER BY created_at DESC`,
      [company_id]
    );
    res.json({ jobs: result.rows });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /jobs/:id — Delete a job
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM jobs WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
