const quizService = require('../services/quizService');

/**
 * GET /quiz
 * Récupérer tous les quiz disponibles
 */
const getAllQuiz = async (req, res) => {
  try {
    const quiz = await quizService.getAllQuiz();
    
    return res.status(200).json({
      success: true,
      message: 'Quiz récupérés avec succès',
      data: { quiz }
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération des quiz:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des quiz'
    });
  }
};

/**
 * GET /quiz/:id
 * Récupérer un quiz avec ses questions
 */
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await quizService.getQuizById(id);
    
    return res.status(200).json({
      success: true,
      message: 'Quiz récupéré avec succès',
      data: quiz
    });
    
  } catch (error) {
    console.error('Erreur lors de la récupération du quiz:', error);
    return res.status(404).json({
      success: false,
      message: error.message || 'Quiz non trouvé'
    });
  }
};

/**
 * POST /quiz/:id/repondre
 * Soumettre des réponses à un quiz
 */
const repondreQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { reponses } = req.body;
    const membreId = req.user.id;
    
    if (!reponses || !Array.isArray(reponses)) {
      return res.status(400).json({
        success: false,
        message: 'Les réponses doivent être fournies sous forme de tableau'
      });
    }
    
    const resultat = await quizService.repondreQuiz(id, membreId, reponses, req);
    
    return res.status(200).json({
      success: true,
      message: 'Quiz soumis avec succès',
      data: resultat
    });
    
  } catch (error) {
    console.error('Erreur lors de la soumission du quiz:', error);
    return res.status(400).json({
      success: false,
      message: error.message || 'Erreur lors de la soumission du quiz'
    });
  }
};

module.exports = {
  getAllQuiz,
  getQuizById,
  repondreQuiz
};
