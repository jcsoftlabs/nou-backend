const { Op } = require('sequelize');
const { Formation, ModuleFormation, Quiz, QuizResultat, QuizQuestion } = require('../models');

/**
 * Récupérer les formations actives avec leurs modules et quiz (côté membre)
 * et, si un membre_id est fourni, inclure une progression personnalisée.
 */
const getFormationsForUser = async (membreId = null) => {
  const now = new Date();

  const formations = await Formation.findAll({
    where: { est_active: true },
    include: [
      {
        model: ModuleFormation,
        as: 'modules',
        include: [
          {
            model: Quiz,
            as: 'quizzes',
            required: false,
            where: {
              [Op.or]: [
                { date_expiration: null },
                { date_expiration: { [Op.gte]: now } }
              ]
            },
            attributes: ['id', 'titre', 'description', 'date_publication', 'date_expiration']
          }
        ]
      }
    ],
    order: [
      ['date_publication', 'DESC'],
      [{ model: ModuleFormation, as: 'modules' }, 'ordre', 'ASC']
    ]
  });

  // Si aucun membre connecté n'est fourni, retourner les formations telles quelles
  if (!membreId) {
    return formations;
  }

  // Construire la liste de tous les quiz visibles dans ces formations
  const allQuizIds = [];
  formations.forEach((formation) => {
    const modules = formation.modules || [];
    modules.forEach((module) => {
      const quizzes = module.quizzes || [];
      quizzes.forEach((quiz) => {
        if (quiz && quiz.id && !allQuizIds.includes(quiz.id)) {
          allQuizIds.push(quiz.id);
        }
      });
    });
  });

  if (allQuizIds.length === 0) {
    return formations;
  }

  // Récupérer les résultats du membre pour ces quiz
  const resultats = await QuizResultat.findAll({
    where: {
      membre_id: membreId,
      quiz_id: { [Op.in]: allQuizIds }
    }
  });

  // Récupérer le total de points possibles par quiz
  const questions = await QuizQuestion.findAll({
    where: {
      quiz_id: { [Op.in]: allQuizIds },
    },
    attributes: ['quiz_id', 'points_question'],
  });

  const totalPointsByQuizId = new Map();
  questions.forEach((q) => {
    const current = totalPointsByQuizId.get(q.quiz_id) || 0;
    totalPointsByQuizId.set(
      q.quiz_id,
      current + (typeof q.points_question === 'number' ? q.points_question : 1)
    );
  });

  const completedQuizIds = new Set(resultats.map((r) => r.quiz_id));
  const lastResultByQuizId = new Map();
  resultats.forEach((r) => {
    lastResultByQuizId.set(r.quiz_id, r);
  });

  // Annoter les formations / modules / quiz avec la progression
  formations.forEach((formation) => {
    let formationTotalQuiz = 0;
    let formationCompletedQuiz = 0;

    (formation.modules || []).forEach((module) => {
      let moduleTotalQuiz = 0;
      let moduleCompletedQuiz = 0;

      (module.quizzes || []).forEach((quiz) => {
        moduleTotalQuiz += 1;
        const isCompleted = completedQuizIds.has(quiz.id);
        if (isCompleted) moduleCompletedQuiz += 1;

        // Badge de progression au niveau du quiz
        quiz.setDataValue('completed', isCompleted);

        // Dernier résultat de ce membre sur ce quiz (score + date)
        const lastResult = lastResultByQuizId.get(quiz.id);
        if (lastResult) {
          const totalPoints = totalPointsByQuizId.get(quiz.id) || null;
          quiz.setDataValue('last_result', {
            score_total: lastResult.score_total,
            total_points: totalPoints,
            date_participation: lastResult.date_participation,
          });
        }
      });

      module.setDataValue('progression', {
        total_quiz: moduleTotalQuiz,
        completed_quiz: moduleCompletedQuiz,
        percentage:
          moduleTotalQuiz > 0
            ? Math.round((moduleCompletedQuiz / moduleTotalQuiz) * 100)
            : 0,
      });

      formationTotalQuiz += moduleTotalQuiz;
      formationCompletedQuiz += moduleCompletedQuiz;
    });

    formation.setDataValue('progression', {
      total_quiz: formationTotalQuiz,
      completed_quiz: formationCompletedQuiz,
      percentage:
        formationTotalQuiz > 0
          ? Math.round((formationCompletedQuiz / formationTotalQuiz) * 100)
          : 0,
    });
  });

  return formations;
};

