import express from 'express';
import pool from '../db';
const router = express.Router();

// Get all candidates ranked by score
router.get('/candidates', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.name, u.email
       FROM assessments a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.overall_score DESC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get platform stats
router.get('/stats', async (req, res) => {
  try {
    const total = await pool.query('SELECT COUNT(*) FROM assessments');
    const hired = await pool.query("SELECT COUNT(*) FROM assessments WHERE verdict = 'HIRE'");
    const flagged = await pool.query("SELECT COUNT(*) FROM assessments WHERE triangle_status = 'FLAGGED'");
    const avgScore = await pool.query('SELECT AVG(overall_score) FROM assessments');
    res.json({
      total: total.rows[0].count,
      hired: hired.rows[0].count,
      flagged: flagged.rows[0].count,
      avgScore: Math.round(avgScore.rows[0].avg || 0)
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Update verdict
router.put('/verdict/:id', async (req, res) => {
  try {
    const { verdict } = req.body;
    await pool.query(
      'UPDATE assessments SET verdict = $1 WHERE id = $2',
      [verdict, req.params.id]
    );
    res.json({ updated: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Export candidates as CSV
router.get('/export-csv', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.name, u.email, a.overall_score, a.ats_score, a.test_score,
              a.interview_score, a.verdict, a.triangle_status, a.created_at
       FROM assessments a
       JOIN users u ON a.user_id = u.id
       ORDER BY a.overall_score DESC`
    );
    const headers = ['Name','Email','Overall Score','ATS Score','Test Score','Interview Score','Verdict','Triangle Status','Date'];
    const rows = result.rows.map(r => [
      r.name, r.email, r.overall_score, r.ats_score,
      r.test_score, r.interview_score, r.verdict,
      r.triangle_status, new Date(r.created_at).toLocaleDateString()
    ]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=genuai-candidates.csv');
    res.send(csv);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Role-wise performance analytics
router.get('/role-analytics', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT role, COUNT(*) as total,
              ROUND(AVG(overall_score)) as avg_score,
              COUNT(CASE WHEN verdict='HIRE' THEN 1 END) as hired,
              COUNT(CASE WHEN verdict='REJECT' THEN 1 END) as rejected
       FROM assessments
       GROUP BY role
       ORDER BY avg_score DESC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
