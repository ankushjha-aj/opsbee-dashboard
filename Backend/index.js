const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test database connection
pool.connect()
  .then(() => console.log('Connected to PostgreSQL database'))
  .catch(err => console.error('Database connection error:', err.stack));

// Initialize database table
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Task (
        id SERIAL PRIMARY KEY,
        person VARCHAR(100) NOT NULL,
        date DATE NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'not-started',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );CREATE TABLE IF NOT EXISTS Person (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// API Routes


app.post('/api/person/:person', async (req, res) => {
  try {
    const name = req.params.person;
    
    const result = await pool.query(`INSERT INTO Person (name) VALUES ($1) RETURNING *`, [name]);
    res.json(result.rows[0]);
  } catch (error) {
    res.json(error);
  }
})

app.get("/api/person", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT name FROM Person`
    );
    res.json(result.rows);
  } catch (error) {
    res.json(error);
  }
});

// Get all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Task ');
    console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks by person
app.get('/api/tasks/person/:person', async (req, res) => {
  try {
    const { person } = req.params;
    const result = await pool.query('SELECT * FROM Task WHERE person = $1 ORDER BY date ASC', [person]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching tasks by person:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Get tasks by date
app.get('/api/tasks/date/:date', async (req, res) => {
    try {
      const { date } = req.params;
      
      // Corrected SQL Query
      const result = await pool.query(
        "SELECT * FROM Task WHERE date BETWEEN $1::date - INTERVAL '1 day' AND $1::date + INTERVAL '6 days' ORDER BY person ASC",
        [date]
      );
  
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching tasks by date:', error);
      res.status(500).json({ error: 'Failed to fetch tasks' });
    }
  });
  

// Add a new task
app.post('/api/tasks', async (req, res) => {
  try {
    const { person, date, description, status } = req.body;
    
    // Validate required fields
    if (!person || !date || !description) {
      return res.status(400).json({ error: 'Person, date, and description are required' });
    }
    
    const result = await pool.query(
      'INSERT INTO Task (person, date, description, status) VALUES ($1, $2, $3, $4) RETURNING *',
      [person, date, description, status || 'not-started']
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding task:', error);
    res.status(500).json({ error: 'Failed to add task' });
  }
});

// Update task status
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, description } = req.body;
    
    let query, params;
    
    if (status && description) {
      query = 'UPDATE Task SET status = $1, description = $2 WHERE id = $3 RETURNING *';
      params = [status, description, id];
    } else if (status) {
      query = 'UPDATE Task SET status = $1 WHERE id = $2 RETURNING *';
      params = [status, id];
    } else if (description) {
      query = 'UPDATE Task SET description = $1 WHERE id = $2 RETURNING *';
      params = [description, id];
    } else {
      return res.status(400).json({ error: 'No update parameters provided' });
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// Delete a task
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM Task WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json({ message: 'Task deleted successfully', task: result.rows[0] });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to initialize server:', err);
  });