/**
 * Récupérer une formation par ID (côté membre)
 * et, si un membre_id est fourni, inclure une progression personnalisée.
 */
const getFormationByIdForUser = async (id, membreId = null) => {
  const now = new Date();

  const formation = await Formation.findByPk(id, {
    include: [
      {
        model: ModuleFormation,
        as: 'modules',
        include: [
          {
            model: Quiz,
            as: 'quizzes',
            required: false,
            where: {
              [Op.or]: [
                { date_expiration: null },
                { date_expiration: { [Op.gte]: now } }
              ]
            },
            attributes: ['id', 'titre', 'description', 'date_publication', 'date_expiration']
          }
        ]
      }
    ],
    order: [
      ['date_publication', 'DESC'],
      [{ model: ModuleFormation, as: 'modules' }, 'ordre', 'ASC']
    ]
  });

  if (!formation) {
    throw new Error('Formation non trouvée');
  }

  if (!formation.est_active) {
    throw new Error('Cette formation n\'est pas active');
  }

  // Si aucun membre connecté, retourner la formation telle quelle
  if (!membreId) {
    return formation;
  }

  const allQuizIds = [];
  (formation.modules || []).forEach((module) => {
    (module.quizzes || []).forEach((quiz) => {
      if (quiz && quiz.id && !allQuizIds.includes(quiz.id)) {
        allQuizIds.push(quiz.id);
      }
    });
  });

  if (allQuizIds.length === 0) {
    return formation;
  }

  const resultats = await QuizResultat.findAll({
    where: {
      membre_id: membreId,
      quiz_id: { [Op.in]: allQuizIds },
    },
  });

  const questions = await QuizQuestion.findAll({
    where: {
      quiz_id: { [Op.in]: allQuizIds },
    },
    attributes: ['quiz_id', 'points_question'],
  });

  const totalPointsByQuizId = new Map();
  questions.forEach((q) => {
    const current = totalPointsByQuizId.get(q.quiz_id) || 0;
    totalPointsByQuizId.set(
      q.quiz_id,
      current + (typeof q.points_question === 'number' ? q.points_question : 1)
    );
  });

  const completedQuizIds = new Set(resultats.map((r) => r.quiz_id));
  const lastResultByQuizId = new Map();
  resultats.forEach((r) => {
    lastResultByQuizId.set(r.quiz_id, r);
  });

  let formationTotalQuiz = 0;
  let formationCompletedQuiz = 0;

  (formation.modules || []).forEach((module) => {
    let moduleTotalQuiz = 0;
    let moduleCompletedQuiz = 0;

    (module.quizzes || []).forEach((quiz) => {
      moduleTotalQuiz += 1;
      const isCompleted = completedQuizIds.has(quiz.id);
      if (isCompleted) moduleCompletedQuiz += 1;

      quiz.setDataValue('completed', isCompleted);

      const lastResult = lastResultByQuizId.get(quiz.id);
      if (lastResult) {
        const totalPoints = totalPointsByQuizId.get(quiz.id) || null;
        quiz.setDataValue('last_result', {
          score_total: lastResult.score_total,
          total_points: totalPoints,
          date_participation: lastResult.date_participation,
        });
      }
    });

    module.setDataValue('progression', {
      total_quiz: moduleTotalQuiz,
      completed_quiz: moduleCompletedQuiz,
      percentage:
        moduleTotalQuiz > 0
          ? Math.round((moduleCompletedQuiz / moduleTotalQuiz) * 100)
          : 0,
    });

    formationTotalQuiz += moduleTotalQuiz;
    formationCompletedQuiz += moduleCompletedQuiz;
  });

  formation.setDataValue('progression', {
    total_quiz: formationTotalQuiz,
    completed_quiz: formationCompletedQuiz,
    percentage:
      formationTotalQuiz > 0
        ? Math.round((formationCompletedQuiz / formationTotalQuiz) * 100)
        : 0,
  });

  return formation;
};

/**
 * Liste des formations (admin)
 */
