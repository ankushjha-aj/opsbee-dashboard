// api-service.js - Place this in a 'js' folder in your public directory
class TaskService {
    constructor(baseURL = '/api') {
      this.baseURL = baseURL;
    }
  
    // Fetch all tasks
    async getTasks() {
      try {
        const response = await fetch(`${this.baseURL}/tasks`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
      } catch (error) {
        console.error('Error fetching tasks:', error);
        throw error;
      }
    }
  
    // Create a new task
    async createTask(taskData) {
      try {
        const response = await fetch(`${this.baseURL}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error creating task:', error);
        throw error;
      }
    }
  
    // Get a specific task
    async getTask(id) {
      try {
        const response = await fetch(`${this.baseURL}/tasks/${id}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error fetching task with id ${id}:`, error);
        throw error;
      }
    }
  
    // Update a task
    async updateTask(id, taskData) {
      try {
        const response = await fetch(`${this.baseURL}/tasks/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(taskData),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error updating task with id ${id}:`, error);
        throw error;
      }
    }
  
    // Delete a task
    async deleteTask(id) {
      try {
        const response = await fetch(`${this.baseURL}/tasks/${id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error deleting task with id ${id}:`, error);
        throw error;
      }
    }
  
    // Filter tasks by status or assignee
    async filterTasks(type, value) {
      try {
        const response = await fetch(`${this.baseURL}/tasks/filter/${type}/${value}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error filtering tasks by ${type}=${value}:`, error);
        throw error;
      }
    }
  
    // Search tasks
    async searchTasks(term) {
      try {
        const response = await fetch(`${this.baseURL}/tasks/search/${encodeURIComponent(term)}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error(`Error searching tasks with term "${term}":`, error);
        throw error;
      }
    }
  
    // Get dashboard statistics
    async getStats() {
      try {
        const response = await fetch(`${this.baseURL}/stats`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Error fetching stats:', error);
        throw error;
      }
    }
  }
  
  // Use this to replace localStorage functionality when ready to connect to MongoDB
  // Example usage:
  /*
  const taskService = new TaskService();
  
  // Initialize the dashboard
  document.addEventListener('DOMContentLoaded', async function() {
    try {
      tasks = await taskService.getTasks();
      renderTasks();
      updateStats();
      
      // ... rest of your initialization code
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
      taskList.innerHTML = '<div class="alert alert-danger">Failed to load tasks. Please try again later.</div>';
    }
  });
  
  // Replace the saveTask function
  async function saveTask() {
    // ... your existing validation code
    
    try {
      const task = {
        title,
        description,
        assignee,
        status,
        date,
        isLastCompleted,
      };
      
      const newTask = await taskService.createTask(task);
      tasks.push(newTask);
      
      // Close the modal and update UI
      const modal = bootstrap.Modal.getInstance(document.getElementById('addTaskModal'));
      modal.hide();
      document.getElementById('task-form').reset();
      renderTasks();
      updateStats();
    } catch (error) {
      alert('Failed to save task: ' + error.message);
    }
  }
  */