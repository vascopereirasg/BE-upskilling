import { Router } from 'express';
import { pool } from '../server';

const router = Router();

// Get All Todos
router.get('/', async (req: any, res: any) => {
  try {
    const result = await pool.query('SELECT * FROM todos');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

// Get a Single Todo
router.get('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch todo' });
  }
});

// Create a Todo
router.post('/', async (req: any, res: any) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const result = await pool.query(
      'INSERT INTO todos (title, description) VALUES ($1, $2) RETURNING *',
      [title, description]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create todo' });
  }
});

// Update a Todo
router.put('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const result = await pool.query(
      'UPDATE todos SET title = $1, description = $2, completed = $3 WHERE id = $4 RETURNING *',
      [title, description, completed, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update todo' });
  }
});

// Delete a Todo
router.delete('/:id', async (req: any, res: any) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM todos WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.json({ success: true, message: 'Todo deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
