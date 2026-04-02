import express from 'express';
import pool from '../db';

const router = express.Router();

const marks:any = { K1:1, K2:2, K3:3, K4:4, K5:5 };

// Get random question
router.get('/question/:role/:level', async (req,res)=>{
  try {
    const { role, level } = req.params;

    const result = await pool.query(
      `SELECT id, question_text, options FROM questions 
       WHERE role=$1 AND level=$2 
       ORDER BY RANDOM() LIMIT 1`,
      [role, level]
    );

    res.json(result.rows[0]);
  } catch(err:any){
    res.status(500).json({error:err.message});
  }
});

// Evaluate answers
router.post('/evaluate', async (req,res)=>{
  try {
    const { answers } = req.body;

    let score = 0;

    for (const a of answers) {
      const q = await pool.query(
        `SELECT correct_answer FROM questions WHERE id=$1`,
        [a.id]
      );

      if (q.rows[0].correct_answer === a.answer) {
        score += marks[a.level];
      } else {
        break;
      }
    }

    res.json({ score });

  } catch(err:any){
    res.status(500).json({error:err.message});
  }
});

export default router;
