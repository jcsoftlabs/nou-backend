-- Migration: Ajouter la colonne username à la table membres
-- Date: 2025-11-16
-- Description: Ajoute un champ username unique pour l'authentification

-- Ajouter la colonne username
ALTER TABLE membres 
ADD COLUMN username VARCHAR(50) UNIQUE NOT NULL AFTER id;

-- Ajouter un index sur username pour optimiser les recherches
ALTER TABLE membres 
ADD INDEX idx_username (username);

-- Commenter la table pour documentation
ALTER TABLE membres 
COMMENT = 'Table des membres avec authentification par username, email ou téléphone';
