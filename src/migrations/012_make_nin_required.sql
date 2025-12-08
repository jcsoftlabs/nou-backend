-- Migration 012: Rendre le champ NIN obligatoire et unique
-- Date: 2025-12-08
-- Description: Modification de la colonne nin pour la rendre NOT NULL et UNIQUE dans la table membres

-- Modifier la colonne nin pour la rendre NOT NULL
ALTER TABLE membres 
MODIFY COLUMN nin VARCHAR(50) NOT NULL;

-- Ajouter une contrainte d'unicité sur le NIN
ALTER TABLE membres
ADD CONSTRAINT unique_nin UNIQUE (nin);

-- Ajouter un index sur nin pour optimiser les recherches lors de la récupération de mot de passe
-- (L'index sera automatiquement créé avec la contrainte UNIQUE, donc cette ligne est optionnelle)
CREATE INDEX idx_membres_nin ON membres(nin);
