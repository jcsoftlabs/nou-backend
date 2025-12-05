const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const authenticate = require('../middleware/auth');

/**
 * @route   GET /quiz
 * @desc    Récupérer tous les quiz disponibles
 * @access  Private
 */
router.get('/',
  authenticate,
  quizController.getAllQuiz
);

/**
 * @route   GET /quiz/:id
 * @desc    Récupérer un quiz avec ses questions
 * @access  Private
 */
router.get('/:id',
  authenticate,
  quizController.getQuizById
);

/**
 * @route   POST /quiz/:id/repondre
 * @desc    Soumettre des réponses à un quiz
 * @access  Private
 */
router.post('/:id/repondre',
  authenticate,
  quizController.repondreQuiz
);

module.exports = router;
