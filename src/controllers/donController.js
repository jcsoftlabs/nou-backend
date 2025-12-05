const { Don, Membre } = require('../models');
const path = require('path');

/**
 * POST /dons - Créer un nouveau don
 * Accessible aux membres authentifiés
 */
const createDon = async (req, res) => {
  try {
    const { montant, description } = req.body;
    const membre_id = req.user.id;

    // Validation
    if (!montant || parseFloat(montant) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Le montant du don doit être supérieur à 0'
      });
    }

    // Vérifier si un reçu a été uploadé
    let recu_url = null;
    if (req.file) {
      recu_url = `/uploads/dons/${req.file.filename}`;
    }

    // Créer le don
    const don = await Don.create({
      membre_id,
      montant: parseFloat(montant),
      recu_url,
      description,
      statut_don: 'en_attente',
      date_don: new Date()
    });

    return res.status(201).json({
      success: true,
      message: 'Don enregistré avec succès. En attente de vérification.',
      data: don
    });
  } catch (error) {
    console.error('Erreur lors de la création du don:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création du don'
    });
  }
};

/**
 * GET /dons/mes-dons - Obtenir les dons du membre connecté
 */
const getMesDons = async (req, res) => {
  try {
    const membre_id = req.user.id;

    const dons = await Don.findAll({
      where: { membre_id },
      include: [
        {
          model: Membre,
          as: 'admin_verificateur',
          attributes: ['id', 'nom', 'prenom'],
          required: false
        }
      ],
      order: [['date_don', 'DESC']]
    });

    return res.status(200).json({
      success: true,
      message: 'Dons récupérés avec succès',
      data: dons
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des dons:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des dons'
    });
  }
};

/**
 * GET /dons/:id - Obtenir les détails d'un don
 */
const getDonById = async (req, res) => {
  try {
    const { id } = req.params;
    const membre_id = req.user.id;

    const don = await Don.findOne({
      where: { 
        id,
        membre_id // S'assurer que le membre ne peut voir que ses propres dons
      },
      include: [
        {
          model: Membre,
          as: 'admin_verificateur',
          attributes: ['id', 'nom', 'prenom'],
          required: false
        }
      ]
    });

    if (!don) {
      return res.status(404).json({
        success: false,
        message: 'Don introuvable'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Don récupéré avec succès',
      data: don
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du don:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération du don'
    });
  }
};

module.exports = {
  createDon,
  getMesDons,
  getDonById
};
