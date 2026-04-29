const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc    Get tasks for a project
// @route   GET /api/tasks/project/:projectId
// @access  Private
const getTasksByProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    // Check if user is part of the project or is admin
    if (req.user.role !== 'Admin' && !project.members.includes(req.user._id)) {
       res.status(401);
       throw new Error('Not authorized to view tasks for this project');
    }

    const tasks = await Task.find({ projectId: req.params.projectId }).populate('assignedTo', 'name email');
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate, assignedTo, projectId } = req.body;

    if (!title || !projectId) {
      res.status(400);
      throw new Error('Please add a title and select a project');
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      projectId,
    });

    const populatedTask = await Task.findById(task._id).populate('assignedTo', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a task (Admin full edit, Member status update)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    let updatedData = req.body;

    // If member, only allow updating status
    if (req.user.role === 'Member') {
      // Check if task is assigned to this member (optional, or any member in project can update)
      // We will allow the member to update if they are assigned, or maybe just if they are in the project.
      // Let's restrict to just updating status for members.
      updatedData = { status: req.body.status }; 
    }

    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    ).populate('assignedTo', 'name email');

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get user's assigned tasks (Dashboard)
// @route   GET /api/tasks/me
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    let tasks;
    if (req.user.role === 'Admin') {
      tasks = await Task.find().populate('projectId', 'name').populate('assignedTo', 'name email');
    } else {
      tasks = await Task.find({ assignedTo: req.user._id }).populate('projectId', 'name').populate('assignedTo', 'name email');
    }
    
    res.status(200).json(tasks);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
};
