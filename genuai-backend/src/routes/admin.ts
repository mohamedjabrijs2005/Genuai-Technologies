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

// Update verdict (with Waterfall Routing Cascade)
router.put('/verdict/:id', async (req, res) => {
  try {
    const { verdict, company_name } = req.body;
    const { id } = req.params;

    // Fetch the assessment
    const result = await pool.query('SELECT a.*, u.email, u.name as candidate_name FROM assessments a JOIN users u ON a.user_id = u.id WHERE a.id = $1', [id]);
    const assessment = result.rows[0];

    if (!assessment) throw new Error("Assessment not found");

    if (verdict === 'REJECT' && assessment.company_ids && assessment.company_ids.length > 0) {
      const activeId = assessment.active_company_id;
      const currentIndex = assessment.company_ids.indexOf(activeId);
      
      // If there is a next company in the array
      if (currentIndex >= 0 && currentIndex < assessment.company_ids.length - 1) {
        const nextCompanyId = assessment.company_ids[currentIndex + 1];
        
        // Update active_company_id to the next company, keep verdict as null or REVIEW for the new company
        await pool.query(
          'UPDATE assessments SET active_company_id = $1, verdict = $2 WHERE id = $3',
          [nextCompanyId, 'REVIEW', id]
        );

        // Fetch next company name
        const nextCompRes = await pool.query('SELECT name FROM users WHERE id = $1', [nextCompanyId]);
        const nextCompanyName = nextCompRes.rows[0]?.name || "another company";

        // Import sendgrid
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
        
        try {
          await sgMail.send({
            to: assessment.email,
            from: process.env.SENDGRID_SENDER_EMAIL!,
            subject: 'Update on your GenuAI Application',
            text: `Hi ${assessment.candidate_name},\n\nUnfortunately, you were not selected by ${company_name || 'the previous company'}. However, your profile has been automatically forwarded to your next choice, ${nextCompanyName}.\n\nBest of luck!\nThe GenuAI Team`,
          });
        } catch (emailErr) {
          console.error("Failed to send waterfall email:", emailErr);
        }

        return res.json({ updated: true, cascaded: true, nextCompany: nextCompanyName });
      }
    }

    // Default behavior if HIRE, or if REJECT with no more companies left
    await pool.query(
      'UPDATE assessments SET verdict = $1 WHERE id = $2',
      [verdict, id]
    );
    res.json({ updated: true, cascaded: false });
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

// List all registered company accounts (for candidate company-selector)
router.get('/companies', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email FROM users WHERE role = 'company' ORDER BY name ASC`
    );
    res.json(result.rows);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Get candidates who are currently ACTIVE for this specific company
router.get('/candidates/for-company/:companyId', async (req, res) => {
  try {
    const { companyId } = req.params;
    const result = await pool.query(
      `SELECT a.*, u.name, u.email
       FROM assessments a
       JOIN users u ON a.user_id = u.id
       WHERE a.active_company_id = $1
       ORDER BY a.overall_score DESC`,
      [companyId]
    );
    res.json(result.rows);
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