const adminGetFormations = async ({ page = 1, limit = 50, est_active } = {}) => {
  const whereClause = {};

  if (typeof est_active !== 'undefined') {
    whereClause.est_active = est_active === 'true' || est_active === true;
  }

  const offset = (page - 1) * limit;

  const { count, rows } = await Formation.findAndCountAll({
    where: whereClause,
    include: [
      {
        model: ModuleFormation,
        as: 'modules',
        required: false,
        include: [
          {
            model: Quiz,
            as: 'quizzes',
            required: false,
            attributes: ['id', 'titre', 'description', 'module_id']
          }
        ]
      }
    ],
    order: [
      ['date_publication', 'DESC'],
      ['id', 'DESC'],
      [{ model: ModuleFormation, as: 'modules' }, 'ordre', 'ASC']
    ],
    limit: parseInt(limit, 10),
    offset: parseInt(offset, 10),
    distinct: true // Important pour le count avec include
  });

  return {
    data: rows,
    pagination: {
      total: count,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      pages: Math.ceil(count / limit)
    }
  };
};

/**
 * Créer une formation (admin)
 */
const adminCreateFormation = async (data) => {
  if (!data.titre) {
    throw new Error('Le titre de la formation est obligatoire');
  }

  const formation = await Formation.create({
    titre: data.titre,
    description: data.description || null,
    niveau: data.niveau || null,
    image_couverture_url: data.image_couverture_url || null,
    est_active: typeof data.est_active === 'boolean' ? data.est_active : true,
    date_publication: data.date_publication || new Date()
  });

  return formation;
};

/**
 * Mettre à jour une formation (admin)
 */
const adminUpdateFormation = async (id, data) => {
  const formation = await Formation.findByPk(id);

  if (!formation) {
    throw new Error('Formation non trouvée');
  }

  await formation.update({
    titre: typeof data.titre !== 'undefined' ? data.titre : formation.titre,
    description: typeof data.description !== 'undefined' ? data.description : formation.description,
    niveau: typeof data.niveau !== 'undefined' ? data.niveau : formation.niveau,
    image_couverture_url: typeof data.image_couverture_url !== 'undefined' ? data.image_couverture_url : formation.image_couverture_url,
    est_active: typeof data.est_active !== 'undefined' ? data.est_active : formation.est_active,
    date_publication: typeof data.date_publication !== 'undefined' ? data.date_publication : formation.date_publication
  });

  return formation;
};

/**
 * Créer un module pour une formation (admin)
 */
const adminCreateModule = async (formationId, data) => {
  const formation = await Formation.findByPk(formationId);

  if (!formation) {
    throw new Error('Formation non trouvée');
  }

  if (!data.titre) {
    throw new Error('Le titre du module est obligatoire');
  }

  const moduleFormation = await ModuleFormation.create({
    formation_id: formationId,
    titre: data.titre,
    description: data.description || null,
    type_contenu: data.type_contenu || 'texte',
    contenu_texte: data.contenu_texte || null,
    image_url: data.image_url || null,
    video_url: data.video_url || null,
    ordre: typeof data.ordre === 'number' ? data.ordre : 0
  });

  return moduleFormation;
};

/**
 * Mettre à jour un module de formation (admin)
 */
const adminUpdateModule = async (moduleId, data) => {
  const moduleFormation = await ModuleFormation.findByPk(moduleId);

  if (!moduleFormation) {
    throw new Error('Module de formation non trouvé');
  }

  await moduleFormation.update({
    titre: typeof data.titre !== 'undefined' ? data.titre : moduleFormation.titre,
    description: typeof data.description !== 'undefined' ? data.description : moduleFormation.description,
    type_contenu: typeof data.type_contenu !== 'undefined' ? data.type_contenu : moduleFormation.type_contenu,
    contenu_texte: typeof data.contenu_texte !== 'undefined' ? data.contenu_texte : moduleFormation.contenu_texte,
    image_url: typeof data.image_url !== 'undefined' ? data.image_url : moduleFormation.image_url,
    video_url: typeof data.video_url !== 'undefined' ? data.video_url : moduleFormation.video_url,
    ordre: typeof data.ordre !== 'undefined' ? data.ordre : moduleFormation.ordre
  });

  return moduleFormation;
};

/**
 * Associer un quiz existant à un module (admin)
 */
const adminAttachQuizToModule = async (quizId, moduleId) => {
  const moduleFormation = await ModuleFormation.findByPk(moduleId);
  if (!moduleFormation) {
    throw new Error('Module de formation non trouvé');
  }

  const quiz = await Quiz.findByPk(quizId);
  if (!quiz) {
    throw new Error('Quiz non trouvé');
  }

  await quiz.update({ module_id: moduleId });

  return quiz;
};

module.exports = {
  getFormationsForUser,
  getFormationByIdForUser,
  adminGetFormations,
  adminCreateFormation,
  adminUpdateFormation,
  adminCreateModule,
  adminUpdateModule,
  adminAttachQuizToModule
};
