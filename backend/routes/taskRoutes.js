const express = require('express');
const { check, validationResult } = require('express-validator');
const router = express.Router();
const {
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  getMyTasks,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/roleMiddleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.route('/')
  .post(protect, admin, [
    check('title', 'Task title is required').not().isEmpty(),
    check('projectId', 'Project ID is required').not().isEmpty()
  ], validate, createTask);

router.route('/me')
  .get(protect, getMyTasks);

router.route('/project/:projectId')
  .get(protect, getTasksByProject);

router.route('/:id')
  .put(protect, updateTask)
  .delete(protect, admin, deleteTask);

module.exports = router;
