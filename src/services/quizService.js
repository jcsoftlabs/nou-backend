const { Quiz, QuizQuestion, QuizResultat, Membre, AuditLog } = require('../models');
const { Op } = require('sequelize');

/**
 * Loguer une action dans la table audit
 */
const logAudit = async (userId, action, entityType, entityId, description, dataBefore, dataAfter, req) => {
  try {
    await AuditLog.create({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      description,
      data_before: dataBefore,
      data_after: dataAfter,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.headers['user-agent']
    });
  } catch (error) {
    console.error('Erreur lors du logging audit:', error);
  }
};

/**
 * Récupérer tous les quiz disponibles (non expirés)
 */
const getAllQuiz = async () => {
  try {
    const now = new Date();
    
    const quiz = await Quiz.findAll({
      where: {
        [Op.or]: [
          { date_expiration: null },
          { date_expiration: { [Op.gte]: now } }
        ]
      },
      order: [['date_publication', 'DESC']],
      attributes: ['id', 'titre', 'description', 'date_publication', 'date_expiration']
    });
    
    return quiz;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Récupérer un quiz par son ID avec ses questions
 */
const getQuizById = async (id) => {
  try {
    const quiz = await Quiz.findByPk(id, {
      include: [{
        model: QuizQuestion,
        as: 'questions',
        attributes: ['id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'points_question']
        // Note: On n'expose pas bonne_reponse au client
      }]
    });
    
    if (!quiz) {
      throw new Error('Quiz non trouvé');
    }
    
    // Vérifier si le quiz est expiré
    if (quiz.date_expiration && new Date(quiz.date_expiration) < new Date()) {
      throw new Error('Ce quiz est expiré');
    }
    
    return quiz;
    
  } catch (error) {
    throw error;
  }
};

/**
 * Soumettre des réponses à un quiz
 */
const repondreQuiz = async (quizId, membreId, reponses, req) => {
  try {
    // Vérifier que le quiz existe
    const quiz = await Quiz.findByPk(quizId, {
      include: [{
        model: QuizQuestion,
        as: 'questions'
      }]
    });
    
    if (!quiz) {
      throw new Error('Quiz non trouvé');
    }
    
    // Vérifier si le quiz est expiré
    if (quiz.date_expiration && new Date(quiz.date_expiration) < new Date()) {
      throw new Error('Ce quiz est expiré');
    }
    
    // Vérifier que le membre existe
    const membre = await Membre.findByPk(membreId);
    if (!membre) {
      throw new Error('Membre non trouvé');
    }
    
    // Vérifier si le membre a déjà répondu à ce quiz
    const existingResultat = await QuizResultat.findOne({
      where: {
        quiz_id: quizId,
        membre_id: membreId
      }
    });
    
    if (existingResultat) {
      throw new Error('Vous avez déjà répondu à ce quiz');
    }
    
    // Calculer le score
    let score = 0;
    let totalPoints = 0;
    let bonnesReponses = 0;
    
    const questionsMap = {};
    quiz.questions.forEach(q => {
      questionsMap[q.id] = q;
      totalPoints += q.points_question || 1;
    });
    
    reponses.forEach(reponse => {
      const question = questionsMap[reponse.question_id];
      if (question && reponse.reponse === question.bonne_reponse) {
        score += question.points_question || 1;
        bonnesReponses += 1;
      }
    });
    
    // Enregistrer le résultat
    const resultat = await QuizResultat.create({
      quiz_id: quizId,
      membre_id: membreId,
      score_total: score,
      total_points: totalPoints,
      bonnes_reponses: bonnesReponses,
      date_participation: new Date()
    });
    
    // Logger l'action
    await logAudit(
      membreId,
      'COMPLETE_QUIZ',
      'quiz_resultat',
      resultat.id,
      `Soumission du quiz "${quiz.titre}" avec un score de ${score}/${totalPoints}`,
      null,
      resultat.toJSON(),
      req
    );
    
    // TODO: Ajouter des points au membre via le système de points
    
    return {
      resultat_id: resultat.id,
      score_total: score,
      total_points: totalPoints,
      bonnes_reponses: bonnesReponses,
      nombre_questions: quiz.questions.length,
      pourcentage: totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0,
      points_gagnes: 0
    };
    
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllQuiz,
  getQuizById,
  repondreQuiz
};
