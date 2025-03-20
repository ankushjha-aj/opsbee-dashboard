// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Schema and Model (will be used later)
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  assignee: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'in-progress', 'completed'], 
    default: 'pending'
  },
  date: { type: Date, required: true },
  isLastCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

const Task = mongoose.model('Task', taskSchema);

// Routes
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/tasks', async (req, res) => {
  const task = new Task(req.body);
  
  // If task is marked as last completed, unmark other tasks for the same assignee
  if (task.isLastCompleted) {
    await Task.updateMany(
      { assignee: task.assignee, isLastCompleted: true },
      { isLastCompleted: false }
    );
  }
  
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/tasks/:id', async (req, res) => {
  try {
    // If task is marked as last completed, unmark other tasks for the same assignee
    if (req.body.isLastCompleted) {
      await Task.updateMany(
        { 
          assignee: req.body.assignee, 
          isLastCompleted: true,
          _id: { $ne: req.params.id }
        },
        { isLastCompleted: false }
      );
    }
    
    req.body.updatedAt = new Date();
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Filter tasks by status or assignee
app.get('/api/tasks/filter/:type/:value', async (req, res) => {
  try {
    let query = {};
    if (req.params.type === 'status') {
      query.status = req.params.value;
    } else if (req.params.type === 'assignee') {
      query.assignee = req.params.value;
    }
    
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search tasks
app.get('/api/tasks/search/:term', async (req, res) => {
  try {
    const searchTerm = req.params.term;
    const tasks = await Task.find({
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { assignee: { $regex: searchTerm, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get stats
app.get('/api/stats', async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ status: 'completed' });
    const pendingTasks = await Task.countDocuments({ status: 'pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'in-progress' });
    
    const assigneeStats = await Task.aggregate([
      { $group: { 
        _id: '$assignee', 
        count: { $sum: 1 },
        completed: { 
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        }
      }}
    ]);
    
    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      assigneeStats
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// For React/SPA routing - serve index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// MongoDB Connection Function (to be used later)
async function connectDB(uri) {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, connectDB };